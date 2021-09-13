import { Color } from "./colors";
import { constants } from "./constants";
import {
  Face,
  Mesh,
  ProceduralTextureData,
  textureCoord,
  Vertex,
} from "./mesh";
import gameObjects, { GameObjects } from "./GameObjects";
import { Barycenter } from "./barycenter";
import { createListItem, updateListItem } from "./listItems";

const { gravitationalConstant, maxPlanetSize } = constants;
let nextID = 1;

export class Body extends Mesh {
  id: number;
  name: string;
  size: number;
  mass: number;
  velocity: Vertex;
  acceleration: Vertex;
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
    texture?: HTMLImageElement | ProceduralTextureData,
    isStar = false
  ) {
    if (!vertices) {
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

    if (!faces) {
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
    super(vertices, faces, normals, textureCoords, texture, isStar);
    this.id = nextID;
    nextID++;
    this.size = d;
    this.mass = mass ? mass : 1;
    this.velocity = velocity ? velocity : new Vertex(0, 0, 0);
    this.acceleration = acceleration ? acceleration : new Vertex(0, 0, 0);
    this.name = name;
    gameObjects.objects[this.id] = this;
  }

  update() {
    this.velocity = this.velocity.subtract(this.acceleration);
    this.translate(this.velocity.x, this.velocity.y, this.velocity.z);
    this.acceleration = this.acceleration.scale(0);
    this.createOrUpdateListItem();
    if (this.position.magnitude() - this.size > constants.universeSize)
      this.destroy(gameObjects);
  }

  createOrUpdateListItem(): HTMLElement {
    return updateListItem(this) || createListItem(this);
  }

  applyForce(force: Vertex) {
    this.acceleration = this.acceleration.add(force.scale(1 / this.mass));
  }

  gravitationalForce(otherObject: Body, distance: number): number {
    return (
      (gravitationalConstant * this.mass * otherObject.mass) /
      (distance * distance)
    );
  }

  calculateAttraction(objectTwo: Body): Vertex {
    let direction = this.directionalVector(objectTwo);
    const distance = Math.max(direction.magnitude(), 0.01);
    direction = direction.normalize();
    let gravitationalForce = this.gravitationalForce(objectTwo, distance);
    return direction.scale(gravitationalForce);
  }

  forceOfCenterMass(otherObject: Body | Barycenter): number {
    return Math.sqrt(
      (gravitationalConstant * Math.max(this.mass, otherObject.mass)) /
        this.distance(otherObject)
    );
  }

  setStableOrbit(otherObjects: Body | Body[]) {
    const center =
      otherObjects instanceof Body
        ? otherObjects
        : new Barycenter(otherObjects);

    if (this.mass < center.mass) {
      const force = this.forceOfCenterMass(center);
      this.velocity = new Vertex(0, force, 0);
      this.acceleration = this.acceleration.scale(0);
    }
  }

  destroy(gameObjects: GameObjects) {
    // remove all references to the object
    delete gameObjects.objects[this.id];
    delete gameObjects.movers[this.id];
    delete gameObjects.attractors[this.id];
    const element = document.getElementById(this.id.toString());
    if (element) element.remove();
  }

  addToMovers() {
    gameObjects.movers[this.id] = this;
    return this;
  }

  addToAttractors() {
    gameObjects.attractors[this.id] = this;
    return this;
  }

  absorb(gameObjects: GameObjects, otherObject: Body) {
    let newSize = this.size + otherObject.size;
    newSize = Math.min(newSize, maxPlanetSize);
    this.rescale(newSize / this.size);
    this.size = newSize;
    this.alterTrajectory(otherObject);
    this.mass += otherObject.mass;
    otherObject.destroy(gameObjects);
  }

  alterTrajectory(otherObject: Body): Vertex {
    const combinedMass = this.mass + otherObject.mass;
    const obj1ScaledVelocity = this.velocity.scale(this.mass / combinedMass);
    const obj2ScaledVelocity = otherObject.velocity.scale(
      otherObject.mass / combinedMass
    );
    const newVelocity = obj1ScaledVelocity.add(obj2ScaledVelocity);
    this.velocity = newVelocity;
    return newVelocity;
  }
}
