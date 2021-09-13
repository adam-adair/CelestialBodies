import { cam } from ".";
import { constants } from "./constants";
import { get } from "./utils";

export function createListItem(objectToList: any): HTMLElement {
  const listItem = document.createElement("li");
  listItem.id = objectToList.id.toString();

  const card = document.createElement("div");
  card.className = "card flexContainer";

  listItem.appendChild(card);

  const statList = document.createElement("ul");
  const vectorList = document.createElement("ul");
  card.appendChild(statList);
  card.appendChild(vectorList);

  const name = document.createElement("h5");
  name.id = listItem.id + "-name";
  name.innerHTML = `Name: ${objectToList.name}`;
  name.style.fontWeight = "bold";

  const mass = document.createElement("h5");
  mass.id = listItem.id + "-mass";
  mass.innerHTML = `Mass: ${objectToList.mass.toFixed(2)}`;

  const size = document.createElement("h5");
  size.id = listItem.id + "-size";
  size.innerHTML = `Size: ${objectToList.size.toFixed(2)}`;

  statList.appendChild(name);
  statList.appendChild(mass);
  statList.appendChild(size);

  const position = document.createElement("h5");
  position.id = listItem.id + "-position";
  position.innerHTML = `Position: [${objectToList.position.x.toFixed(
    2
  )},${objectToList.position.y.toFixed(2)},${objectToList.position.z.toFixed(
    2
  )}]`;

  const velocity = document.createElement("h5");
  velocity.id = listItem.id + "-velocity";
  velocity.innerHTML = `Velocity: [${objectToList.velocity.x.toFixed(
    2
  )},${objectToList.velocity.y.toFixed(2)},${objectToList.velocity.z.toFixed(
    2
  )}]`;

  vectorList.appendChild(position);
  vectorList.appendChild(velocity);

  const buttonDiv = document.createElement("div");
  buttonDiv.className = "flexContainer column";
  card.appendChild(buttonDiv);

  const followButton = document.createElement("button");
  followButton.innerHTML = "Fly To";
  followButton.onclick = () => flyTo(objectToList);

  buttonDiv.appendChild(followButton);

  const watchButton = document.createElement("button");
  watchButton.innerHTML = "Look At";
  watchButton.onclick = () => {
    cam.lookAt(objectToList.position);
  };
  buttonDiv.appendChild(watchButton);
  return listItem;
}

export const flyTo = (objectToList: any) => {
  const camPosition = cam.getPosition();
  cam.move(
    camPosition.x - objectToList.position.x + objectToList.size,
    camPosition.y - objectToList.position.y - objectToList.size,
    objectToList.position.z + camPosition.z + objectToList.size * constants.zoom
  );
  cam.lookAt(objectToList.position);
  cam.follow(objectToList);
};

export function updateListItem(objectToList: any): HTMLElement | null {
  const listItem = get(objectToList.id.toString());
  if (!listItem) return;
  const name = get(`${objectToList.id}-name`);
  const mass = get(`${objectToList.id}-mass`);
  const size = get(`${objectToList.id}-size`);
  const velocity = get(`${objectToList.id}-velocity`);
  const position = get(`${objectToList.id}-position`);

  name.innerHTML = `Name: ${objectToList.name}`;
  mass.innerHTML = `Mass: ${objectToList.mass.toFixed(2)}`;
  size.innerHTML = `Size: ${objectToList.size.toFixed(2)}`;
  velocity.innerHTML = `Velocity: [${objectToList.velocity.x.toFixed(
    2
  )}, ${objectToList.velocity.y.toFixed(2)}, ${objectToList.velocity.z.toFixed(
    2
  )}]`;
  position.innerHTML = `Position: [${objectToList.position.x.toFixed(
    2
  )}, ${objectToList.position.y.toFixed(2)}, ${objectToList.position.z.toFixed(
    2
  )}]`;

  return listItem;
}
