export const state = {
    N: [0, 1, 2],
    C: [0, 1, 2, 3],
    profile: {0: [[0], [1], [2], [3]], 1: [[0], [1], [2], [3]], 2: [[0], [1], [2], [3]]},
    agenda: [0, 1, 2, 3],
    cmap: {0: "a", 1: "b", 2: "c", 3: "d", 4: "e", 5: "f", 6: "g", 7: "h", 8: "i", 9: "j", 10: "k", 11: "l", 12: "m", 13: "n", 14: "o", 15: "p", 16: "q", 17: "r", 18: "s", 19: "t", 20: "u", 21: "v", 22: "w", 23: "x", 24: "y", 25: "z"},
    storedCommittee: {}
}

export const settings = {
    weakOrderMode: false,
    showPropertyinTable: false,
    randomizer: { probmodel: 'IC' },
}

export let storedLogs = {};

export let pyodide;
export let highs;
export let micropip;

window.state = state;