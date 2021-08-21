import { Body } from "./bodies";
import { Mesh, Vertex } from "./mesh";

// const gravitationalConstant= 6.67430*(10^-11) // cubic meters per kilogram per second squared
const gravitationalConstant = 1.4878 * 10^-34 //cubic AUs per kilogram per day squared
// mass = kilograms
// distance = AU
// distance between (0,0,0) and (1,0,0) is 1 AU
// 1 AU = 149597870700 m, distance between earth and sun


export const getDirectionalVector = (objectOne: Mesh, objectTwo:Mesh): Vertex => objectOne.position.subtract(objectTwo.position);

export const getGravitationalForce = (objectOne: Body, objectTwo:Body, distance: number): number => (gravitationalConstant * objectOne.mass * objectTwo.mass) / (distance * distance);

