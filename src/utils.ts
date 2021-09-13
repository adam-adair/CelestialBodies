import { constants } from "./constants";
import { V } from "./mesh";

export const get = (id: string) => document.getElementById(id);

export const generateRandomStarts = () => {
  let remaining = constants.universeSize - constants.maxStarSize * 2;
  const startX = Math.random() * remaining * 2 - remaining;
  remaining -= Math.abs(startX);
  const startY = Math.random() * remaining * 2 - remaining;
  remaining -= startY;
  const startZ = Math.random() * remaining * 2 - remaining;
  return [startX, startY, startZ];
};

export const randomInRange = (max: number, min: number = 0) =>
  Math.random() * (max - min) + min;

export const seperateSpawnPoints = (
  startPosition: V,
  spawnVelocity: V,
  spawnSize = 1
): number[] => {
  /* start the new object at the spawn point
    offset enough in the direction of its velocity that it won't
    immediately collide with other new objects */
  return [
    startPosition.x + spawnVelocity.x * spawnSize * 4,
    startPosition.y + spawnVelocity.y * spawnSize * 4,
    startPosition.z + spawnVelocity.z * spawnSize * 4,
  ];
};

export default {
  get,
  generateRandomStarts,
  randomInRange,
  seperateSpawnPoints,
};
