import { Planet } from "./Planet";
import { Star } from "./Star";

const starList = document.getElementById("starList");
const planetList = document.getElementById("planetList");

export function addToList(object:Planet | Star){
const item = createItem(object);
if(object instanceof Star) starList.appendChild(item);
else if(object instanceof Planet) planetList.appendChild(item);
}

export function createItem(object:Planet | Star): HTMLElement{
  const element = document.createElement("li");
  element.id=object.id.toString();
  element.innerHTML= `Name: ${object.name} Mass: ${object.mass.toFixed(3)} Size: ${object.size.toFixed(3)}  Position: [${object.position.x},${object.position.y},${object.position.z}] Velocity: [${object.velocity.x},${object.velocity.y},${object.velocity.z}]`
return element;
}

export function updateItem(object:any): HTMLElement{
  // const item = object as Planet | Star; //just to shut up typescript errors
  const element = document.getElementById(object.id.toString());
  if (element) element.innerHTML= `Name: ${object.name} Mass: ${object.mass.toFixed(3)} Size: ${object.size.toFixed(3)}  Position: [${object.position.x},${object.position.y},${object.position.z}] Velocity: [${object.velocity.x},${object.velocity.y},${object.velocity.z}]`
return element;
}
