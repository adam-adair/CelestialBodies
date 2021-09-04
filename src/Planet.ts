import { Color } from "./colors";
import { ProceduralTextureData, Vertex } from "./mesh";

import { Asteroid } from "./Asteroid";
import { Sphere } from "./Sphere";
import { Star } from "./Star";
import { Body } from "./bodies";
import { GameObjects } from "./GameObjects";

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
      console.log("COLLISION");
      this.handleCollision(gameObjects, otherObject);
    }
  }

  handleCollision(gameObjects: GameObjects, otherObject: Body) {
    //if the other object is a star then that handling takes precedence
    if (otherObject instanceof Star)
      otherObject.handleCollision(gameObjects, this);
    else if (otherObject instanceof Planet) {
      // logic to decide whether planets merge or break into pieces. for now they'll just always absorb
      if(this.mass>otherObject.mass) this.absorb(gameObjects, otherObject);
      else otherObject.absorb(gameObjects,this)
      // this.split();
    } else if (otherObject instanceof Asteroid){
      if(this.mass>otherObject.mass) this.absorb(gameObjects, otherObject);
      else otherObject.absorb(gameObjects,this)
    }
  }
}
