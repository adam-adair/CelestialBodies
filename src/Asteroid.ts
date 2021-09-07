import { Color } from "./colors";
import {
  ProceduralTextureData,
  Vertex,
} from "./mesh";

import { Planet} from "./Planet";
import { Sphere } from "./Sphere";
import { Star } from "./Star";
import { Body } from "./bodies";
import { GameObjects } from "./GameObjects";

export class Asteroid extends Sphere {
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
    super(
      name,
      size,
      precision,
      mass,
      velocity,
      acceleration,
      texture,
      color
    );
  }
  checkCollision(gameObjects: GameObjects, otherObject: Star | Planet | Asteroid) {
    if (this.intersect(otherObject)) {
      console.log("COLLISION");
      this.handleCollision(gameObjects, otherObject);
    }
  }

  handleCollision(gameObjects: GameObjects, otherObject: Star | Planet | Asteroid){
    //if the other object is a star then that handling takes precedence
      if (otherObject instanceof Asteroid) {
       // if two asteroids collide, just split again?
      //  this.split(gameObjects,otherObject);
    } else otherObject.handleCollision(gameObjects,this);
  }

}
