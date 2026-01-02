/* 
 * 
 *          noa hello-world example
 * 
 *  This is a bare-minimum example world, intended to be a 
 *  starting point for hacking on noa game world content.
 * 
*/

// Engine options object, and engine instantiation.
import { Engine } from 'noa-engine'
import { loadImagePixels,loadCSVToMap,makeKey,loadCSVToNpcInstructions, loadCSVToTextAudio } from "./dataUtility";
import { createEntity, raycastEntitiesBabylon } from "./entityfunctions";
import { npcSequenceHandler } from "./npcSequences";
import { makeMesh } from "./loadMesh";
import * as BABYLON from "@babylonjs/core";
import { npcConditionContinue,npcTextIndexToGameInstructions,npcTextIndexArgs } from './npcGoalStates'; 
import {getDirection3D, degToRad,radiansToDegrees} from "./utility";

// --- Bottom screen text UI (click-through) ---
const bottomText = document.createElement('div')
bottomText.id = 'bottom-text'
bottomText.textContent = ''

document.body.appendChild(bottomText)

// Style it so it NEVER blocks mouse input
Object.assign(bottomText.style, {
  position: 'fixed',
  bottom: '10px',
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '8px 16px',
  background: 'rgba(0, 0, 0, 0.6)',
  color: 'white',
  fontFamily: 'sans-serif',
  fontSize: '50px',
  borderRadius: '60px',

  // 🔑 critical line
  pointerEvents: 'none',

  // ensure it's visible but non-interactive
  zIndex: '9999',
  userSelect: 'none'
})

function setBottomText(text) {
  bottomText.innerText = text
}

//console.log(npcConditionContinue.get(0));

setBottomText(" ");

const csvVoxelMap = await loadCSVToMap('data.csv');
const levelData = await loadCSVToMap('leveldata.csv');
const npcInstruction = await loadCSVToNpcInstructions('npcPositions.csv');
const textAudio = await loadCSVToTextAudio('textAndAudioLines.csv');
var playerData = new Map();

const imagePixels = await loadImagePixels("imgMap.png");
const imgWidth = imagePixels[0].length;
const imgHeight = imagePixels.length;

var noa = new Engine({
    debug: false,
    showFPS: true,
    chunkSize: 48,
    chunkAddDistance: [8.5, 6],
    maxRenderRate: 0,
    playerStart: [0, 10, 0],
    playerAutoStep: true,
    playerShadowComponent: false,
    originRebaseDistance: 10,
})

// light to get all objects lit.
const hemi = new BABYLON.HemisphericLight(
  "hemi",
  new BABYLON.Vector3(0, 1, 0),
  noa.rendering.getScene()
)

hemi.intensity = 0.6
hemi.diffuse.set(1, 1, 1)
hemi.groundColor.set(0.5, 0.5, 0.5)



var newPosition = [233, 87, 525];

// Move player instantly
noa.entities.setPosition(noa.playerEntity, newPosition);

const scene = noa.rendering.getScene()

var citizen = null;
var fullyLoaded = false;
var meshPlayer = null;
var teleporterActive = null;
//mesh name, actual mesh.

// load our custom meshes as initialization.
noa.once('tick', async () => {
  const teleporterProp = await makeMesh(noa, 'teleporter_inactive', 'teleporter_inactive.obj');
  const teleporterActiveMesh = await makeMesh(noa, 'teleporter_active', 'teleporter_active.obj');
  teleporterActive = teleporterActiveMesh;
  const npc = await makeMesh(noa, 'friendnpc', 'generic_felari.obj');
  const playerMesh = await makeMesh(noa,'playerNpc','james.obj');

  noa.entities.addComponent(noa.playerEntity, noa.entities.names.mesh, {
    mesh: playerMesh,
    // offset vector is needed because noa positions are always the 
    // bottom-center of the entity, and Babylon's CreateBox gives a 
    // mesh registered at the center of the box
    offset: [0, 0, 0],
});

const meshData = noa.entities.getMeshData(noa.playerEntity);
meshPlayer = meshData.mesh;

  var teleport = createEntity(noa, 328, 87, 637, teleporterProp)
  var teleporterMesh = noa.entities.getMeshData(teleport); 
  teleporterMesh.mesh.scaling.setAll(6);
  citizen = createEntity(noa, 300, 87, 640, npc)
  noa.entities.setPosition(citizen, [233,87,535]);

  // defining arguements
  npcTextIndexArgs.set(3,[3,teleporterActiveMesh]);
  fullyLoaded = true;
});

// npc controlling
const npcState = {
  currentNpcPage: 0,
  currentNpcText: 0,
  textTicks: 0,
  ticks: 0
};

// set our text
//setBottomText(textAudio[currentNpcText][0]);

var npcSequences = new npcSequenceHandler();

setBottomText(textAudio[0][0]);

var degreeOrientation = Math.PI;

// the npc movement and text happens.
noa.on('tick', async () => {

  // player scroll
  var scroll = noa.inputs.pointerState.scrolly
    if (scroll !== 0) {
        noa.camera.zoomDistance += (scroll > 0) ? 1 : -1
        if (noa.camera.zoomDistance < 0) noa.camera.zoomDistance = 0
        if (noa.camera.zoomDistance > 10) noa.camera.zoomDistance = 10
    }

  //npc control
  if(fullyLoaded) {

    const GameChanges = npcTextIndexToGameInstructions.get(npcState.currentNpcText);
    if(GameChanges) {
      // process mesh changes.
      /*
      if(GameChanges.MeshesToChange) {
        //console.log(GameChanges.MeshesToChange);
        for(const meshChange of GameChanges.MeshesToChange) {
          const meshId = meshChange[0];
          const newMeshName = meshChange[1];
          const entityMeshData = noa.entities.getMeshData(meshId);
          const newMesh = teleporterActive.get(newMeshName);
          noa.entities.addComponentAgain(meshId, noa.entities.names.mesh, {
            mesh: newMesh,
            // offset vector is needed because noa positions are always the 
            // bottom-center of the entity, and Babylon's CreateBox gives a 
            // mesh registered at the center of the box
            offset: [0, 0, 0],
        });
        noa.entities.getMeshData(meshId).mesh.scaling.setAll(6);
      }
        */
      const changeFunction = GameChanges;
      if(typeof(changeFunction) === 'function') {
        changeFunction(noa,npcTextIndexArgs.get(npcState.currentNpcText));
      }
    }
    const cam = noa.camera;

    meshPlayer.rotation.y = cam.heading - degreeOrientation;
    npcSequences.doNpcTick(npcState, textAudio, npcInstruction,noa,setBottomText);
  }

})



/*
 *
 *      Registering voxel types
 * 
 *  Two step process. First you register a material, specifying the 
 *  color/texture/etc. of a given block face, then you register a 
 *  block, which specifies the materials for a given block type.
 * 
*/

// generate 20 distinct colors
var colors = []
for (let i = 0; i < 20; i++) {
    let r = i*20;
    let g = 0;
    let b = 0;
    if(r > 255) {
      g = i*20-255;
      if(g > 255) {
        b = i*20-255;
      }
    }
    if(r == 0) {
      colors.push([1,1,1]);
    } else {
      colors.push([r/255,g/255,b/255]);
    }
}

// register materials and blocks
var blockIDs = []

colors.forEach((color, i) => {
    let materialName = `color_${i}`
    noa.registry.registerMaterial(materialName, { color })

    let blockID = noa.registry.registerBlock(i + 1, {
        material: materialName
    })

    blockIDs.push(blockID)
})

/*
 * 
 *      World generation
 * 
 *  The world is divided into chunks, and `noa` will emit an 
 *  `worldDataNeeded` event for each chunk of data it needs.
 *  The game client should catch this, and call 
 *  `noa.world.setChunkData` whenever the world data is ready.
 *  (The latter can be done asynchronously.)
 * 
*/


// simple height map worldgen function
function getVoxelID(x, y, z) {
  if (y < -3 || y > 140) {return 0;}

  // bounds check for image
  if (x < 0 || z < 0 || z >= imgHeight || x >= imgWidth) {
    return 0;
  }

  // CSV override editor made.
  const csvIdleveldata = levelData.get(makeKey(x, y, z));
  if (csvIdleveldata !== undefined) {
    return csvIdleveldata;
  }

  // CSV override
  const csvId = csvVoxelMap.get(makeKey(x, y, z));
  if (csvId !== undefined) {
    return csvId+1;
  }

  // heightmap terrain
  const pixel = imagePixels[z][x];
  const height = pixel.r;

  if (y < height) return 1;
  return 0;
}

// register for world events
noa.world.on('worldDataNeeded', function (id, chunk, x, y, z) {
    for (let i = 0; i < chunk.shape[0]; i++) {
        for (let j = 0; j < chunk.shape[1]; j++) {
            for (let k = 0; k < chunk.shape[2]; k++) {
                const voxelID = getVoxelID(x + i, y + j, z + k);
                chunk.set(i, j, k, voxelID);
            }
        }
    }

    noa.world.setChunkData(id, chunk);
});

console.log(noa.entities.names);

window.addEventListener('mousedown', (event) => {
  const hit = raycastEntitiesBabylon(noa, 100)

  var winState = npcConditionContinue.get(npcState.currentNpcText);

  if (winState && winState.hasOwnProperty('PlayerHasClicked')) {
    winState.PlayerHasClicked = true;
  }

  //console.log(noa.entities.getPosition(noa.playerEntity));

  if( event.button === 2 ) {
    degreeOrientation = Math.PI;
  } else {
    degreeOrientation = 0;
  }
  //degreeOrientation = -degreeOrientation;

  console.log(winState);
  if (hit) {
    console.log('Hit entity', hit.eid, 'at', hit.distance)
  }
})