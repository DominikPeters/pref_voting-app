import { state } from './globalState.js';
import { buildTable } from './TableBuilder.js';

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
    state.agenda.push(newCandidate);
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
    const candidateIndex = state.C.indexOf(parseInt(candidate));
    const oldNumCandidates = state.C.length;
    if (candidateIndex !== -1) {
        state.agenda = state.agenda.filter(c => c !== parseInt(candidate));

        const deletedCandidateName = state.cmap[parseInt(candidate)];
        state.C.splice(candidateIndex, 1);

        // Renumber candidates greater than the deleted candidate
        for (let i = candidateIndex; i < state.C.length; i++) {
            state.C[i] = i;
        }
        state.agenda = state.agenda.map(c => (c > parseInt(candidate) ? c - 1 : c));

        // Update profile rankings
        for (let i of state.N) {
            state.profile[i] = state.profile[i]
                .filter(c => c !== parseInt(candidate))
                .map(c => (c > parseInt(candidate) ? c - 1 : c));
        }

        // Update cmap
        for (let i = parseInt(candidate); i < Object.keys(state.cmap).length; i++) {
            if (i === oldNumCandidates - 1) {
                state.cmap[i] = deletedCandidateName;
            } else if (i < oldNumCandidates - 1) {
                state.cmap[i] = state.cmap[i + 1];
            }
        }

        buildTable();
    }
}

export function toggleAgenda(candidate) {
    if (state.agenda.includes(parseInt(candidate))) {
        state.agenda = state.agenda.filter(c => c !== parseInt(candidate));
    } else {
        state.agenda.push(parseInt(candidate));
        state.agenda.sort((a, b) => a - b);
    }
    buildTable();
}

export function deleteVoter(voter) {
    const voterIndex = state.N.indexOf(parseInt(voter));
    if (voterIndex !== -1) {
        // Create a new profile object with updated voter labels
        const newProfile = {};
        for (let i = 0; i < state.N.length; i++) {
            if (i < voterIndex) {
                newProfile[i] = state.profile[state.N[i]];
            } else if (i > voterIndex) {
                newProfile[i - 1] = state.profile[state.N[i]];
            }
        }

        // Remove the voter from state.N
        state.N.splice(voterIndex, 1);

        // Renumber voters greater than the deleted voter
        for (let i = voterIndex; i < state.N.length; i++) {
            state.N[i] = i;
        }

        // Update the profile object
        state.profile = newProfile;

        buildTable();
    }
}

export function updateVotingMlLink() {
    const votingMlWrapper = document.getElementById("voting-ml-wrapper");
    const votingMlLink = document.getElementById("voting-ml-link");
    if (state.C.length <= 10) {
        // example: https://pro.voting.ml/?profile=1ABC-1CBA-1BCA
        let url = "https://pro.voting.ml/";
        url += "?profile=";
        const alphabet = "ABCDEFGHIJ";
        for (let i of state.N) {
            url += '1' + state.profile[i].map(c => alphabet[c]).join('') + '-';
        }
        url = url.slice(0, -1); // remove trailing '-'
        votingMlLink.href = url;
        votingMlWrapper.style.display = 'block';
    } else {
        votingMlWrapper.style.display = 'none';
    }
}

export function setInstance(N_, C_, profile_) {
    state.N = N_;
    state.C = C_;
    state.profile = profile_;
    state.agenda = [...C_];
    buildTable();
}
