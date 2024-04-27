import { settings, state } from './globalState.js';
import { rules, properties, colors } from './constants.js';

function computeTiedCommittees() {
    let rule = document.getElementById("compute-tied-committees-button").dataset.rule;
    let result = _calculateRule(rule, true)[0];
    let pre = document.getElementById("committee-info-modal-all-committees");
    pre.innerHTML = "";
    pre.innerHTML = result.map(committee => committee.join(",")).join("\n");
}

function populateCommitteeInfoModal(rule) {
    document.getElementById("compute-tied-committees-button").dataset.rule = rule;
    document.getElementById("compute-tied-committees-button").addEventListener("click", computeTiedCommittees);
    let pre = document.getElementById("committee-info-modal-all-committees");
    pre.innerHTML = "";
    // compute properties
    setTimeout(() => {
        let propList = document.getElementById("committee-info-modal-properties-list");
        propList.innerHTML = "";
        for (let prop in properties) {
            let result = window.pyodide.runPython(`
                properties.check("${prop}", profile, ${JSON.stringify(state.storedCommittee[rule])})
            `);
            let details = document.createElement("details");
            let summary = document.createElement("summary");
            if (result) {
                summary.classList.add("satisfied");
                summary.innerHTML = properties[prop].fullName + ": ✓ satisfied";
            } else {
                summary.classList.add("failed");
                summary.innerHTML = properties[prop].fullName + ": ✗ failed";
            }
            details.appendChild(summary);
            let pre = document.createElement("pre");
            // pre.innerHTML = info.join("\n");
            details.appendChild(pre);
            propList.appendChild(details);
        }
    }, 0);
}

function _calculateRule(rule, forceIrresolute = false) {
    let result;
    result = window.pyodide.runPython(`
        results = ${rules[rule].command}
        if results is None:
            results = []
        results = [int(x) for x in results]
        json.dumps(results)
    `);
    return JSON.parse(result);
}

export async function calculateRules() {
    let profileString;
    if (settings.weakOrderMode) {
        profileString = "profile = ProfileWithTies([";
        for (let i of state.N) {
            // make a rank map candidate -> rank (1 is best)
            // then JSON.stringify it
            let rankMap = {};
            for (let j = 0; j < state.profile[i].length; j++) {
                for (let k of state.profile[i][j]) {
                    rankMap[k] = j + 1;
                }
            }
            profileString += JSON.stringify(rankMap).replaceAll(`"`, '') + ",";
        }
        profileString = profileString.slice(0, -1) + "]"; // remove trailing comma
        console.log(profileString);
    } else {
        profileString = "profile = Profile([";
        for (let i of state.N) {
            profileString += "[" + state.profile[i].join(",") + "],";
        }
        profileString = profileString.slice(0, -1) + "]"; // remove trailing comma
    }
    // add cmap
    profileString += ", cmap = {";
    for (let key in state.cmap) {
        if (state.C.includes(parseInt(key))) {
            profileString += key + ": '" + state.cmap[key] + "', ";
        }
    }
    profileString = profileString.slice(0, -2) + "})";
    window.pyodide.runPython(`
        ${profileString}
        agenda = ${JSON.stringify(state.agenda)}
    `);
    let table = document.getElementById("profile-table");
    let tBody = table.getElementsByTagName("tbody")[0];
    for (let rule in rules) {
        if (!rules[rule].active) {
            continue;
        }
        setTimeout(() => {
            let result = _calculateRule(rule);
            state.storedCommittee[rule] = result;
            let cell = document.getElementById("rule-" + rule + "-results");
            cell.innerHTML = "";
            for (let j of result) {
                var chip = document.createElement("div");
                chip.className = "candidate-chip";
                chip.style.backgroundColor = colors[j];
                chip.innerHTML = state.cmap[j] || j;
                chip.dataset.rule = rule;
                chip.dataset.candidate = j;
                cell.appendChild(chip);
            }
            let row = document.getElementById("rule-" + rule + "-row");
            // row.dataset.hystmodal = "#committee-info-modal";
            // row.onclick = function () {
            //     populateCommitteeInfoModal(rule);
            // };
            if (settings.showPropertyinTable) {
                setTimeout(() => {
                    let cell = document.getElementById("rule-" + rule + "-property-cell");
                    let result = window.pyodide.runPython(`
                        properties.check("${settings.showPropertyinTable}", profile, ${JSON.stringify(state.storedCommittee[rule])})
                    `);
                    if (result) {
                        let span = document.createElement("span");
                        span.classList.add("property-cell-satisfied");
                        span.innerHTML = "✓ " + properties[settings.showPropertyinTable].shortName;
                        cell.appendChild(span);
                    } else {
                        let span = document.createElement("span");
                        span.classList.add("property-cell-failed");
                        span.innerHTML = "✗ " + properties[settings.showPropertyinTable].shortName;
                        cell.appendChild(span);
                    }
                }, 0);
            }
        }, 0);
    }
    return true;
}