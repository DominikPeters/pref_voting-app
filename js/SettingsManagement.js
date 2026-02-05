import { settings, state } from "./globalState.js";
import { buildTable } from "./TableBuilder.js";
import { deactivateRulesNotSupportingWeakOrders } from "./RuleSelection.js";

export function turnOnWeakOrderMode() {
    document.getElementById('weak-order-mode').checked = true;
    settings.weakOrderMode = true;
    deactivateRulesNotSupportingWeakOrders();
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
    if (!document.getElementById('showPropertyinTable').checked) {
        settings.showPropertyinTable = false;
    } else {
        settings.showPropertyinTable = document.getElementById('propertyToShow').value;
    }
    // if (settings.liveMode) {
    //     buildTable();
    // }
    buildTable();
}

export function populatePropertyDropdown() {
    const select = document.getElementById("propertyToShow");
    if (!select) {
        return;
    }
    if (!window.pyodide) {
        select.innerHTML = `<option value="">Loading...</option>`;
        return;
    }
    const previousValue = settings.showPropertyinTable || select.value;
    let registry = [];
    try {
        registry = JSON.parse(window.pyodide.runPython(`_pv_axiom_registry_json()`));
    } catch (e) {
        select.innerHTML = `<option value="">Axioms unavailable</option>`;
        console.error("Could not load pref_voting axioms for dropdown:", e);
        return;
    }
    state.axiomRegistry = registry;
    select.innerHTML = "";
    for (const axiom of registry) {
        const option = document.createElement("option");
        option.value = axiom.key;
        option.innerText = axiom.fullName + (axiom.heavy ? " (slow)" : "");
        select.appendChild(option);
    }
    const fallbackValue = (registry.find(a => !a.heavy) || registry[0] || {}).key;
    const selectedValue = registry.some(a => a.key === previousValue) ? previousValue : fallbackValue;
    if (selectedValue) {
        select.value = selectedValue;
        if (settings.showPropertyinTable) {
            settings.showPropertyinTable = selectedValue;
        }
    }
}

export function addSettingChangeHandlers() {
    const elementIDs = ["weak-order-mode", "showPropertyinTable"];
    for (let id of elementIDs) {
        document.getElementById(id).addEventListener('change', changeSetting);
    }
    document.getElementById("propertyToShow").addEventListener('change', () => {
        document.getElementById('showPropertyinTable').checked = true;
        changeSetting();
    });
}
