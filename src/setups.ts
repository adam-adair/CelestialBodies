// this can be removed later when we're done testing but I dcided to move the different configurations to their own file just to keep things clean
import { Color, Red, Green, Blue } from "./colors";
import { constants } from "./constants";
import { Mesh, Vertex, ProceduralTextureData } from "./mesh";
import { kilogramsToMass, metersToAU } from "./utils";
import { Sphere } from "./Sphere";
import { Star } from "./Star";
import gameObjects from "./GameObjects";
import { Planet } from "./Planet";

//randomly generate solar system
export const randomSystem = (
  numObjects: number,
  textures: (HTMLImageElement | ProceduralTextureData)[]
): void => {
  for (let x = 0; x < numObjects; x++) {
    const mass = Math.random() * 10 + 0.2;
    const velocity = new Vertex(
      Math.random() / 100,
      Math.random() / 100,
      Math.random() / 100
    );
    const acceleration = new Vertex(0, 0, 0);
    const texture = textures[Math.floor(Math.random() * textures.length)];
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
    body.translate(
      Math.random() * 18 + 18,
      Math.random() * 18 + 18,
      Math.random() * 18 + 18
    );
  }
};

export const randomPlanetSystem = (
  numObjects: number,
  textures: (HTMLImageElement | ProceduralTextureData)[]
): void => {
  for (let x = 0; x < numObjects; x++) {
    const mass = Math.random() + 0.2;
    const size = mass * 0.75;
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
    body.translate(
      Math.random() * 32 - 16,
      Math.random() * 32 - 16,
      Math.random() * 32 - 16
    );
  }
};

//repetable solar system to test gravitational constant
export const repeatableSystem = (
  textures: (HTMLImageElement | ProceduralTextureData)[]
) => {
  for (let x = 0; x < 2; x++) {
    const mass = 3;
    const size = Math.random() + 0.25;
    const velocity = new Vertex(0, 0, 0);
    const acceleration = new Vertex(0, 0, 0);
    const texture = textures[2];
    const precision = 8;

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
    const positionX = x % 2 === 0 ? x * 5 : -x * 5;
    const positionY = x % 2 === 0 ? x * 5 : -x * 5;
    const positionZ = x % 2 === 0 ? x * 5 : -x * 5;
    body.translate(positionX, positionY, 0);
  }
};

export const texturesDisplay = async (
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  player: Mesh,
  textures: (HTMLImageElement | ProceduralTextureData)[]
): Promise<Mesh> => {
  player = await Mesh.fromObjMtl(
    gl,
    program,
    "./obj/weirddonut.obj",
    "./obj/weirddonut.mtl",
    1
  );

  new Sphere("Object1", 0.8, 12, 0, null, null, textures[0])
    .addToAttractors()
    .translate(-1, -1, -1);

  new Sphere("Object2", 1, 16, 0, null, null, textures[1])
    .addToAttractors()
    .translate(2, 1, 0);
  new Sphere("Object2", 0.5, 5, 0, null, null, null, Green)
    .addToAttractors()
    .translate(-2, 1, -5);
  // objects[2].rotate(-2, 1, -5);

  //sand textured sphere
  new Sphere("Sand", 0.7, 16, 0, null, null, textures[2])
    .addToAttractors()
    .translate(-2, 3.5, 0);

  //grass textured sphere
  new Sphere("grass", 0.7, 16, 0, null, null, textures[3])
    .addToAttractors()
    .translate(2, -3.5, 0);

  //clouds textured sphere
  new Sphere("clouds", 0.7, 16, 0, null, null, textures[4])
    .addToAttractors()
    .translate(-3, -3.5, 0);

  return player;
};

// 1 sun,  x planets to test a stable orbit, sort of cheating by setting the planet directly left on the x axis
export const stableOrbit = (
  numPlanets: number,
  textures: (HTMLImageElement | ProceduralTextureData)[]
): void => {
  const sun = new Star("sun", 16, 1, null, null, textures[2])
    .addToAttractors()
    .addToMovers(); // metersToAU(1.3927e9) to get the real diameter of the sun
  for (let x = 0; x < numPlanets; x++) {
    const planet = new Planet(
      "earth",
      0.5,
      16,
      sun.mass / 1047,
      null,
      null,
      textures[3],
      Green
    )
      .addToAttractors()
      .addToMovers(); //metersToAU(12742000) to get the real diameter of the earth but it's way too small to see relative to the sun
    planet.translate(-5 * (x + 1), 0, 0);
    planet.setStableOrbit(sun);
  }
};

//two stars orbiting each other
export const binaryStars = (
  textures: (HTMLImageElement | ProceduralTextureData)[]
): Sphere[] => {
  const startSpeed = 0.02;
  const mass = 1;
  const sun1 = new Star(
    "sun1",
    16,
    mass,
    new Vertex(0, startSpeed, 0),
    null,
    textures[2]
  )
    .addToAttractors()
    .addToMovers(); // metersToAU(1.3927e9) to get the real diameter of the sun
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

  sun1.translate(5, 0, 0);
  sun2.translate(-5, 0, 0);
  return [sun1, sun2];
};

//1 planet orbiting the barycenter between binary stars
export const binaryStarsPlanet = (
  textures: (HTMLImageElement | ProceduralTextureData)[]
): void => {
  const [sun1, sun2] = binaryStars(textures);
  const planet = new Planet(
    "planet",
    0.5,
    16,
    sun1.mass / 1047,
    new Vertex(0, 0, 0),
    null,
    textures[0],
    Red
  )
    .addToAttractors()
    .addToMovers();
  planet.translate(sun2.position.x * 3, 0, 0);
  planet.setStableOrbit([sun1, sun2]);
};

export const starColor = (
  textures: (HTMLImageElement | ProceduralTextureData)[]
) => {
  const redStar = new Star(
    "Red",
    16,
    8,
    null,
    null,
    textures[3]
  ).addToAttractors();
  redStar.translate(5, 5, 0);

  const orangeStar = new Star(
    "Orange",
    16,
    6,
    null,
    null,
    textures[2]
  ).addToAttractors();
  orangeStar.translate(9, -6, 0);

  const yellowStar = new Star(
    "Yellow",
    16,
    10,
    null,
    null,
    textures[2]
  ).addToAttractors();
  yellowStar.translate(4, -2, 0);

  const whiteStar = new Star(
    "White",
    16,
    19,
    null,
    null,
    textures[2]
  ).addToAttractors(); // white is kind of yellow looking
  whiteStar.translate(2, 0, 0);

  const blueWhiteStar = new Star(
    "Blue White",
    16,
    30,
    null,
    null,
    textures[2]
  ).addToAttractors(); // white is kind of yellow looking
  // blueWhiteStar.translate(,1,0);

  const classB = new Star(
    "Class B",
    16,
    35,
    null,
    null,
    textures[2]
  ).addToAttractors(); // white is kind of yellow looking
  classB.translate(-1.5, 1, 0);

  const blueStar = new Star(
    "Blue",
    16,
    100,
    null,
    null,
    textures[2]
  ).addToAttractors(); // white is kind of yellow looking
  blueStar.translate(-2.5, 2, 0);
};

export const twoPlanets = (
  textures: (HTMLImageElement | ProceduralTextureData)[]
) => {
  for (let x = 0; x < 2; x++) {
    const mass = 0.5;
    const size = 2;
    const color = new Color(Math.random(), Math.random(), Math.random());
    const velocity = new Vertex(0, 0, 0);
    const acceleration = new Vertex(0, 0, 0);
    const texture = textures[2];
    const precision = 8;

    const body = new Planet(
      `Planet ${x}`,
      size,
      precision,
      mass,
      velocity,
      acceleration,
      texture,
      color
    )
      .addToAttractors()
      .addToMovers();
    const positionX = x % 2 === 0 ? x * 5 : -x * 5;
    const positionY = x % 2 === 0 ? x * 5 : -x * 5;
    const positionZ = x % 2 === 0 ? x * 5 : -x * 5;
    body.translate(positionX, positionY, 0);
  }
};

export const testCollisionAddMomentum = (
  textures: (HTMLImageElement | ProceduralTextureData)[]
) => {
  const color = new Color(Math.random(), Math.random(), Math.random());
  const acceleration = new Vertex(0, 0, 0);
  const texture = textures[2];
  const precision = 8;

  const planet1 = new Planet(
    `Planet 1`,
    1,
    precision,
    100,
    new Vertex(0.1, 0.1, 0),
    acceleration,
    texture,
    Red
  ).addToMovers();
  planet1.translate(-5, -5, 0);

  const planet2 = new Planet(
    `Planet 1`,
    1,
    precision,
    100,
    new Vertex(0.05, 0.05, 0),
    acceleration,
    texture,
    Green
  ).addToMovers();
  planet2.translate(-2, -2, 0);
};

export const testCollisionLoseMomentum = (
  textures: (HTMLImageElement | ProceduralTextureData)[]
) => {
  const acceleration = new Vertex(0, 0, 0);
  const texture = textures[2];
  const precision = 8;

  const planet1 = new Planet(
    `Planet 1`,
    2,
    precision,
    100,
    new Vertex(0.05, 0, 0),
    acceleration,
    texture,
    Red
  ).addToMovers();
  planet1.translate(-5, 0, 0);

  const planet2 = new Planet(
    `Planet 1`,
    1,
    precision,
    100,
    new Vertex(-0.02, 0, 0),
    acceleration,
    texture,
    Green
  ).addToMovers();
  planet2.translate(0, 0, 0);
};

export const testTranslation = (
  textures: (HTMLImageElement | ProceduralTextureData)[]
): void => {
  //sand textured sphere
  new Sphere("Sand", 2, 16, 0, null, null, textures[2]).translate(4, 0, 0);

  //grass textured sphere
  new Sphere("grass", 2, 16, 0, null, null, textures[3]).translate(0, 0, 0);

  //clouds textured sphere
  new Sphere("clouds", 1, 16, 0, null, null, textures[4]).translate(-4, 0, 0);
};

export default {
  randomSystem,
  repeatableSystem,
  texturesDisplay,
  stableOrbit,
  binaryStars,
  binaryStarsPlanet,
  starColor,
  twoPlanets,
  testCollisionAddMomentum,
  testCollisionLoseMomentum,
  randomPlanetSystem,
  testTranslation,
};
