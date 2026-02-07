import { settings, state } from './globalState.js';
import { rules, outputTypes, deleteIconHTML } from './constants.js';
import { calculateRules } from './CalculateRules.js';
import { deleteCandidate, deleteVoter, toggleAgenda, updateVotingMlLink } from './InstanceManagement.js';
import Sortable from '../imports/sortable.core.esm.min.js';
import { createWeakOrder } from './WeakOrderElement.js';

let previousComputation;
export function buildTable() {
    // check if we can skip computation
    // var thisComputation = JSON.stringify([settings, rules, state.N, state.C, state.profile, state.agenda]);
    // if (previousComputation && thisComputation == previousComputation) {
    //     return;
    // }
    // previousComputation = thisComputation;
    updateVotingMlLink();

    var table = document.getElementById("profile-table");
    table.replaceChildren(); // clear table
    // voter rows
    var tablebody = table.createTBody();
    for (var i of state.N) {
        var row = tablebody.insertRow();
        row.classList.add("voter-row");
        var cell = row.insertCell();
        cell.innerHTML = "Voter " + (i + 1);
        // allow deletion of last voter
        if (state.N.length > 1) {
            cell.innerHTML += " " + deleteIconHTML;
            const deleteIcon = cell.children[0];
            deleteIcon.classList.add("delete-voter-icon");
            deleteIcon.dataset.voter = i;
            deleteIcon.addEventListener("click", function () {
                deleteVoter(this.dataset.voter);
            });
        }
        if (i == state.N.length - 1) {
            row.classList.add("last-voter");
        }
        var cell = row.insertCell();
        const voteContainer = document.createElement("span");
        voteContainer.classList.add("vote-container");
        voteContainer.id = "voter" + i + "-vote";
        const weakOrder = [];
        for (const indifferenceClass of state.profile[i]) {
            const indifferenceClassItems = [];
            for (const j of indifferenceClass) {
                const chip = document.createElement("div");
                chip.id = "voter" + i + "-candidate" + j + "-chip";
                chip.dataset.candidate = j;
                chip.dataset.voter = i;
                chip.className = "candidate-chip";
                chip.style.backgroundColor = settings.colors[j];
                chip.innerHTML = state.cmap[j] || j;
                if (!state.agenda.includes(j)) {
                    chip.classList.add("not-agenda");
                }
                chip.addEventListener("click", function () {
                    toggleAgenda(this.dataset.candidate);
                });
                voteContainer.appendChild(chip);
                indifferenceClassItems.push(chip);
            }
            weakOrder.push(indifferenceClassItems);
        }
        const trash = document.createElement("div");
        trash.id = "voter" + i + "-trash";
        trash.classList.add("ranking-trash");
        trash.dataset.voter = i;
        if (settings.weakOrderMode) {
            const weakOrderDiv = createWeakOrder({
                initialWeakOrder: weakOrder, 
                onChange: (weakOrder) => { updateProfile(); }, 
                trash,
                onTrashDrop: (item) => { deleteCandidate(item.dataset.candidate); }
            });
            weakOrderDiv.id = "voter" + i + "-vote";
            cell.appendChild(weakOrderDiv);
        } else {
            cell.appendChild(voteContainer);
            Sortable.create(voteContainer, {
                group: `voter${i}-vote`,
                dataIdAttr: 'data-candidate', 
                draggable: '.candidate-chip',
                ghostClass: 'ghost-chip',
                animation: 150,
                onChange: (evt) => { updateProfile(); },
                onStart: (evt) => { if (state.C.length > 1) { const i = evt.item.dataset.voter; document.getElementById(`voter${i}-trash`).style.display = 'inline-block'; } },
                onEnd: (evt) => { for (const trash of document.querySelectorAll('.ranking-trash')) { trash.style.display = 'none'; } },
                // while hovering over trash, add padding to more easily go back to ranking
                onMove: (evt) => { if (evt.to.className == 'ranking-trash') { evt.from.style.paddingRight = '37.5px'; } else { evt.from.style.paddingRight = '0'; } },
            });
            Sortable.create(trash, {
                group: `voter${i}-vote`,
                draggable: '.candidate-chip',
                ghostClass: 'ghost-chip',
                onAdd: (evt) => { deleteCandidate(evt.item.dataset.candidate); },
            });
        }
        if (state.C.length > 1) {
            const trashCell = row.insertCell();
            trashCell.className = "empty-cell";
            trashCell.appendChild(trash);
        }
    }
    const spacerRow = tablebody.insertRow();
    spacerRow.style.height = "1em";

    buildResultSections();

    if (window.pyodide) {
        // wait for browser to render table
        setTimeout(function () {
            calculateRules();
        }, 0);
    }
}

function buildResultSections() {
    const sectionsHost = document.getElementById("results-sections");
    sectionsHost.innerHTML = "";
    const showLoadingPlaceholders = !window.pyodide;

    for (const outputType of Object.keys(outputTypes)) {
        const activeRules = Object.keys(rules).filter(rule => rules[rule].active && (rules[rule].outputType || "vm") === outputType);
        if (activeRules.length === 0) {
            continue;
        }

        const section = document.createElement("section");
        section.classList.add("results-section");
        section.id = `results-section-${outputType}`;

        const heading = document.createElement("h3");
        heading.innerText = outputTypes[outputType].label;
        section.appendChild(heading);

        const table = document.createElement("table");
        table.classList.add("results-table");
        table.id = `results-table-${outputType}`;
        const body = table.createTBody();
        const categories = new Set(activeRules.map(rule => rules[rule].category || ""));
        const showCategoryRows = categories.size > 1;
        let currentCategory = null;
        for (const rule of activeRules) {
            const ruleCategory = rules[rule].category || "";
            if (showCategoryRows && ruleCategory !== currentCategory) {
                currentCategory = ruleCategory;
                const categoryRow = body.insertRow();
                categoryRow.classList.add("category-row");
                const cell = categoryRow.insertCell();
                cell.colSpan = 3;
                cell.textContent = currentCategory;
            }

            const row = body.insertRow();
            row.id = "rule-" + rule + "-row";
            row.classList.add("rule-row");

            const nameCell = row.insertCell();
            const span = document.createElement("span");
            span.innerHTML = rules[rule].shortName;
            tippy(span, {
                content: rules[rule].fullName,
                theme: "light",
            });
            nameCell.appendChild(span);

            const resultCell = row.insertCell();
            resultCell.id = "rule-" + rule + "-results";
            if (showLoadingPlaceholders && (rules[rule].outputType || "vm") === "vm") {
                renderPlaceholderVmResult(rule, resultCell);
            }

            const propertyCell = row.insertCell();
            propertyCell.id = "rule-" + rule + "-property-cell";
            propertyCell.classList.add("empty-cell");
        }

        section.appendChild(table);
        sectionsHost.appendChild(section);
    }
}

function renderPlaceholderVmResult(rule, cell) {
    const command = rules[rule].command || "";
    const isAntiPlurality = rule === "anti-plurality" || command.startsWith("anti_plurality(");
    const winners = isAntiPlurality ? state.C.slice(0, 3) : state.C.slice(0, 1);

    for (const j of winners) {
        const chip = document.createElement("div");
        chip.className = "candidate-chip";
        chip.style.backgroundColor = settings.colors[j];
        chip.textContent = state.cmap[j] || String(j);
        cell.appendChild(chip);
    }
}

function updateProfile() {
    for (var i of state.N) {
        const voteElem = document.getElementById("voter" + i + "-vote");
        const vote = [];
        if (settings.weakOrderMode) {
            for (const indifferenceClassDiv of voteElem.querySelectorAll('.weak-order-indifference-class')) {
                const indifferenceClass = [];
                for (const chip of indifferenceClassDiv.querySelectorAll('.weak-order-item')) {
                    indifferenceClass.push(parseInt(chip.dataset.candidate));
                }
                if (indifferenceClass.length > 0) {
                    vote.push(indifferenceClass);
                }
            }
        } else {
            for (const child of voteElem.children) {
                if (!child.classList.contains("sortable-drag") && child.classList.contains("candidate-chip")) {
                    vote.push([parseInt(child.dataset.candidate)]);
                }
            }
        }
        state.profile[i] = vote;
    }
    updateVotingMlLink();
    calculateRules();
}
