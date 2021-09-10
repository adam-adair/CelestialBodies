import { White } from "./colors";
import { ProceduralTextureData } from "./mesh";
import { Sphere } from "./Sphere";

export class StarField extends Sphere {
  constructor(size: number, textureSize: number, frequency: number) {
    const data: number[] = [];
    for (let i = 0; i < textureSize * textureSize; i++) {
      const rand = Math.floor(Math.random() * frequency);
      if (rand === 1) data.push(255, 255, 255, 255);
      else data.push(0, 0, 0, 255);
    }
    const texture: ProceduralTextureData = {
      width: textureSize,
      height: textureSize,
      data: new Uint8Array(data),
    };
    super("starfield", size, 16, null, null, null, texture, White, true);
  }
}
