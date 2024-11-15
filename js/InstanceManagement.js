import { settings, state } from './globalState.js';
import { buildTable } from './TableBuilder.js';
import { turnOnWeakOrderMode } from './SettingsManagement.js';

export function addVoter() {
    let newVoter = state.N.slice(-1)[0] + 1;
    state.N.push(newVoter);
    for (let j of state.C) {
        state.profile[newVoter] = state.C.map(c => [c]);
    }
    buildTable();
}

export function addCandidate() {
    let newCandidate = state.C.slice(-1)[0] + 1;
    state.C.push(newCandidate);
    state.agenda.push(newCandidate);
    for (let i of state.N) {
        state.profile[i].push([newCandidate]);
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

        const deletedColor = settings.colors[parseInt(candidate)];
        settings.colors.splice(parseInt(candidate), 1);
        settings.colors.splice(state.C.length, 0, deletedColor);

        // Renumber candidates greater than the deleted candidate
        for (let i = candidateIndex; i < state.C.length; i++) {
            state.C[i] = i;
        }
        state.agenda = state.agenda.map(c => (c > parseInt(candidate) ? c - 1 : c));

        function removeFromIndifferenceClass(indifferenceClass, candidate) {
            return indifferenceClass.filter(c => c !== parseInt(candidate)).map(c => (c > parseInt(candidate) ? c - 1 : c));
        }

        // Update profile rankings
        for (let i of state.N) {
            state.profile[i] = state.profile[i]
                .map(indifferenceClass => removeFromIndifferenceClass(indifferenceClass, candidate))
                .filter(indifferenceClass => indifferenceClass.length > 0);
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
    if (settings.weakOrderMode) {
        votingMlWrapper.style.display = 'none';
        return;
    }
    votingMlLink.style.display = '';
    if (state.C.length <= 10) {
        const alphabet = "ABCDEFGHIJ";
        let url = "https://pro.voting.ml/?profile=";
        
        // Group sequential voters with identical preferences
        let currentPreference = null;
        let currentCount = 0;
        let groups = [];
        
        for (let i of state.N) {
            // Convert current voter's preference to string representation
            const prefString = state.profile[i].map(c => alphabet[c]).join('');
            
            if (currentPreference === null) {
                // First voter
                currentPreference = prefString;
                currentCount = 1;
            } else if (prefString === currentPreference) {
                // Same preference as previous voter
                currentCount++;
            } else {
                // Different preference, store the group and start new one
                groups.push(`${currentCount}${currentPreference}`);
                currentPreference = prefString;
                currentCount = 1;
            }
        }
        // Add the last group
        if (currentCount > 0) {
            groups.push(`${currentCount}${currentPreference}`);
        }
        
        url += groups.join('-');
        votingMlLink.href = url;
        votingMlWrapper.style.display = 'block';
    } else {
        votingMlWrapper.style.display = 'none';
    }
}

export function atLeastOneIndifference() {
    for (const i of state.N) {
        if (state.profile[i].some(ic => ic.length > 1)) {
            return true;
        }
    }
    return false;
}

export function setInstance(N_, C_, profile_) {
    state.N = N_;
    state.C = C_;
    state.profile = profile_;
    state.agenda = [...C_];
    if (atLeastOneIndifference()) {
        turnOnWeakOrderMode();
    }
    buildTable();
}
