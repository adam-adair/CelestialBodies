import { CPlayer } from "./music/player-small";
import spaceJam from "./music/spaceJam";
import { Body } from "./bodies";
import { constants } from "./constants";
import { ProceduralTextureData } from "./mesh";
import { movePlayer, handleInput, PlayerMovement, moveCamera } from "./input";
import { get } from "./utils";
import { Sphere } from "./Sphere";
import { sandTexture, grassTexture, cloudTexture } from "./texture";
import initialize from "./initialize";
import populate from "./setups";
import { Grid } from "./grid";
import { Camera } from "./camera";
import { Star } from "./Star";
import { Planet } from "./Planet";
import { Barycenter } from "./barycenter";

import gameObjects from "./GameObjects";
import { StarField } from "./Starfield";
import { addBody, destroyTemp } from "./addBody";

const { gl, canvas } = initialize;
const { movement, universeSize } = constants;
const { movers, attractors, objects } = gameObjects;
let then = 0;
const bodyButton = get("bodyButton") as HTMLButtonElement;
const cancelButton = get("cancelButton") as HTMLButtonElement;
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

      let playing = false;
      const playButton = document.createElement("button");
      playButton.innerHTML = "Play Music";
      get("instructions").appendChild(playButton);
      playButton.onclick = () => {
        if (!playing) {
          playButton.innerHTML = "Pause Music";
          audio.play();
          playing = true;
        } else {
          playButton.innerHTML = "Play Music";
          audio.pause();
          playing = false;
        }
      };
    }
  }, 0);
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
  camRL: false,
  camRR: false,
};

let paused = false;
document.onkeydown = (ev) => {
  if (ev.key === "`") paused = !paused;
  else handleInput(ev, true, playerInput);
};
document.onkeyup = (ev) => handleInput(ev, false, playerInput);

let player: Body;
let textures: (HTMLImageElement | ProceduralTextureData)[];
let grid: Grid;
export let cam: Camera;
let starField: Sphere;

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
  textures = await loadImages(["./textures/blank.png", "./textures/blank.png"]);
  textures.push(sandTexture, grassTexture, cloudTexture);
  //size of the sphere encompassing the world, size of the texture in pixels, frequency of the stars (higher is less freq)
  starField = new StarField(universeSize, 2048, 2000);
  bodyButton.onclick = toggleForm; //() => addBody(bodyForm, textures);
  cancelButton.onclick = cancelBody;

  // presets
  // populate.randomSystem(5, textures);
  // populate.stableOrbit(20, textures);
  // populate.binaryStars(textures); // to objects with equal mass and opposite motion perpindular to axis
  // populate.binaryStarsPlanet(textures); //binary stars plus an orbiting planet
  // populate.randomPlanetSystem(30, textures);
  // populate.whiteHole(textures);

  grid = new Grid(10, 10, true);

  //right now the camera start position is hardcoded but we can change that around and maybe make it dynamic based on what's in scene
  cam = new Camera();
  cam.view();
  requestAnimationFrame(loop);
};

//game loop
const loop = (now: number) => {
  cam.view();

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  //clear screen
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  starField.draw();

  if (!paused) {
    // check whether movers collide with attractors. if an object is not both it is immune to object collision
    for (let i in movers) {
      const body = movers[i] as Planet | Star;
      for (let j in attractors) {
        //dont check against self
        if (movers[i] !== attractors[j]) {
          const otherBody = attractors[j] as Planet | Star;
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
  loadMusic(spaceJam);
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

document.onmousemove = (e) => {
  let x = e.clientX;
  let y = e.clientY;
  if (dragging) {
    cam.watch();
    let dy = (y - lastY) / canvas.height;
    let dx = (x - lastX) / canvas.width;
    cam.rotate(dx * 100, dy * 100, 0);
    lastX = x;
    lastY = y;
  }
};

export const toggleForm = () => {
  get("bodyOptions").style.visibility = "hidden";
  const nameField = <HTMLFormElement>get("bodyName");
  const inputFields = document.getElementsByTagName("input");
  if (bodyForm.style.display === "none") {
    paused = true;
    bodyButton.innerHTML = "Finalize Body";
    cancelButton.style.display = "inline-block";
    bodyForm.style.display = "inline-block";
    (<HTMLFormElement>get("bodyStar")).checked = false;
    (<HTMLFormElement>get("bodyPlanet")).checked = false;
    //stops game obj movement when typing input fields
    for (let i = 0; i < inputFields.length; i++) {
      const field = inputFields[i];
      field.onfocus = () => {
        document.onkeydown = null;
        document.onkeyup = null;
      };
      field.onblur = () => {
        document.onkeydown = (ev) => handleInput(ev, true, playerInput);
        document.onkeyup = (ev) => handleInput(ev, false, playerInput);
      };
    }
    addBody(bodyForm, textures);
  } else {
    get("sizeDiv").style.visibility = "hidden";
    paused = false;
    bodyButton.innerHTML = "Add Body";
    cancelButton.style.display = "none";
    bodyForm.style.display = "none";
    if (player) {
      player.name = nameField.value;
      if (player.constructor.name !== "WhiteHole")
        //instanceof doesn't work here and I don't know why
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

export const cancelBody = () => {
  destroyTemp();
  player = null;
  toggleForm();
};
