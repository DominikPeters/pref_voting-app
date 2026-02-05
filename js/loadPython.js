import { calculateRules } from './CalculateRules.js';
import { populatePropertyDropdown } from './SettingsManagement.js';

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
    let zipResponse = await fetch("pref_voting.zip?v1");
    let zipBinary = await zipResponse.arrayBuffer();
    pyodide.unpackArchive(zipBinary, "zip", { extractDir: "pref_voting" });
    pyodide.pyimport("pref_voting");
    await window.pyodide.runPython(`
        from pref_voting.profiles import Profile
        from pref_voting.profiles_with_ties import ProfileWithTies
        from pref_voting.scoring_methods import plurality, borda, anti_plurality
        from pref_voting.iterative_methods import *
        from pref_voting.c1_methods import *
        from pref_voting.margin_based_methods import *
        from pref_voting.combined_methods import *
        from pref_voting.other_methods import *
        from pref_voting.axioms import axioms_dict
        import io
        import contextlib

        _PV_CHEAP_AXIOMS = {
            "pareto_dominance",
            "condorcet_winner",
            "condorcet_loser",
            "smith",
            "schwartz",
            "monotonicity",
            "positive_responsiveness",
            "weak_positive_responsiveness",
        }

        def _pv_axiom_registry_json():
            data = []
            for key, ax in axioms_dict.items():
                data.append({
                    "key": key,
                    "fullName": ax.name,
                    "shortName": ax.name,
                    "heavy": key not in _PV_CHEAP_AXIOMS
                })
            data.sort(key=lambda x: x["fullName"])
            return json.dumps(data)

        def _pv_trim_text(text, limit=5000):
            if text is None:
                return ""
            text = str(text)
            if len(text) > limit:
                return text[:limit] + "\\n... (truncated)"
            return text

        def _pv_format_violations(violations):
            text = repr(violations)
            if "<pref_voting." in text and " object at " in text:
                if isinstance(violations, dict):
                    count = len(violations)
                elif isinstance(violations, (list, tuple, set)):
                    count = len(violations)
                else:
                    count = 1
                return (
                    f"{count} violation witness(es) contain complex Python objects; "
                    f"see verbose output below for readable details."
                )
            return _pv_trim_text(text)

        def _pv_has_violation_from_collection(violations):
            if isinstance(violations, dict):
                if len(violations) == 0:
                    return False
                vals = list(violations.values())
                if vals and all(isinstance(v, bool) for v in vals):
                    return any(vals)
                return any(_pv_has_violation_from_collection(v) for v in vals)
            if isinstance(violations, (list, tuple, set)):
                if len(violations) == 0:
                    return False
                vals = list(violations)
                if vals and all(isinstance(v, bool) for v in vals):
                    return any(vals)
                return any(_pv_has_violation_from_collection(v) for v in vals)
            if violations is None:
                return False
            if violations is False:
                return False
            if isinstance(violations, str):
                return len(violations) > 0
            # Treat scalar payloads (including candidate id 0) as evidence of a violation.
            return True

        def _pv_check_axiom_json(axiom_key, vm_key, include_details=False):
            axiom = axioms_dict.get(axiom_key)
            if axiom is None:
                return json.dumps({"applicable": False, "error": f"Unknown axiom: {axiom_key}"})

            vm = globals().get(vm_key)
            if vm is None:
                return json.dumps({"applicable": False, "error": f"Unknown voting method object: {vm_key}"})

            try:
                all_violations = None
                try:
                    all_violations = axiom.find_all_violations(profile, vm)
                except Exception:
                    all_violations = None

                if all_violations is not None:
                    violation = _pv_has_violation_from_collection(all_violations)
                else:
                    violation = axiom.has_violation(profile, vm)
                    if isinstance(violation, tuple):
                        violation = violation[0]
                    violation = bool(violation)

                satisfied = (not violation)

                details_parts = []
                if include_details and not satisfied:
                    if all_violations is not None:
                        # Normalize cryptic boolean-list outputs (e.g., Schwartz implementation).
                        if isinstance(all_violations, (list, tuple)) and all_violations and all(isinstance(v, bool) for v in all_violations):
                            try:
                                winners = vm(profile)
                                violating_winners = [w for (w, flag) in zip(winners, all_violations) if flag]
                                details_parts.append("Violating winners:\\n" + _pv_trim_text(repr(violating_winners)))
                            except Exception:
                                details_parts.append("Violations:\\n" + _pv_format_violations(all_violations))
                        else:
                            details_parts.append("Violations:\\n" + _pv_format_violations(all_violations))
                    else:
                        details_parts.append("Could not enumerate violations.")

                    try:
                        buf = io.StringIO()
                        with contextlib.redirect_stdout(buf):
                            axiom.has_violation(profile, vm, verbose=True)
                        verbose_text = buf.getvalue().strip()
                        if verbose_text:
                            details_parts.append("Verbose output:\\n" + _pv_trim_text(verbose_text))
                    except TypeError:
                        # Some axioms may not accept a verbose kwarg.
                        pass
                    except Exception as e:
                        details_parts.append("Could not capture verbose output:\\n" + _pv_trim_text(e))

                result = {"applicable": True, "satisfied": satisfied}
                if include_details and details_parts:
                    result["details"] = "\\n\\n".join(details_parts)
                return json.dumps(result)
            except Exception as e:
                msg = str(e)
                if "Cannot find the plurality scores unless all voters rank a unique candidate in first place." in msg:
                    msg += " This can also happen when the axiom test internally adds tie ballots."
                return json.dumps({"applicable": False, "error": msg})
    `);
    populatePropertyDropdown();
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
