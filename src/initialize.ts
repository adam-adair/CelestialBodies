import { constants } from "./constants";
import { get } from "./utils";

const { clearColor, lightDirection, ambientLightAmount } = constants;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = get("canvasContainer").scrollWidth;
canvas.height = get("canvasContainer").scrollHeight;
//initialize webgl
const gl = canvas.getContext("webgl");
const program = gl.createProgram();

//shader source
const vs_source = require("./glsl/vshader.glsl") as string;
const fs_source = require("./glsl/fshader.glsl") as string;

const VShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(VShader, vs_source);
gl.compileShader(VShader);
const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragShader, fs_source);
gl.compileShader(fragShader);

gl.attachShader(program, VShader);
gl.attachShader(program, fragShader);
gl.linkProgram(program);
gl.useProgram(program);

//set background color, enable depth
gl.clearColor(clearColor.r, clearColor.g, clearColor.b, clearColor.a);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.enable(gl.DEPTH_TEST);

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
