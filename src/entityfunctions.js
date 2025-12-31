import { Ray, Vector3 } from "@babylonjs/core";

export function createEntity(noaInstance,x,y,z,mesh) {
    var id = noaInstance.entities.add([x,y,z],1,1,mesh,[0,0,0],false,false);
    mesh.metadata = {
    eid: id,
    raycastType: "entity"
  };
    return id;
}


export function raycastEntitiesBabylon(noa, maxDist = 6) {
  const scene = noa.rendering.getScene();
  const camera = scene.activeCamera;

  // Get Babylon's forward ray (for direction)
  const forwardRay = camera.getForwardRay(1);

  // Explicitly use the camera's world position as origin
  const origin = camera.globalPosition || camera.position
  const direction = forwardRay.direction

  const ray = new Ray(origin, direction, maxDist);

  const hit = scene.pickWithRay(ray, mesh =>
    mesh.isPickable &&
    mesh.metadata &&
    mesh.metadata.raycastType === "entity"
  );

  if (!hit?.hit) {
    return null;}

  return {
    eid: hit.pickedMesh.metadata.eid,
    distance: hit.distance,
    point: hit.pickedPoint,
    mesh: hit.pickedMesh
  };
}