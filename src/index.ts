import { perspective, orthogonal } from "./camera";
import { Color, Red, Green, Blue } from "./colors";
import { Barycenter, Body } from "./bodies";
import { constants } from "./constants";
import { Mesh, Vertex, ProceduralTextureData } from "./mesh";
import { movePlayer, handleInput, PlayerMovement } from "./input";
import { kilogramsToMass, metersToAU} from "./utils";
import { Sphere } from "./sphere";
import { generateTexture, sand, grass, clouds } from "./texture";
import  initialize from './initialize';

const { gl,program, canvas, camera } = initialize;

const sandTexture: ProceduralTextureData = {
  width: 128,
  height: 128,
  data: new Uint8Array(generateTexture(128, sand)),
};

const grassTexture: ProceduralTextureData = {
  width: 128,
  height: 128,
  data: new Uint8Array(generateTexture(128, grass)),
};

const cloudTexture: ProceduralTextureData = {
  width: 128,
  height: 128,
  data: new Uint8Array(generateTexture(128, clouds)),
};

const playerInput: PlayerMovement = {
  spinL: false,
  spinR: false,
  up: false,
  down: false,
  right: false,
  left: false,
  in: false,
  out: false,
  spinI: false,
  spinO: false,
  spinU: false,
  spinD: false,
};
document.onkeydown = (ev) => handleInput(ev, true, playerInput);
document.onkeyup = (ev) => handleInput(ev, false, playerInput);




let movables: Body[] = [];
let player: Mesh;
let textures: (HTMLImageElement | ProceduralTextureData)[];

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = url;
  });
};

const loadImages = (urlArr: string[]) => {
  return Promise.all(urlArr.map((url) => loadImage(url)));
};

const init = async () => {
textures = await loadImages(["./textures/test.png", "./textures/test2.jpg"]);
textures.push(sandTexture, grassTexture, cloudTexture);


//randomly generate solar system
  for(let x = 0 ; x<40; x++){
    const mass = kilogramsToMass(Math.random()*1.989e30);
    const size = mass*2000
    const color = new Color(Math.random(), Math.random(), Math.random());
    const velocity = new Vertex(Math.random()/100, Math.random()/100, Math.random()/100);
    const acceleration = new Vertex(0,0,0);
    const texture = textures[Math.floor(Math.random()*textures.length)];
    const precision = Math.random()*12

    const body = new Sphere(`Planet ${x}`,size, precision, mass, velocity, acceleration, texture, color);
    body.translate(Math.random()*16-8, Math.random()*16-8, Math.random()*16-8);
    movables.push(body);
  }

  // player = await Mesh.fromObjMtl(
  //   gl,
  //   program,
  //   "./obj/weirddonut.obj",
  //   "./obj/weirddonut.mtl",
  //   1
  // );

  // movables.push(new Sphere( 0.8, 12, textures[0]));
  // movables.[0].translate(-1, -1, -1);
  // movables.push(new Sphere( 1, 16, textures[1]));
  // movables[1].translate(2, 1, 0);
  // movables.push(new Sphere( 0.5, 5, null, Green));
  // movables[3].translate(-2, 1, -5);
  // movables[3].rotate(-2, 1, -5);

  // //sand textured sphere
  // movables.push(new Sphere(gl, program, 0.7, 16, textures[2]));
  // movables[4].translate(-2, 3.5, 0);

  // //grass textured sphere
  // movables.push(new Sphere(gl, program, 0.7, 16, textures[3]));
  // movables[5].translate(2, -3.5, 0);

  // //clouds textured sphere
  // movables.push(new Sphere(gl, program, 0.7, 16, textures[4]));
  // movables[6].translate(-3, -3.5, 0);

  // 1 sun,  1 planet to test a stable orbit, which is not working yet.
    // const sun = new Body("sun", .25, kilogramsToMass(1.989e30), Red, new Vertex(0,0,0)); // metersToAU(1.3927e9) to get the real diameter of the sun
    // const planet = new Body("earth", .1, kilogramsToMass(5.972e24), Green, new Vertex(0,0,0)) //metersToAU(12742000) to get the real diameter of the earth but it's way too small to see relative to the sun
    // planet.translate(-3,0,0);
    // planet.setStableOrbit(sun);
    // movables.push(sun);
    // movables.push(planet);

  requestAnimationFrame(loop);
};

let then = 0;

//game loop
const loop = (now: number) => {
  // calculate frames per second
    now *= 0.001;                          // convert to seconds
    const deltaTime = now - then;          // compute time since last frame
    then = now;                            // remember time for next frame
    const fps = 1 / deltaTime;             // compute frames per second


  //clear screen
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //box movement
  // movePlayer(player, playerInput, movement);

  // calculateNewVelocities(movables[0], movables[1]);

  for(let j = 0; j < movables.length; j++) {
    for(let i = 0; i <movables.length; i++){
      if(i !== j) {
        const force = movables[j].calculateAttraction(movables[i], fps)
        movables[j].applyForce(force);
      }
    }
  }

  // draw movables
  for (let i = 0; i < movables.length; i++) {
    const body = movables[i];
    //make object spin
    body.rotate(0.5, 0.5, 0.5);
    // body.translate(body.velocity.x, body.velocity.y, body.velocity.z )
    body.update();
    body.draw();
  }

  //draw player
  // player.draw(gl, program);

  requestAnimationFrame(loop);
};

// start program
window.onload = () => {
  canvas.width = 640; //document.body.clientWidth;
  canvas.height = 480; //document.body.clientHeight;
  init();
};
