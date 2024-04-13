import { state } from './globalState.js';
import { buildTable } from './TableBuilder.js';
import { sum } from './utils.js';

export function addVoter() {
    let newVoter = state.N.slice(-1)[0] + 1;
    state.N.push(newVoter);
    for (let j of state.C) {
        state.profile[newVoter] = [...state.C];
    }
    buildTable();
}

export function addCandidate() {
    let newCandidate = state.C.slice(-1)[0] + 1;
    state.C.push(newCandidate);
    for (let i of state.N) {
        state.profile[i].push(newCandidate);
    }
    // add cmap if it doesn't exist
    if (!state.cmap[newCandidate]) {
        state.cmap[newCandidate] = newCandidate;
    }
    buildTable();
}

export function deleteCandidate(candidate) {
    state.C.splice(state.C.indexOf(parseInt(candidate)), 1);
    for (let i of state.N) {
        state.profile[i] = state.profile[i].filter(c => c != candidate);
    }
    buildTable();
}

export function deleteVoter(voter) {
    state.N.splice(state.N.indexOf(parseInt(voter)), 1);
    buildTable();
}

export function setInstance(N_, C_, profile_) {
    state.N = N_;
    state.C = C_;
    state.profile = profile_;
    buildTable();
}

export function loadMatrix(matrix) {
    var lines = matrix.split('\n');
    // remove empty lines
    lines = lines.filter(line => line.length > 0);
    // check that all lines have the same length
    if (lines.every(line => line.length === lines[0].length)) {
        let numCands = lines[0].length;
        let numVoters = lines.length;
        let N_ = Array.from(Array(numVoters).keys());
        let C_ = Array.from(Array(numCands).keys());
        let profile_ = {};
        for (let i of N_) {
            profile_[i] = [...C_];
        }
        setInstance(N_, C_, profile_);
        return true;
    } else {
        return false;
    }
}
