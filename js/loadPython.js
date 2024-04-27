import { calculateRules } from './CalculateRules.js';

export async function loadPython() {
    document.getElementById("loading-container").style.display = "block";
    let loading = document.getElementById("loading-indicator");
    loading.innerHTML = "Loading... (20%)";
    // window.pyodide = await loadPyodide({lockFileURL: "repodata.json"});
    window.pyodide = await loadPyodide();
    loading.innerHTML = "Loading... (30%)";
    await window.pyodide.loadPackage("micropip");
    const micropip = window.pyodide.pyimport("micropip");
    window.micropip = micropip;
    await micropip.add_mock_package("mip", "2.0.0");
    loading.innerHTML = "Loading... (40%)";
    await micropip.install("numpy", true);
    loading.innerHTML = "Loading... (50%)";
    await micropip.install("networkx", true);
    loading.innerHTML = "Loading... (60%)";
    await micropip.install("matplotlib", true);
    await micropip.install("tabulate", true);
    loading.innerHTML = "Loading... (70%)";
    await micropip.install("preflibtools");
    await micropip.install("prefsampling", true);
    await window.pyodide.runPython(`
        import js
        import json
        from prefsampling.ordinal import *
    `);
    setTimeout(function () {
        loading.innerHTML = "Loading... (90%)";
    }, 0);
    loading.innerHTML = "Loading... (80%)";
    await window.pyodide.runPythonAsync(`
        from pyodide.http import pyfetch
        response = await pyfetch("pref_voting.zip")
        await response.unpack_archive(format="zip")
    `);
    await window.pyodide.runPython(`
        from pref_voting.profiles import Profile
        from pref_voting.scoring_methods import plurality, borda, anti_plurality
        from pref_voting.iterative_methods import *
        from pref_voting.c1_methods import *
        from pref_voting.margin_based_methods import *
        from pref_voting.combined_methods import *
        from pref_voting.other_methods import *
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