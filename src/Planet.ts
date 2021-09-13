import { ProceduralTextureData, Vertex } from "./mesh";
import { Color, randomColor } from "./colors";
import { constants } from "./constants";
import { Sphere } from "./Sphere";
import { Star } from "./Star";
import { Body } from "./bodies";
import { GameObjects } from "./GameObjects";
import { randomInRange, seperateSpawnPoints } from "./utils";
const planetList = document.getElementById("planetList");

const {
  minPlanetMass,
  maxPlanetMass,
  impactThreshold,
} = constants;

export class Planet extends Sphere {
  hitBoxTimer: number;
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
    super(name, size, precision, mass, velocity, acceleration, texture, color);
    this.addToList();
    this.hitBoxTimer = 30;
  }

  update() {
    if (this.hitBoxTimer > -1) {
      --this.hitBoxTimer;
      if (this.hitBoxTimer === 0) {
        this.addToAttractors().addToMovers();
      }
    }
    Sphere.prototype.update.call(this);
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
      const bigger = this.mass >= otherObject.size ? this : otherObject;
      const smaller = bigger !== this ? this : otherObject;
      const newVelocity = bigger.alterTrajectory(smaller);
      const diff = newVelocity.add(bigger.velocity).magnitude();
      if (
        diff > impactThreshold ||
        bigger.mass + smaller.mass > maxPlanetMass
      ) {
        bigger.split(gameObjects, smaller);
      } else {
        bigger.absorb(gameObjects, smaller);
      }
    }
  }

  split(gameObjects: GameObjects, otherObject: Body) {
    const initialMass = this.mass + otherObject.mass;
    const initialSize = this.size + otherObject.size;

    let maxMass = Math.max(initialMass * 0.333333333, minPlanetMass); // limit debris to 1/3 the total mass
    const initialVelocity = this.alterTrajectory(otherObject); //find trajectory of the combined mass before it splits,
    const unitVelocity = initialVelocity.normalize(); // normalize the velocity to 0-1 scale to make it easier to offset
    const startPosition = this.position.add(otherObject.position).scale(1 / 2); // debris spawns from midway between planets
    const randomOffset = () => Math.random() * 2 - 1;
    let remainingMass = initialMass;
    while (remainingMass >= minPlanetMass) {
      maxMass = Math.min(maxMass, remainingMass);
      const newMass = Math.min(
        remainingMass,
        randomInRange(maxMass,minPlanetMass)
      ); // this piece of debris will either be randomly sized within limits, or the remaining amount, whichever is smaller.
      let newSize = (newMass / initialMass) * initialSize; // size of the new object has same proportion as its mass
      const newSpeed = initialVelocity.scale(initialMass / newMass).magnitude(); //objects should speed up as their mass decreases, ignoring friction from the collision
      const randomDirection = new Vertex(
        unitVelocity.x - randomOffset(),
        unitVelocity.y - randomOffset(),
        unitVelocity.z - randomOffset()
      );
      const newVelocity = randomDirection.normalize().scale(newSpeed);
      const debris = new Planet(
        "Debris",
        newSize,
        16,
        newMass,
        newVelocity,
        new Vertex(0, 0, 0),
        this.texture,
        randomColor()
      )
      const [x,y,z]=seperateSpawnPoints(startPosition,newVelocity,newSize);
      debris.translate(x,y,z);
      remainingMass -= newMass;
    }
    this.destroy(gameObjects);
    otherObject.destroy(gameObjects);
  }

  addToList() {
    const item = this.createOrUpdateListItem();
    planetList.appendChild(item);
  }
}
