import { settings, state } from './globalState.js';
import { rules, deleteIconHTML } from './constants.js';
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
    // spacer row
    var row = tablebody.insertRow();
    row.style.height = "1em";
    // insert table foot for rule rows
    let tablefoot = table.createTFoot();
    tablefoot.classList.add("rule-table-rows");
    let number_of_rules_selected = Object.values(rules).filter(rule => rule.active).length;
    if (number_of_rules_selected * 33 >= 0.4 * window.innerHeight) {
        // not enough space for sticky
        tablefoot.style.position = 'static';
    }
    let currentCategory = "";
    // already draw rows for each rule to avoid flickering
    for (let rule in rules) {
        if (!rules[rule].active) {
            continue;
        }
        if (rules[rule].category != currentCategory) {
            currentCategory = rules[rule].category;
            let row = tablefoot.insertRow();
            row.classList.add("category-row");
            let cell = row.insertCell();
            cell.colSpan = 4;
            cell.innerHTML = currentCategory;
        }
        let row = tablefoot.insertRow();
        row.id = "rule-" + rule + "-row";
        row.classList.add("rule-row");
        let cell = row.insertCell();
        let span = document.createElement("span");
        span.innerHTML = rules[rule].shortName;
        tippy(span, {
            content: rules[rule].fullName,
            theme: "light",
        });
        cell.appendChild(span);
        let resultsCell = row.insertCell();
        resultsCell.id = "rule-" + rule + "-results";
        cell = row.insertCell();
        cell.id = "rule-" + rule + "-property-cell";
        cell.classList.add("empty-cell");
    }
    if (window.pyodide) {
        // wait for browser to render table
        setTimeout(function () {
            calculateRules();
        }, 0);
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