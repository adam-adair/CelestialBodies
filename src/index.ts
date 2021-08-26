import { perspective, orthogonal } from "./camera";
import { Color, Red, Green, Blue } from "./colors";
import { Barycenter, Body } from "./bodies";
import { constants } from "./constants";
import { Mesh, Vertex } from "./mesh";
import { movePlayer, handleInput, PlayerMovement } from "./input";
import { kilogramsToMass, metersToAU} from "./utils";

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
let movables: Body[] = [];
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
  cameraMatrix.translateSelf(0, 0, -zoom * 5);

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
  // player = await Mesh.fromObjMtl(
  //   "./obj/weirddonut.obj",
  //   "./obj/weirddonut.mtl",
  //   1
  // );
  // movables.push(new Body(0.2, Red));

  // player.translate(0, -2, 0);
  // player.rotate(0, 180, 0);

//randomly generate solar system
  for(let x = 0 ; x<40; x++){
    const mass = kilogramsToMass(Math.random()*1.989e30);
    const size = mass*2000
    const color = new Color(Math.random(), Math.random(), Math.random());
    const velocity = new Vertex(Math.random()/100, Math.random()/100, Math.random()/100);
    // const velocity = new Vertex(0,0,0);

    const body = new Body(`Planet ${x}`,size, mass, color, velocity);
    body.translate(Math.random()*16-8, Math.random()*16-8, Math.random()*16-8);
    movables.push(body);
  }

  // 1 sun,  1 planet to test a stable orbit, which is not working yet.
    // const sun = new Body("sun", .25, kilogramsToMass(1.989e30), Red, new Vertex(0,0,0)); // metersToAU(1.3927e9) to get the real diameter of the sun
    // const planet = new Body("earth", .1, kilogramsToMass(5.972e24), Green, new Vertex(0,0,0)) //metersToAU(12742000) to get the real diameter of the earth but it's way too small to see relative to the sun
    // planet.translate(-3,0,0);
    // planet.setStableOrbit(sun);
    // movables.push(sun);
    // movables.push(planet);

  requestAnimationFrame(loop);
};

let then = 0;

//game loop
const loop = (now: number) => {
  // calculate frames per second
    now *= 0.001;                          // convert to seconds
    const deltaTime = now - then;          // compute time since last frame
    then = now;                            // remember time for next frame
    const fps = 1 / deltaTime;             // compute frames per second


  //clear screen
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //box movement
  // movePlayer(player, playerInput, movement);

  // calculateNewVelocities(movables[0], movables[1]);

  for(let j = 0; j < movables.length; j++) {
    for(let i = 0; i <movables.length; i++){
      if(i !== j) {
        const force = movables[j].calculateAttraction(movables[i], fps)
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
    body.draw(gl, program);
  }

  //draw player
  // player.draw(gl, program);

  requestAnimationFrame(loop);
};

// start program
window.onload = () => {
  canvas.width = 640; //document.body.clientWidth;
  canvas.height = 480; //document.body.clientHeight;
  init();
};
