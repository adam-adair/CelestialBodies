import { getPlayer, setPlayer } from ".";
import { ProceduralTextureData, Vertex } from "./mesh";
import { Planet } from "./Planet";
import { Star } from "./Star";
import gameObjects from "./GameObjects";
import { get } from "./utils";
import { Color } from "./colors";
import { constants } from "./constants";
const { speedAdjust, massAdjust, sizeAdjust } = constants;
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
  const size =
    parseFloat((<HTMLFormElement>get("bodySize")).value) * sizeAdjust || 1;
  const mass =
    parseFloat((<HTMLFormElement>get("bodyMass")).value) * massAdjust || 1;
  const velX =
    parseFloat((<HTMLFormElement>get("velX")).value) * speedAdjust || 0;
  const velY =
    parseFloat((<HTMLFormElement>get("velY")).value) * speedAdjust || 0;
  const velZ =
    parseFloat((<HTMLFormElement>get("velZ")).value) * speedAdjust || 0;
  let bodyType;
  if ((<HTMLFormElement>get("bodyStar")).checked) bodyType = "star";
  if ((<HTMLFormElement>get("bodyPlanet")).checked) bodyType = "planet";
  let texIx = 0;
  if ((<HTMLFormElement>get("grass")).checked) texIx = 3;
  if ((<HTMLFormElement>get("water")).checked) texIx = 4;
  if ((<HTMLFormElement>get("sand")).checked) texIx = 2;
  const colorRGB = get("colorRGB") as HTMLFormElement;
  const r = parseInt(colorRGB.value.substr(1, 2), 16) / 256;
  const g = parseInt(colorRGB.value.substr(3, 2), 16) / 256;
  const b = parseInt(colorRGB.value.substr(5, 2), 16) / 256;
  const color = new Color(r, g, b);
  let scaleChange;
  let scalePos = [0, 0, 0];
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
      for (let i = 0; i < player.faces.length; i++) {
        const f = player.faces[i];
        f.color = color;
      }
      player.initialize(player.texture, null);
    }
    if (
      (change === "bodyMass" && bodyType === "star") ||
      (change === "bodySize" && bodyType === "planet")
    ) {
      scaleChange = bodyType;
      scalePos = [player.position.x, player.position.y, player.position.z];
      player.destroy(gameObjects);
    }
    if (["velX", "velY", "velZ"].includes(change)) {
      player.velocity = new Vertex(velX, velY, velZ);
    }
  }

  let body;
  if (change === "bodyPlanet" || scaleChange === "planet") {
    destroyTemp();
    hideIrrelevant();
    body = new Planet(
      "_tempBody",
      size,
      12,
      mass,
      new Vertex(velX, velY, velZ),
      null,
      textures[texIx]
    );
    body.translate(scalePos[0], scalePos[1], scalePos[2]);
    if (texIx === 0) {
      for (let i = 0; i < body.faces.length; i++) {
        const f = body.faces[i];
        f.color = color;
      }
      body.initialize(body.texture, null);
    }
    setPlayer(body);
  }
  if (change === "bodyStar" || scaleChange === "star") {
    destroyTemp();
    hideIrrelevant(true);
    body = new Star(
      "_tempBody",
      12,
      mass,
      new Vertex(velX, velY, velZ),
      null,
      textures[2]
    );
    body.translate(scalePos[0], scalePos[1], scalePos[2]);
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

const hideIrrelevant = (isStar = false) => {
  const vis = isStar ? "hidden" : "visible";
  get("sizeDiv").style.visibility = vis;
  get("surfaceDiv").style.visibility = vis;
};