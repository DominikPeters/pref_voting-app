import { settings } from "./globalState.js";
import { buildTable } from "./TableBuilder.js";

export function turnOnWeakOrderMode() {
    document.getElementById('weak-order-mode').checked = true;
    settings.weakOrderMode = true;
}

function turnOffWeakOrderMode() {
    document.getElementById('weak-order-mode').checked = false;
    settings.weakOrderMode = false;
    for (let i of state.N) {
        state.profile[i] = state.profile[i].flat().map(c => [c]);
    }
}

async function changeSetting() {
    // settings.resolute = document.getElementById('resolute').checked;
    if (document.getElementById('weak-order-mode').checked) {
        turnOnWeakOrderMode();
    } else {
        turnOffWeakOrderMode();
    }
    // settings.useFractions = document.getElementById('fractions').checked;
    // if (!document.getElementById('showPropertyinTable').checked) {
    //     settings.showPropertyinTable = false;
    // } else {
    //     settings.showPropertyinTable = document.getElementById('propertyToShow').value;
    // }
    // if (settings.liveMode) {
    //     buildTable();
    // }
    buildTable();
}

export function addSettingChangeHandlers() {
    const elementIDs = ["weak-order-mode"]; //, "showPropertyinTable"];
    for (let id of elementIDs) {
        document.getElementById(id).addEventListener('change', changeSetting);
    }
    // document.getElementById("propertyToShow").addEventListener('change', () => {
    //     document.getElementById('showPropertyinTable').checked = true;
    //     changeSetting();
    // });
}