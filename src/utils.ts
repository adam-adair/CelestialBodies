import { constants } from "./constants";

export const kilogramsToMass = (kilograms: number): number =>
  kilograms / constants.massScale; //convert kilograms to arbitrary mass units, useful if trying to simulate accurate masses of real planets

export const massToKilograms = (mass: number): number =>
  mass * constants.massScale; //revert mass units to kilograms, might be useful for display purposes

export const metersToAU = (meters: number): number => meters / 149597870700; //convert meters to au, useful if trying to simulate accurate sizes of real planets

export const auToMeters = (au: number): number => au * 149597870700; // reverse au back to meters, might be useful for display purposes

export const calculateTemperature = (mass: number, radius: number) =>
  Math.pow(mass ** 3.5 / (4 * Math.PI * radius ** 2), 1 / 4);   //technically it should be ^.5 but 1/4 makes a better range

export const get = (id: string) => document.getElementById(id);

export const generateRandomStarts= () =>{
  let remaining = constants.universeSize-constants.maxStarSize*2
  const startX=Math.random() * remaining*2 - remaining;
  remaining -= Math.abs(startX);
  const startY = Math.random() * remaining*2 - remaining;
  remaining -= startY;
  const startZ = Math.random() * remaining*2 - remaining;
  return [startX,startY,startZ];
}

export const randomInRange = (max:number, min:number = 0) => Math.random() * (max - min) + min

export default {
  kilogramsToMass,
  massToKilograms,
  metersToAU,
  auToMeters,
  calculateTemperature,
  get,
  generateRandomStarts,
  randomInRange
};
