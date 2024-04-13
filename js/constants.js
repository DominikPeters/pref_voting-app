export const colors = ["#40a4d8", "#33beb7", "#b2c224", "#fecc2f", "#f8a227", "#f66320", "rgb(50,150,77)", "rgb(1,104,118)", "rgb(117,213,225)", "rgb(44,69,125)", "rgb(129,132,251)", "rgb(141,48,186)", "rgb(160,232,91)", "rgb(238,200,241)", "rgb(173,34,112)", "rgb(250,99,213)", "rgb(63,22,249)", "rgb(30,239,201)", "rgb(11,83,19)", "rgb(205,219,155)", "rgb(132,84,26)", "rgb(214,160,117)", "rgb(225,50,25)", "rgb(219,201,7)", "rgb(137,151,91)", "rgb(54,229,21)", "rgb(247,147,2)", "rgb(137,127,158)", "rgb(89,32,175)", "rgb(112,248,235)", "rgb(14,80,62)", "rgb(132,235,134)", "rgb(115,140,78)", "rgb(201,221,135)", "rgb(28,152,32)", "rgb(158,203,244)", "rgb(32,41,108)", "rgb(152,103,246)", "rgb(242,135,208)", "rgb(155,79,140)", "rgb(244,38,151)", "rgb(43,114,231)", "rgb(20,143,174)", "rgb(174,248,21)", "rgb(102,6,22)", "rgb(247,57,49)", "rgb(77,54,52)", "rgb(221,114,94)", "rgb(230,191,162)", "rgb(244,212,3)", "rgb(141,99,10)", "rgb(159,4,252)", "rgb(103,45,126)", "rgb(188,116,216)", "rgb(100,248,244)", "rgb(42,104,102)", "rgb(76,176,130)", "rgb(145,251,115)", "rgb(5,110,18)", "rgb(194,233,245)", "rgb(10,47,100)", "rgb(158,156,176)", "rgb(19,26,186)", "rgb(82,142,251)", "rgb(194,13,166)", "rgb(252,214,255)", "rgb(125,172,34)", "rgb(213,236,158)", "rgb(69,42,19)", "rgb(233,173,111)", "rgb(117,22,16)", "rgb(243,122,107)", "rgb(253,44,59)", "rgb(21,183,30)"];

export const properties = {
    // "pareto": { fullName: "Pareto optimality", shortName: "Pareto" },
    // "jr": { fullName: "Justified Representation (JR)", shortName: "JR" },
    // "pjr": { fullName: "Proportional Justified Representation (PJR)", shortName: "PJR" },
    // "ejr": { fullName: "Extended Justified Representation (EJR)", shortName: "EJR" },
    // "ejr+": { fullName: "EJR+ without cohesiveness", shortName: "EJR+" },
    // "fjr": { fullName: "Full Justified Representation (FJR)", shortName: "FJR" },
    // "priceability": { fullName: "Priceability" },
    // "core": { fullName: "Core", shortName: "Core" },
}

export const rules = {
    "plurality": {
        "fullName": "Plurality",
        "shortName": "Plurality",
        "command": "plurality(profile)",
        "active": 1
    },
    "borda": {
        "fullName": "Borda",
        "shortName": "Borda",
        "command": "borda(profile)",
        "active": 1
    },
    "copeland": {
        "fullName": "Copeland",
        "shortName": "Copeland",
        "command": "copeland(profile)",
        "active": 1
    },
    "split_cycle": {
        "fullName": "Split Cycle",
        "shortName": "Split Cycle",
        "command": "split_cycle(profile)",
        "active": 1
    },
}

export const deleteIconHTML = `<div class="delete-icon">
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
    </svg>
</div>`;

export const infoIconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16">
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
</svg>`;