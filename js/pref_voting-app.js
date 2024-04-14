import { state, settings } from './globalState.js';
import { rules, properties, infoIconHtml } from './constants.js';
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

    loadPython();

});