import Colors, { Color } from "./colors";
import { ProceduralTextureData, Vertex } from "./mesh";

import { Sphere } from "./Sphere";
import { Body } from "./bodies";
import { GameObjects } from "./GameObjects";
import { calculateTemperature } from "./utils";
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
  luminosity: number;
  temperature: number;
  constructor(
    name: string,
    precision: number,
    mass?: number,
    velocity?: Vertex,
    acceleration?: Vertex,
    texture?: HTMLImageElement | ProceduralTextureData
  ) {
    //include normals (which on a unit sphere are the verts) as 3rd param to smooth out sphere

    const luminosity = mass ** 3.5;
    const radius = starMasstoRadius(mass); //**(v-1)/(v+3); // mass and radius are in solar units
    const temperature = calculateTemperature(mass, radius);
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

    //in case we want to have lighting come from stars and dynamically adjust color and brightness
    this.temperature = temperature; //in Kelvins (thousands)
    this.luminosity = luminosity; // 4*Math.PI*((size/2)**2)*(temperature**4 )  // divided by some
    this.addToList();
  }
  handleCollision(gameObjects: GameObjects, otherObject: Body) {
    // stars will absorb the other object, no matter what it is. If we make black holes in the future then we may have to change that.
    this.absorb(gameObjects, otherObject);
    otherObject.destroy(gameObjects);
  }

  checkCollision(gameObjects: GameObjects, otherObject: Body) {
    if (this.intersect(otherObject)) {
      this.handleCollision(gameObjects, otherObject);
    }
  }

  absorb(gameObjects: GameObjects, otherObject: Body) {
    // Stars have a different absorb function than other types, which is defined in the Body class. Just add to the star's mass, resize and recolor the star based on the new mass.
    // this.velocity = this.velocity.add(otherObject.velocity.scale(this.mass/otherObject.mass));
    this.mass += otherObject.mass;
    const newSize = starMasstoRadius(this.mass);
    this.rescale(newSize / this.size);
    this.size = newSize;
    this.temperature = calculateTemperature(this.mass, this.size);
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
