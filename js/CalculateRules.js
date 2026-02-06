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

function explanationFunctionNameForRule(rule) {
    const vmName = rules[rule].command.split("(")[0];
    return `${vmName}_with_explanation`;
}

function candidateLabel(cand) {
    let c = cand;
    if (typeof c === "string" && /^-?\\d+$/.test(c)) {
        c = parseInt(c, 10);
    }
    if (typeof c === "number" && state.cmap[c] !== undefined) {
        return state.cmap[c];
    }
    return String(c);
}

function makeCandidateChip(cand) {
    const chip = document.createElement("span");
    chip.className = "candidate-chip";
    let c = cand;
    if (typeof c === "string" && /^-?\\d+$/.test(c)) {
        c = parseInt(c, 10);
    }
    if (typeof c === "number" && settings.colors[c] !== undefined) {
        chip.style.backgroundColor = settings.colors[c];
    } else {
        chip.style.backgroundColor = "#888";
    }
    chip.style.cursor = "default";
    chip.innerText = candidateLabel(c);
    return chip;
}

function appendCandidatesInline(parent, cands) {
    const arr = Array.isArray(cands) ? cands : [cands];
    arr.forEach((cand, idx) => {
        parent.appendChild(makeCandidateChip(cand));
        if (idx < arr.length - 1) {
            parent.appendChild(document.createTextNode(" "));
        }
    });
}

function getOutputType(rule) {
    return rules[rule].outputType || "vm";
}

function appendScoreList(parent, scores) {
    const ul = document.createElement("ul");
    const entries = Object.entries(scores || {}).sort((a, b) => Number(b[1]) - Number(a[1]));
    for (const [cand, score] of entries) {
        const li = document.createElement("li");
        li.appendChild(document.createTextNode("Score of "));
        li.appendChild(makeCandidateChip(cand));
        li.appendChild(document.createTextNode(`: ${score}`));
        ul.appendChild(li);
    }
    parent.appendChild(ul);
}

function renderExplanationHtml(rule, data, fallbackText) {
    const container = document.getElementById("committee-info-modal-rule-explanation");
    container.innerHTML = "";

    const fallbackPre = () => {
        const pre = document.createElement("pre");
        pre.innerText = fallbackText || JSON.stringify(data, null, 2);
        container.appendChild(pre);
    };

    if (!Array.isArray(data) || data.length < 1) {
        fallbackPre();
        return;
    }

    const winners = Array.isArray(data[0]) ? data[0] : [data[0]];
    const winnersP = document.createElement("p");
    winnersP.appendChild(document.createTextNode("Winners: "));
    appendCandidatesInline(winnersP, winners);
    container.appendChild(winnersP);

    const details = data.length > 1 ? data[1] : null;
    if (details == null) {
        return;
    }

    if (rule === "instant_runoff" || rule === "coombs" || rule === "iterated_removal_cl") {
        const ol = document.createElement("ol");
        for (const round of details || []) {
            const li = document.createElement("li");
            li.appendChild(document.createTextNode("Eliminated: "));
            appendCandidatesInline(li, round);
            ol.appendChild(li);
        }
        container.appendChild(ol);
        return;
    }

    if (rule === "plurality_with_runoff_put") {
        const ul = document.createElement("ul");
        for (const pair of details || []) {
            const li = document.createElement("li");
            li.appendChild(document.createTextNode("Runoff pair: "));
            appendCandidatesInline(li, pair);
            ul.appendChild(li);
        }
        container.appendChild(ul);
        return;
    }

    if (rule === "baldwin") {
        const ol = document.createElement("ol");
        for (const round of details || []) {
            const li = document.createElement("li");
            const eliminated = round[0] || [];
            const scores = round[1] || {};
            const line = document.createElement("div");
            line.appendChild(document.createTextNode("Eliminated: "));
            appendCandidatesInline(line, eliminated);
            li.appendChild(line);
            appendScoreList(li, scores);
            ol.appendChild(li);
        }
        container.appendChild(ol);
        return;
    }

    if (rule === "strict_nanson" || rule === "weak_nanson") {
        const ol = document.createElement("ol");
        for (const round of details || []) {
            const li = document.createElement("li");
            const avg = round.avg_borda_score;
            const eliminated = round.elim_cands || [];
            const line = document.createElement("div");
            line.appendChild(document.createTextNode(`Average Borda: ${avg}; Eliminated: `));
            appendCandidatesInline(line, eliminated);
            li.appendChild(line);
            appendScoreList(li, round.borda_scores || {});
            ol.appendChild(li);
        }
        container.appendChild(ol);
        return;
    }

    if (rule === "banks") {
        const ul = document.createElement("ul");
        for (const chain of details || []) {
            const li = document.createElement("li");
            li.appendChild(document.createTextNode("Maximal chain: "));
            appendCandidatesInline(li, chain);
            ul.appendChild(li);
        }
        container.appendChild(ul);
        return;
    }

    if (rule === "stable_voting" || rule === "simple_stable_voting") {
        const ul = document.createElement("ul");
        for (const [winner, elimPath] of Object.entries(details || {})) {
            const li = document.createElement("li");
            li.appendChild(makeCandidateChip(winner));
            li.appendChild(document.createTextNode(" elimination path: "));
            appendCandidatesInline(li, elimPath);
            ul.appendChild(li);
        }
        container.appendChild(ul);
        return;
    }

    if (rule === "bucklin" || rule === "simplified_bucklin") {
        appendScoreList(container, details || {});
        return;
    }

    fallbackPre();
}

function populateRuleExplanation(rule) {
    const container = document.getElementById("committee-info-modal-rule-explanation-container");
    const panel = document.getElementById("committee-info-modal-rule-explanation");
    panel.innerHTML = "";
    if (!rules[rule].supportsExplanation) {
        container.style.display = "none";
        return;
    }
    container.style.display = "block";
    panel.innerText = "Computing explanation...";
    setTimeout(() => {
        const explanationFn = explanationFunctionNameForRule(rule);
        const result = JSON.parse(window.pyodide.runPython(`
            _pv_rule_explanation_json(${JSON.stringify(explanationFn)})
        `));
        if (result.ok) {
            renderExplanationHtml(rule, result.data, result.text);
        } else {
            panel.innerText = "Explanation unavailable for this profile/rule configuration.\n\n" + result.error;
        }
    }, 0);
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
    populateRuleExplanation(rule);
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

function renderVmResult(rule, result) {
    const cell = document.getElementById("rule-" + rule + "-results");
    if (!cell) {
        return;
    }
    cell.innerHTML = "";
    for (let j of result.winners) {
        const chip = document.createElement("div");
        chip.className = "candidate-chip";
        chip.style.backgroundColor = settings.colors[j];
        chip.innerHTML = state.cmap[j] || j;
        chip.dataset.rule = rule;
        chip.dataset.candidate = j;
        cell.appendChild(chip);
    }
}

function renderSwfResult(rule, result) {
    const cell = document.getElementById("rule-" + rule + "-results");
    if (!cell) {
        return;
    }
    cell.innerHTML = "";
    if (result.error) {
        const err = document.createElement("span");
        err.className = "property-cell-failed";
        err.innerText = `SWF error: ${result.error}`;
        cell.appendChild(err);
        return;
    }

    const allRankings = Array.isArray(result.rankings) && result.rankings.length > 0
        ? result.rankings
        : [Array.isArray(result.ranking) ? result.ranking : []];

    const renderSingleRanking = (ranking) => {
        const row = document.createElement("div");
        row.className = "swf-ranking-row";
        ranking.forEach((tier, idx) => {
            const tierDiv = document.createElement("div");
            tierDiv.className = "swf-ranking-tier";
            appendCandidatesInline(tierDiv, tier);
            row.appendChild(tierDiv);
            if (idx < ranking.length - 1) {
                const sep = document.createElement("div");
                sep.className = "swf-ranking-sep";
                sep.innerText = ">";
                row.appendChild(sep);
            }
        });
        return row;
    };

    const PREVIEW_COUNT = 3;
    const previewCount = Math.min(PREVIEW_COUNT, allRankings.length);
    for (let i = 0; i < previewCount; i++) {
        cell.appendChild(renderSingleRanking(allRankings[i]));
    }

    if (allRankings.length > PREVIEW_COUNT) {
        const remaining = allRankings.length - PREVIEW_COUNT;
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "swf-more-toggle";
        toggle.innerText = `(+${remaining} more)`;

        const hidden = document.createElement("div");
        hidden.className = "swf-hidden-rankings";
        hidden.style.display = "none";
        for (let i = PREVIEW_COUNT; i < allRankings.length; i++) {
            hidden.appendChild(renderSingleRanking(allRankings[i]));
        }

        toggle.addEventListener("click", () => {
            const expanded = hidden.style.display !== "none";
            hidden.style.display = expanded ? "none" : "block";
            toggle.innerText = expanded ? `(+${remaining} more)` : "(show less)";
        });

        cell.appendChild(toggle);
        cell.appendChild(hidden);
    }
}

function clearPropertyCell(rule) {
    const cell = document.getElementById("rule-" + rule + "-property-cell");
    if (cell) {
        cell.innerHTML = "";
    }
}

function _calculateVmRule(rule) {
    const result = window.pyodide.runPython(`
        results = ${rules[rule].command}
        if results is None:
            results = []
        results = [int(x) for x in results]
        json.dumps(results)
    `);
    return { outputType: "vm", winners: JSON.parse(result) };
}

function _calculateSwfRule(rule) {
    const commandName = (rules[rule].resultAdapter || rules[rule].command.split("(")[0]);
    const result = window.pyodide.runPython(`
        _pv_swf_result_json(${JSON.stringify(commandName)})
    `);
    const parsed = JSON.parse(result);
    return {
        outputType: "swf",
        ranking: parsed.ranking || [],
        rankings: parsed.rankings || null,
        error: parsed.error || null
    };
}

function _calculateRule(rule) {
    const outputType = getOutputType(rule);
    if (outputType === "swf") {
        return _calculateSwfRule(rule);
    }
    return _calculateVmRule(rule);
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
    for (let rule in rules) {
        if (!rules[rule].active) {
            continue;
        }
        setTimeout(() => {
            let result = _calculateRule(rule);
            state.storedResults[rule] = result;
            if (result.outputType === "swf") {
                renderSwfResult(rule, result);
            } else {
                renderVmResult(rule, result);
            }

            let row = document.getElementById("rule-" + rule + "-row");
            if (!row) {
                return;
            }
            if (result.outputType === "vm") {
                row.dataset.hystmodal = "#committee-info-modal";
                row.onclick = function () {
                    populateCommitteeInfoModal(rule);
                };
            } else {
                row.removeAttribute("data-hystmodal");
                row.onclick = null;
            }
            if (result.outputType === "vm" && settings.showPropertyinTable) {
                setTimeout(() => {
                    renderPropertyCell(rule, settings.showPropertyinTable);
                }, 0);
            } else {
                clearPropertyCell(rule);
            }
        }, 0);
    }
    return true;
}
