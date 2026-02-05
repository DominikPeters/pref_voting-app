import { settings, state } from './globalState.js';
import { rules } from './constants.js';

function vmNameForRule(rule) {
    // Use canonical VM objects for axioms if the displayed rule uses a guarded wrapper.
    if (rule === "ranked_pairs") return "ranked_pairs";
    if (rule === "river") return "river";
    return rules[rule].command.split("(")[0];
}

function ensureAxiomRegistry() {
    if (!state.axiomRegistry) {
        state.axiomRegistry = JSON.parse(window.pyodide.runPython(`_pv_axiom_registry_json()`));
    }
}

function checkAxiom(rule, axiomKey, includeDetails = true) {
    const vmName = vmNameForRule(rule);
    const result = window.pyodide.runPython(`
        _pv_check_axiom_json(${JSON.stringify(axiomKey)}, ${JSON.stringify(vmName)}, ${includeDetails ? "True" : "False"})
    `);
    return JSON.parse(result);
}

function createAxiomRow(container, axiom) {
    const row = document.createElement("div");
    row.className = "axiom-row";
    row.dataset.axiomKey = axiom.key;
    row.dataset.heavy = axiom.heavy ? "1" : "0";

    const summary = document.createElement("div");
    summary.className = "axiom-line";
    if (axiom.heavy) {
        summary.innerText = `${axiom.fullName}: ⏳ pending (slow)`;
    } else {
        summary.innerText = `${axiom.fullName}: ⏳ computing`;
    }
    row.appendChild(summary);

    const detailsHost = document.createElement("div");
    detailsHost.className = "axiom-details-host";
    row.appendChild(detailsHost);

    container.appendChild(row);
    return row;
}

function renderAxiomResult(row, axiom, result) {
    const summary = row.querySelector(".axiom-line");
    const detailsHost = row.querySelector(".axiom-details-host");

    summary.classList.remove("satisfied", "failed", "na");
    if (!result.applicable) {
        summary.classList.add("na");
        summary.innerText = `${axiom.fullName}: ? not applicable`;
    } else if (result.satisfied) {
        summary.classList.add("satisfied");
        summary.innerText = `${axiom.fullName}: ✓ satisfied`;
    } else {
        summary.classList.add("failed");
        summary.innerText = `${axiom.fullName}: ✗ failed`;
    }

    detailsHost.innerHTML = "";
    const detailText = result.error || result.details;
    if (detailText) {
        const details = document.createElement("details");
        const detailSummary = document.createElement("summary");
        detailSummary.innerText = "Details";
        const pre = document.createElement("pre");
        pre.innerText = detailText;
        details.appendChild(detailSummary);
        details.appendChild(pre);
        detailsHost.appendChild(details);
    }
}

function getAxiomByKey(axiomKey) {
    ensureAxiomRegistry();
    return state.axiomRegistry.find(a => a.key === axiomKey) || { key: axiomKey, shortName: axiomKey, fullName: axiomKey };
}

function renderPropertyCell(rule, axiomKey) {
    const cell = document.getElementById("rule-" + rule + "-property-cell");
    if (!cell) {
        return;
    }
    cell.innerHTML = "";
    const axiom = getAxiomByKey(axiomKey);
    const result = checkAxiom(rule, axiomKey, false);
    const span = document.createElement("span");
    if (!result.applicable) {
        span.classList.add("property-cell-na");
        span.innerText = "? " + axiom.shortName;
        span.title = result.error || "Not applicable";
    } else if (result.satisfied) {
        span.classList.add("property-cell-satisfied");
        span.innerText = "✓ " + axiom.shortName;
    } else {
        span.classList.add("property-cell-failed");
        span.innerText = "✗ " + axiom.shortName;
    }
    cell.appendChild(span);
}

function populateCommitteeInfoModal(rule) {
    ensureAxiomRegistry();
    const list = document.getElementById("committee-info-modal-properties-list");
    list.innerHTML = "";

    const rowsByKey = {};
    for (let axiom of state.axiomRegistry) {
        rowsByKey[axiom.key] = createAxiomRow(list, axiom);
    }

    const button = document.getElementById("compute-heavy-axioms-button");
    button.dataset.rule = rule;
    button.disabled = false;
    button.innerText = "compute";
    button.onclick = () => {
        button.disabled = true;
        button.innerText = "computing...";
        setTimeout(() => {
            const heavyAxioms = state.axiomRegistry.filter(a => a.heavy);
            for (let axiom of heavyAxioms) {
                const result = checkAxiom(rule, axiom.key);
                renderAxiomResult(rowsByKey[axiom.key], axiom, result);
            }
            button.innerText = "recompute";
            button.disabled = false;
        }, 0);
    };

    setTimeout(() => {
        const cheapAxioms = state.axiomRegistry.filter(a => !a.heavy);
        for (let axiom of cheapAxioms) {
            const result = checkAxiom(rule, axiom.key);
            renderAxiomResult(rowsByKey[axiom.key], axiom, result);
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
                chip.style.backgroundColor = settings.colors[j];
                chip.innerHTML = state.cmap[j] || j;
                chip.dataset.rule = rule;
                chip.dataset.candidate = j;
                cell.appendChild(chip);
            }
            let row = document.getElementById("rule-" + rule + "-row");
            row.dataset.hystmodal = "#committee-info-modal";
            row.onclick = function () {
                populateCommitteeInfoModal(rule);
            };
            if (settings.showPropertyinTable) {
                setTimeout(() => {
                    renderPropertyCell(rule, settings.showPropertyinTable);
                }, 0);
            } else {
                const cell = document.getElementById("rule-" + rule + "-property-cell");
                if (cell) {
                    cell.innerHTML = "";
                }
            }
        }, 0);
    }
    return true;
}
