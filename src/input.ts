import { cam } from ".";
import { Mesh } from "./mesh";

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
}

export const handleInput = (
  ev: KeyboardEvent,
  pressed: boolean,
  inp: PlayerMovement
) => {
  switch (ev.key) {
    case "w":
      inp.up = pressed;
      ev.preventDefault();
      break;
    case "a":
      inp.left = pressed;
      ev.preventDefault();
      break;
    case "s":
      inp.down = pressed;
      ev.preventDefault();
      break;
    case "d":
      inp.right = pressed;
      ev.preventDefault();
      break;
    case "q":
      inp.in = pressed;
      ev.preventDefault();
      break;
    case "e":
      inp.out = pressed;
      ev.preventDefault();
      break;
    case "r":
      inp.spinR = pressed;
      ev.preventDefault();
      break;
    case "f":
      inp.spinL = pressed;
      ev.preventDefault();
      break;
    case "t":
      inp.spinU = pressed;
      ev.preventDefault();
      break;
    case "g":
      inp.spinD = pressed;
      ev.preventDefault();
      break;
    case "y":
      inp.spinI = pressed;
      ev.preventDefault();
      break;
    case "h":
      inp.spinO = pressed;
      ev.preventDefault();
      break;
    case "l":
      inp.camR = pressed;
      ev.preventDefault();
      break;
    case "j":
      inp.camL = pressed;
      ev.preventDefault();
      break;
    case "i":
      inp.camU = pressed;
      ev.preventDefault();
      break;
    case "k":
      inp.camD = pressed;
      ev.preventDefault();
      break;
    case "o":
      inp.camI = pressed;
      ev.preventDefault();
      break;
    case "u":
      inp.camO = pressed;
      ev.preventDefault();
      break;
  }
};

export const movePlayer = (
  player: Mesh,
  inp: PlayerMovement,
  movement: number
) => {
  if (inp.up) player.translate(0, movement, 0);
  if (inp.down) player.translate(0, -movement, 0);
  if (inp.left) player.translate(-movement, 0, 0);
  if (inp.right) player.translate(movement, 0, 0);
  if (inp.in) player.translate(0, 0, -movement);
  if (inp.out) player.translate(0, 0, movement);
  if (inp.spinL) player.rotate(movement * 10, 0, 0);
  if (inp.spinR) player.rotate(movement * -10, 0, 0);
  if (inp.spinU) player.rotate(0, movement * 10, 0);
  if (inp.spinD) player.rotate(0, movement * -10, 0);
  if (inp.spinI) player.rotate(0, 0, movement * 10);
  if (inp.spinO) player.rotate(0, 0, movement * -10);

  if (inp.camL) cam.move(-0.1, 0, 0);
  if (inp.camR) cam.move(0.1, 0, 0);
  if (inp.camU) cam.move(0, 0.1, 0);
  if (inp.camD) cam.move(0, -0.1, 0);
  if (inp.camI) cam.move(0, 0, -0.1);
  if (inp.camO) cam.move(0, 0, 0.1);
};
