import { CPlayer } from "./music/player-small";
import spaceJam from "./music/spaceJam";
import { Color, Red, Green, Blue, White } from "./colors";
import { Body } from "./bodies";
import { constants } from "./constants";
import { Mesh, Vertex, ProceduralTextureData } from "./mesh";
import { movePlayer, handleInput, PlayerMovement, moveCamera } from "./input";
import { get, kilogramsToMass, metersToAU } from "./utils";
import { Sphere } from "./Sphere";
import { generateTexture, sand, grass, clouds } from "./texture";
import initialize from "./initialize";
import populate from "./setups";
import { Grid } from "./grid";
import { Camera } from "./camera";
import { Star } from "./Star";
import { Planet } from "./Planet";
import { Asteroid } from "./Asteroid";

import gameObjects from "./GameObjects";
import { StarField } from "./Starfield";
import { addBody } from "./addBody";

const { gl, program, canvas } = initialize;
const { movement, zoom } = constants;
const { movers, attractors, objects } = gameObjects;
let then = 0;
const bodyButton = get("bodyButton") as HTMLButtonElement;
const bodyForm = get("bodyForm") as HTMLFormElement;
//could use this func to load diff songs for diff levels or scenes
const loadMusic = (song: any) => {
  const cPlayer = new CPlayer();
  cPlayer.init(song);
  cPlayer.generate();
  let done = false;
  const musicStatus = get("musicStatus");
  setInterval(function () {
    if (done) {
      return;
    }
    const pctLoaded = cPlayer.generate();
    musicStatus.innerHTML = `Music Loading: ${(100 * pctLoaded).toFixed(0)}%`;
    done = pctLoaded >= 1;
    if (done) {
      // Put the generated song in an Audio element.
      const wave = cPlayer.createWave();
      const audio = document.createElement("audio");
      audio.src = URL.createObjectURL(new Blob([wave], { type: "audio/wav" }));
      audio.loop = true;
      musicStatus.remove();

      // doing this for now so we can test audio
      // chrome requires user interact with DOM before audio plays
      // think this won't be an issue once actually playing game
      // but during development, if you live reload, you haven't
      // interacted with DOM so it won't autoplay music.
      // Plus hearing the same loop forever is annoying.
      let playing = false;
      const playButton = document.createElement("button");
      playButton.innerHTML = "Play Song";
      document.body.appendChild(playButton);
      playButton.onclick = () => {
        if (!playing) {
          playButton.innerHTML = "Pause Song";
          audio.play();
          playing = true;
        } else {
          playButton.innerHTML = "Play Song";
          audio.pause();
          playing = false;
        }
      };
    }
  }, 0);
};

const sandTexture: ProceduralTextureData = {
  width: 128,
  height: 128,
  data: new Uint8Array(generateTexture(128, sand)),
};

const grassTexture: ProceduralTextureData = {
  width: 128,
  height: 128,
  data: new Uint8Array(generateTexture(128, grass)),
};

const cloudTexture: ProceduralTextureData = {
  width: 128,
  height: 128,
  data: new Uint8Array(generateTexture(128, clouds)),
};

const playerInput: PlayerMovement = {
  spinL: false,
  spinR: false,
  up: false,
  down: false,
  right: false,
  left: false,
  in: false,
  out: false,
  spinI: false,
  spinO: false,
  spinU: false,
  spinD: false,
  camR: false,
  camL: false,
  camU: false,
  camD: false,
  camI: false,
  camO: false,
};
document.onkeydown = (ev) => handleInput(ev, true, playerInput);
document.onkeyup = (ev) => handleInput(ev, false, playerInput);

let player: Body;
let textures: (HTMLImageElement | ProceduralTextureData)[];
let grid: Grid;
export let cam: Camera;
let starField: Sphere;
let paused = false;

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = url;
  });
};

const loadImages = (urlArr: string[]) => {
  return Promise.all(urlArr.map((url) => loadImage(url)));
};

const init = async () => {
  textures = await loadImages(["./textures/blank.png", "./textures/test2.jpg"]);
  textures.push(sandTexture, grassTexture, cloudTexture);
  //size of the sphere encompassing the world, size of the texture in pixels, frequency of the stars (higher is less freq)
  starField = new StarField(50, 512, 2000);
  bodyButton.onclick = togglePause; //() => addBody(bodyForm, textures);

  // moved the different testing configurations into functions to make them easier to switch between. we can get rid of these later on. just uncomment the setup you want to use.
  // populate.randomSystem(2, textures); // after 25 objects the simulation gets real slow
  // populate.repeatableSystem(textures); // two objects with equal mass and no starting velocity
  populate.stableOrbit(10, textures); // doesn't quite work yet.
  // populate.binaryStars(textures); // to objects with equal mass and opposite motion perpindular to axis
  // populate.binaryStarsPlanet(textures); //binary stars plus an orbiting planet
  // player = await populate.texturesDisplay(gl, program, player, textures);
  // populate.starColor(textures); // just a display of star colors. they don't move.
  // populate.twoPlanets(textures);
  // populate.testCollisionAddMomentum(textures);
  // populate.testCollisionLoseMomentum(textures);
  // populate.randomPlanetSystem(30, textures);
  // populate.testTranslation(textures);
  grid = new Grid(10, 10, true);
  cam = new Camera(new DOMPoint(0, zoom / 2, zoom / 2), new DOMPoint(0, 0, 0));
  cam.view();
  requestAnimationFrame(loop);
};

//game loop
const loop = (now: number) => {
  cam.view();
  // calculate frames per second
  now *= 0.001; // convert to seconds
  const deltaTime = now - then; // compute time since last frame
  then = now; // remember time for next frame
  const fps = 1 / deltaTime; // compute frames per second

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  //clear screen
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //box movement
  starField.draw();

  // check this object against all other objects for collision
  // maybe there's a better way to do this

  if (!paused) {
    for (let i in movers) {
      const body = movers[i] as Planet | Star | Asteroid;

      for (let j in objects) {
        //dont check against self

        if (movers[i] !== objects[j]) {
          const otherBody = objects[j] as Planet | Star | Asteroid;
          body.checkCollision(gameObjects, otherBody);
        }
      }
    }

    // calculate effect of attractors on movers
    for (let j in movers) {
      for (let i in attractors) {
        if (i !== j) {
          const force = movers[j].calculateAttraction(attractors[i]);
          movers[j].applyForce(force);
        }
      }
    }
  }

  // draw all objects
  for (let i in objects) {
    const body = objects[i];
    //make object spin
    // body.rotate(0.5, 0.5, 0.5);
    if (!paused) body.update();
    body.draw();
  }

  moveCamera(playerInput);
  //draw player
  if (player) {
    movePlayer(player, playerInput, movement);
    player.draw();
  }
  grid.draw();
  requestAnimationFrame(loop);
};

// start program
window.onload = () => {
  canvas.width = 640; //document.body.clientWidth;
  canvas.height = 480; //document.body.clientHeight;

  // disabling for testing so I don't have to wait
  // loadMusic(spaceJam);
  init();
};

let dragging = false;
let lastX = -1;
let lastY = 0;
canvas.onmousedown = (e) => {
  lastX = e.clientX;
  lastY = e.clientY;
  dragging = true;
};

document.onmouseup = (e) => {
  dragging = false;
};

canvas.onmouseup = (e) => {
  dragging = false;
};

canvas.onmousemove = (e) => {
  let x = e.clientX;
  let y = e.clientY;
  if (dragging) {
    let dy = (4 * (y - lastY)) / canvas.height;
    let dx = (4 * (x - lastX)) / canvas.width;
    cam.rotateAroundEye(dx, dy);
    // cam.target = cam.target.subtract(new Vertex(-dx, -dy, 0));
    //(dx, dy);
    lastX = x;
    lastY = y;
  }
};

export const togglePause = () => {
  paused = !paused;
  const nameField = <HTMLFormElement>get("bodyName");
  if (paused) {
    bodyButton.innerHTML = "Finalize Body";
    bodyForm.style.visibility = "visible";
    get("sizeDiv").style.visibility = "visible";
    get("surfaceDiv").style.visibility = "visible";
    (<HTMLFormElement>get("bodyStar")).checked = false;
    (<HTMLFormElement>get("bodyPlanet")).checked = false;
    //stops game obj movement when typing name
    nameField.onfocus = () => {
      document.onkeydown = null;
      document.onkeyup = null;
    };
    nameField.onblur = () => {
      document.onkeydown = (ev) => handleInput(ev, true, playerInput);
      document.onkeyup = (ev) => handleInput(ev, false, playerInput);
    };
    addBody(bodyForm, textures);
  } else {
    bodyButton.innerHTML = "Add Body";
    bodyForm.style.visibility = "hidden";
    get("sizeDiv").style.visibility = "hidden";
    get("surfaceDiv").style.visibility = "hidden";
    if (player) {
      player.name = nameField.value;
      player.addToAttractors().addToMovers();
      setPlayer(null);
    }
    bodyForm.removeEventListener("change", null);
  }
};

export const setPlayer = (body: Body) => {
  player = body;
};

export const getPlayer = () => {
  return player;
};
