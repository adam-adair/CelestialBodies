import { Color } from "./colors";
import { constants } from "./constants";
import { Mesh, Vertex, Face } from "./mesh";
import {getDirectionalVector, getGravitationalForce} from "./physics";

export class Body extends Mesh {
  size: number;
  mass: number; // kg
  velocity: Vertex; // changes in location (in AUs) in that direction in a frame. due to gravitational constant, 1 frame is 1 day.
  acceleration: Vertex; // change in AU to velocity in a frame, again 1 frame is 1 day.
  constructor(d: number, mass?: number, color?: Color, velocity?: Vertex, acceleration?: Vertex, ) {
    const Vertices = [];
    Vertices[0] = new Vertex(-d, -d, -d);
    Vertices[1] = new Vertex(-d, -d, d);
    Vertices[2] = new Vertex(-d, d, -d);
    Vertices[3] = new Vertex(-d, d, d);
    Vertices[4] = new Vertex(d, -d, -d);
    Vertices[5] = new Vertex(d, d, -d);
    Vertices[6] = new Vertex(d, -d, d);
    Vertices[7] = new Vertex(d, d, d);

    const Faces = [];
    Faces[0] = new Face(0, 1, 2, color);
    Faces[1] = new Face(3, 2, 1, color);
    Faces[2] = new Face(5, 7, 4, color);
    Faces[3] = new Face(6, 4, 7, color);
    Faces[4] = new Face(2, 3, 5, color);
    Faces[5] = new Face(7, 5, 3, color);
    Faces[6] = new Face(4, 6, 0, color);
    Faces[7] = new Face(1, 0, 6, color);
    Faces[8] = new Face(3, 1, 7, color);
    Faces[9] = new Face(6, 7, 1, color);
    Faces[10] = new Face(5, 4, 2, color);
    Faces[11] = new Face(0, 2, 4, color);
    super(Vertices, Faces);

    this.size = d;
    this.mass = mass ? mass : 0;
    this.velocity = velocity ? velocity : new Vertex(0,0,0);
    this.acceleration = acceleration ? acceleration : new Vertex(0,0,0);
  }

  update(){
    this.velocity = this.velocity.add(this.acceleration);
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
    let gravitationalForce = getGravitationalForce(this, objectTwo, distance); // AUs cubed per kilogram per day per day
    gravitationalForce = gravitationalForce / (constants.simluationSpeed/fps)/100000 //convert gravitational force to frames, where ~60 frames = 23 days. I have to divide by 100000 to slow things down and I don't know why. Maybe the units are off?

    direction = direction.scale(gravitationalForce);

    return direction;
  }
}

export class Barycenter extends Body {
  constructor(d: number, mass?: number, color?: Color, velocity?: Vertex, acceleration?: Vertex, ){
    super(d,mass, color, velocity, acceleration);
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
