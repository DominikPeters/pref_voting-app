import { rules, outputTypes } from './constants.js';

export function deactivateRulesNotSupportingWeakOrders() {
    for (let rule in rules) {
        if (rules[rule].supportsWeakOrders === 0) {
            setRuleActive(rule, false);
        }
    }
}

export function setRuleActive(rule, active) {
    rules[rule].active = active;
    const checkbox = document.getElementById('rule-choice-' + rule);
    if (checkbox) {
        checkbox.checked = active;
    }
    let number_selected = Object.values(rules).filter(rule => rule.active).length;
    document.getElementById('choose-rules-button-text').innerText = 'Choose rules (' + number_selected + ' / ' + Object.keys(rules).length + ' selected)';
}

export function populateRuleChoiceModal() {
    document.getElementById('selectAllRulesButton').addEventListener('click', () => {
        for (let rule in rules) {
            setRuleActive(rule, true);
        }
    });
    
    document.getElementById('deselectAllRulesButton').addEventListener('click', () => {
        for (let rule in rules) {
            setRuleActive(rule, false);
        }
    });

    let list = document.getElementById('rule-choice-list');
    list.innerHTML = "";
    const rulesByType = {};
    for (let rule of Object.keys(rules)) {
        const outputType = rules[rule].outputType || "vm";
        if (!rulesByType[outputType]) {
            rulesByType[outputType] = [];
        }
        rulesByType[outputType].push(rule);
    }

    for (const outputType of Object.keys(outputTypes)) {
        const typeRules = rulesByType[outputType] || [];
        if (typeRules.length === 0) {
            continue;
        }
        const typeHeader = document.createElement('li');
        typeHeader.classList.add('output-type-item');
        typeHeader.appendChild(document.createTextNode(outputTypes[outputType].label));
        list.appendChild(typeHeader);

        let currentCategory = '';
        for (let rule of typeRules) {
            if (rules[rule].category != currentCategory) {
                currentCategory = rules[rule].category;
                let li = document.createElement('li');
                li.classList.add('category-item');
                li.appendChild(document.createTextNode(currentCategory));
                list.appendChild(li);
            }
            let li = document.createElement('li');
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'rule-choice-' + rule;
            checkbox.value = rule;
            checkbox.checked = rules[rule].active;
            checkbox.addEventListener('change', function () {
                setRuleActive(rule, checkbox.checked);
            });
            li.appendChild(checkbox);
            let label = document.createElement('label');
            label.htmlFor = 'rule-choice-' + rule;
            label.appendChild(document.createTextNode(rules[rule].fullName));
            li.appendChild(label);
            list.appendChild(li);
        }
    }
}
