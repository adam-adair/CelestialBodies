import { Matrix, Vertex } from "./mesh";
import initialize from "./initialize";
const { gl, program } = initialize;

export class Grid {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  vertices: Vertex[];
  pMatrix: Matrix;
  rMatrix: Matrix;
  sMatrix: Matrix;
  buffer: WebGLBuffer;
  vbo: Float32Array;
  drawStyle: number;
  constructor(gridSize: number, gridWidth: number, points = false) {
    this.gl = gl;
    this.program = program;
    this.drawStyle = points ? gl.POINTS : gl.LINES;
    const translate = (gridSize * gridWidth) / 2;
    const vertices: Vertex[] = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        vertices.push(
          new Vertex(-translate + gridWidth * i, 0, -translate + gridWidth * j)
        );
        vertices.push(
          new Vertex(
            -translate + gridWidth * (i + 1),
            0,
            -translate + gridWidth * j
          )
        );

        vertices.push(
          new Vertex(
            -translate + gridWidth * (i + 1),
            0,
            -translate + gridWidth * j
          )
        );
        vertices.push(
          new Vertex(
            -translate + gridWidth * (i + 1),
            0,
            -translate + gridWidth * (j + 1)
          )
        );

        vertices.push(
          new Vertex(
            -translate + gridWidth * (i + 1),
            0,
            -translate + gridWidth * (j + 1)
          )
        );
        vertices.push(
          new Vertex(
            -translate + gridWidth * i,
            0,
            -translate + gridWidth * (j + 1)
          )
        );

        vertices.push(
          new Vertex(
            -translate + gridWidth * i,
            0,
            -translate + gridWidth * (j + 1)
          )
        );
        vertices.push(
          new Vertex(-translate + gridWidth * i, 0, -translate + gridWidth * j)
        );
      }
    }
    this.vertices = vertices;
    this.pMatrix = new Matrix();
    this.rMatrix = new Matrix();
    this.sMatrix = new Matrix();
    const arr = [];
    for (let i = 0; i < this.vertices.length; i++) {
      const vA = this.vertices[i];
      // prettier-ignore
      arr.push(
        vA.x, vA.y, vA.z, 1.0, 1.0, 1.0, -99.0
        )
    }
    this.vbo = new Float32Array(arr);
    this.buffer = this.gl.createBuffer();
  }
  draw() {
    const { gl, program } = this;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vbo, gl.STATIC_DRAW);
    const FSIZE = this.vbo.BYTES_PER_ELEMENT;

    const position = gl.getAttribLocation(program, "position");
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, FSIZE * 7, 0);
    gl.enableVertexAttribArray(position);

    const color = gl.getAttribLocation(program, "color");
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, FSIZE * 7, FSIZE * 3);
    gl.enableVertexAttribArray(color);

    const texCoord = gl.getAttribLocation(program, "texCoord");
    gl.vertexAttribPointer(texCoord, 2, gl.FLOAT, false, FSIZE * 7, FSIZE * 5);
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

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.drawArrays(this.drawStyle, 0, this.vertices.length);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
}
