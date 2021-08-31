import { CPlayer } from "./music/player-small";
import spaceJam from "./music/spaceJam";
import { perspective, orthogonal } from "./camera";
import { Color, Red, Green, Blue } from "./colors";
import { Body } from "./bodies";
import { constants } from "./constants";
import { Mesh, Vertex, ProceduralTextureData } from "./mesh";
import { movePlayer, handleInput, PlayerMovement } from "./input";
import { kilogramsToMass, metersToAU } from "./utils";
import { Sphere } from "./sphere";
import { generateTexture, sand, grass, clouds } from "./texture";
import initialize from "./initialize";
import populate from "./setups";
import { Grid } from "./grid";

const { gl, program, canvas, camera, cameraMatrix } = initialize;
const { movement } = constants;

//could use this func to load diff songs for diff levels or scenes
const loadMusic = (song: any) => {
  const cPlayer = new CPlayer();
  cPlayer.init(song);
  cPlayer.generate();
  let done = false;
  const musicStatus = document.getElementById("musicStatus");
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
};
document.onkeydown = (ev) => handleInput(ev, true, playerInput);
document.onkeyup = (ev) => handleInput(ev, false, playerInput);

let movables: Sphere[] = [];
let stationary: Sphere[] = [];
let player: Mesh;
let textures: (HTMLImageElement | ProceduralTextureData)[];
let grid: Grid;

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
  textures = await loadImages(["./textures/test.png", "./textures/test2.jpg"]);
  textures.push(sandTexture, grassTexture, cloudTexture);

  // moved the different testing configurations into functions to make them easier to switch between. we can get rid of these later on. just uncomment the setup you want to use.
  // populate.randomSystem(movables, 3, textures); // after 25 objects the simulation gets real slow
  // populate.repeatableSystem(movables, textures); // two objects with equal mass and no starting velocity
  // populate.stableOrbit(movables, 1, textures);         // doesn't quite work yet.
  //  populate.binaryStars(movables,textures);            // to objects with equal mass and opposite motion perpindular to axis
  // populate.binaryStarsPlanet(movables, textures); //binary stars plus an orbiting planet
  player = await populate.texturesDisplay(
    gl,
    program,
    stationary,
    player,
    textures
  );
  grid = new Grid(10, 2, true);

  requestAnimationFrame(loop);
};

let then = 0;

//game loop
const loop = (now: number) => {
  // calculate frames per second
  now *= 0.001; // convert to seconds
  const deltaTime = now - then; // compute time since last frame
  then = now; // remember time for next frame
  const fps = 1 / deltaTime; // compute frames per second

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  //clear screen
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //box movement

  if (movables.length > 0) {
    for (let j = 0; j < movables.length; j++) {
      for (let i = 0; i < movables.length; i++) {
        if (i !== j) {
          const force = movables[j].calculateAttraction(movables[i]);
          movables[j].applyForce(force);
        }
      }
    }

    // draw movables
    for (let i = 0; i < movables.length; i++) {
      const body = movables[i];
      //make object spin
      body.rotate(0.5, 0.5, 0.5);
      // body.translate(body.velocity.x, body.velocity.y, body.velocity.z )
      body.update();
      body.draw();

      // check this object against all other objects for collision
      // maybe there's a better way to do this
      for (let j = 0; j < movables.length - 1; j++) {
        //dont check against self
        if (i === j) j++;
        else {
          const otherBody = movables[j];
          //if the bodies intersect
          if (body.intersect(otherBody)) {
            //do something
            console.log("collide");
            //todo - some real physics about ricocheting or exploding or combining
            // for now, reverse their velocities
            otherBody.velocity = otherBody.velocity.scale(-1);
            body.velocity = body.velocity.scale(-1);
          }
        }
      }
    }
  }

  // right now this is only useful for the "texture display" setup
  if (stationary.length > 0) {
    for (let i = 0; i < stationary.length; i++) {
      const body = stationary[i];

      //make object spin
      body.rotate(0.5, 0.5, 0.5);
      body.update();
      body.draw();
    }

    //draw player
    movePlayer(player, playerInput, movement);
    player.draw();
  }
  grid.draw();
  gl.uniformMatrix4fv(camera, false, cameraMatrix.toFloat32Array());
  requestAnimationFrame(loop);
};

// start program
window.onload = () => {
  canvas.width = 640; //document.body.clientWidth;
  canvas.height = 480; //document.body.clientHeight;
  // loadMusic(spaceJam); //disabled for now for speed
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

canvas.onmouseup = (e) => {
  dragging = false;
};

canvas.onmousemove = (e) => {
  let x = e.clientX;
  let y = e.clientY;
  if (dragging) {
    let dx = ((y - lastY) * 200) / canvas.height;
    let dy = ((x - lastX) * 200) / canvas.width;
    cameraMatrix.rotateSelf(dx, dy);
    lastX = x;
    lastY = y;
  }
};
