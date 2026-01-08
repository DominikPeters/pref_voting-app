import { settings, state } from './globalState.js';
import { rules, axioms } from './constants.js';

/**
 * Check all axioms for a given voting rule on the current profile.
 * @param {string} rule - The rule key to check
 * @returns {Object} - Object mapping axiom names to {satisfied: boolean, details: string}
 */
export function checkAxiomsForRule(rule) {
    const results = {};

    // Get the voting method object for this rule
    const vmCommand = rules[rule].command.split('(')[0]; // Extract function name

    for (let axiomKey in axioms) {
        const axiom = axioms[axiomKey];
        try {
            // Check if this axiom has a violation
            const hasViolation = window.pyodide.runPython(`
                try:
                    vm = ${vmCommand}
                    result = ${axiom.checkCommand.replace('vm', vmCommand)}
                    bool(result)
                except Exception as e:
                    print(f"Error checking axiom: {e}")
                    None
            `);

            if (hasViolation === null || hasViolation === undefined) {
                results[axiomKey] = {
                    satisfied: null,
                    details: "Could not check (incompatible rule or profile type)"
                };
            } else {
                results[axiomKey] = {
                    satisfied: !hasViolation,
                    details: hasViolation ? "Violation found" : "Satisfied"
                };
            }
        } catch (e) {
            results[axiomKey] = {
                satisfied: null,
                details: "Error: " + e.message
            };
        }
    }

    return results;
}

/**
 * Find a profile where two voting rules disagree.
 * @param {string} rule1 - First rule key
 * @param {string} rule2 - Second rule key
 * @param {number} numCands - Number of candidates
 * @param {number} numVoters - Number of voters
 * @param {number} maxTrials - Maximum number of random profiles to try
 * @returns {Object|null} - Profile object if found, null otherwise
 */
export function findDisagreement(rule1, rule2, numCands = 4, numVoters = 5, maxTrials = 1000) {
    const cmd1 = rules[rule1].command;
    const cmd2 = rules[rule2].command;
    const func1 = cmd1.split('(')[0];
    const func2 = cmd2.split('(')[0];

    const result = window.pyodide.runPython(`
        import json
        from pref_voting.generate_profiles import generate_profile

        found = None
        for _ in range(${maxTrials}):
            profile = generate_profile(${numCands}, ${numVoters}, probmod="IC")
            agenda = list(range(${numCands}))

            result1 = set(${func1}(profile, curr_cands=agenda))
            result2 = set(${func2}(profile, curr_cands=agenda))

            if result1 != result2:
                # Found a disagreement
                found = {
                    "rankings": [list(r) for r in profile.rankings],
                    "cmap": {int(k): str(v) for k, v in profile.cmap.items()},
                    "winners1": [int(x) for x in result1],
                    "winners2": [int(x) for x in result2]
                }
                break

        json.dumps(found)
    `);

    return JSON.parse(result);
}

/**
 * Get profile statistics and analysis
 * @returns {Object} - Object with various profile statistics
 */
export function getProfileAnalysis() {
    const result = window.pyodide.runPython(`
        import json

        analysis = {}

        # Check for Condorcet winner
        cw = profile.condorcet_winner(curr_cands=agenda)
        analysis["condorcet_winner"] = int(cw) if cw is not None else None

        # Check for Condorcet loser
        try:
            cl = profile.condorcet_loser(curr_cands=agenda)
            analysis["condorcet_loser"] = int(cl) if cl is not None else None
        except:
            analysis["condorcet_loser"] = None

        # Get plurality scores
        try:
            p_scores = profile.plurality_scores(curr_cands=agenda)
            analysis["plurality_scores"] = {int(k): int(v) for k, v in p_scores.items()}
        except:
            analysis["plurality_scores"] = {}

        # Get Borda scores
        try:
            b_scores = profile.borda_scores(curr_cands=agenda)
            analysis["borda_scores"] = {int(k): float(v) for k, v in b_scores.items()}
        except:
            analysis["borda_scores"] = {}

        # Get Copeland scores
        try:
            c_scores = profile.copeland_scores(curr_cands=agenda)
            analysis["copeland_scores"] = {int(k): float(v) for k, v in c_scores.items()}
        except:
            analysis["copeland_scores"] = {}

        # Check for cycles
        try:
            has_cycle = len(profile.cycles(curr_cands=agenda)) > 0
            analysis["has_cycle"] = has_cycle
        except:
            analysis["has_cycle"] = None

        json.dumps(analysis)
    `);

    return JSON.parse(result);
}

/**
 * Populate the axiom checking modal for a specific rule
 * @param {string} rule - The rule to check axioms for
 */
export function populateAxiomModal(rule) {
    const container = document.getElementById('axiom-results-container');
    if (!container) return;

    container.innerHTML = '<p>Checking axioms...</p>';

    setTimeout(() => {
        const results = checkAxiomsForRule(rule);
        let html = `<h3>Axiom Check: ${rules[rule].fullName}</h3>`;
        html += '<ul class="axiom-list">';

        for (let axiomKey in results) {
            const axiom = axioms[axiomKey];
            const result = results[axiomKey];
            const icon = result.satisfied === null ? '?' : (result.satisfied ? '✓' : '✗');
            const className = result.satisfied === null ? '' : (result.satisfied ? 'axiom-satisfied' : 'axiom-violated');

            html += `<li>
                <span class="${className}">${icon}</span>
                <strong>${axiom.fullName}</strong>
                <span style="color: #666; font-size: 0.9em;">${result.details}</span>
            </li>`;
        }

        html += '</ul>';
        container.innerHTML = html;
    }, 10);
}

/**
 * Populate the profile analysis panel
 */
export function populateAnalysisPanel() {
    const container = document.getElementById('analysis-results-container');
    if (!container) return;

    container.innerHTML = '<p>Analyzing profile...</p>';

    setTimeout(() => {
        try {
            const analysis = getProfileAnalysis();
            let html = '<div class="analysis-panel">';

            // Condorcet winner/loser
            if (analysis.condorcet_winner !== null) {
                html += `<p><strong>Condorcet Winner:</strong> ${state.cmap[analysis.condorcet_winner] || analysis.condorcet_winner}</p>`;
            } else {
                html += `<p><strong>Condorcet Winner:</strong> None (cycle exists)</p>`;
            }

            if (analysis.condorcet_loser !== null) {
                html += `<p><strong>Condorcet Loser:</strong> ${state.cmap[analysis.condorcet_loser] || analysis.condorcet_loser}</p>`;
            }

            // Cycle indicator
            if (analysis.has_cycle) {
                html += `<p style="color: #c62828;"><strong>Majority Cycle:</strong> Yes</p>`;
            }

            // Scores table
            html += '<h4 style="margin-bottom: 5px;">Candidate Scores</h4>';
            html += '<table style="width: 100%; font-size: 12px; border-collapse: collapse;">';
            html += '<tr><th style="text-align: left; padding: 3px;">Candidate</th><th>Plurality</th><th>Borda</th><th>Copeland</th></tr>';

            for (let c of state.agenda) {
                const name = state.cmap[c] || c;
                const plurality = analysis.plurality_scores[c] ?? '-';
                const borda = analysis.borda_scores[c] !== undefined ? analysis.borda_scores[c].toFixed(1) : '-';
                const copeland = analysis.copeland_scores[c] !== undefined ? analysis.copeland_scores[c].toFixed(1) : '-';
                html += `<tr><td style="padding: 3px;">${name}</td><td style="text-align: center;">${plurality}</td><td style="text-align: center;">${borda}</td><td style="text-align: center;">${copeland}</td></tr>`;
            }

            html += '</table></div>';
            container.innerHTML = html;
        } catch (e) {
            container.innerHTML = '<p style="color: red;">Error analyzing profile: ' + e.message + '</p>';
        }
    }, 10);
}
