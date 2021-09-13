import { cam } from ".";
import { Mesh } from "./mesh";
import { get } from "./utils";

interface altKey<T> {
  [K: string]: T;
}
const altKeys: altKey<string> = {
  "3": "u",
  "9": "o",
  "8": "i",
  "2": "k",
  "4": "j",
  "6": "l",
  "1": "m",
  "7": ".",
};

export interface PlayerMovement {
  up: boolean;
  left: boolean;
  down: boolean;
  in: boolean;
  out: boolean;
  right: boolean;
  spinR: boolean;
  spinL: boolean;
  spinU: boolean;
  spinD: boolean;
  spinI: boolean;
  spinO: boolean;
  camR: boolean;
  camL: boolean;
  camU: boolean;
  camD: boolean;
  camI: boolean;
  camO: boolean;
  camRL: boolean;
  camRR: boolean;
}

export const handleInput = (
  ev: KeyboardEvent,
  pressed: boolean,
  inp: PlayerMovement
) => {
  const key = altKeys[ev.key] ? altKeys[ev.key] : ev.key;
  switch (key) {
    case "w":
      inp.up = pressed;
      break;
    case "a":
      inp.left = pressed;
      break;
    case "s":
      inp.down = pressed;
      break;
    case "d":
      inp.right = pressed;
      break;
    case "q":
      inp.in = pressed;
      break;
    case "e":
      inp.out = pressed;
      break;
    case "r":
      inp.spinR = pressed;
      break;
    case "f":
      inp.spinL = pressed;
      break;
    case "t":
      inp.spinU = pressed;
      break;
    case "g":
      inp.spinD = pressed;
      break;
    case "y":
      inp.spinI = pressed;
      break;
    case "h":
      inp.spinO = pressed;
      break;
    case "l":
      inp.camR = pressed;
      break;
    case "j":
      inp.camL = pressed;
      break;
    case "i":
      inp.camU = pressed;
      break;
    case "k":
      inp.camD = pressed;
      break;
    case "o":
      inp.camI = pressed;
      break;
    case "u":
      inp.camO = pressed;
      break;
    case "m":
      inp.camRL = pressed;
      break;
    case ".":
      inp.camRR = pressed;
      break;
  }
};

export const movePlayer = (
  player: Mesh,
  inp: PlayerMovement,
  movement: number
) => {
  const posX = <HTMLFormElement>get("posX");
  const posY = <HTMLFormElement>get("posY");
  const posZ = <HTMLFormElement>get("posZ");

  if (inp.up) {
    player.translate(0, movement, 0);
    posY.value = player.position.y.toFixed(2);
  }
  if (inp.down) {
    player.translate(0, -movement, 0);
    posY.value = player.position.y.toFixed(2);
  }
  if (inp.left) {
    player.translate(-movement, 0, 0);
    posX.value = player.position.x.toFixed(2);
  }
  if (inp.right) {
    player.translate(movement, 0, 0);
    posX.value = player.position.x.toFixed(2);
  }
  if (inp.in) {
    player.translate(0, 0, -movement);
    posZ.value = player.position.z.toFixed(2);
  }
  if (inp.out) {
    player.translate(0, 0, movement);
    posZ.value = player.position.z.toFixed(2);
  }
  if (inp.spinL) player.rotate(movement * 10, 0, 0);
  if (inp.spinR) player.rotate(movement * -10, 0, 0);
  if (inp.spinU) player.rotate(0, movement * 10, 0);
  if (inp.spinD) player.rotate(0, movement * -10, 0);
  if (inp.spinI) player.rotate(0, 0, movement * 10);
  if (inp.spinO) player.rotate(0, 0, movement * -10);
};

export const moveCamera = (inp: PlayerMovement, paused = false) => {
  if (inp.camL) {
    cam.follow();
    cam.move(-0.1, 0, 0);
  }
  if (inp.camR) {
    cam.follow();
    cam.move(0.1, 0, 0);
  }
  if (inp.camU) {
    cam.follow();
    cam.move(0, 0.1, 0);
  }
  if (inp.camD) {
    cam.follow();
    cam.move(0, -0.1, 0);
  }
  if (inp.camI) {
    cam.follow();
    cam.move(0, 0, -0.1);
  }
  if (inp.camO) {
    cam.follow();
    cam.move(0, 0, 0.1);
  }
  if (inp.camRL) {
    cam.follow();
    cam.rotate(0, 0, 1);
  }
  if (inp.camRR) {
    cam.follow();
    cam.rotate(0, 0, -1);
  }
  if(!paused){
  if (cam.followTarget) {
    const { x, y, z } = cam.followTarget.velocity;
    cam.move(-x, y, -z);
  }
}
};
