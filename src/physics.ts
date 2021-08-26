import { Body } from "./bodies";
import { constants } from "./constants";
import { Mesh, Vertex } from "./mesh";

// const gravitationalConstant = 6.67430e-11 // cubic meters per kilogram per second squared (aka per ~60 frames per ~60 frames )
// mass = kilograms
// distance = meters
// distance between (0,0,0) and (1,0,0) is 1 meter
// 149597870700 m = distance between earth and sun

// const gravitationalConstant = 1.4878e-34 //cubic AUs per kilogram per day squared

const g = constants.gravitationalConstant //cubic AUs per 6.7213335e+33 kg per day squared (aka per ~60 frames per ~60 frames )
// mass 6.7213335e+33 kg
// distance = AU. ie difference between (0,0,0) and (1,0,0) locations is 1 AU
// 1 AU is the distance between earth and sun, 149597870700 m



export const getDirectionalVector = (objectOne: Mesh, objectTwo:Mesh): Vertex => objectOne.position.subtract(objectTwo.position);

export const getGravitationalForce = (objectOne: Body, objectTwo:Body, distance: number): number => (g * objectOne.mass * objectTwo.mass) / (distance * distance);

export const equalCentripGravity = (planet: Body, sun: Body): number => {
  let direction = getDirectionalVector(planet,sun);
   const distance = direction.magnitude(); // AU
   return Math.sqrt((g * sun.mass) / distance);
}
