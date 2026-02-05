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
        if (radio.checked) {
            settings.randomizer = randomizer;
        }
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
        # convert serialized form values to expected Python types
        for field in prob_distribution:
            value = prob_distribution[field]

            # bool values from HTML selects
            if value == "True":
                prob_distribution[field] = True
                continue
            if value == "False":
                prob_distribution[field] = False
                continue

            # list-valued parameters currently used by randomizer UI
            if field == "alphas" and isinstance(value, str):
                prob_distribution[field] = [float(x.strip()) for x in value.split(",") if x.strip() != ""]
                continue

            if isinstance(value, str) and "." in value:
                prob_distribution[field] = float(value)
            elif isinstance(value, str):
                try:
                    prob_distribution[field] = int(value)
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
