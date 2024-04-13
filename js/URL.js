import { state } from './globalState.js';
import { profileToMatrix } from './utils.js';
import { setInstance } from './InstanceManagement.js';
import { buildTable } from './TableBuilder.js';


export function copyURL() {
    let stateString = JSON.stringify(state.N.map(i => state.profile[i]));
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
            console.log(stateString);
            const parsed = JSON.parse(stateString);
            let N_ = Array.from(Array(parsed.length).keys());
            let C_ = Array.from(Array(parsed[0].length).keys());
            let profile_ = {};
            for (let i of N_) {
                profile_[i] = parsed[i];
            }
            setInstance(N_, C_, profile_);
        } catch (e) {
            console.error(e);
            // loadStandardInstance();
        }
        // buildTable();
    }
}