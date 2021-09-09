import { container } from "webpack";
import { constants } from "./constants";
import { Camera } from "./camera";
import { Vertex } from "./mesh";

const { clearColor, zoom, lightDirection, ambientLightAmount } = constants;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = 640; //document.body.clientWidth;
canvas.height = 480; //document.body.clientHeight;
//initialize webgl
const gl = canvas.getContext("webgl");
const program = gl.createProgram();

//shader source
const vs_source = require("./glsl/vshader.glsl") as string;
const fs_source = require("./glsl/fshader.glsl") as string;

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
// const cam = new Camera(new Vertex(0, 2, 50), new Vertex(0, 0, 0));
// const camera = gl.getUniformLocation(program, "camera");
// const projMatrix = perspective(zoom, canvas.width / canvas.height, 1, 100);
// const viewMatrix = lookAt(0, 2, 50, 0, 0, 10);
// // const cameraMatrix = projMatrix.multiplySelf(viewMatrix);
// const cameraMatrix = perspective(zoom, canvas.width / canvas.height, 1, 100);
// cameraMatrix.translateSelf(0, 0, -zoom * 5);

// for ortho view:
// const cameraMatrix = orthogonal(zoom * ratio, zoom, 100);
// cameraMatrix.translateSelf((zoom * ratio) / 2, -zoom / 2, -zoom);

// cam.view();

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

export default {
  gl,
  program,
  canvas,
};
