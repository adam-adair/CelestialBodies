// this can be removed later when we're done testing but I dcided to move the different configurations to their own file just to keep things clean
import { Color, Red, Green, Blue } from "./colors";
import { constants } from "./constants";
import { Mesh, Vertex, ProceduralTextureData } from "./mesh";
import { kilogramsToMass, metersToAU} from "./utils";
import { Sphere } from "./sphere";

//randomly generate solar system
export const randomSystem = (objects: Sphere[], numObjects:number, textures: (HTMLImageElement | ProceduralTextureData)[]): void => {
  for(let x = 0 ; x<numObjects; x++){
    const mass = kilogramsToMass(Math.random()*1.989e30);
    const size = mass*3000+.25
    const color = new Color(Math.random(), Math.random(), Math.random());
    const velocity = new Vertex(Math.random()/100, Math.random()/100, Math.random()/100);
    const acceleration = new Vertex(0,0,0);
    const texture = textures[Math.floor(Math.random()*textures.length)];
    const precision = Math.floor(Math.random()*8)+8;

    const body = new Sphere(`Planet ${x}`,size, precision, mass, velocity, acceleration, texture, color);
    body.translate(Math.random()*16-8, Math.random()*16-8, Math.random()*16-8);
    objects.push(body);
  }
}

  //repetable solar system to test gravitational constant
  export const repeatableSystem = (objects: Sphere[], textures: (HTMLImageElement | ProceduralTextureData)[]) => {
  for(let x = 0 ; x<2; x++){
    const mass = kilogramsToMass(1.989e31);
    const size = 1;
    const color = new Color(Math.random(), Math.random(), Math.random());
    const velocity = new Vertex(0,0,0);
    const acceleration = new Vertex(0,0,0);
    const texture = textures[Math.floor(Math.random()*textures.length)];
    const precision = 8;

    const body = new Sphere(`Planet ${x}`,size, precision, mass, velocity, acceleration, texture, color);
    const positionX = x %2===0 ? x*5 : -x*5;
    const positionY = x %2===0 ? x*5: -x*5;
    const positionZ = x %2===0 ? x*5 : -x*5;
    body.translate(positionX,positionY,positionZ);
    objects.push(body);
  }
}

export const texturesDisplay = async (gl: WebGLRenderingContext, program: WebGLProgram, objects: Sphere[], player: Mesh, textures: (HTMLImageElement | ProceduralTextureData)[]): Promise<Mesh> =>{
  player = await Mesh.fromObjMtl(
    gl,
    program,
    "./obj/weirddonut.obj",
    "./obj/weirddonut.mtl",
    1
  );

  objects.push(new Sphere("Object1", 0.8, 12, 0, null,null, textures[0]));
  objects[0].translate(-1, -1, -1);
  objects.push(new Sphere( "Object2", 1, 16, 0, null, null, textures[1]));
  objects[1].translate(2, 1, 0);
  objects.push(new Sphere("Object2", 0.5, 5, 0, null, null, null, Green));
  objects[2].translate(-2, 1, -5);
  objects[2].rotate(-2, 1, -5);

  //sand textured sphere
  objects.push(new Sphere("Sand", 0.7, 16, 0, null, null, textures[2]));
  objects[3].translate(-2, 3.5, 0);

  //grass textured sphere
  objects.push(new Sphere("grass", 0.7, 16, 0, null, null, textures[3]));
  objects[4].translate(2, -3.5, 0);

  //clouds textured sphere
  objects.push(new Sphere("clouds", 0.7, 16, 0 ,null, null, textures[4]));
  objects[5].translate(-3, -3.5, 0);

  return player;
}

  // 1 sun,  x planets to test a stable orbit, which is not working yet.
  export const stableOrbit = (objects: Sphere[], numPlanets:number, textures: (HTMLImageElement | ProceduralTextureData)[]): void => {
    const sun = new Sphere("sun", 1, 16, .01, null,null, textures[2], Red); // metersToAU(1.3927e9) to get the real diameter of the sun
    const planet = new Sphere("earth", .5, 16, sun.mass/1047,null, null, textures[3], Green) //metersToAU(12742000) to get the real diameter of the earth but it's way too small to see relative to the sun
    planet.translate(-5,0,0);
    planet.setStableOrbit(sun);
    objects.push(sun);
    objects.push(planet);
  }

  //two stars orbiting each other
  export const binaryStars = (objects: Sphere[], textures: (HTMLImageElement | ProceduralTextureData)[]): void => {
    const startSpeed = .05;
    const mass = .01;
    const sun1 = new Sphere("sun1", 1, 16, mass, new Vertex(0,startSpeed,0), null, textures[2], Red); // metersToAU(1.3927e9) to get the real diameter of the sun
    const sun2 = new Sphere("sun2", 1, 16, mass, new Vertex( 0,-startSpeed,0), null, textures[2], Red);

    sun1.translate(5,0,0);
    sun2.translate(-5,0,0);
    objects.push(sun1);
    objects.push(sun2);
  }

  //1 planet orbiting the binary star, hardcoded
  export const binaryStarsPlanet = (objects: Sphere[], textures: (HTMLImageElement | ProceduralTextureData)[]): void => {

    binaryStars(objects,textures);
    const startSpeed = objects[0].velocity.y*3;

    const planet = new Sphere("planet", .5, 16, objects[0].mass/1047, new Vertex(0,startSpeed,0), null, textures[0], Red);
    planet.translate(objects[1].position.x*3,0,0);
    objects.push(planet);
  }

  export default {
    randomSystem,
    repeatableSystem,
    texturesDisplay,
    stableOrbit,
    binaryStars,
    binaryStarsPlanet,
  }
