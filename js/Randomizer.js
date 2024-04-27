import { state, settings } from './globalState.js';
import { buildTable } from './TableBuilder.js';
import { setInstance } from './InstanceManagement.js';

export function populateRandomizerModal(attachListeners=false) {
    for (let radio of document.getElementsByName('randomize')) {
        let parentLi = radio.parentElement;
        let randomizer = { "probmodel": radio.value };
        for (let div of parentLi.getElementsByTagName('div')) {
            div.style.display = radio.checked ? 'block' : 'none';
            // inputs
            for (let input of div.getElementsByTagName('input')) {
                let key = input.id.split('-').slice(-1)[0];
                randomizer[key] = input.value;
                if (attachListeners) {
                    input.addEventListener('change', function () {
                        populateRandomizerModal();
                    });
                }
            }
            // selects
            for (let select of div.getElementsByTagName('select')) {
                let key = select.id.split('-').slice(-1)[0];
                randomizer[key] = select.value;
                if (attachListeners) {
                    select.addEventListener('change', function () {
                        populateRandomizerModal();
                    });
                }
            }
        }
        // Placket-Luce: check number of candidates
        var alphas = document.getElementById("plackett_luce-alphas").value.split(",");
        if (alphas.length !== state.C.length) {
            document.getElementById("plackett_luce-alphas").value = Array(state.C.length).fill(1).join(",");
        }
        // if (radio.checked) {
        //     // Check Euclidean integrity
        //     document.getElementById("Euclidean fixed-size-warning").style.display = "none";
        //     if (radio.value == "Euclidean fixed-size" &&
        //         document.getElementById("Euclidean fixed-size-voter_prob_distribution").value.includes("1d") != document.getElementById("Euclidean fixed-size-candidate_prob_distribution").value.includes("1d")) {
        //         randomizer["voter_prob_distribution"] = "1d_interval";
        //         randomizer["candidate_prob_distribution"] = "1d_interval";
        //         document.getElementById("Euclidean fixed-size-warning").style.display = "block";
        //     }
        //     // Set randomizer
        //     settings.randomizer = randomizer;
        // }
        if (attachListeners) {
            radio.addEventListener('change', function () {
                populateRandomizerModal();
            });
        }
    }
}

export async function randomize() {
    let result = window.pyodide.runPython(`
        from pref_voting.generate_profiles import generate_profile
        prob_distribution = ${JSON.stringify(settings.randomizer)}
        # go through fields in prob_distribution and replace strings with floats or ints if possible
        for field in prob_distribution:
            if "distribution" in field:
                prob_distribution[field] = PointProbabilityDistribution(prob_distribution[field])
                continue
            if "." in prob_distribution[field]:
                prob_distribution[field] = float(prob_distribution[field])
            else:
                try:
                    prob_distribution[field] = int(prob_distribution[field])
                except ValueError:
                    pass
        profile = generate_profile(num_candidates=${state.C.length}, num_voters=${state.N.length}, **prob_distribution)
        rankings = [[[int(c)] for c in voter] for voter in profile.rankings]
        return_object = {'num_voters': int(profile.num_voters), 'num_cands': int(profile.num_cands), 'rankings': rankings}
        json.dumps(return_object)
    `);
    let parsed = JSON.parse(result);
    let N_ = Array.from(Array(parsed.num_voters).keys());
    let C_ = Array.from(Array(parsed.num_cands).keys());
    let profile_ = parsed.rankings;
    setInstance(N_, C_, profile_);
}