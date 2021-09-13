// https://clockworkchilli.com/blog/6_procedural_textures_in_javascript
import { ProceduralTextureData } from "./mesh";

interface NoiseData {
  color: number[];
  attenuation: number;
  roughness: number;
  numOctaves: number;
  startingOctave: number;
}
class NoiseGenerator {
  p: number[];
  perm: number[];
  grad3: number[][];
  noiseData: NoiseData;
  constructor(noiseData: NoiseData) {
    // random numbers
    this.p = [];
    for (var i = 0; i < 256; i++) {
      this.p[i] = Math.floor(Math.random() * 256);
    }
    // To remove the need for index wrapping, double the permutation table length
    this.perm = [];
    for (i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
    }

    this.grad3 = [
      [1, 1, 0],
      [-1, 1, 0],
      [1, -1, 0],
      [-1, -1, 0],
      [1, 0, 1],
      [-1, 0, 1],
      [1, 0, -1],
      [-1, 0, -1],
      [0, 1, 1],
      [0, -1, 1],
      [0, 1, -1],
      [0, -1, -1],
    ];
    this.noiseData = noiseData;
  }

  // linear interpolation
  mix(a: number, b: number, t: number) {
    return (1 - t) * a + t * b;
  }

  // a special dot product function used in perlin noise calculations
  perlinDot(g: number[], x: number, y: number, z: number) {
    return g[0] * x + g[1] * y + g[2] * z;
  }

  fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  n(x: number, y: number, z: number) {
    const { perm, fade, mix, perlinDot, grad3 } = this;
    // Find unit grid cell containing point
    var X = Math.floor(x);
    var Y = Math.floor(y);
    var Z = Math.floor(z);

    // Get relative xyz coordinates of point within that cell
    x = x - X;
    y = y - Y;
    z = z - Z;

    // Wrap the integer cells at 255
    X &= 255;
    Y &= 255;
    Z &= 255;

    // Calculate a set of eight hashed gradient indices
    var gi000 = perm[X + perm[Y + perm[Z]]] % 12;
    var gi001 = perm[X + perm[Y + perm[Z + 1]]] % 12;
    var gi010 = perm[X + perm[Y + 1 + perm[Z]]] % 12;
    var gi011 = perm[X + perm[Y + 1 + perm[Z + 1]]] % 12;
    var gi100 = perm[X + 1 + perm[Y + perm[Z]]] % 12;
    var gi101 = perm[X + 1 + perm[Y + perm[Z + 1]]] % 12;
    var gi110 = perm[X + 1 + perm[Y + 1 + perm[Z]]] % 12;
    var gi111 = perm[X + 1 + perm[Y + 1 + perm[Z + 1]]] % 12;

    // Calculate noise contributions from each of the eight corners
    var n000 = perlinDot(grad3[gi000], x, y, z);
    var n100 = perlinDot(grad3[gi100], x - 1, y, z);
    var n010 = perlinDot(grad3[gi010], x, y - 1, z);
    var n110 = perlinDot(grad3[gi110], x - 1, y - 1, z);
    var n001 = perlinDot(grad3[gi001], x, y, z - 1);
    var n101 = perlinDot(grad3[gi101], x - 1, y, z - 1);
    var n011 = perlinDot(grad3[gi011], x, y - 1, z - 1);
    var n111 = perlinDot(grad3[gi111], x - 1, y - 1, z - 1);

    // Compute the ease curve value for each of x, y, z
    var u = fade(x);
    var v = fade(y);
    var w = fade(z);

    // Interpolate (along x) the contributions from each of the corners
    var nx00 = mix(n000, n100, u);
    var nx01 = mix(n001, n101, u);
    var nx10 = mix(n010, n110, u);
    var nx11 = mix(n011, n111, u);

    // Interpolate the four results along y
    var nxy0 = mix(nx00, nx10, v);
    var nxy1 = mix(nx01, nx11, v);

    // Interpolate the last two results along z
    return mix(nxy0, nxy1, w);
  }

  noise(x: number, y: number, z: number) {
    const { attenuation, startingOctave, roughness, numOctaves } =
      this.noiseData;
    var a = Math.pow(attenuation, -startingOctave);
    var f = Math.pow(roughness, startingOctave);
    var m = 0;
    for (var i = startingOctave; i < numOctaves + startingOctave; i++) {
      m += this.n(x * f, y * f, z * f) * a;
      a /= attenuation;
      f *= roughness;
    }
    return m / numOctaves;
  }
}

export interface textureData {
  baseColor: number[];
  noiseDataArray: NoiseData[];
}

export const generateTexture = (
  size: number,
  textureData: textureData,
  //for testing. will draw image onto second canvas
  showImage = false,
  scale = 1
) => {
  const { baseColor, noiseDataArray } = textureData;
  const imageData = new Array(size * size);

  // fill with base color
  for (var i = 0; i < size * size * 4; i += 4) {
    imageData[i] = baseColor[0];
    imageData[i + 1] = baseColor[1];
    imageData[i + 2] = baseColor[2];
    imageData[i + 3] = baseColor[3];
  }

  const twoPi = Math.PI * 2;
  const at = 1;
  const ct = 4;
  for (i = 0; i < noiseDataArray.length; i++) {
    var k = noiseDataArray[i];
    var n = new NoiseGenerator(k);
    var p = 0;
    for (var y = 0; y < size; y++) {
      for (var x = 0; x < size; x++) {
        var xt =
          (ct + at * Math.cos((twoPi * y) / size)) *
          Math.cos((twoPi * x) / size);
        var yt =
          (ct + at * Math.cos((twoPi * y) / size)) *
          Math.sin((twoPi * x) / size);
        var zt = at * Math.sin((twoPi * y) / size);
        // generate noise at current x and y coordinates (z is set to 0)
        var v = Math.abs(n.noise(xt, yt, zt));
        for (var c = 0; c < 3; c++, p++) {
          imageData[p] = Math.min(
            255,
            Math.floor(imageData[p] + (v * k.color[c] * k.color[3]) / 255)
          );
        }
        p++;
      }
    }
  }

  //can remove later. in there now for testing
  if (showImage) {
    var canvas = document.createElement("canvas");
    canvas.width = canvas.height = size * scale;
    var context = canvas.getContext("2d");
    var imageDataObject = context.createImageData(size, size);
    for (let i = 0; i < imageData.length; i++)
      imageDataObject.data[i] = imageData[i];
    context.putImageData(imageDataObject, 0, 0);
    context.scale(scale, scale);
    context.drawImage(canvas, 0, 0); // <-- added
    document.body.appendChild(canvas);
  }
  return imageData;
};

export const sand: textureData = {
  baseColor: [202, 177, 50, 255],
  noiseDataArray: [
    {
      color: [235, 221, 61, 1024],
      attenuation: 1.5,
      roughness: 1.3,
      numOctaves: 4,
      startingOctave: 2,
    },
    {
      color: [255, 255, 255, 255],
      attenuation: 1.5,
      roughness: 5,
      numOctaves: 3,
      startingOctave: 5,
    },
  ],
};

export const grass: textureData = {
  baseColor: [53, 161, 27, 255],
  noiseDataArray: [
    {
      color: [95, 235, 61, 180],
      attenuation: 2,
      roughness: 2,
      numOctaves: 3,
      startingOctave: 2,
    },
    {
      color: [200, -60, 0, 2550],
      attenuation: 2,
      roughness: 2,
      numOctaves: 5,
      startingOctave: 2,
    },
  ],
};

export const clouds: textureData = {
  baseColor: [0, 0, 255, 255],
  noiseDataArray: [
    {
      color: [255, 255, 255, 850],
      attenuation: 1.3,
      roughness: 1.4,
      numOctaves: 6,
      startingOctave: 2,
    },
  ],
};

export const sandTexture: ProceduralTextureData = {
  width: 128,
  height: 128,
  data: new Uint8Array(generateTexture(128, sand)),
};

export const grassTexture: ProceduralTextureData = {
  width: 128,
  height: 128,
  data: new Uint8Array(generateTexture(128, grass)),
};

export const cloudTexture: ProceduralTextureData = {
  width: 128,
  height: 128,
  data: new Uint8Array(generateTexture(128, clouds)),
};

export const blankTexture: ProceduralTextureData = {
  width: 1,
  height: 1,
  data: new Uint8Array([255, 255, 255, 255]),
};
