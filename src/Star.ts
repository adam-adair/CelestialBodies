import Colors, { Color } from "./colors";
import { ProceduralTextureData, Vertex } from "./mesh";

import { Sphere } from "./Sphere";
import { Body } from "./bodies";
import { GameObjects } from "./GameObjects";
import { starMasstoRadius, calculateTemperature } from "./utils";

const starList = document.getElementById("starList");

const pickColor = (temperature: number) => {
  if (temperature <= 3) return Colors.Red;
  else if (temperature <= 4) return Colors.Orange;
  else if (temperature <= 6) return Colors.Yellow;
  else if (temperature <= 7) return Colors.White;
  else if (temperature <= 10) return Colors.ClassA;
  else if (temperature <= 20) return Colors.ClassB;
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
    const color = pickColor(temperature);

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
    const newColor = pickColor(this.temperature);
    if (this.faces[0].color !== newColor) {
      this.faces.forEach((face) => {
        face.color = newColor;
      });
      this.initialize(this.texture, true);
    }
  }

  addToList(){
    const item = this.createOrUpdateListItem();
    starList.appendChild(item);
    }
}
