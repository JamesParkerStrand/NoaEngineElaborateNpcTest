import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

export async function makeMesh(noa, filedes, filename) {
  const scene = noa.rendering.getScene()

  const result = await BABYLON.SceneLoader.ImportMeshAsync(
    "",
    "../models/" + filedes + "/",
    filename,
    scene
  )

  const meshes = result.meshes.filter(m =>
    m instanceof BABYLON.Mesh &&
    m.getTotalVertices() > 0
  )

  const merged = BABYLON.Mesh.MergeMeshes(meshes, true, true, undefined, false)

  meshes.forEach(m => m.dispose())

  merged.rotationQuaternion = null
  merged.isPickable = true
  //merged.scaling.setAll(6);
  //merged.computeWorldMatrix(true);
  //merged.bakeCurrentTransformIntoVertices();


  return merged
}