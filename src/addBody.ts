import { getPlayer, setPlayer } from ".";
import { ProceduralTextureData, Vertex } from "./mesh";
import { Planet } from "./Planet";
import { Star } from "./Star";
import gameObjects from "./GameObjects";
import { get } from "./utils";
import { Color } from "./colors";
import { constants } from "./constants";
import { WhiteHole } from "./WhiteHole";
const {
  speedAdjust,
  massAdjust,
  sizeAdjust,
  minPlanetMass,
  maxPlanetMass,
  minPlanetSize,
  maxPlanetSize,
  minStarMass,
  maxStarMass,
} = constants;
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
    parseFloat((<HTMLFormElement>get("bodySize")).value) * sizeAdjust || 0;
  const mass =
    parseFloat((<HTMLFormElement>get("bodyMass")).value) * massAdjust || 0;
  const velX =
    parseFloat((<HTMLFormElement>get("velX")).value) * speedAdjust || 0;
  const velY =
    parseFloat((<HTMLFormElement>get("velY")).value) * speedAdjust || 0;
  const velZ =
    parseFloat((<HTMLFormElement>get("velZ")).value) * speedAdjust || 0;

  const posX = parseFloat((<HTMLFormElement>get("posX")).value) || 0;
  const posY = parseFloat((<HTMLFormElement>get("posY")).value) || 0;
  const posZ = parseFloat((<HTMLFormElement>get("posZ")).value) || 0;

  let bodyType;
  if ((<HTMLFormElement>get("bodyStar")).checked) bodyType = "star";
  if ((<HTMLFormElement>get("bodyPlanet")).checked) bodyType = "planet";
  const whiteHoleDiv = <HTMLFormElement>get("bodyWhiteHole");
  if (whiteHoleDiv && whiteHoleDiv.checked) bodyType = "whiteHole";

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
    if (["posX", "posY", "posZ"].includes(change)) {
      player.translate(
        posX - player.position.x,
        posY - player.position.y,
        posZ - player.position.z
      );
    }
  }

  let body;
  if (change === "bodyPlanet" || scaleChange === "planet") {
    destroyTemp();
    resetOptions(bodyType);
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
    resetOptions(bodyType);
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
  if (change === "bodyWhiteHole") {
    destroyTemp();
    resetOptions(bodyType);
    body  = new WhiteHole("_tempBody", 16, textures);
    body.translate(scalePos[0], scalePos[1], scalePos[2]);
    setPlayer(body);
  }
};

//delete current temp body if exists
export const destroyTemp = () => {
  for (let key in gameObjects.objects) {
    const obj = gameObjects.objects[key];
    if (obj.name === "_tempBody") obj.destroy(gameObjects);
  }
};

const resetOptions = (body: string) => {
  const hideableDivs = document.getElementsByClassName("hideable");
  for (let x = 0; x < hideableDivs.length; x++) {
    const el = <HTMLDivElement>hideableDivs.item(x);
    el.style.visibility = "hidden";
  }

  const visibleDivs = document.getElementsByClassName(body);
  for (let x = 0; x < visibleDivs.length; x++) {
    const el = <HTMLDivElement>visibleDivs.item(x);
    el.style.visibility = "visible";
  }
  if (body !== "whiteHole") changeInputRanges(body === "star" ? true : false);
};

const changeInputRanges = (isStar: boolean) => {
  const calculateStep = (max: number, min: number) =>
    10 ** (Math.floor(Math.log10(max - min)) - 2);
  get("bodyOptions").style.visibility = "visible";

  const maxMass = isStar ? maxStarMass : maxPlanetMass;
  const minMass = isStar ? minStarMass : minPlanetMass;
  const maxSize = maxPlanetSize; // could delete this but will be needed if new body types are added
  const minSize = minPlanetSize; // could delete this but will be needed if new body types are added
  const startMass = minMass; //(maxMass+minMass)/2
  const startSize = minSize; // (maxSize+minSize)/2;
  const massStep = calculateStep(maxMass, minMass);
  const sizeStep = calculateStep(maxSize, minSize);

  const massInput = <HTMLInputElement>get("bodyMass");
  const sizeInput = <HTMLInputElement>get("bodySize");

  massInput.max = maxMass.toString();
  massInput.min = minMass.toString();
  massInput.step = massStep.toString();
  massInput.defaultValue = startMass.toString();
  showInputValue(massInput);

  sizeInput.max = maxSize.toString();
  sizeInput.min = minSize.toString();
  sizeInput.step = sizeStep.toString();
  // sizeInput.value = startSize.toString();
  sizeInput.defaultValue = startSize.toString();
  showInputValue(sizeInput);
};

const showInputValue = (range: HTMLInputElement) => {
  const rangeV = document.getElementById(`${range.id}Label`);
  const value = parseFloat(range.value);
  const min = parseFloat(range.min);
  const max = parseFloat(range.max);
  const setValue = () => {
    const newValue = Number(((value - min) * 100) / (max - min));
    rangeV.innerHTML = `${range.id.slice(4)}: ${range.value}`;
  };
  range.addEventListener("input", setValue);
};
