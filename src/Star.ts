import Colors from "./colors";
import { ProceduralTextureData, Vertex } from "./mesh";

import { Sphere } from "./Sphere";
import { Body } from "./bodies";
import { GameObjects } from "./GameObjects";
import { constants } from "./constants";
const { starMasstoRadius, massColorFactor } = constants;

const starList = document.getElementById("starList");

const pickColor = (mass: number) => {
  if (mass <= 0.45 * massColorFactor) return Colors.Red;
  else if (mass <= 0.8 * massColorFactor) return Colors.Orange;
  else if (mass <= 1.04 * massColorFactor) return Colors.Yellow;
  else if (mass <= 1.4 * massColorFactor) return Colors.White;
  else if (mass <= 2.1 * massColorFactor) return Colors.ClassA;
  else if (mass <= 15.8 * massColorFactor) return Colors.ClassB;
  return Colors.Blue;
};

export class Star extends Sphere {
  hitBoxTimer: number;
  constructor(
    name: string,
    precision: number,
    mass?: number,
    velocity?: Vertex,
    acceleration?: Vertex,
    texture?: HTMLImageElement | ProceduralTextureData
  ) {
    const radius = starMasstoRadius(mass);
    const color = pickColor(mass);

    super(
      name,
      radius,
      precision,
      mass,
      velocity,
      acceleration,
      texture,
      color,
      true
    );

    this.hitBoxTimer = 30;
    this.addToList();
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

  handleCollision(gameObjects: GameObjects, otherObject: Body) {
    this.absorb(gameObjects, otherObject);
    otherObject.destroy(gameObjects);
  }

  checkCollision(gameObjects: GameObjects, otherObject: Body) {
    if (this.intersect(otherObject)) {
      this.handleCollision(gameObjects, otherObject);
    }
  }

  absorb(gameObjects: GameObjects, otherObject: Body) {
    this.mass += otherObject.mass;
    const newSize = starMasstoRadius(this.mass);
    this.rescale(newSize / this.size);
    this.size = newSize;
    this.reColor();
  }

  reColor() {
    const newColor = pickColor(this.mass);
    if (this.faces[0].color !== newColor) {
      this.faces.forEach((face) => {
        face.color = newColor;
      });
      this.initialize(this.texture, true);
    }
  }

  addToList() {
    const item = this.createOrUpdateListItem();
    starList.appendChild(item);
  }
}
