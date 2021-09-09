import { getPlayer, setPlayer } from ".";
import { ProceduralTextureData, Vertex } from "./mesh";
import { Planet } from "./Planet";
import { Star } from "./Star";
import gameObjects, { GameObjects } from "./GameObjects";
import { Body } from "./bodies";
import { get } from "./utils";
import { Color } from "./colors";

const colorRGB = get("colorRGB") as HTMLFormElement;

export const addBody = (
  bodyForm: HTMLFormElement,
  textures: (HTMLImageElement | ProceduralTextureData)[]
) => {
  bodyForm.addEventListener("change", (ev) => changeBody(ev, textures));
};

const changeBody = (
  ev: Event,
  textures: (HTMLImageElement | ProceduralTextureData)[]
) => {
  const player = getPlayer();
  const change = (<HTMLElement>ev.target).id;
  console.log(change);

  if (player) {
    if (change === "water") {
      player.texture = textures[4];
    }
    if (change === "grass") {
      player.texture = textures[3];
    }
    if (change === "sand") {
      player.texture = textures[2];
    }
    if (change === "solid" || change === "colorRGB") {
      if (change === "solid") player.texture = textures[0];
      const color = colorRGB.value;
      const r = parseInt(color.substr(1, 2), 16) / 256;
      const g = parseInt(color.substr(3, 2), 16) / 256;
      const b = parseInt(color.substr(5, 2), 16) / 256;
      const col = new Color(r, g, b);
      for (let i = 0; i < player.faces.length; i++) {
        const f = player.faces[i];
        f.color = col;
      }
      player.initialize(player.texture, null);
    }
  }

  let body;
  if (change === "bodyPlanet") {
    destroyTemp();
    body = new Planet("_tempBody", 1, 8, 1 / 1047, null, null, textures[3]);
    setPlayer(body);
  }
  if (change === "bodyStar") {
    destroyTemp();
    body = new Star("_tempBody", 16, 8, null, null, textures[2]);
    setPlayer(body);
  }
};

//delete current temp body if exists
const destroyTemp = () => {
  for (let key in gameObjects.objects) {
    const obj = gameObjects.objects[key];
    if (obj.name === "_tempBody") obj.destroy(gameObjects);
  }
};
