import { Color } from "./colors";
import { constants } from "./constants";
import {
  Face,
  Mesh,
  ProceduralTextureData,
  textureCoord,
  Vertex,
} from "./mesh";
import {getDirectionalVector, getGravitationalForce, equalCentripGravity} from "./physics";

export class Body extends Mesh {
  name: string;
  size: number;
  mass: number; // kg
  velocity: Vertex; // changes in location (in AUs) in that direction in a frame. due to gravitational constant, 1 frame is 1 day.
  acceleration: Vertex; // change in AU to velocity in a frame, again 1 frame is 1 day.
  constructor(
    name: string,
    d: number,
    mass?: number,
    color?: Color,
    velocity?: Vertex,
    acceleration?: Vertex,
    vertices?: Vertex[],
    faces?: Face[],
    normals?: Vertex[],
    textureCoords?: textureCoord[],
    texture?: HTMLImageElement | ProceduralTextureData
    ) {
    if(!vertices) {
     vertices = [];
    vertices[0] = new Vertex(-d, -d, -d);
    vertices[1] = new Vertex(-d, -d, d);
    vertices[2] = new Vertex(-d, d, -d);
    vertices[3] = new Vertex(-d, d, d);
    vertices[4] = new Vertex(d, -d, -d);
    vertices[5] = new Vertex(d, d, -d);
    vertices[6] = new Vertex(d, -d, d);
    vertices[7] = new Vertex(d, d, d);
    }

    if(!faces) {
      faces = [];
    faces[0] = new Face(0, 1, 2, color);
    faces[1] = new Face(3, 2, 1, color);
    faces[2] = new Face(5, 7, 4, color);
    faces[3] = new Face(6, 4, 7, color);
    faces[4] = new Face(2, 3, 5, color);
    faces[5] = new Face(7, 5, 3, color);
    faces[6] = new Face(4, 6, 0, color);
    faces[7] = new Face(1, 0, 6, color);
    faces[8] = new Face(3, 1, 7, color);
    faces[9] = new Face(6, 7, 1, color);
    faces[10] = new Face(5, 4, 2, color);
    faces[11] = new Face(0, 2, 4, color);
    }
    super(vertices, faces, normals, textureCoords, texture);

    this.size = d;
    this.mass = mass ? mass : 1;
    this.velocity = velocity ? velocity : new Vertex(0,0,0);
    this.acceleration = acceleration ? acceleration : new Vertex(0,0,0);
    this.name = name;
  }

  update(){
    this.velocity = this.velocity.subtract(this.acceleration);

    this.translate(this.velocity.x, this.velocity.y, this.velocity.z);
    this.acceleration = this.acceleration.scale(0);
  }

  applyForce(force: Vertex){
    this.acceleration= this.acceleration.add(force.scale(1/this.mass));
  }

  calculateAttraction(objectTwo:Body, fps: number): Vertex {
    let direction = getDirectionalVector(this,objectTwo);
    const distance = direction.magnitude(); // astronomical units AU
    direction.normalize();
    let gravitationalForce = getGravitationalForce(this, objectTwo, distance); // cubic meters per kilogram per second per second
    gravitationalForce = gravitationalForce / (constants.simluationSpeed/fps)
    // convert gravitational force to frames, where ~60 frames = 23 days.

    direction = direction.scale(gravitationalForce);
    return direction;
  }

  setStableOrbit(sun: Body) {
    // still working on this. it is only designed for planets directly to the left or right of a central mass and it's quite right yet.
    const force = equalCentripGravity(this, sun);
    this.velocity = new Vertex(0,force,0);
    this.acceleration = this.acceleration.scale(0);
  }
}

export class Barycenter extends Body {
  constructor(d: number, mass?: number, color?: Color, velocity?: Vertex, acceleration?: Vertex, ){
    super("barycenter",d,mass, color, velocity, acceleration);
  }
  place(movables:Body[]): void {
    const totalMass = movables.reduce((sum, movable) => sum+movable.mass, 0);
    let centerOfMass = new Vertex(0,0,0);
    for(let x = 0; x< movables.length; x++){
      centerOfMass = centerOfMass.add(movables[x].position.scale(1/totalMass));
    }
    this.position = centerOfMass;
  }
}
