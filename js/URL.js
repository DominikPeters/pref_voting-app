import { state } from './globalState.js';
import { setInstance } from './InstanceManagement.js';


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
        }
    }
}