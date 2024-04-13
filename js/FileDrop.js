import { state } from './globalState.js';
import { buildTable } from './TableBuilder.js';
import { setInstance, loadMatrix } from './InstanceManagement.js';

function dragOverHandler(ev) {
    if (ev.dataTransfer.types.includes('Files')) {
        document.getElementById('drop-overlay').style.display = "block";
        ev.preventDefault();
    }
}

function dragStartHandler(ev) {
    if (ev.dataTransfer.types.includes('Files')) {
        document.getElementById('drop-overlay').style.display = "block";
        ev.preventDefault();
    }
}

function dragEndHandler(ev) {
    document.getElementById('drop-overlay').style.display = "none";
    ev.preventDefault();
}

const importFunctions = {
    "soc": "preflib_to_profile(filename, as_linear_profile=True)",
    "csv": "csv_to_profile(filename, as_linear_profile=True)",
    "json": "json_to_profile(filename, as_linear_profile=True)",
    "abif": "abif_to_profile(filename)"
}

function dropHandler(ev) {
    document.getElementById('drop-overlay').style.display = "none";
    ev.preventDefault();
    if (ev.dataTransfer.items) {
        [...ev.dataTransfer.items].forEach((item, i) => {
            // If dropped items aren't files, reject them
            if (item.kind === "file") {
                let file = item.getAsFile();
                let reader = new FileReader();
                reader.onload = function (e) {
                    let text = e.target.result;
                    // is it a valid extension?
                    for (let extension in importFunctions) {
                        if (file.name.endsWith("." + extension)) {
                            try {
                                let parsed = JSON.parse(window.pyodide.runPython(`
from pref_voting.io.readers import *
filetext = """${text}"""
filename = "profile.${extension}"
with open(filename, "w") as f:
    f.write(filetext)
profile = ${importFunctions[extension]}
rankings = [[int(c) for c in voter] for voter in profile.rankings]
return_object = {'num_voters': int(profile.num_voters), 'num_cands': int(profile.num_cands), 'rankings': rankings}
json.dumps(return_object)
                                `));
                                let N_ = Array.from(Array(parsed.num_voters).keys());
                                let C_ = Array.from(Array(parsed.num_cands).keys());
                                let profile_ = parsed.rankings;
                                setInstance(N_, C_, profile_);
                                buildTable();
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    }
                };
                reader.readAsText(file);
            }
        });
    }
}

export function setUpDragDropHandlers() {
    document.body.ondrop = dropHandler;
    document.body.ondragover = dragOverHandler;
    document.body.ondragenter = dragStartHandler;
    document.body.ondragleave = dragEndHandler;
}