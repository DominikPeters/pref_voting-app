import { state, settings } from './globalState.js';
import { rules, properties, axioms, infoIconHtml } from './constants.js';
import { setRuleActive, populateRuleChoiceModal } from './RuleSelection.js';
import { populateExportModal } from './ExportModal.js';
import { populateRandomizerModal, randomize } from './Randomizer.js';
import { copyURL, readURL } from './URL.js';
import { setUpDragDropHandlers } from './FileDrop.js';
import { loadPython } from './loadPython.js';
import { buildTable } from './TableBuilder.js';
import { calculateRules } from './CalculateRules.js';
import { startLog, getLog, storedLogs, logger } from './logger.js';
import { addVoter, addCandidate } from './InstanceManagement.js';
import { populateLibraryModal } from './LibraryModal.js';
import { addSettingChangeHandlers } from './SettingsManagement.js';
import { populateAxiomModal, populateAnalysisPanel, findDisagreement } from './AxiomChecker.js';

window.logger = logger;

function dismissAbout() {
    document.getElementById("dismissable-about").style.display = "none";
    window.localStorage.setItem("dismissed-about", "true");
}

function runHighs(LpInput) {
    let result = window.highs.solve(LpInput);
    return JSON.stringify(result);
}

window.runHighs = runHighs;

document.addEventListener('DOMContentLoaded', function () {
    if (window.localStorage.getItem("dismissed-about") === "true") {
        dismissAbout();
    }
    document.getElementById("dismiss-button").addEventListener('click', dismissAbout);

    if (window.location.search) {
        readURL();
    } else {
        buildTable();
    }

    setUpDragDropHandlers();

    // disable all buttons and inputs while loading
    document.querySelectorAll("button, input").forEach(function (el) {
        el.disabled = true;
    });

    document.getElementById("add-voter-button").addEventListener('click', addVoter);
    document.getElementById("add-candidate-button").addEventListener('click', addCandidate);
    document.getElementById("random-button").addEventListener('click', randomize);
    document.getElementById("export-button").addEventListener('click', populateExportModal);
    document.getElementById("copy-url-button").addEventListener('click', copyURL);

    addSettingChangeHandlers();

    tippy('[data-tippy-content]', { theme: "light", });
    window.modals = new HystModal({
        linkAttributeName: "data-hystmodal",
        beforeOpen: function (modal) {
            tippy.hideAll();
        },
        afterClose: function (modal) {
            if (modal.openedWindow.id === "rule-choice-modal") {
                buildTable();
            }
        },
    });
    populateRuleChoiceModal();
    populateRandomizerModal(true);
    populateLibraryModal();
    initializeAnalysisModal();

    loadPython();

});

/**
 * Initialize the analysis modal with dropdowns and event handlers
 */
function initializeAnalysisModal() {
    // Populate rule dropdowns for disagreement finder and axiom checker
    const ruleSelect1 = document.getElementById('disagreement-rule1');
    const ruleSelect2 = document.getElementById('disagreement-rule2');
    const axiomRuleSelect = document.getElementById('axiom-rule-select');

    // Only include standard voting rules (not rankings or probabilities)
    const standardRules = Object.keys(rules).filter(r => !rules[r].resultType || rules[r].resultType === 'winners');

    for (let rule of standardRules) {
        const option1 = document.createElement('option');
        option1.value = rule;
        option1.textContent = rules[rule].shortName;
        ruleSelect1.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = rule;
        option2.textContent = rules[rule].shortName;
        ruleSelect2.appendChild(option2);

        const option3 = document.createElement('option');
        option3.value = rule;
        option3.textContent = rules[rule].shortName;
        axiomRuleSelect.appendChild(option3);
    }

    // Set different default selections for disagreement finder
    if (standardRules.length > 1) {
        ruleSelect1.value = 'plurality';
        ruleSelect2.value = 'borda';
    }

    // Event handler for "Analyze Profile" button
    document.getElementById('analyze-button').addEventListener('click', () => {
        if (window.pyodide) {
            populateAnalysisPanel();
        }
    });

    // Event handler for "Check Axioms" button
    document.getElementById('check-axioms-button').addEventListener('click', () => {
        if (window.pyodide) {
            const selectedRule = axiomRuleSelect.value;
            populateAxiomModal(selectedRule);
        }
    });

    // Event handler for "Find Disagreement" button
    document.getElementById('find-disagreement-button').addEventListener('click', () => {
        if (!window.pyodide) return;

        const rule1 = ruleSelect1.value;
        const rule2 = ruleSelect2.value;
        const resultDiv = document.getElementById('disagreement-result');

        if (rule1 === rule2) {
            resultDiv.innerHTML = '<p style="color: #c62828;">Please select two different rules.</p>';
            return;
        }

        resultDiv.innerHTML = '<p>Searching for disagreement...</p>';

        setTimeout(() => {
            try {
                const result = findDisagreement(rule1, rule2, state.C.length, state.N.length, 1000);

                if (result) {
                    let html = '<div class="analysis-panel">';
                    html += '<p><strong>Found a profile where they disagree!</strong></p>';
                    html += `<p><strong>${rules[rule1].shortName}:</strong> `;
                    for (let w of result.winners1) {
                        html += `<span style="background: ${settings.colors[w]}; padding: 2px 6px; border-radius: 3px; margin-right: 3px;">${result.cmap[w] || w}</span>`;
                    }
                    html += '</p>';
                    html += `<p><strong>${rules[rule2].shortName}:</strong> `;
                    for (let w of result.winners2) {
                        html += `<span style="background: ${settings.colors[w]}; padding: 2px 6px; border-radius: 3px; margin-right: 3px;">${result.cmap[w] || w}</span>`;
                    }
                    html += '</p>';
                    html += '<button id="load-disagreement-profile">Load this profile</button>';
                    html += '</div>';
                    resultDiv.innerHTML = html;

                    // Add click handler to load the profile
                    document.getElementById('load-disagreement-profile').addEventListener('click', () => {
                        // Update state with the found profile
                        const numCands = Object.keys(result.cmap).length;
                        const numVoters = result.rankings.length;

                        state.N = Array.from({ length: numVoters }, (_, i) => i);
                        state.C = Array.from({ length: numCands }, (_, i) => i);
                        state.agenda = [...state.C];
                        state.cmap = {};
                        for (let k in result.cmap) {
                            state.cmap[parseInt(k)] = result.cmap[k];
                        }
                        state.profile = {};
                        for (let i = 0; i < numVoters; i++) {
                            state.profile[i] = result.rankings[i].map(c => [c]);
                        }

                        buildTable();
                        window.modals.close();
                    });
                } else {
                    resultDiv.innerHTML = `<p>No disagreement found in 1000 random profiles with ${state.C.length} candidates and ${state.N.length} voters. These rules may agree on most profiles of this size.</p>`;
                }
            } catch (e) {
                resultDiv.innerHTML = '<p style="color: #c62828;">Error: ' + e.message + '</p>';
            }
        }, 10);
    });
}