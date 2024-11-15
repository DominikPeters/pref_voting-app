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
        if (window.location.search.startsWith("?profile=")) {
            // voting.ml URL scheme
            // example: ?profile=3ABC-1BCA-4CAB
            let stateString = window.location.search.substring(9);
            console.log(stateString);
            try {
                const parts = stateString.split('-');
                let totalVoters = 0;
                let profile_ = {};
                
                // Find the first preference order to determine number of candidates
                const firstPart = parts[0];
                const firstPrefMatch = firstPart.match(/^\d+([A-Z]+)$/);
                if (!firstPrefMatch) throw new Error("Invalid format");
                const numCandidates = firstPrefMatch[1].length;
                
                // Convert each part and calculate total voters
                parts.forEach(part => {
                    const countMatch = part.match(/^(\d+)/);
                    if (!countMatch) throw new Error("Invalid format");
                    totalVoters += parseInt(countMatch[1]);
                });
                
                // Set up N and C arrays
                let N_ = Array.from(Array(totalVoters).keys());
                let C_ = Array.from(Array(numCandidates).keys());
                
                // Fill profile
                let currentVoter = 0;
                parts.forEach(part => {
                    const match = part.match(/^(\d+)([A-Z]+)$/);
                    if (!match) throw new Error("Invalid format");
                    const count = parseInt(match[1]);
                    const pref = match[2];
                    // Convert preference string to numbers (A=0, B=1, etc.)
                    const prefArray = Array.from(pref).map(c => c.charCodeAt(0) - 65);
                    // Create preference as array of single-element arrays
                    const preference = prefArray.map(p => [p]);
                    
                    // Assign same preference to 'count' number of voters
                    for (let i = 0; i < count; i++) {
                        profile_[currentVoter] = preference;
                        currentVoter++;
                    }
                });
                
                setInstance(N_, C_, profile_);
            } catch (e) {
                console.error(e);
            }
        } else {
            try {
                let stateString = window.location.search.substring(1);
                console.log(stateString);
                const parsed = JSON.parse(stateString);
                let N_ = Array.from(Array(parsed.length).keys());
                let C_ = parsed[0].flat();
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
}