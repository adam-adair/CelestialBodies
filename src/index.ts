import { CPlayer } from "./music/player-small";
import spaceJam from "./music/spaceJam";
import { Body } from "./bodies";
import { constants } from "./constants";
import { ProceduralTextureData } from "./mesh";
import { movePlayer, handleInput, PlayerMovement, moveCamera } from "./input";
import { get } from "./utils";
import { Sphere } from "./Sphere";
import { sandTexture, grassTexture, cloudTexture, blankTexture } from "./texture";
import initialize from "./initialize";
import populate from "./setups";
import { Grid } from "./grid";
import { Camera } from "./camera";
import { Star } from "./Star";
import { Planet } from "./Planet";
import gameObjects from "./GameObjects";
import { StarField } from "./Starfield";
import { addBody, destroyTemp } from "./addBody";
import { flyTo } from "./listItems";

const { gl, canvas } = initialize;
const { movement, universeSize } = constants;
const { movers, attractors, objects } = gameObjects;
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
      musicStatus.innerHTML = "Click anywhere to begin";
      get("titleOverlay").onclick = () => hideOverlay(audio);
    }
  }, 0);
};

const hideOverlay = (audio: HTMLAudioElement) => {
  get("titleOverlay").style.visibility = "hidden";
  let playing = true;
  audio.play();
  const playButton = document.createElement("button");
  playButton.className = "bottom";
  playButton.innerHTML = "Pause Music";
  playButton.style.zIndex = "0";
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



const init = async () => {
  // textures = await loadImages(["./textures/blank.png", "./textures/test2.jpg"]);
  textures = [blankTexture, blankTexture];
  textures.push(sandTexture, grassTexture, cloudTexture);
  //size of the sphere encompassing the world, size of the texture in pixels, frequency of the stars (higher is less freq)
  starField = new StarField(universeSize, 2048, 2000);
  bodyButton.onclick = toggleForm; //() => addBody(bodyForm, textures);
  cancelButton.onclick = cancelBody;

  // presets
  // populate.randomSystem(5, textures);
  populate.stableOrbit(10, textures);
  // populate.binaryStars(textures); // to objects with equal mass and opposite motion perpindular to axis
  // populate.binaryStarsPlanet(textures); //binary stars plus an orbiting planet
  // populate.randomPlanetSystem(30, textures);
  // populate.whiteHole(textures);

  grid = new Grid(10, 10, true);

  //right now the camera start position is hardcoded but we can change that around and maybe make it dynamic based on what's in scene
  cam = new Camera();
  cam.view();
  flyTo(gameObjects.objects[3]);

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

  moveCamera(playerInput, paused);
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
  checkCoilSubscribtion();
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

const checkCoilSubscribtion = () => {
  const d = document as any;
  if (d.monetization) {
    if (d.monetization.state === "started") {
      toggleWhiteHole();
    } else {
      d.monetization.addEventListener("monetizationstart", function () {
        console.log("HELLO COIL SUBSCRIBER");
        toggleWhiteHole();
      });
    }
  }
};

const toggleWhiteHole = () => {
  console.log("adding white hole");
  const radioDiv = document.getElementById("radioButtons");
  const whiteHoleRadio = document.createElement("input");
  whiteHoleRadio.type = "radio";
  whiteHoleRadio.id = "bodyWhiteHole";
  whiteHoleRadio.name = "bodyType";
  whiteHoleRadio.value = "whiteHole";

  radioDiv.appendChild(whiteHoleRadio);

  const whiteHolelabel = document.createElement("label");
  whiteHolelabel.setAttribute("for", whiteHoleRadio.id);
  whiteHolelabel.innerHTML = "White Hole";

  radioDiv.appendChild(whiteHolelabel);
  get("whHeader").style.visibility = "visible";
};
