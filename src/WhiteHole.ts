import Colors, { Color } from "./colors";
import { ProceduralTextureData, Vertex } from "./mesh";

import { Sphere } from "./Sphere";
import { Planet } from "./Planet";
import { Star } from "./Star";
import { randomInRange, seperateSpawnPoints } from "./utils";
import { constants } from "./constants";
const {
  massColorFactor,
  maxSpawnTime,
  minSpawnTime,
  minPlanetMass,
  maxPlanetMass,
  minPlanetSize,
  maxPlanetSize,
  maxStarMass,
  minStarMass,
} = constants;

const whiteHoleList = document.getElementById("whiteHoleList");

export class WhiteHole extends Sphere {
  timeToSpawn: number;
  newPlanetNumber: number;
  newStarNumber: number;
  textures: (HTMLImageElement | ProceduralTextureData)[];
  constructor(
    name: string,
    precision: number,
    textures: (HTMLImageElement | ProceduralTextureData)[]
  ) {
    super(
      name,
      1,
      precision,
      -1,
      new Vertex(0, 0, 0),
      new Vertex(0, 0, 0),
      textures[0],
      new Color(3, 3, 3),
      true
    );
    this.addToList();
    this.timeToSpawn = randomInRange(maxSpawnTime, minSpawnTime);
    this.newStarNumber = 1;
    this.newPlanetNumber = 1;
    this.textures = textures;
  }

  update() {
    if (this.timeToSpawn > 0) {
      this.timeToSpawn--;
    } else {
      this.spawn();
      this.timeToSpawn = randomInRange(maxSpawnTime, minSpawnTime);
    }
  }

  spawn() {
    const newBodyType = Math.random() > 0.75 ? Star : Planet; // Planets 3x as likely to spawn
    if (newBodyType === Planet) {
      const newPlanet = new Planet(
        `New Planet ${this.newPlanetNumber++}`,
        randomInRange(maxPlanetSize, minPlanetSize),
        16,
        randomInRange(maxPlanetMass, minPlanetMass),
        this.randomVelocity(),
        null,
        this.textures[randomInRange(this.textures.length)],
        Colors.randomColor()
      );
      const [x, y, z] = seperateSpawnPoints(this.position, newPlanet.velocity);
      newPlanet.translate(x, y, z);
    } else {
      const newStar = new Star(
        `New Star ${this.newPlanetNumber++}`,
        16,
        this.randomWeightedMass(),
        this.randomVelocity(),
        null,
        this.textures[2]
      );
      const [x, y, z] = seperateSpawnPoints(this.position, newStar.velocity);
      newStar.translate(x, y, z);
    }
  }

  randomWeightedMass() {
    /* star masses chosen at realistic frequencies
    .00003% blue      .13% class B
    .6% class A        3% white
    7.6% yellow        12.1% orange
    76.45% red
    */
    const bEnd = 15.8 * massColorFactor;
    const aEnd = 2.1 * massColorFactor;
    const whiteEnd = 1.4 * massColorFactor;
    const yellowEnd = 1.04 * massColorFactor;
    const orangeEnd = 0.8 * massColorFactor;
    const redEnd = 0.45 * massColorFactor;

    class Spectral {
      chance: number;
      maxMass: number;
      minMass: number;
      constructor(chance: number, maxMass: number, minMass: number) {
        this.chance = chance;
        this.maxMass = maxMass;
        this.minMass = minMass;
      }
    }

    //chances must add up to 1!!!!
    const classes = [
      new Spectral(0.0000003, maxStarMass, bEnd),
      new Spectral(0.0013, bEnd, aEnd),
      new Spectral(0.006, aEnd, whiteEnd),
      new Spectral(0.03, whiteEnd, yellowEnd),
      new Spectral(0.076, yellowEnd, orangeEnd),
      new Spectral(0.121, orangeEnd, redEnd),
      new Spectral(0.7641, redEnd, minStarMass),
    ];

    let i,
      sum = 0,
      r = Math.random();
    for (i in classes) {
      sum += classes[i].chance;
      if (r <= sum)
        return randomInRange(classes[i].maxMass, classes[i].minMass);
    }
  }

  randomVelocity() {
    const maxVelocity = 0.1;
    const minVelocity = 0.025;

    const randomOffset = () => Math.random() * 2 - 1;
    return new Vertex(randomOffset(), randomOffset(), randomOffset())
      .normalize()
      .scale(randomInRange(maxVelocity - minVelocity));
  }

  addToList() {
    const item = this.createOrUpdateListItem();
    whiteHoleList.appendChild(item);
  }
}
