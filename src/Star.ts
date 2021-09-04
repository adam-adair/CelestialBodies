import Colors, { Color } from "./colors";
import { ProceduralTextureData, Vertex } from "./mesh";

import { Sphere } from "./Sphere";
import { Body } from "./bodies";
import { GameObjects } from "./GameObjects";
import { starMasstoRadius, calculateTemperature } from "./utils";

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
    size: number,
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

    console.log(`Temperature of ${name}is`, temperature);
    const color = pickColor(temperature);

    super(
      name,
      radius,
      precision,
      mass,
      velocity,
      acceleration,
      texture,
      color
    );

    //in case we want to have lighting come from stars and dynamically adjust color and brightness
    this.temperature = temperature; //in Kelvins (thousands)
    this.luminosity = luminosity; // 4*Math.PI*((size/2)**2)*(temperature**4 )  // divided by some
  }
  handleCollision(gameObjects: GameObjects, otherObject: Body) {
    //if two stars collide then, just add the mass and size to one of them and destroy the other
    //if something else collides then add the mass only?
    this.absorb(gameObjects, otherObject);
    otherObject.destroy(gameObjects);
  }

  checkCollision(gameObjects: GameObjects, otherObject: Body) {
    if (this.intersect(otherObject)) {
      console.log("COLLISION");
      this.handleCollision(gameObjects, otherObject);
    }
  }

  absorb(gameObjects: GameObjects, otherObject: Body) {
    // this.velocity = this.velocity.add(otherObject.velocity.scale(this.mass/otherObject.mass));
    this.mass += otherObject.mass;
    const newSize = starMasstoRadius(this.mass);
    this.rescale(newSize/this.size);
    this.size=newSize;
    this.temperature = calculateTemperature(this.mass, this.size);
    this.reColor();
  }

  reColor() {
    const newColor = pickColor(this.temperature);
    if (this.faces[0].color !== newColor) {
      console.log("RECOLOR");
      this.faces.forEach((face) => {
        face.color = newColor;
      });
      this.initialize(this.texture);
    }
  }
}
