import { constants } from "./constants";

export const kilogramsToMass = (kilograms: number): number => kilograms / constants.massScale; //convert kilograms to arbitrary mass units, useful if trying to simulate accurate masses of real planets

export const massToKilograms = (mass: number): number => mass * constants.massScale; //revert mass units to kilograms, might be useful for display purposes

export const metersToAU = (meters: number): number => meters / 149597870700; //convert meters to au, useful if trying to simulate accurate sizes of real planets

export const auToMeters = (au: number): number => au*149597870700; // reverse au back to meters, might be useful for display purposes

export default { kilogramsToMass, massToKilograms, metersToAU,auToMeters};
