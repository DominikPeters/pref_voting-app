import { state } from './globalState.js';
import { profileToMatrix } from './utils.js';
import { loadMatrix } from './InstanceManagement.js';
import { buildTable } from './TableBuilder.js';


export function copyURL() {
    let stateString = `${state.budget}&` 
        + state.C.map(c => state.cost[c]).join(",") + "&"
        + profileToMatrix(state).replaceAll("\n", "&").slice(0, -1);
    let URL = window.location.origin + window.location.pathname + "?" + stateString;
    console.log(URL);
    let button = document.getElementById("copy-url-button");
    let originalHTML = button.innerHTML;
    navigator.clipboard.writeText(URL).then(function () {
        button.innerHTML = "✓ Copied!";
        setTimeout(function () {
            button.innerHTML = originalHTML;
        }, 1000);
    });
}

function loadStandardInstance() {
    let matrix = "111100000000000\n111010000000000\n111001000000000\n000000111000000\n000000000111000\n000000000000111";
    loadMatrix(matrix);
    state.budget = 12;
}

export function readURL() {
    if (window.location.search) {
        try {
            let stateString = window.location.search.substring(1);
            let info = stateString.split("&");
            let matrix = info.slice(2).join("\n");
            state.budget = parseInt(info[0]);
            if (!loadMatrix(matrix)) {
                loadStandardInstance();
            } else {
                state.cost = Object.fromEntries(info[1].split(",").map((c, i) => [i, parseInt(c)]));
                buildTable();
            }
        } catch (e) {
            console.error(e);
            loadStandardInstance();
        }
        buildTable();
    }
}