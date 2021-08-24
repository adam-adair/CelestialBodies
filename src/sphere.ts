import { Color } from "./colors";
import { Face, Mesh, textureCoord, Vertex } from "./mesh";

export class Sphere extends Mesh {
  size: number;
  precision: number;
  constructor(
    size: number,
    precision: number,
    textureUrl: string,
    color?: Color
  ) {
    const vertices: Vertex[] = [];
    const faces: Face[] = [];
    const textureCoords: textureCoord[] = [];
    for (let j = 0; j <= precision; j++) {
      const aj = (j * Math.PI) / precision;
      const sj = Math.sin(aj);
      const cj = Math.cos(aj);
      for (let i = 0; i <= precision; i++) {
        const ai = (i * 2 * Math.PI) / precision;
        const si = Math.sin(ai);
        const ci = Math.cos(ai);
        vertices.push(new Vertex(si * sj, cj, ci * sj));
        textureCoords.push({ u: i / precision, v: j / precision });
      }
    }
    for (let j = 0; j < precision; j++) {
      for (let i = 0; i < precision; i++) {
        const p1 = j * (precision + 1) + i;
        const p2 = p1 + (precision + 1);
        faces.push(new Face(p1, p2, p1 + 1, color));
        faces.push(new Face(p1 + 1, p2, p2 + 1, color));
      }
    }
    //include normals (which on a unit sphere are the verts) as 3rd param to smooth out sphere
    super(vertices, faces, vertices, textureUrl, textureCoords);
    //in case we need size or precision later
    this.size = size;
    this.precision = precision;
    //make sphere unit sphere and scale it to size
    this.scale(size, size, size);
  }
}
