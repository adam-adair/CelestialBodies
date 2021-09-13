import { Face, Mesh, V } from "./mesh";
import { Body } from "./bodies";

export class Barycenter extends Mesh {
  mass: number;
  constructor(orbitingBodies: Body[]) {
    const vertices: V[] = [];
    const faces: Face[] = [];
    super(vertices, faces);

    this.mass = orbitingBodies.reduce((mass, body) => mass + body.mass, 0);
    let centerOfMass = new V(0, 0, 0);
    for (let x = 0; x < orbitingBodies.length; x++) {
      centerOfMass = centerOfMass.add(
        orbitingBodies[x].position.scale(1 / this.mass)
      );
    }
    this.position = centerOfMass;
  }
}
