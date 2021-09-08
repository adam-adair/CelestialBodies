import { Body } from "./bodies";

export interface GameObjects {
  objects: {
    [key: number]: Body;
  };
  attractors: {
    [key: number]: Body;
  };
  movers: {
    [key: number]: Body;
  };
}

const gameObjects: GameObjects = {
  objects: {},
  attractors: {},
  movers: {},
};

export default gameObjects;
