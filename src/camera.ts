import { Vertex } from "./mesh";
import { constants } from "./constants";
import initialize from "./initialize";
const { canvas, gl, program } = initialize;
const { zoom } = constants;

export class Camera {
  viewMatrix: DOMMatrix;
  projMatrix: DOMMatrix;
  cameraGL: WebGLUniformLocation;
  constructor() {
    this.cameraGL = gl.getUniformLocation(program, "camera");
    this.viewMatrix = new DOMMatrix();
    this.viewMatrix.translateSelf(0, 3, 13);
    this.projMatrix = this.perspective(
      zoom,
      canvas.width / canvas.height,
      1,
      100
    );

  }
  perspective = (fov: number, ratio: number, near: number, far: number) => {
    const tan = 1 / Math.tan((fov * Math.PI) / 180);
    // prettier-ignore
    return new DOMMatrix([
      tan / ratio, 0, 0, 0,
      0, tan, 0, 0,
      0, 0, (far + near) / (near - far), -1,
      0, 0, (2 * near * far) / (near - far), 0
    ]);
  };
  view() {
    const cameraMatrix = this.projMatrix.multiply(this.viewMatrix.inverse());
    gl.uniformMatrix4fv(this.cameraGL, false, cameraMatrix.toFloat32Array());
  }
  rotate(x: number, y: number, z: number) {
    this.viewMatrix.rotateSelf(y, x, z);
  }
  move(x = 0, y = 0, z = 0) {
    this.viewMatrix.translateSelf(x, y, z);
  }
}
