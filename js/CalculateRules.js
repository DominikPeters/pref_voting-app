import { settings, state } from './globalState.js';
import { rules, properties } from './constants.js';

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
    const resultType = rules[rule].resultType || "winners";

    if (resultType === "probability") {
        // Handle probabilistic methods - return dict of candidate -> probability
        let result = window.pyodide.runPython(`
            prob_result = ${rules[rule].command}
            if prob_result is None:
                prob_result = {}
            # Convert to dict with int keys and float values
            prob_dict = {int(k): float(v) for k, v in prob_result.items()}
            json.dumps(prob_dict)
        `);
        return { type: "probability", data: JSON.parse(result) };
    } else if (resultType === "ranking") {
        // Handle social welfare functions - return ranking
        let result = window.pyodide.runPython(`
            ranking_result = ${rules[rule].command}
            if ranking_result is None:
                ranking_list = []
            else:
                # Ranking object has .ranking property which is list of lists (with ties)
                if hasattr(ranking_result, 'ranking'):
                    ranking_list = [[int(c) for c in tier] for tier in ranking_result.ranking]
                elif hasattr(ranking_result, 'ranks'):
                    # Build ranking from ranks dict
                    from collections import defaultdict
                    tiers = defaultdict(list)
                    for c, r in ranking_result.ranks.items():
                        tiers[r].append(int(c))
                    ranking_list = [tiers[r] for r in sorted(tiers.keys())]
                else:
                    # Assume it's already a list of lists
                    ranking_list = [[int(c) for c in tier] if hasattr(tier, '__iter__') else [int(tier)] for tier in ranking_result]
            json.dumps(ranking_list)
        `);
        return { type: "ranking", data: JSON.parse(result) };
    } else {
        // Standard winner set
        let result = window.pyodide.runPython(`
            results = ${rules[rule].command}
            if results is None:
                results = []
            results = [int(x) for x in results]
            json.dumps(results)
        `);
        return JSON.parse(result);
    }
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

            // Handle different result types
            if (result && result.type === "probability") {
                // Probabilistic method - display as bar chart style
                const probData = result.data;
                const sortedCands = Object.keys(probData).sort((a, b) => probData[b] - probData[a]);
                for (let j of sortedCands) {
                    const prob = probData[j];
                    if (prob > 0.001) {  // Only show non-negligible probabilities
                        var chip = document.createElement("div");
                        chip.className = "candidate-chip probability-chip";
                        chip.style.backgroundColor = settings.colors[j];
                        const percent = (prob * 100).toFixed(1);
                        chip.innerHTML = `${state.cmap[j] || j}: ${percent}%`;
                        chip.dataset.rule = rule;
                        chip.dataset.candidate = j;
                        chip.title = `${state.cmap[j] || j}: ${(prob * 100).toFixed(2)}%`;
                        cell.appendChild(chip);
                    }
                }
            } else if (result && result.type === "ranking") {
                // Social welfare function - display as ranking with > and =
                const ranking = result.data;
                for (let tierIdx = 0; tierIdx < ranking.length; tierIdx++) {
                    const tier = ranking[tierIdx];
                    for (let i = 0; i < tier.length; i++) {
                        const j = tier[i];
                        var chip = document.createElement("div");
                        chip.className = "candidate-chip";
                        chip.style.backgroundColor = settings.colors[j];
                        chip.innerHTML = state.cmap[j] || j;
                        chip.dataset.rule = rule;
                        chip.dataset.candidate = j;
                        cell.appendChild(chip);
                        // Add "=" between tied candidates
                        if (i < tier.length - 1) {
                            var eq = document.createElement("span");
                            eq.className = "ranking-separator";
                            eq.innerHTML = " = ";
                            cell.appendChild(eq);
                        }
                    }
                    // Add ">" between tiers
                    if (tierIdx < ranking.length - 1) {
                        var gt = document.createElement("span");
                        gt.className = "ranking-separator";
                        gt.innerHTML = " > ";
                        cell.appendChild(gt);
                    }
                }
            } else {
                // Standard winner set
                for (let j of result) {
                    var chip = document.createElement("div");
                    chip.className = "candidate-chip";
                    chip.style.backgroundColor = settings.colors[j];
                    chip.innerHTML = state.cmap[j] || j;
                    chip.dataset.rule = rule;
                    chip.dataset.candidate = j;
                    cell.appendChild(chip);
                }
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