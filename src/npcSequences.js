import {getDirection3D, degToRad} from "./utility";
import { npcConditionContinue } from './npcGoalStates'; 

export class npcSequenceHandler {

  constructor() {
      this.Interupted = false;
  }

  doNpcTick(state, textAudio, npcInstruction, noaInst,textChanger) {

    const {
      currentNpcPage,
      currentNpcText,
      textTicks,
      ticks
    } = state;

    var winState = npcConditionContinue.get(state.currentNpcText);

    if (winState) {
      Object.keys(winState).forEach(key => {
        //console.log(key, winState[key]);
        if (winState[key] === false) {
          //console.log("npc shouldn't continue.");
          this.Interupted = true;
          return true;
        } else {
          this.Interupted = false;
        }
      });
    };

    const targetPos = [
      npcInstruction[currentNpcPage][1],
      npcInstruction[currentNpcPage][2],
      npcInstruction[currentNpcPage][3]
    ];

    state.textTicks++;

    if (state.textTicks > textAudio[currentNpcText][2] && this.Interupted === false) {
      if (state.currentNpcText < textAudio.length - 1) {
        state.currentNpcText++;
      }
      textChanger(textAudio[state.currentNpcText][0]);
      state.textTicks = 0;
    }

    const speed = npcInstruction[currentNpcPage][4];
    let pos = noaInst.entities.getPosition(
      npcInstruction[currentNpcPage][0]
    );

    let [forward, , distance] = getDirection3D(pos, targetPos);

    if (distance < 0.01) {
      pos = [...targetPos];
      state.ticks++;

      if (state.ticks > npcInstruction[currentNpcPage][5] && this.Interupted === false) {
        if (state.currentNpcPage < npcInstruction.length - 1) {
          state.currentNpcPage++;
        }

        const meshData = noaInst.entities.getMeshData(
          npcInstruction[state.currentNpcPage][0]
        );

        meshData.mesh.rotation.y = degToRad(
          npcInstruction[state.currentNpcPage][6]
        );

        state.ticks = 0;
      }
    } else {
      const moveDist = Math.min(speed, distance);
      pos[0] += forward[0] * moveDist;
      pos[1] += forward[1] * moveDist;
      pos[2] += forward[2] * moveDist;
      state.ticks = 0;
    }

    noaInst.entities.setPosition(
      npcInstruction[state.currentNpcPage][0],
      pos
    );
  }
}