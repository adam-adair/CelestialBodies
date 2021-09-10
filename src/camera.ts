import { Vertex } from "./mesh";
import { constants } from "./constants";
import initialize from "./initialize";
const { canvas, gl, program } = initialize;
const { zoom } = constants;

export class Camera {
  eye: DOMPoint;
  target: DOMPoint;
  projMatrix: DOMMatrix;
  cameraGL: WebGLUniformLocation;
  constructor(eye: DOMPoint, target: DOMPoint) {
    this.eye = eye;
    this.target = target;
    this.cameraGL = gl.getUniformLocation(program, "camera");
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
  lookAt = (
    cameraX: number,
    cameraY: number,
    cameraZ: number,
    targetX: number,
    targetY: number,
    targetZ: number,
    upX = 0,
    upY = 1,
    upZ = 0
  ) => {
    let fx, fy, fz, rlf, sx, sy, sz, rls, ux, uy, uz;
    fx = targetX - cameraX;
    fy = targetY - cameraY;
    fz = targetZ - cameraZ;
    rlf = 1 / Math.hypot(fx, fy, fz);
    fx *= rlf;
    fy *= rlf;
    fz *= rlf;
    sx = fy * upZ - fz * upY;
    sy = fz * upX - fx * upZ;
    sz = fx * upY - fy * upX;
    rls = 1 / Math.hypot(sx, sy, sz);
    sx *= rls;
    sy *= rls;
    sz *= rls;
    ux = sy * fz - sz * fy;
    uy = sz * fx - sx * fz;
    uz = sx * fy - sy * fx;
    // prettier-ignore
    const ret = new DOMMatrix([
      sx, ux, -fx, 0,
      sy, uy, -fy, 0,
      sz, uz, -fz, 0,
      0, 0, 0, 1,
    ]);
    return ret.translateSelf(-cameraX, -cameraY, -cameraZ);
  };
  view() {
    const { eye, target } = this;
    const viewMatrix = this.lookAt(
      eye.x,
      eye.y,
      eye.z,
      target.x,
      target.y,
      target.z
    );
    const cameraMatrix = this.projMatrix.multiply(viewMatrix);
    gl.uniformMatrix4fv(this.cameraGL, false, cameraMatrix.toFloat32Array());
  }
  rotateAroundEye(x: number, y: number) {
    const t = new DOMMatrix();
    t.translateSelf(-this.eye.x, -this.eye.y, -this.eye.z);
    this.target = this.target.matrixTransform(t);
    // const matrix = new DOMMatrix(`rotate3d(${0 * y},${0 * x},${y},1deg)`);
    const matrix = new DOMMatrix();
    matrix.rotateSelf(y * 20, x * 20, 0);
    this.target = this.target.matrixTransform(matrix);
    t.invertSelf();
    this.target = this.target.matrixTransform(t);
  }
  move(x = 0, y = 0, z = 0) {
    const t = new DOMMatrix();
    t.translateSelf(x, y, z);
    this.target = this.target.matrixTransform(t);
    this.eye = this.eye.matrixTransform(t);
  }
}
