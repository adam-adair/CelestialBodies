import { perspective, orthogonal } from "./camera";
import { Blue, Red } from "./colors";
import { Cube } from "./cube";
import { constants } from "./constants";
import { Mesh } from "./mesh";
import { movePlayer, handleInput, PlayerMovement } from "./input";
import { Sphere } from "./sphere";
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

const init = async () => {
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
    "./obj/weirddonut.obj",
    "./obj/weirddonut.mtl",
    1
  );
  // enemies.push(new Cube(0.2, Red));
  enemies.push(new Sphere(0.5, Blue, 8));
  enemies.push(new Sphere(1, Red));
  enemies[1].translate(-1, -1, -1);

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
    enemy.rotate(0.5, 0.5, 0.5);
    enemy.draw(gl, program);
  }

  //draw player
  player.draw(gl, program);

  requestAnimationFrame(loop);
};

// start program
window.onload = () => {
  canvas.width = 640; //document.body.clientWidth;
  canvas.height = 480; //document.body.clientHeight;
  init();
};
