

export var npcTextIndexToGameInstructions = new Map();

// MeshesToChange: [(MeshIdToChange, newLoadedMeshname)...]
npcTextIndexToGameInstructions.set(3, {MeshesToChange: [[3, 'teleportActive']]});

// npcTextIndex: storage of win conditions to move on to the next text
export var npcConditionContinue = new Map();

npcConditionContinue.set(2,{PlayerHasClicked: false});