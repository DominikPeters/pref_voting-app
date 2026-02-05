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
        "category": "Positional Scoring Rules",
        "command": "plurality(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 1
    },
    "borda": {
        "fullName": "Borda",
        "shortName": "Borda",
        "category": "Positional Scoring Rules",
        "command": "borda(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 1
    },
    "anti-plurality": {
        "fullName": "Anti-Plurality / Veto",
        "shortName": "Anti-Plurality",
        "category": "Positional Scoring Rules",
        "command": "anti_plurality(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 1
    },
    "instant_runoff": {
        "fullName": "Instant Runoff with immediate elimination of all plurality losers",
        "shortName": "Instant Runoff",
        "category": "Iterative Methods",
        "command": "instant_runoff(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 1
    },
    "instant_runoff_put": {
        "fullName": "Instant Runoff with parallel-universe tiebreaking",
        "shortName": "Instant Runoff (PUT)",
        "category": "Iterative Methods",
        "command": "instant_runoff_put(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 0
    },
    "plurality_with_runoff_put": {
        "fullName": "Plurality with runoff (parallel-universe tiebreaking)",
        "shortName": "Plurality with runoff",
        "category": "Iterative Methods",
        "command": "plurality_with_runoff_put(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 1
    },
    "benham": {
        "fullName": "Benham",
        "shortName": "Benham",
        "category": "Iterative Methods",
        "description": "As long as the profile has no Condorcet winner, eliminate the candidate with the lowest plurality score.",
        "command": "benham(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 0
    },
    "benham_put": {
        "fullName": "Benham with parallel-universe tiebreaking",
        "shortName": "Benham (PUT)",
        "category": "Iterative Methods",
        "command": "benham_put(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 0
    },
    "bottom_two_runoff_instant_runoff": {
        "fullName": "Bottom-Two-Runoff Instant Runoff",
        "shortName": "Bottom-two runoff",
        "category": "Iterative Methods",
        "description": "Find the two candidates with the lowest two plurality scores, remove the one who loses head-to-head to the other, and repeat until a single candidate remains. If there is a tie for lowest or second lowest plurality score, consider all head-to-head matches between a candidate with lowest and a candidate with second lowest plurality score, and remove all the losers of the head-to-head matches, unless this would remove all candidates. BTR-IRV is a Condorcet consistent voting method, i.e., if a Condorcet winner exists, then BTR-IRV will elect the Condorcet winner.",
        "command": "bottom_two_runoff_instant_runoff(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 0
    },
    "bottom_two_runoff_instant_runoff_put": {
        "fullName": "Bottom-Two-Runoff Instant Runoff with parallel-universe tiebreaking",
        "shortName": "Bottom-two runoff (PUT)",
        "category": "Iterative Methods",
        "command": "bottom_two_runoff_instant_runoff_put(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 0
    },
    "coombs": {
        "fullName": "Coombs' method",
        "shortName": "Coombs",
        "category": "Iterative Methods",
        "description": "If there is a majority winner then that candidate is the Coombs winner. If there is no majority winner, then remove all candidates that are ranked last by the greatest number of voters. Continue removing candidates with the most last-place votes until there is a candidate with a majority of first place votes.",
        "command": "coombs(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 1
    },
    "coombs_put": {
        "fullName": "Coombs' method with parallel-universe tiebreaking",
        "shortName": "Coombs (PUT)",
        "category": "Iterative Methods",
        "command": "coombs_put(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 0
    },
    "baldwin": {
        "fullName": "Baldwin's method",
        "shortName": "Baldwin",
        "category": "Iterative Methods",
        "description": "Iteratively remove all candidates with the lowest Borda score until a single candidate remains. If, at any stage, all candidates have the same Borda score, then all (remaining) candidates are winners.",
        "command": "baldwin(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 1
    },
    "baldwin_put": {
        "fullName": "Baldwin's method with parallel-universe tiebreaking",
        "shortName": "Baldwin (PUT)",
        "category": "Iterative Methods",
        "command": "baldwin_put(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 0
    },
    "strict_nanson": {
        "fullName": "Strict Nanson's method",
        "shortName": "Strict Nanson",
        "category": "Iterative Methods",
        "description": "Iteratively remove all candidates with the Borda score strictly below the average Borda score until one candidate remains. If, at any stage, all candidates have the same Borda score, then all (remaining) candidates are winners.",
        "command": "strict_nanson(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 0
    },
    "weak_nanson": {
        "fullName": "Weak Nanson's method",
        "shortName": "Weak Nanson",
        "category": "Iterative Methods",
        "description": "Iteratively remove all candidates with Borda score less than or equal the average Borda score until one candidate remains. If, at any stage, all candidates have the same Borda score, then all (remaining) candidates are winners.",
        "command": "weak_nanson(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 0
    },
    "raynaud": {
        "fullName": "Raynaud's method",
        "shortName": "Raynaud",
        "category": "Iterative Methods",
        "description": "Iteratively remove the candidate(s) whose worst loss is biggest, unless all candidates have the same worst loss.",
        "command": "raynaud(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 0
    },
    "woodall": {
        "fullName": "Woodall's method",
        "shortName": "Woodall",
        "category": "Iterative Methods",
        "description": "If there is a single member of the Smith Set (i.e., a Condorcet winner) then that candidate is the winner. If there the Smith Set contains more than one candidate, then remove all candidates that are ranked first by the fewest number of voters. Continue removing candidates with the fewest number first-place votes until there is a single member of the originally Smith Set remaining.",
        "command": "woodall(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 0
    },
    "iterated_removal_cl": {
        "fullName": "Iterated Removal of Condorcet Losers",
        "shortName": "IRCL",
        "category": "Iterative Methods",
        "description": "Iteratively remove candidates that are Condorcet losers until there are no Condorcet losers.",
        "command": "iterated_removal_cl(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 0
    },
    "condorcet": {
        "fullName": "Condorcet winner if it exists, else all candidates",
        "shortName": "Condorcet",
        "category": "C1 Methods",
        "command": "condorcet(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 0
    },
    "copeland": {
        "fullName": "Copeland",
        "shortName": "Copeland",
        "category": "C1 Methods",
        "description": "The Copeland score for c is the number of candidates that c is majority preferred to minus the number of candidates majority preferred to c. The Copeland winners are the candidates with the maximum Copeland score in the profile.",
        "command": "copeland(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 1
    },
    "llull": {
        "fullName": "Llull",
        "shortName": "Llull",
        "category": "C1 Methods",
        // "The Llull score for a candidate :math:`c` is the number of candidates that :math:`c` is weakly majority preferred to.  This is equivalent to calculating the Copeland scores for a candidate :math:`c` with 1 point for each candidate that :math:`c` is majority preferred to, 1/2 point for each candidate that :math:`c` is tied with, and 0 points for each candidate that is majority preferred to :math:`c`.  The Llull winners are the candidates with the maximum Llull score in the profile.",
        "description": "The Llull score for a candidate c is the number of candidates that c is weakly majority preferred to.  This is equivalent to calculating the Copeland scores for a candidate c with 1 point for each candidate that c is majority preferred to, 1/2 point for each candidate that c is tied with, and 0 points for each candidate that is majority preferred to c.  The Llull winners are the candidates with the maximum Llull score in the profile.",
        "command": "llull(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 0
    },
    "uc_gill": {
        "fullName": "Uncovered Set - Gillies",
        "shortName": "UC Gillies",
        "category": "C1 Methods",
        // "Uncovered Set (Gillies version):  Given candidates :math:`a` and :math:`b`, say that :math:`a` defeats :math:`b` in the election if :math:`a` is majority preferred to :math:`b` and :math:`a` left covers :math:`b`: i.e., for all :math:`c`, if :math:`c` is majority preferred to :math:`a`,  then :math:`c` majority preferred to :math:`b`. The winners are the set of candidates who are undefeated in the election."
        "description": "Uncovered Set (Gillies version):  Given candidates a and b, say that a defeats b in the election if a is majority preferred to b and a left covers b: i.e., for all c, if c is majority preferred to a,  then c majority preferred to b. The winners are the set of candidates who are undefeated in the election.",
        "command": "uc_gill(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 0
    },
    "uc_fish": {
        "fullName": "Uncovered Set - Fishburn",
        "shortName": "UC Fishburn",
        "category": "C1 Methods",
        // "Uncovered Set (Fishburn version):  Given candidates :math:`a` and :math:`b`, say that :math:`a` defeats :math:`b` in the election :math:`a` left covers :math:`b`: i.e., for all :math:`c`, if :math:`c` is majority preferred to :math:`a`,  then :math:`c` majority preferred to :math:`b`. The winners are the set of candidates who are undefeated in the election."
        "description": "Uncovered Set (Fishburn version):  Given candidates a and b, say that a defeats b in the election a left covers b: i.e., for all c, if c is majority preferred to a,  then c majority preferred to b. The winners are the set of candidates who are undefeated in the election.",
        "command": "uc_fish(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 0
    },
    "uc_bordes": {
        "fullName": "Uncovered Set - Bordes",
        "shortName": "UC Bordes",
        "category": "C1 Methods",
        // "Uncovered Set (Bordes version):  Given candidates :math:`a` and :math:`b`, say that :math:`a` Bordes covers :math:`b` if :math:`a` is majority preferred to :math:`b` and for all :math:`c`, if :math:`c` is majority preferred or tied with :math:`a`, then :math:`c` is majority preferred to or tied with :math:`b`. The winners are the set of candidates who are not Bordes covered in the election."
        "description": "Uncovered Set (Bordes version):  Given candidates a and b, say that a Bordes covers b if a is majority preferred to b and for all c, if c is majority preferred or tied with a, then c is majority preferred to or tied with b. The winners are the set of candidates who are not Bordes covered in the election.",
        "command": "uc_bordes(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 0
    },
    "uc_mckelvey": {
        "fullName": "Uncovered Set - McKelvey",
        "shortName": "UC McKelvey",
        "category": "C1 Methods",
        // "Uncovered Set (McKelvey version):  Given candidates :math:`a` and :math:`b`, say that  :math:`a` McKelvey covers :math:`b` if a Gillies covers :math:`b` and :math:`a` Bordes covers :math:`b`. The winners are the set of candidates who are not McKelvey covered in the election."
        "description": "Uncovered Set (McKelvey version):  Given candidates a and b, say that  a McKelvey covers b if a Gillies covers b and a Bordes covers b. The winners are the set of candidates who are not McKelvey covered in the election.",
        "command": "uc_mckelvey(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 0
    },
    "top_cycle": {
        "fullName": "Top Cycle",
        "shortName": "Top Cycle",
        "category": "C1 Methods",
        "description": "The smallest set of candidates such that every candidate inside the set is majority preferred to every candidate outside the set.",
        "command": "top_cycle(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 1
    },
    "gocha": {
        "fullName": "Gocha / Schwartz Set",
        "shortName": "Gocha",
        "category": "C1 Methods",
        "description": "The set of all candidates x such that if y can reach x in the transitive closer of the majority relation, then x can reach y in the transitive closer of the majority relation.",
        "command": "gocha(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 0
    },
    "weak_condorcet": {
        "fullName": "Weak Condorcet",
        "shortName": "Weak Condorcet",
        "category": "C1 Methods",
        "description": "Return all candidates who are not majority-defeated by any other candidate.",
        "command": "weak_condorcet(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 1
    },
    "banks": {
        "fullName": "Banks Set",
        "shortName": "Banks",
        "category": "C1 Methods",
        // "Say that a *chain* in majority graph is a subset of candidates that is linearly ordered by the majority relation. Then a candidate :math:`a` if :math:`a` is the maximum element with respect to the majority relation of some maximal chain in the majority graph."
        "description": "Say that a chain in majority graph is a subset of candidates that is linearly ordered by the majority relation. Then a candidate a if a is the maximum element with respect to the majority relation of some maximal chain in the majority graph.",
        "command": "banks(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 0
    },
    "slater": {
        "fullName": "Slater winners",
        "shortName": "Slater",
        "category": "C1 Methods",
        // "A Slater ranking is a linear order :math:`R` of the candidates that minimizes the number of edges in the majority graph we have to turn around before we obtain :math:`R`.   A candidate is a Slater winner if the candidate is the top element of some Slater ranking."
        "description": "A Slater ranking is a linear order R of the candidates that minimizes the number of edges in the majority graph we have to turn around before we obtain R.   A candidate is a Slater winner if the candidate is the top element of some Slater ranking.",
        "command": "slater(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 0
    },
    // bipartisan (unsupported)
    "minimax": {
        "fullName": "Minimax",
        "shortName": "Minimax",
        "category": "Margin Methods",
        // "The Minimax winners are the candidates with the smallest maximum pairwise loss.  That is, for each candidate :math:`a`, find the biggest margin of a candidate :math:`b` over :math:`a`, then elect the candidate(s) with the smallest such loss. Also known as the Simpson-Kramer Rule."
        "description": "The Minimax winners are the candidates with the smallest maximum pairwise loss.  That is, for each candidate a, find the biggest margin of a candidate b over a, then elect the candidate(s) with the smallest such loss. Also known as the Simpson-Kramer Rule.",
        "command": "minimax(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 1
    },
    "minimax_support": {
        "fullName": "Minimax (Support)",
        "shortName": "Minimax (Support)",
        "category": "Margin Methods",
        "description": "A Minimax variant that measures worst pairwise loss by support counts.",
        "command": "minimax_support(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 1
    },
    "leximax": {
        "fullName": "Leximax",
        "shortName": "Leximax",
        "category": "Margin Methods",
        "description": "Break Minimax ties lexicographically by comparing second-worst losses, then third-worst, etc.",
        "command": "leximax(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 1
    },
    "beat_path": {
        "fullName": "Beat Path / Schulze",
        "shortName": "Beat Path",
        "category": "Margin Methods",
        // "For candidates :math:`a` and :math:`b`, a **path** from :math:`a` to :math:`b` is a sequence :math:`x_1, \ldots, x_n` of distinct candidates  with  :math:`x_1=a` and :math:`x_n=b` such that for :math:`1\leq k\leq n-1`, :math:`x_k` is majority preferred to :math:`x_{k+1}`.  The **strength of a path** is the minimal margin along that path.  Say that :math:`a` defeats :math:`b` according to Beat Path if the the strength of the strongest path from :math:`a` to :math:`b` is greater than the strength of the strongest path from :math:`b` to :math:`a`. Then, the candidates that are undefeated according to Beat Path are the winners.  Also known as the Schulze Rule. "
        "description": "For candidates a and b, a path from a to b is a sequence x_1, ..., x_n of distinct candidates  with  x_1=a and x_n=b such that for 1≤k≤n-1, x_k is majority preferred to x_{k+1}.  The strength of a path is the minimal margin along that path.  Say that a defeats b according to Beat Path if the the strength of the strongest path from a to b is greater than the strength of the strongest path from b to a. Then, the candidates that are undefeated according to Beat Path are the winners.  Also known as the Schulze Rule. ",
        "command": "beat_path(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 1,
    },
    "split_cycle": {
        "fullName": "Split Cycle",
        "shortName": "Split Cycle",
        "category": "Margin Methods",
        // "A **majority cycle** is a sequence :math:`x_1, \ldots ,x_n` of distinct candidates with :math:`x_1=x_n` such that for :math:`1 \leq k \leq n-1`,  :math:`x_k` is majority preferred to :math:`x_{k+1}`.  The Split Cycle winners are determined as follows:  If candidate x has a positive margin over y and (x,y) is not the weakest edge in a cycle, then x defeats y. Equivalently, if x has a positive margin over y and there is no path from y back to x of strength at least the margin of x over y, then x defeats y. The candidates that are undefeated are the Split Cycle winners."
        "description": "A majority cycle is a sequence x_1, ..., x_n of distinct candidates with x_1=x_n such that for 1 ≤ k ≤ n-1,  x_k is majority preferred to x_{k+1}.  The Split Cycle winners are determined as follows:  If candidate x has a positive margin over y and (x,y) is not the weakest edge in a cycle, then x defeats y. Equivalently, if x has a positive margin over y and there is no path from y back to x of strength at least the margin of x over y, then x defeats y. The candidates that are undefeated are the Split Cycle winners.",
        "command": "split_cycle(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 1
    },
    "ranked_pairs": {
        "fullName": "Ranked Pairs",
        "shortName": "Ranked Pairs",
        "category": "Margin Methods",
        "description": "Order the edges in the margin graph from largest to smallest and lock them in in that order, skipping edges that create a cycle.  If there are ties in the margins, break the ties using a tie-breaking rule: a linear ordering over the edges.   A candidate is a Ranked Pairs winner if it wins according to some tie-breaking rule. Also known as Tideman's Rule.",
        "command": "ranked_pairs_with_test(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 1
    },
    "river": {
        "fullName": "River",
        "shortName": "River",
        "category": "Margin Methods",
        "description": "Order the edges in the weak margin graph from largest to smallest and lock them in in that order, skipping edges that create a cycle *and edges in which there is already an edge pointing to the target*.  Break ties using a tie-breaking  linear ordering over the edges.  A candidate is a River winner if it wins according to some tie-breaking rule. See https://electowiki.org/wiki/River.",
        "command": "river_with_test(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 1
    },
    "stable_voting": {
        "fullName": "Stable Voting",
        "shortName": "Stable Voting",
        "category": "Margin Methods",
        // "Implementation of  Stable Voting from https://arxiv.org/abs/2108.00542. Stable Voting is a recursive voting method defined as follows: 1.  If there is only one candidate in the profile, then that candidate is the winner. 2. Order the pairs :math:`(a,b)` of candidates from largest to smallest value of the margin of :math:`a` over :math:`b` such that :math:`a` is undefeated according to Split Cycle, and declare as Stable Voting winners the candidate(s) :math:`a` from the earliest pair(s) :math:`(a,b)` such that :math:`a` is a Simple Stable Voting winner in the election without :math:`b`. "
        "description": "Implementation of  Stable Voting from https://arxiv.org/abs/2108.00542. Stable Voting is a recursive voting method defined as follows: 1.  If there is only one candidate in the profile, then that candidate is the winner. 2. Order the pairs (a,b) of candidates from largest to smallest value of the margin of a over b such that a is undefeated according to Split Cycle, and declare as Stable Voting winners the candidate(s) a from the earliest pair(s) (a,b) such that a is a Simple Stable Voting winner in the election without b. ",
        "command": "stable_voting(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 0,
    },
    "simple_stable_voting": {
        "fullName": "Simple Stable Voting",
        "shortName": "Simple Stable Voting",
        "category": "Margin Methods",
        // "Implementation of Simple Stable Voting from https://arxiv.org/abs/2108.00542. Simple Stable Voting is a recursive voting method defined as follows: 1. If there is only one candidate in the profile, then that candidate is the winner. 2. Order the pairs :math:`(a,b)` of candidates from largest to smallest value of the margin of :math:`a` over :math:`b`, and declare as Simple Stable Voting winners the candidate(s) :math:`a` from the earliest pair(s) :math:`(a,b)` such that :math:`a` is a Simple Stable Voting winner in the election without :math:`b`. "
        "description": "Implementation of Simple Stable Voting from https://arxiv.org/abs/2108.00542. Simple Stable Voting is a recursive voting method defined as follows: 1. If there is only one candidate in the profile, then that candidate is the winner. 2. Order the pairs (a,b) of candidates from largest to smallest value of the margin of a over b, and declare as Simple Stable Voting winners the candidate(s) a from the earliest pair(s) (a,b) such that a is a Simple Stable Voting winner in the election without b. ",
        "command": "simple_stable_voting(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 0
    },
    "weighted_covering": {
        "fullName": "Weighted Covering",
        "shortName": "Weighted Covering",
        "category": "Margin Methods",
        "description": "Return candidates not covered under the weighted-covering relation.",
        "command": "weighted_covering(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 1
    },
    "beta_uncovered_set": {
        "fullName": "beta-Uncovered Set",
        "shortName": "beta-Uncovered",
        "category": "Margin Methods",
        "description": "Return candidates not beta-covered by any other candidate (default beta = 0.5).",
        "command": "beta_uncovered_set(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 1
    },
    "simplified_dodgson": {
        "fullName": "Simplified Dodgson",
        "shortName": "Simplified Dodgson",
        "category": "Margin Methods",
        "description": "Return the Condorcet winner if one exists; otherwise candidates with smallest total margins of loss.",
        "command": "simplified_dodgson(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 1
    },
    // essential set not supported
    "loss_trimmer": {
        "fullName": "Loss-Trimmer Voting",
        "shortName": "Loss Trimmer",
        "category": "Margin Methods",
        "description": "Iteratively eliminate the candidate with the largest sum of margins of loss until a Condorcet winner is found. In this version of the method, parallel-universe tiebreaking is used if there are multiple candidates with the largest sum of margins of loss.",
        "command": "loss_trimmer(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 0
    },
    "daunou": {
        "fullName": "Daunou",
        "shortName": "Daunou",
        "category": "Combined Methods",
        "description": "If there is a Condorcet winner, then that candidate is the winner. Otherwise, iteratively remove all Condorcet losers then select the plurality winner from among the remaining candidates.",
        "command": "daunou(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 0
    },
    "blacks": {
        "fullName": "Black's Rule (Condorcetified Borda)",
        "shortName": "Blacks",
        "category": "Combined Methods",
        "description": "If a Condorcet winner exists return that winner. Otherwise, return the Borda winning set.",
        "command": "blacks(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 1,
    },
    "condorcet_irv": {
        "fullName": "Condorcet-IRV",
        "shortName": "Condorcet-IRV",
        "category": "Combined Methods",
        "description": "If there is a Condorcet winner, then that candidate is the winner. Otherwise, run Instant Runoff on the profile.",
        "command": "condorcet_irv(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 1
    },
    "condorcet_irv_put": {
        "fullName": "Condorcet-IRV with parallel-universe tiebreaking",
        "shortName": "Condorcet-IRV (PUT)",
        "category": "Combined Methods",
        "description": "If there is a Condorcet winner, then that candidate is the winner. Otherwise, run Instant Runoff with parallel-universe tiebreaking on the profile.",
        "command": "condorcet_irv_put(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 0
    },
    "smith_irv": {
        "fullName": "Smith-IRV",
        "shortName": "Smith-IRV",
        "category": "Combined Methods",
        "description": "After restricting to the Smith Set, return the Instant Runoff winner.",
        "command": "smith_irv(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 0
    },
    "smith_irv_put": {
        "fullName": "Smith-IRV with parallel-universe tiebreaking",
        "shortName": "Smith-IRV (PUT)",
        "category": "Combined Methods",
        "description": "After restricting to the Smith Set, return the Instant Runoff winner with parallel-universe tiebreaking.",
        "command": "smith_irv_put(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 0
    },
    "condorcet_plurality": {
        "fullName": "Condorcet-Plurality",
        "shortName": "Condorcet-Plurality",
        "category": "Combined Methods",
        "description": "If there is a Condorcet winner, then that candidate is the winner. Otherwise, run Plurality on the profile.",
        "command": "condorcet_plurality(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 0
    },
    "smith_minimax": {
        "fullName": "Smith-Minimax",
        "shortName": "Smith-Minimax",
        "category": "Combined Methods",
        "description": "After restricting to the Smith Set, return the Minimax winner.",
        "command": "smith_minimax(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 0
    },
    "copeland_local_borda": {
        "fullName": "Copeland-Local-Borda",
        "shortName": "Copeland-Local-Borda",
        "category": "Combined Methods",
        "description": "Return the Borda winner after restricting to the Copeland winners.",
        "command": "copeland_local_borda(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 0
    },
    "copeland_global_borda": {
        "fullName": "Copeland-Global-Borda",
        "shortName": "Copeland-Global-Borda",
        "category": "Combined Methods",
        "description": "From the Copeland winners, return the candidate with the largest global Borda score.",
        "command": "copeland_global_borda(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 0
    },
    "copeland_global_minimax": {
        "fullName": "Copeland-Global-Minimax",
        "shortName": "Copeland-Global-Minimax",
        "category": "Combined Methods",
        "description": "From the Copeland winners, return candidates with smallest global Minimax score.",
        "command": "copeland_global_minimax(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 1
    },
    "kemeny_young": {
        "fullName": "Kemeny-Young winners",
        "shortName": "Kemeny-Young",
        "category": "Other Methods",
        "description": "A Kemeny-Young ranking is a ranking that minimizes the sum of the Kendall tau distances to the voters' rankings. The Kemeny-Young winners are the candidates that are ranked first by some Kemeny-Young ranking.",
        "command": "kemeny_young(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 1
    },
    "pareto": {
        "fullName": "Pareto",
        "shortName": "Pareto",
        "category": "Other Methods",
        "description": "Return candidates that are not Pareto dominated.",
        "command": "pareto(profile, curr_cands=agenda)",
        "supportsWeakOrders": 1,
        "active": 1
    },
    "bucklin": {
        "fullName": "Bucklin",
        "shortName": "Bucklin",
        "category": "Other Methods",
        "description": "If a candidate has a strict majority of first-place votes, then that candidate is the winner. If no such candidate exists, then check the candidates that are ranked first or second. If a candidate has a strict majority of first- or second-place voters, then that candidate is the winner. If no such winner is found move on to the 3rd, 4th, etc. place votes. Return the candidates with the greatest overall score.",
        "command": "bucklin(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 1
    },
    "simplified_bucklin": {
        "fullName": "Simplified Bucklin",
        "shortName": "Simplified Bucklin",
        "category": "Other Methods",
        "description": "If a candidate has a strict majority of first-place votes, then that candidate is the winner. If no such candidate exists, then check the candidates that are ranked first or second. If a candidate has a strict majority of first- or second-place voters, then that candidate is the winner. If no such winner is found move on to the 3rd, 4th, etc. place votes.",
        "command": "simplified_bucklin(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 0
    },
    "bracket_voting": {
        "fullName": "Bracket Voting",
        "shortName": "Bracket Voting",
        "category": "Other Methods",
        "description": "The candidates with the top four plurality scores are seeded into a bracket: the candidate with the highest plurality score is seeded 1st, the candidate with the second highest plurality score is seeded 2nd, etc. The 1st seed faces the 4th seed in a head-to-head match decided by majority rule, and the 2nd seed faces the 3rd seed in a head-to-head match decided by majority rule. The winners of these two matches face each other in a final head-to-head match decided by majority rule. The winner of the final is the winner of the election.",
        "command": "bracket_voting(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 0
    },
    "superior_voting": {
        "fullName": "Superior Voting",
        "shortName": "Superior Voting",
        "category": "Other Methods",
        "description": "One candidate is superior to another if more ballots rank the first candidate above the second than vice versa. A candidate earns a point from a ballot if they are ranked first on that ballot or they are superior to the candidate ranked first on that ballot. The candidate with the most points wins.",
        "command": "superior_voting(profile, curr_cands=agenda)",
        "supportsWeakOrders": 0,
        "active": 0
    }
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
