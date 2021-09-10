import { constants } from "./constants";

export const kilogramsToMass = (kilograms: number): number =>
  kilograms / constants.massScale; //convert kilograms to arbitrary mass units, useful if trying to simulate accurate masses of real planets

export const massToKilograms = (mass: number): number =>
  mass * constants.massScale; //revert mass units to kilograms, might be useful for display purposes

export const metersToAU = (meters: number): number => meters / 149597870700; //convert meters to au, useful if trying to simulate accurate sizes of real planets

export const auToMeters = (au: number): number => au * 149597870700; // reverse au back to meters, might be useful for display purposes

export const starMasstoRadius = (mass: number): number => {
  const radius = mass ** 0.8 / 2; //dividing by 2 just to scale
  return radius;
};

export const calculateTemperature = (mass: number, radius: number) =>
  Math.pow(mass ** 3.5 / (4 * Math.PI * radius ** 2), 1 / 4);

export const get = (id: string) => document.getElementById(id);

export default {
  kilogramsToMass,
  massToKilograms,
  metersToAU,
  auToMeters,
  starMasstoRadius,
  calculateTemperature,
  get,
};
