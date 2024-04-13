import { settings, state } from './globalState.js';
import { rules, deleteIconHTML, colors } from './constants.js';
import { calculateRules } from './CalculateRules.js';
import { deleteCandidate, deleteVoter, toggleAgenda } from './InstanceManagement.js';
import Sortable from '../imports/sortable.core.esm.min.js';

let previousComputation;
export function buildTable() {
    // check if we can skip computation
    var thisComputation = JSON.stringify([settings, rules, state.N, state.C, state.u]);
    if (previousComputation && thisComputation == previousComputation) {
        return;
    }
    previousComputation = thisComputation;

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
        cell.id = "voter" + i + "-vote";
        for (var j of state.profile[i]) {
            var chip = document.createElement("button");
            chip.id = "voter" + i + "-candidate" + j + "-chip";
            chip.dataset.candidate = j;
            chip.dataset.voter = i;
            chip.className = "candidate-chip";
            chip.style.backgroundColor = colors[j];
            chip.innerHTML = state.cmap[j] || j;
            cell.appendChild(chip);
            if (!state.agenda.includes(j)) {
                chip.classList.add("not-agenda");
            }
            chip.addEventListener("click", function () {
                toggleAgenda(this.dataset.candidate);
            });
        }
        Sortable.create(cell, {
            dataIdAttr: 'data-candidate', 
            ghostClass: 'ghost-chip',
            onChange: (evt) => { updateProfile(); }
        });
        if (state.C.length > 1) {
            const trashCell = row.insertCell();
            trashCell.className = "empty-cell";
            const trash = document.createElement("div");
            trash.id = "voter" + i + "-trash";
            trash.classList.add("ranking-trash");
            trash.dataset.voter = i;
            trashCell.appendChild(trash);
            Sortable.create(trash, {
                group: `voter${i}-vote`,
                draggable: '.candidate-chip',
                ghostClass: 'ghost-chip',
                onAdd: (evt) => { deleteCandidate(evt.item.dataset.candidate); },
            });
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
    // already draw rows for each rule to avoid flickering
    for (let rule in rules) {
        if (!rules[rule].active) {
            continue;
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
        const vote = Array.from(voteElem.children).map(child => parseInt(child.dataset.candidate));
        state.profile[i] = vote;
        calculateRules();
    }
}