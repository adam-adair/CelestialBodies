import { Color, Red, randomColor } from "./colors";
import { constants } from "./constants";
import { Vertex, ProceduralTextureData } from "./mesh";
import { generateRandomStarts } from "./utils";
import { Sphere } from "./Sphere";
import { Star } from "./Star";
import { Planet } from "./Planet";
import { WhiteHole } from "./WhiteHole";

const {
  maxPlanetMass,
  maxPlanetSize,
  minPlanetMass,
  minPlanetSize,
  maxStarMass,
  minStarMass,
  maxStarSize,
  universeSize,
} = constants;

//randomly generate solar system
export const randomSystem = (
  numObjects: number,
  textures: (HTMLImageElement | ProceduralTextureData)[]
): void => {
  for (let x = 0; x < numObjects; x++) {
    const mass = Math.random() * (maxStarMass - minStarMass) + minStarMass;
    const velocity = new Vertex(
      Math.random() / 100,
      Math.random() / 100,
      Math.random() / 100
    );
    const acceleration = new Vertex(0, 0, 0);
    const texture = textures[2];
    const precision = Math.floor(Math.random() * 8) + 8;

    const body = new Star(
      `Star ${x}`,
      precision,
      mass,
      velocity,
      acceleration,
      texture
    )
      .addToAttractors()
      .addToMovers();

    const [startX, startY, startZ] = generateRandomStarts();
    body.translate(startX, startY, startZ);
  }
};

export const randomPlanetSystem = (
  numObjects: number,
  textures: (HTMLImageElement | ProceduralTextureData)[]
): void => {
  for (let x = 0; x < numObjects; x++) {
    const mass =
      Math.random() * (maxPlanetMass - minPlanetMass) + minPlanetMass;
    const size =
      Math.random() * (maxPlanetSize - minPlanetSize) + minPlanetSize;
    const color = new Color(Math.random(), Math.random(), Math.random());
    const velocity = new Vertex(
      Math.random() / 100,
      Math.random() / 100,
      Math.random() / 100
    );
    const acceleration = new Vertex(0, 0, 0);
    const precision = Math.floor(Math.random() * 8) + 8;
    const body = new Planet(
      `Planet ${x}`,
      size,
      precision,
      mass,
      velocity,
      acceleration,
      textures[2],
      color
    )
      .addToAttractors()
      .addToMovers();

    const [startX, startY, startZ] = generateRandomStarts();
    body.translate(startX, startY, startZ);
  }
};

// 1 sun,  x planets to test a stable orbit, sort of cheating by setting the planet directly left on the x axis
export const stableOrbit = (
  numPlanets: number,
  textures: (HTMLImageElement | ProceduralTextureData)[]
): void => {
  const sun = new Star("sun", 16, maxStarSize, null, null, textures[2])
    .addToAttractors()
    .addToMovers();
  for (let x = 0; x < numPlanets; x++) {
    const planet = new Planet(
      `Planet ${x + 1}`,
      minPlanetSize,
      16,
      minPlanetMass,
      null,
      null,
      textures[3],
      randomColor()
    )
      .addToAttractors()
      .addToMovers(); //metersToAU(12742000) to get the real diameter of the earth but it's way too small to see relative to the sun

    planet.translate(-sun.size, 0, 0);
    planet.translate(
      -((universeSize - sun.size) / numPlanets) * planet.size * (x + 1),
      0,
      0
    );
    planet.setStableOrbit(sun);
  }
};

//two stars orbiting each other
export const binaryStars = (
  textures: (HTMLImageElement | ProceduralTextureData)[]
): Sphere[] => {
  const startSpeed = 0.03;
  const mass = minStarMass;
  const sun1 = new Star(
    "sun1",
    16,
    mass,
    new Vertex(0, startSpeed, 0),
    null,
    textures[2]
  )
    .addToAttractors()
    .addToMovers();
  const sun2 = new Star(
    "sun2",
    16,
    mass,
    new Vertex(0, -startSpeed, 0),
    null,
    textures[2]
  )
    .addToAttractors()
    .addToMovers();

  sun1.translate(sun1.size * 5, 0, 0);
  sun2.translate(-sun2.size * 5, 0, 0);
  return [sun1, sun2];
};

//1 planet orbiting the barycenter between binary stars
export const binaryStarsPlanet = (
  textures: (HTMLImageElement | ProceduralTextureData)[]
): void => {
  const [sun1, sun2] = binaryStars(textures);
  const planet = new Planet(
    "planet",
    minPlanetSize,
    16,
    minPlanetMass,
    new Vertex(0, 0, 0),
    null,
    textures[0],
    Red
  )
    .addToAttractors()
    .addToMovers();
  planet.translate((sun2.position.x - sun2.size) * 3 * planet.size, 0, 0);
  planet.setStableOrbit([sun1, sun2]);
};

export const whiteHole = (
  textures: (HTMLImageElement | ProceduralTextureData)[]
) => {
  new WhiteHole("white hole", 16, textures);
};

export default {
  randomSystem,
  stableOrbit,
  binaryStars,
  binaryStarsPlanet,
  randomPlanetSystem,
  whiteHole,
};
