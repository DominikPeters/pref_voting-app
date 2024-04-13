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
                    if (file.name.endsWith(".txt")) {
                        if (loadMatrix(text)) {
                            buildTable();
                        }
                    } else if (file.name.endsWith(".pb")) {
                        // try {
                            let pbImport = JSON.parse(window.pyodide.runPython(`
filetext = """${text}"""
instance, profile = parse_pabulib_from_string(filetext)
return_object = {'num_projects': len(instance.project_meta.keys()), 'num_voter': profile.num_ballots(), 'budget': int(instance.budget_limit)}
cost = {}
project_index = {}
for j, project in enumerate(instance.project_meta.keys()):
    cost[j] = int(project.cost)
    project_index[project.name] = j
u = {j : {i : 0 for i in range(profile.num_ballots())} for j in range(return_object["num_projects"])}
for i, voter in enumerate(profile):
    for project in voter:
        u[project_index[project.name]][i] = 1
return_object['cost'] = cost
return_object['u'] = u
json.dumps(return_object)
                            `));
                            let N_ = Array.from(Array(pbImport.num_voter).keys());
                            let C_ = Array.from(Array(pbImport.num_projects).keys());
                            let cost_ = pbImport.cost;
                            let u_ = pbImport.u;
                            let budget_ = pbImport.budget;
                            setInstance(N_, C_, cost_, u_, budget_);
                            buildTable();
                        // } catch (e) {
                        //     console.log(e);
                        // }
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