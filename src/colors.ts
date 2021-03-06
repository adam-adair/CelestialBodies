export class Color {
  r: number;
  g: number;
  b: number;
  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
}

export const Red = new Color(1, 0, 0);
export const Green = new Color(0, 1, 0);
export const Blue = new Color(0, 0, 1);
export const White = new Color(2, 2, 2);
export const Yellow = new Color(1, 1, 0);
export const Orange = new Color(1, 0.5, 0);
export const ClassA = new Color(0.68, 0.93, 2);
export const ClassB = new Color(0.34, 0.45, 2);
export const randomColor = () =>
  new Color(Math.random(), Math.random(), Math.random());

export default {
  Red,
  Green,
  Blue,
  White,
  Yellow,
  Orange,
  ClassA,
  ClassB,
  randomColor,
};
