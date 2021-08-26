import { CPlayer } from "./music/player-small";
import spaceJam from "./music/spaceJam";
import { perspective, orthogonal } from "./camera";
import { Blue, Green, Red } from "./colors";
import { Cube } from "./cube";
import { constants } from "./constants";
import { Mesh, ProceduralTextureData } from "./mesh";
import { movePlayer, handleInput, PlayerMovement } from "./input";
import { Sphere } from "./sphere";
import { generateTexture, sand, grass, clouds } from "./texture";

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

const {
  clearColor,
  zoom,
  lightDirection,
  ambientLightAmount,
  movement,
  fogDistance,
} = constants;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
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

//shader source
const vs_source = require("./glsl/vshader.glsl") as string;
const fs_source = require("./glsl/fshader.glsl") as string;

let gl: WebGLRenderingContext;
let program: WebGLProgram;
let enemies: Mesh[] = [];
let player: Mesh;
let textures: (HTMLImageElement | ProceduralTextureData)[];

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
  //initialize webgl
  gl = canvas.getContext("webgl");

  program = gl.createProgram();

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vs_source);
  gl.compileShader(vertexShader);
  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, fs_source);
  gl.compileShader(fragShader);

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  gl.useProgram(program);
  console.log("vertex shader:", gl.getShaderInfoLog(vertexShader) || "OK");
  console.log("fragment shader:", gl.getShaderInfoLog(fragShader) || "OK");
  console.log("program:", gl.getProgramInfoLog(program) || "OK");

  //set background color, enable depth
  gl.clearColor(clearColor.r, clearColor.g, clearColor.b, clearColor.a);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  //set light, camera uniforms
  const camera = gl.getUniformLocation(program, "camera");
  const cameraMatrix = perspective(zoom, canvas.width / canvas.height, 1, 100);
  cameraMatrix.translateSelf(0, 0, -zoom * 2);

  // for ortho view:
  // const cameraMatrix = orthogonal(zoom * ratio, zoom, 100);
  // cameraMatrix.translateSelf((zoom * ratio) / 2, -zoom / 2, -zoom);

  gl.uniformMatrix4fv(camera, false, cameraMatrix.toFloat32Array());

  // light
  const light = gl.getUniformLocation(program, "light");
  gl.uniform3f(light, lightDirection.x, lightDirection.y, lightDirection.z);
  const ambientLight = gl.getUniformLocation(program, "ambientLight");
  gl.uniform3f(
    ambientLight,
    ambientLightAmount,
    ambientLightAmount,
    ambientLightAmount
  );

  //fog
  const a_fogColor = new Float32Array([
    clearColor.r,
    clearColor.g,
    clearColor.b,
  ]);
  const a_fogDist = new Float32Array(fogDistance);
  const u_FogColor = gl.getUniformLocation(program, "u_FogColor");
  const u_FogDist = gl.getUniformLocation(program, "u_FogDist");
  gl.uniform3fv(u_FogColor, a_fogColor);
  gl.uniform2fv(u_FogDist, a_fogDist);

  // set up some objects
  player = await Mesh.fromObjMtl(
    gl,
    program,
    "./obj/weirddonut.obj",
    "./obj/weirddonut.mtl",
    1
  );

  enemies.push(new Sphere(gl, program, 0.8, 12, textures[0]));
  enemies[0].translate(-1, -1, -1);
  enemies.push(new Sphere(gl, program, 1, 16, textures[1]));
  enemies[1].translate(2, 1, 0);
  enemies.push(new Sphere(gl, program, 0.5, 5, null, Green));
  enemies.push(new Cube(gl, program, 0.7, Red));
  enemies[3].translate(-2, 1, -5);
  enemies[3].rotate(-2, 1, -5);

  //sand textured sphere
  enemies.push(new Sphere(gl, program, 0.7, 16, textures[2]));
  enemies[4].translate(-2, 3.5, 0);

  //grass textured sphere
  enemies.push(new Sphere(gl, program, 0.7, 16, textures[3]));
  enemies[5].translate(2, -3.5, 0);

  //clouds textured sphere
  enemies.push(new Sphere(gl, program, 0.7, 16, textures[4]));
  enemies[6].translate(-3, -3.5, 0);

  player.translate(0, -2, 0);
  player.rotate(0, 180, 0);

  requestAnimationFrame(loop);
};

//game loop
const loop = () => {
  //clear screen
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //box movement
  movePlayer(player, playerInput, movement);

  // draw enemies
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    //make enemy spin
    enemy.rotate(0.0, 0.5, 0.0);
    enemy.draw();
  }

  //draw player
  player.draw();

  requestAnimationFrame(loop);
};

// start program
window.onload = () => {
  canvas.width = 640; //document.body.clientWidth;
  canvas.height = 480; //document.body.clientHeight;
  loadMusic(spaceJam);
  init();
};
