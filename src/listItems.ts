import { cam } from ".";
import { constants } from "./constants";

export function createListItem(objectToList: any): HTMLElement {
  const listItem = document.createElement("li");
  listItem.id = objectToList.id.toString();

  const card = document.createElement("div");
  card.className="card flexContainer";

  listItem.appendChild(card);

  const statList = document.createElement("ul");
  const vectorList = document.createElement("ul");
  card.appendChild(statList);
  card.appendChild(vectorList);

  const name = document.createElement("h5");
  name.id= listItem.id+"-name";
  name.innerHTML = `Name: ${objectToList.name}`;
  name.style.fontWeight="bold"

  const mass = document.createElement("h5");
  mass.id= listItem.id+"-mass";
  mass.innerHTML = `Mass: ${objectToList.mass}`;

  const size = document.createElement("h5");
  size.id= listItem.id+"-size";
  size.innerHTML = `Size: ${objectToList.size}`;

  statList.appendChild(name);
  statList.appendChild(mass);
  statList.appendChild(size);

  const position = document.createElement("h5");
  position.id= listItem.id+"-position";
  position.innerHTML = `Position: [${objectToList.position.x.toFixed(2)},${objectToList.position.y.toFixed(2)},${objectToList.position.z.toFixed(2)}]`;

  const velocity = document.createElement("h5");
  velocity.id= listItem.id+"-velocity";
  velocity.innerHTML = `Velocity: [${objectToList.velocity.x.toFixed(2)},${objectToList.velocity.y.toFixed(2)},${objectToList.velocity.z.toFixed(2)}]`;

  vectorList.appendChild(position);
  vectorList.appendChild(velocity);

  const zoomButton = document.createElement("button");
  zoomButton.innerHTML= "Fly To"
  zoomButton.onclick = () =>{
    const camPosition =cam.getPosition();
    cam.move(camPosition.x - objectToList.position.x, camPosition.y- objectToList.position.y, camPosition.z - objectToList.position.z + objectToList.size*constants.zoom/2);
    cam.lookAt(objectToList.position);
  }

  card.appendChild(zoomButton);

  return listItem;
}

export function updateListItem(objectToList: any): HTMLElement | null {
const listItem = document.getElementById(objectToList.id.toString());
if(!listItem) return;
const mass = document.getElementById(`${objectToList.id}-mass`)
const size = document.getElementById(`${objectToList.id}-size`)
const velocity = document.getElementById(`${objectToList.id}-velocity`)
const position = document.getElementById(`${objectToList.id}-position`)

mass.innerHTML= `Mass: ${objectToList.mass.toFixed(2)}`
size.innerHTML= `Size: ${objectToList.size.toFixed(2)}`
velocity.innerHTML = `Velocity: [${objectToList.velocity.x.toFixed(2)}, ${objectToList.velocity.y.toFixed(2)}, ${objectToList.velocity.z.toFixed(2)}]`
position.innerHTML = `Position: [${objectToList.position.x.toFixed(2)}, ${objectToList.position.y.toFixed(2)}, ${objectToList.position.z.toFixed(2)}]`

return listItem;
}
