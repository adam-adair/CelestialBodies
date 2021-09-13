import { V } from "./mesh";
import { constants } from "./constants";
import initialize from "./initialize";
import { Body } from "./bodies";
const { canvas, gl, program } = initialize;
const { zoom } = constants;

export class Camera {
  viewM: DOMMatrix;
  projM: DOMMatrix;
  cameraGL: WebGLUniformLocation;
  followTarget: Body | null;
  watchTarget: Body | null;
  constructor() {
    this.cameraGL = gl.getUniformLocation(program, "camera");
    this.viewM = new DOMMatrix();
    this.move(0, 3, 25);
    this.projM = this.perspective(zoom, canvas.width / canvas.height, 1, 1000);
    this.followTarget = null;
    this.watchTarget = null;
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
    const cameraM = this.projM.multiply(this.viewM.inverse());
    gl.uniformMatrix4fv(this.cameraGL, false, cameraM.toFloat32Array());
  }
  rotate(x: number, y: number, z: number) {
    this.viewM.rotateSelf(y, x, z);
  }
  move(x = 0, y = 0, z = 0) {
    this.viewM.translateSelf(x, y, z);
    const distFromOrigin = this.getPosition().magnitude();
    if (distFromOrigin >= constants.universeSize * 0.9) {
      this.viewM.translateSelf(-x, -y, -z);
    }
  }
  getPosition() {
    const worldM = this.viewM.inverse();
    return new V(worldM.m41, worldM.m42, worldM.m43);
  }
  lookAt(target: V) {
    const camPosition = this.getPosition();
    const tmp = new V(0, 1, 0);

    const forward = camPosition.subtract(target).normalize();
    const right = tmp.cross(forward).normalize();
    const up = forward.cross(right).normalize();

    this.viewM = new DOMMatrix([
      right.x,
      right.y,
      right.z,
      0,
      up.x,
      up.y,
      up.z,
      0,
      forward.x,
      forward.y,
      forward.z,
      0,
      camPosition.x,
      camPosition.y,
      camPosition.z,
      1,
    ]);
    this.view();
  }
  follow(target?: Body) {
    this.followTarget = target;
  }
  watch(target?: Body) {
    this.watchTarget = target;
  }
}
