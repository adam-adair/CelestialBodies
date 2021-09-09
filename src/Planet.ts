import { ProceduralTextureData, Vertex } from "./mesh";
import { Color, randomColor } from "./colors";
import { constants } from "./constants";

import { Asteroid } from "./Asteroid";
import { Sphere } from "./Sphere";
import { Star } from "./Star";
import { Body } from "./bodies";
import { GameObjects } from "./GameObjects";
const { minMass, impactThreshold } = constants;

export class Planet extends Sphere {
  constructor(
    name: string,
    size: number,
    precision: number,
    mass?: number,
    velocity?: Vertex,
    acceleration?: Vertex,
    texture?: HTMLImageElement | ProceduralTextureData,
    color?: Color
  ) {
    //include normals (which on a unit sphere are the verts) as 3rd param to smooth out sphere
    super(name, size, precision, mass, velocity, acceleration, texture, color);
  }

  checkCollision(gameObjects: GameObjects, otherObject: Body) {
    if (this.intersect(otherObject)) {
      this.handleCollision(gameObjects, otherObject);
    }
  }

  handleCollision(gameObjects: GameObjects, otherObject: Body) {
    //if the other object is a star then that handling takes precedence
    if (otherObject instanceof Star)
      otherObject.handleCollision(gameObjects, this);
    else if (otherObject instanceof Planet) {
      const bigger = this.mass > otherObject.size ? this : otherObject;
      const smaller = this.mass < otherObject.size ? this : otherObject;
      const newVelocity = bigger.alterTrajectory(smaller);
      const diff = newVelocity.add(bigger.velocity).magnitude();
      console.log("Diff", diff);
      if (diff < impactThreshold) {
        bigger.absorb(gameObjects, smaller);
      } else {
        console.log("SPLIT");
        bigger.split(gameObjects, smaller);
      }
    }
    // else if (otherObject instanceof Asteroid){
    //   if(this.mass>otherObject.mass) this.absorb(gameObjects, otherObject);
    //   else otherObject.absorb(gameObjects,this)
    // }
  }

  split(gameObjects: GameObjects, otherObject: Body) {
    const initialMass = this.mass + otherObject.mass;
    const initialSize = this.size + otherObject.size;

    let maxMass = Math.max(initialMass * 0.333333333, minMass); // limiting the size of debris pieces to 1/3 mass of the combined mass because in a scenario where two equal sized planets hit each other, it seems weird if we ended up with debris the size of one of the original planets. but this is largely arbitrary
    const initialVelocity = this.alterTrajectory(otherObject); //find the trajectory of the planets before they split up, this is important to find the momentum of the new objects and to keep them from going in crazy directions.
    const unitVelocity = initialVelocity.normalize(); // normalize the velocity to 0-1 scale to make it easier to offset
    const startPosition = this.position.add(otherObject.position).scale(1 / 2); // debris will be randomly scattered around the midpoint between the planets when they collided
    const randomOffset = () => Math.random() * 2 - 1;
    let remainingMass = initialMass;
    while (remainingMass >= minMass) {
      maxMass = Math.min(maxMass, remainingMass);
      const newMass = Math.min(
        remainingMass,
        Math.random() * (maxMass - minMass) + minMass
      ); // this piece of debris will either be randomly sized within limits, or the remaining amount, whichever is smaller.
      const newSize = (newMass / initialMass) * initialSize; // size of the new object has same proportion as its mass
      const newSpeed = initialVelocity.scale(initialMass / newMass).magnitude(); //objects should speed up as their mass decreases, ignoring friction from the collision
      const randomDirection = new Vertex(
        unitVelocity.x - randomOffset(),
        unitVelocity.y - randomOffset(),
        unitVelocity.z - randomOffset()
      ); // right now the direction of each object is randomly offset. In the future I'd like to prevent the pieces from going in strange directions but that math is beyond me
      const newVelocity = randomDirection.normalize().scale(newSpeed);
      new Planet(
        "Debris",
        newSize,
        16,
        newMass,
        newVelocity,
        new Vertex(0, 0, 0),
        this.texture,
        randomColor()
      )
        .addToAttractors()
        .addToMovers()
        .translate(
          /* start the new object where the 2 planets collided but
          offset enough in the direction of its velocity that it won't
          immediately collide with all the other new objects */
          startPosition.x + newVelocity.x * newSize * 4,
          startPosition.y + newVelocity.y * newSize * 4,
          startPosition.z + newVelocity.z * newSize * 4
        );
      remainingMass -= newMass;
    }
    this.destroy(gameObjects);
    otherObject.destroy(gameObjects);
  }
}
