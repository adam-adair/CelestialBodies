import { setPlayer } from ".";
import { ProceduralTextureData, Vertex } from "./mesh";
import { Planet } from "./Planet";
import { Star } from "./Star";

// we'll need to decide how we want to let you input the data for
// the body you're creating, but once we do, we can just feed it into
// this function.
export const addBody = (
  bodyType: string,
  textures: (HTMLImageElement | ProceduralTextureData)[]
) => {
  if (bodyType === "planet") {
    const planet = new Planet("test", 1, 8, 1 / 1047, null, null, textures[4])
      .addToAttractors()
      .addToMovers();
    setPlayer(planet);
  }
  if (bodyType === "star") {
    console.log("here");
    const star = new Star("test", 1, 16, 1, null, null, textures[2])
      .addToAttractors()
      .addToMovers();
    setPlayer(star);
  }
};
