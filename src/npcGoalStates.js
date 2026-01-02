

function changeteleportMesh(noa, args) { 

    noa.entities.addComponentAgain(args[0], noa.entities.names.mesh, {
            mesh: args[1],
            // offset vector is needed because noa positions are always the 
            // bottom-center of the entity, and Babylon's CreateBox gives a 
            // mesh registered at the center of the box
            offset: [0, 0, 0],
        });
        noa.entities.getMeshData(args[0]).mesh.scaling.setAll(6);

    }

export var npcTextIndexArgs = new Map();

export var npcTextIndexToGameInstructions = new Map();

npcTextIndexToGameInstructions.set(3, changeteleportMesh);

// npcTextIndex: storage of win conditions to move on to the next text
export var npcConditionContinue = new Map();


npcConditionContinue.set(2,{PlayerHasClicked: false});
