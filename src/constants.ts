const gravitationalFactor = 0.01; // we would only change this if we wanted to rescale planet masses to smaller units. but doing so screws up the accelerations so let's not.

export const constants = {
  clearColor: { r: 0, g: 0.2, b: 0.2, a: 1 },
  zoom: 36,
  lightDirection: { x: 0, y: 4, z: 10 },
  ambientLightAmount: 0.1,
  movement: 0.1,
  simulationSpeed: 23, // days simulated per real second, doesn't work yet.
  // massScale: 14982844642.9, //1 mass = this many kilograms
  massScale: 6.7213335e33 / gravitationalFactor, //1 mass = this many kilograms,
  gravitationalConstant: gravitationalFactor, //cubic AUs per massScale number of kg per day squared (aka per ~60 frames per ~60 frames )
  minMass: 0.5, //smallest mass any object can be, make this bigger if we want fewer, larger debris to come out of collisions
  impactThreshold: 0.1, // factor for how fast an impact can be before making planets split.
};
