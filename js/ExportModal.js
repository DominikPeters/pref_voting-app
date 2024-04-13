function downloadExport(exportPre, filename) {
    let text = document.getElementById(exportPre).innerText;
    let blob = new Blob([text], { type: 'text/plain' });
    let elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
}

export async function populateExportModal() {
    await window.pyodide.runPython(`
        from pref_voting.io.writers import *
        write_preflib(profile, "profile.soc")
        write_abif(profile, "profile.abif")
        write_json(profile, "profile.json")
        write_csv(profile, "profile.csv")
    `);
    for (let format of ['soc', 'json', 'abif', 'csv']) {
        document.getElementById(`${format}-export`).innerText = pyodide.FS.readFile(`profile.${format}`, { encoding: 'utf8' });
        let button = document.getElementById(`${format}-export-button`);
        button.addEventListener("click", () => { downloadExport(`${format}-export`, `profile.${format}`) });
    }
}