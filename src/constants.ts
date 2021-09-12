//have to declare these here because they are dependencies for other constants.
const gravitationalFactor = 0.01; // we would only change this if we wanted to rescale planet masses to smaller units. but doing so screws up the accelerations so let's not.
const maxStarMass = 200;
const minStarMass = 1;
const sunSizeFactor = 0.8;
const massColorFactor = minStarMass / 0.08;
const starMasstoRadius = (mass: number): number => {
  const radius = mass ** sunSizeFactor / 2; //dividing by 2 just to scale
  return radius;
};
const maxStarSize = starMasstoRadius(maxStarMass);
const minStarSize = starMasstoRadius(minStarMass);

export const constants = {
  clearColor: { r: 0, g: 0.0, b: 0.0, a: 1 },
  zoom: 36,
  lightDirection: { x: 0, y: 4, z: 10 },
  ambientLightAmount: 1,
  movement: 0.5,
  simulationSpeed: 23, // days simulated per real second, doesn't work yet.
  // massScale: 14982844642.9, //1 mass = this many kilograms
  massScale: 6.7213335e33 / gravitationalFactor, //1 mass = this many kilograms,
  gravitationalConstant: gravitationalFactor, //cubic AUs per massScale number of kg per day squared (aka per ~60 frames per ~60 frames )
  minStarMass,
  maxStarMass,
  sunSizeFactor,
  maxStarSize,
  minStarSize,
  massColorFactor,
  minPlanetMass: minStarMass * 0.1, //smallest mass any object can be, make this bigger if we want fewer, larger debris to come out of collisions
  maxPlanetMass: minStarMass * 0.75, // heaviest planet is 3/4 the size of the smallest star, apparently
  minPlanetSize: 0.5, // 1.5 is the smaller a planet can be and still be seen from the edge of the star field so 0.5 gives the opportunity for planets to appear as you get closer to them.
  maxPlanetSize: Math.floor(maxStarSize / 20), //the biggest star will be 20 times as large as the biggest planet. chosen because that's roughly the proportion of jupiter to the sun. some planets will be bigger than some suns but apparently jupiter is so it happens
  impactThreshold: 0.156, // factor for how hard an impact can be before making planets split. arbitrary number found through testing. should not go lower than .156, could go higher
  speedAdjust: 1 / 50, // factor for adjusting initial velocity in body creation
  massAdjust: 1, // factor for adjusting initial velocity in body creation
  sizeAdjust: 1, // factor for adjusting initial velocity in body creation
  universeSize: 200,
  starMasstoRadius,
  maxSpawnTime: 60 * 3, //30 seconds
  minSpawnTime: 60 * 1, // 5 seconds
};
