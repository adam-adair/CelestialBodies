/*
This engine uses and adapts code from David Rousset's excellent tutorial on building a 3d software engine:
https://www.davrous.com/2013/06/13/tutorial-series-learning-how-to-write-a-3d-soft-engine-from-scratch-in-c-typescript-or-javascript/
and from Maxime Euzière's equally excellent guide to WebGL:
https://xem.github.io/articles/webgl-guide.html
*/
import { Color, White } from "./colors";
import initialize from "./initialize";

const { gl, program } = initialize;

export class Matrix extends DOMMatrix {
  transposeSelf() {
    let temp;
    temp = this.m12;
    this.m12 = this.m21;
    this.m21 = temp;

    temp = this.m13;
    this.m13 = this.m31;
    this.m31 = temp;

    temp = this.m14;
    this.m14 = this.m41;
    this.m41 = temp;

    temp = this.m23;
    this.m23 = this.m32;
    this.m32 = temp;

    temp = this.m24;
    this.m24 = this.m42;
    this.m42 = temp;

    temp = this.m34;
    this.m34 = this.m43;
    this.m43 = temp;
  }
}

export class Vertex {
  x: number;
  y: number;
  z: number;
  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  public subtract(otherVertex: Vertex): Vertex {
    return new Vertex(
      this.x - otherVertex.x,
      this.y - otherVertex.y,
      this.z - otherVertex.z
    );
  }
  public add(otherVertex: Vertex): Vertex {
    return new Vertex(
      this.x + otherVertex.x,
      this.y + otherVertex.y,
      this.z + otherVertex.z
    );
  }
  public scale(factor: number): Vertex {
    return new Vertex(this.x * factor, this.y * factor, this.z * factor);
  }
  public cross(otherVertex: Vertex): Vertex {
    return new Vertex(
      this.y * otherVertex.z - this.z * otherVertex.y,
      this.z * otherVertex.x - this.x * otherVertex.z,
      this.x * otherVertex.y - this.y * otherVertex.x
    );
  }
  public dot(otherVertex: Vertex): number {
    return (
      this.x * otherVertex.x + this.y * otherVertex.y + this.z * otherVertex.z
    );
  }
  public magnitude(): number {
    //the length of the vector
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  public normalize() {
    // rescales the length of the vector to 1, which makes it easier to calculate the point to move to based on distance traveled in a frame.
    const m = this.magnitude();
    if (m > 0) {
      return this.scale(1 / m);
    }
  }
}

export class Face {
  vAi: number;
  vBi: number;
  vCi: number;
  color: Color;
  constructor(vA: number, vB: number, vC: number, color: Color = White) {
    this.vAi = vA;
    this.vBi = vB;
    this.vCi = vC;
    this.color = color;
  }
}
export type textureCoord = { u: number; v: number };
export interface ProceduralTextureData {
  width: number;
  height: number;
  data: Uint8Array;
}
export class Mesh {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  vertices: Vertex[];
  normals: Vertex[];
  position: Vertex;
  rotation: Vertex;
  scale: Vertex;
  faces: Face[];
  pMatrix: Matrix;
  rMatrix: Matrix;
  sMatrix: Matrix;
  buffer: WebGLBuffer;
  vbo: Float32Array;
  textureCoords: textureCoord[];
  gl_texture: WebGLTexture;
  texture: HTMLImageElement | ProceduralTextureData;
  constructor(
    vertices: Vertex[],
    faces: Face[],
    normals?: Vertex[],
    textureCoords?: textureCoord[],
    texture?: HTMLImageElement | ProceduralTextureData
  ) {
    this.gl = gl;
    this.program = program;
    this.vertices = vertices;
    this.faces = faces;
    if (normals) this.normals = normals;
    this.pMatrix = new Matrix();
    this.rMatrix = new Matrix();
    this.sMatrix = new Matrix();
    this.position = new Vertex(0, 0, 0);
    this.rotation = new Vertex(0, 0, 0);
    this.scale = new Vertex(1, 1, 1);
    this.texture = texture;
    this.textureCoords = textureCoords;
    this.initialize(texture);
    this.buffer = this.gl.createBuffer();
  }

  static async fromSerialized(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    url: string
  ): Promise<Mesh> {
    const res = await fetch(url);
    const obj = await res.json();
    const vertices: Vertex[] = [];
    const faces: Face[] = [];
    // for serialized mesh
    const { v, f, c } = obj;
    const colors: Color[] = [];
    for (let i = 0; i < v.length; i += 3) {
      vertices.push(new Vertex(v[i], v[i + 1], v[i + 2]));
    }
    for (let i = 0; i < c.length; i += 3) {
      colors.push(new Color(c[i], c[i + 1], c[i + 2]));
    }
    for (let i = 0; i < f.length; i += 4) {
      faces.push(new Face(f[i], f[i + 1], f[i + 2], colors[f[i + 3]]));
    }
    return new Mesh(vertices, faces);
  }

  static async fromObjMtl(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    url: string,
    mtlUrl: string,
    scale: number
  ): Promise<Mesh> {
    const res = await fetch(url);
    const objArr = (await res.text()).split("\n");
    const mtlRes = await fetch(mtlUrl);
    const mtlArr = (await mtlRes.text()).split("\n");
    const vertices: Vertex[] = [];
    const faces: Face[] = [];
    type MaterialsList = {
      [key: string]: Color;
    };
    const Colors: MaterialsList = {};
    for (let i = 0; i < mtlArr.length; i++) {
      const ln = mtlArr[i].split(" ");
      if (ln[0] === "newmtl") {
        const cols = mtlArr[i + 3].split(" ");
        Colors[ln[1]] = new Color(+cols[1], +cols[2], +cols[3]);
      }
    }
    let currentCol = "";
    for (let i = 0; i < objArr.length; i++) {
      const ln = objArr[i].split(" ");
      if (ln[0] === "usemtl") currentCol = ln[1];
      if (ln[0] === "v")
        vertices.push(
          new Vertex(+ln[1] * scale, +ln[2] * scale, +ln[3] * scale)
        );
      if (ln[0] === "f") {
        const A = +ln[1].split("/")[0] - 1;
        const B = +ln[2].split("/")[0] - 1;
        const C = +ln[3].split("/")[0] - 1;
        faces.push(new Face(A, B, C, Colors[currentCol]));
      }
    }
    return new Mesh(vertices, faces);
  }

  draw = (): void => {
    const { gl, program } = this;
    if (this.texture) {
      const sampler = gl.getUniformLocation(program, "sampler");
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.gl_texture);

      if ("data" in this.texture) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          this.texture.width,
          this.texture.height,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          this.texture.data
        );
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGB,
          gl.RGB,
          gl.UNSIGNED_BYTE,
          this.texture
        );
      }
      gl.uniform1i(sampler, 0);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vbo, gl.STATIC_DRAW);
    const FSIZE = this.vbo.BYTES_PER_ELEMENT;

    const position = gl.getAttribLocation(program, "position");
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, FSIZE * 11, 0);
    gl.enableVertexAttribArray(position);

    const color = gl.getAttribLocation(program, "color");
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, FSIZE * 11, FSIZE * 3);
    gl.enableVertexAttribArray(color);

    const normal = gl.getAttribLocation(program, "normal");
    gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, FSIZE * 11, FSIZE * 6);
    gl.enableVertexAttribArray(normal);

    const texCoord = gl.getAttribLocation(program, "texCoord");
    gl.vertexAttribPointer(texCoord, 2, gl.FLOAT, false, FSIZE * 11, FSIZE * 9);
    gl.enableVertexAttribArray(texCoord);

    // Set the model matrix
    const model = gl.getUniformLocation(program, "model");
    const nMatrix = gl.getUniformLocation(program, "nMatrix");

    const modelMatrix = this.sMatrix.multiply(
      this.pMatrix.multiply(this.rMatrix)
    );
    const normalMatrix = new Matrix(modelMatrix.toString());
    normalMatrix.invertSelf();
    normalMatrix.transposeSelf();

    gl.uniformMatrix4fv(model, false, modelMatrix.toFloat32Array());
    gl.uniformMatrix4fv(nMatrix, false, normalMatrix.toFloat32Array());

    gl.drawArrays(gl.TRIANGLES, 0, this.faces.length * 3);
  };

  distance(otherObject: Mesh) {
    return this.directionalVector(otherObject).magnitude();
  }

  directionalVector(otherObject: Mesh): Vertex {
    return this.position.subtract(otherObject.position);
  }

  rotate(x: number, y: number, z: number): void {
    this.rotation = this.rotation.subtract(new Vertex(-x, -y, -z));
    this.rMatrix.rotateSelf(x, y, z);
  }

  translate(x: number, y: number, z: number): void {
    this.position = this.position.subtract(new Vertex(-x, -y, -z));
    this.pMatrix.translateSelf(x, y, z);
  }

  rescale(x: number): void {
    this.scale = this.scale.scale(x);
    this.sMatrix.scaleSelf(x, x, x);
  }

  serialize(precision: number): string {
    const v = [];
    const f = [];
    const c = [];
    const colorsArray: string[] = [];
    for (let i = 0; i < this.vertices.length; i++) {
      const vert = this.vertices[i];
      v.push(
        +vert.x.toFixed(precision),
        +vert.y.toFixed(precision),
        +vert.z.toFixed(precision)
      );
    }
    for (let i = 0; i < this.faces.length; i++) {
      const face = this.faces[i];
      const faceColor =
        "r" + face.color.r + "g" + face.color.g + "b" + face.color.b;
      if (!colorsArray.includes(faceColor)) {
        colorsArray.push(faceColor);
        c.push(face.color.r, face.color.g, face.color.b);
      }
      const colorIndex = colorsArray.indexOf(faceColor);
      f.push(face.vAi, face.vBi, face.vCi, colorIndex);
    }
    return JSON.stringify({ v, f, c });
  }

  initialize(texture: HTMLImageElement | ProceduralTextureData) {
    const arr = [];
    for (let i = 0; i < this.faces.length; i++) {
      const { vAi, vBi, vCi, color } = this.faces[i];
      const vA = this.vertices[vAi];
      const vB = this.vertices[vBi];
      const vC = this.vertices[vCi];
      let normalA, normalB, normalC, tA, tB, tC;
      if (this.normals) {
        normalA = this.normals[vAi];
        normalB = this.normals[vBi];
        normalC = this.normals[vCi];
      } else
        normalA = normalB = normalC = vA.subtract(vB).cross(vA.subtract(vC));
      //texture coords
      if (texture) {
        this.gl_texture = this.gl.createTexture();
        this.texture = texture;
        tA = this.textureCoords[vAi];
        tB = this.textureCoords[vBi];
        tC = this.textureCoords[vCi];
      } else {
        tA = { u: 0.0, v: 0.0 };
        tB = { u: 0.0, v: 0.0 };
        tC = { u: 0.0, v: 0.0 };
      }
      // prettier-ignore
      arr.push(
        vA.x, vA.y, vA.z, color.r, color.g, color.b, normalA.x, normalA.y, normalA.z,  tA.u, tA.v,
        vB.x, vB.y, vB.z, color.r, color.g, color.b, normalB.x, normalB.y, normalB.z,  tB.u, tB.v,
        vC.x, vC.y, vC.z, color.r, color.g, color.b, normalC.x, normalC.y, normalC.z,  tC.u, tC.v
        )
    }
    this.vbo = new Float32Array(arr);
  }
}
