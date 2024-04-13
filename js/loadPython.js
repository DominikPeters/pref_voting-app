import { calculateRules } from './CalculateRules.js';

export async function loadPython() {
    document.getElementById("loading-container").style.display = "block";
    let loading = document.getElementById("loading-indicator");
    loading.innerHTML = "Loading... (20%)";
    window.pyodide = await loadPyodide();
    loading.innerHTML = "Loading... (30%)";
    await window.pyodide.loadPackage("micropip");
    const micropip = window.pyodide.pyimport("micropip");
    window.micropip = micropip;
    loading.innerHTML = "Loading... (40%)";
    await micropip.install("numpy", true);
    loading.innerHTML = "Loading... (50%)";
    await micropip.install("networkx", true);
    loading.innerHTML = "Loading... (60%)";
    await micropip.install("matplotlib", true);
    await micropip.install("tabulate", true);
    loading.innerHTML = "Loading... (70%)";
    await micropip.install("prefsampling", true);
    await micropip.install("preflibtools", true);
    await window.pyodide.runPython(`
        import js
        import json
        from prefsampling.ordinal import *
        print(mallows(5, 10, 0.5))
    `);
    setTimeout(function () {
        loading.innerHTML = "Loading... (90%)";
    }, 0);
    loading.innerHTML = "Loading... (80%)";
    await window.pyodide.runPythonAsync(`
        from pyodide.http import pyfetch
        response = await pyfetch("/pref_voting/pref_voting.zip")
        await response.unpack_archive()
    `);
    await window.pyodide.runPython(`
        from pref_voting.profiles import Profile
        prof = Profile([[0, 1, 2], [2, 1, 0]])
        print(f"The rankings are {prof.rankings}")
        print(f"The number of voters is {prof.num_voters}")
        print(f"The number of candidate is {prof.num_cands}")
        print(f"The candidates are {prof.candidates}")
        prof.display()
        from pref_voting.scoring_methods import plurality, borda, anti_plurality
        from pref_voting.iterative_methods import *
        from pref_voting.c1_methods import *
        from pref_voting.margin_based_methods import *
        from pref_voting.io.writers import *

        cmap = {0:"a", 1:"b", 2:"c", 3:"d"}

        prof = Profile([[0, 1, 2, 3], [2, 0, 1, 3], [1, 3, 0, 2], [3, 1, 0, 2]], [3, 2, 3, 1])

        prof.display()

        print(plurality.name)
        print(plurality(prof))
        print(plurality(prof, curr_cands = [2, 3]))
        print(plurality.choose(prof))
        plurality.display(prof)
        plurality.display(prof, cmap = cmap)
        instant_runoff.display(prof)
        coombs.display(prof)
        instant_runoff_put.display(prof)
        copeland.display(prof)
        uc_gill.display(prof)
        top_cycle.display(prof)
        banks.display(prof)
        minimax.display(prof)
        beat_path.display(prof)
        ranked_pairs.display(prof)
        split_cycle.display(prof)
        river.display(prof)
        stable_voting.display(prof)
    `);
    // enable all buttons and inputs
    document.querySelectorAll("button, input").forEach(function (el) {
        el.disabled = false;
    });
    calculateRules();
    loading.innerHTML = "Loading... (100%)";
    // hide loading indicator after 200ms
    setTimeout(function () {
        document.getElementById("loading-container").style.display = "none";
    }, 200);
}