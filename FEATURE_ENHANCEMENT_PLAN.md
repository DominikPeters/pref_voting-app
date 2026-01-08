# pref_voting-app Feature Enhancement Plan

This document outlines opportunities to enhance the voting app to better utilize the powerful pref_voting library.

## Implementation Status

### Completed Features (January 2025)

1. **New Voting Methods Added** (13 new methods)
   - Dowdall (Nauru) - harmonic scoring
   - Majority Winner - strict majority criterion
   - Pareto Undominated - Pareto optimal candidates
   - Tideman Alternative (Smith) - Smith set + IRV elimination
   - Tideman Alternative (Schwartz) - Schwartz set + IRV elimination
   - Essential Set - C1 maximal lottery support
   - Weighted Covering - weighted covering relation
   - Borda-Minimax Faceoff - combined method

2. **Social Welfare Functions** (4 methods - return full rankings)
   - Plurality Ranking
   - Borda Ranking
   - Copeland Ranking
   - Kemeny-Young Ranking
   - Rankings displayed with ">" between tiers and "=" for ties

3. **Probabilistic Methods** (4 methods - return probability distributions)
   - Random Dictator
   - Proportional Borda
   - Maximal Lottery
   - C1 Maximal Lottery
   - Results displayed as percentages per candidate

4. **Axiom Checking System**
   - Condorcet Winner Criterion
   - Condorcet Loser Criterion
   - Majority Criterion
   - Pareto Criterion
   - Smith Criterion
   - Monotonicity
   - Check axioms for any voting rule on current profile

5. **Analysis Features**
   - Profile Analysis Panel (scores, Condorcet winner/loser, cycle detection)
   - Method Disagreement Finder (find profiles where rules disagree)
   - Load disagreeing profiles directly into the app

---

## Executive Summary

The pref_voting library has grown significantly more powerful than what the app currently uses:
- **Library has 80+ voting methods** vs **~65 in the app** (was 53, now expanded)
- **4 additional profile types** (Grade, Utility, Spatial) - not yet supported
- **23 axioms** for checking voting rule properties - **6 now implemented**
- **Advanced profile generators** including spatial and utility-based
- **Social Welfare Functions** - **now implemented**
- **Probabilistic methods** - **now implemented**

---

## 1. NEW VOTING METHODS TO ADD

### 1.1 Scoring Methods (Missing: 4)
| Method | Description | Priority |
|--------|-------------|----------|
| `dowdall` | Harmonic scoring (1, 1/2, 1/3...) used in Nauru | Medium |
| `positive_negative_voting` | +1 for 1st, -1 for last | Low |
| `scoring_rule` | Custom parametric scoring | High (flexible) |
| `borda` for ProfilesWithTies | Multiple variants for weak orders | High |

### 1.2 Iterative Methods (Missing: 6)
| Method | Description | Priority |
|--------|-------------|----------|
| `tideman_alternative_smith` | Smith set + IRV elimination | Medium |
| `tideman_alternative_smith_put` | With PUT tie-breaking | Low |
| `tideman_alternative_schwartz` | Schwartz set + IRV elimination | Medium |
| `tideman_alternative_schwartz_put` | With PUT tie-breaking | Low |
| `knockout` | Head-to-head between lowest Borda candidates | Medium |

### 1.3 Margin-Based Methods (Missing: 3)
| Method | Description | Priority |
|--------|-------------|----------|
| `essential_set` | Support of C1 maximal lottery | High |
| `weighted_covering` | Weighted covering relation | Medium |
| `ranked_pairs_from_stacks` | Zavist-Tideman characterization | Low |

### 1.4 Combined Methods (Missing: 1)
| Method | Description | Priority |
|--------|-------------|----------|
| `borda_minimax_faceoff` | Head-to-head between Borda and Minimax winners | Medium |

### 1.5 Other Methods (Missing: 3)
| Method | Description | Priority |
|--------|-------------|----------|
| `majority` | Strict majority winner (may be empty) | High |
| `pareto` | Pareto-undominated candidates | High |
| `weighted_bucklin` | Bucklin with custom scoring | Low |

**Implementation**: Add these to `js/constants.js` with appropriate category, command, and `supportsWeakOrders` flags.

---

## 2. NEW PROFILE TYPES

### 2.1 Grade Profiles (Evaluative Voting)
**What it enables**: Score Voting, STAR, Majority Judgement, Approval, Dis&approval

**New UI Components Needed**:
- Grade input interface (slider or dropdown per candidate per voter)
- Grade scale selector (0-5, 0-10, letter grades, etc.)
- Visual display of grade distributions (bar charts)

**New Voting Methods to Add**:
| Method | Description |
|--------|-------------|
| `score_voting` | Sum/mean/median of grades |
| `approval` | Binary approval (0/1 grades) |
| `dis_approval` | Approval minus disapproval (-1/0/1) |
| `star` | Score Then Automatic Runoff |
| `majority_judgement` | Median-based with tie-breaking |
| `cumulative_voting` | Fixed budget across candidates |

**Implementation Priority**: HIGH - very popular voting methods

### 2.2 Utility Profiles (Cardinal Preferences)
**What it enables**: Utilitarian methods, Nash welfare, social choice analysis

**New UI Components Needed**:
- Utility slider interface (0-100 or 0-1 scale)
- Normalization options (range, standard score)
- Utility visualization

**New Voting Methods to Add**:
| Method | Description |
|--------|-------------|
| `sum_utilitarian` | Maximize sum of utilities |
| `relative_utilitarian` | Normalized sum |
| `maximin` | Rawlsian - maximize minimum utility |
| `lexicographic_maximin` | Lexicographic extension |
| `nash` | Maximize Nash product |

**Implementation Priority**: MEDIUM - more specialized use cases

### 2.3 Spatial Profiles (Spatial Voting)
**What it enables**: Visualize voter/candidate positions, spatial analysis

**New UI Components Needed**:
- 2D canvas for positioning candidates and voters
- Drag-and-drop positioning
- Distance metric selector
- Visualization with labels

**New Features**:
- Generate profiles from spatial positions
- Convert spatial → utility → ranking
- Visualize political spectrum
- Analyze single-peakedness

**Implementation Priority**: MEDIUM - great for education/visualization

---

## 3. SOCIAL WELFARE FUNCTIONS (Rankings)

Currently the app only shows **winners**. The library supports **full rankings**.

### New Display Mode: Rankings View
Show complete social rankings, not just winners:
- `plurality_ranking`
- `borda_ranking`
- `copeland_ranking`
- `anti_plurality_ranking`
- `score_ranking` (custom)

**UI Enhancement**:
- Toggle between "Winners" and "Rankings" view
- Display rankings as ordered lists with tie indicators
- Allow comparison of different ranking methods

**Implementation Priority**: MEDIUM - useful for analysis

---

## 4. PROBABILISTIC METHODS

Return probability distributions over candidates instead of deterministic winners.

### Methods to Add:
| Method | Description |
|--------|-------------|
| `random_dictator` | Lottery proportional to plurality |
| `proportional_borda` | Lottery proportional to Borda |
| `c1_maximal_lottery` | Normalized majority graph lottery |
| `maximal_lottery` | Full margin-based lottery |

**UI Enhancement**:
- Display results as pie chart or bar chart showing probabilities
- New category: "Probabilistic Methods"

**Implementation Priority**: LOW - niche but interesting

---

## 5. AXIOM CHECKING (RE-ENABLE & EXPAND)

The app has axiom checking **disabled** in `constants.js`. The library has **23 axioms**.

### 5.1 Axioms to Implement:

**Dominance Axioms** (check if winner satisfies):
- Pareto criterion
- Condorcet winner criterion
- Condorcet loser criterion
- Smith criterion
- Schwartz criterion

**Monotonicity Axioms** (find violations):
- Monotonicity (lift/drop)
- Weak Positive Responsiveness

**Strategic Axioms**:
- Strategy-proofness (find manipulation)

**Invariance Axioms**:
- Homogeneity
- Block invariance

**Variable Candidate Axioms**:
- Stability for winners
- Immunity to spoilers
- ISDA, IPDA

### 5.2 UI Components:

**Axiom Panel** (for current profile + selected rule):
- List of axioms with ✓/✗ status
- Click to see violation details
- Show counterexample profiles

**Axiom Comparison Table**:
- Matrix showing which rules satisfy which axioms
- Reference table for education

### 5.3 Interactive Violation Finder:
- "Find a profile where [rule] violates [axiom]"
- Display the counterexample profile
- Allow loading the counterexample

**Implementation Priority**: HIGH - major educational value

---

## 6. PROFILE GENERATION ENHANCEMENTS

### 6.1 Current Generators (Already in Randomizer.js):
- Impartial Culture (IC)
- Impartial Anonymous Culture (IAC)
- Urn model
- Mallows model
- Single-peaked (3 variants)
- Single-crossing
- Euclidean
- Plackett-Luce
- Dirichlet

### 6.2 New Generators to Add:

**Spatial Profile Generator**:
- Visual 2D placement of candidates/voters
- Automatic preference derivation
- Configurable utility functions (Euclidean, Manhattan, etc.)

**Polarized Profile Generator**:
- Define voter clusters
- Generate realistic polarized electorates
- Useful for studying real-world scenarios

**From Margin Graph**:
- Define margins directly
- Minimal profile construction
- Useful for testing specific scenarios

**Utility Profile Generator**:
- Uniform distribution
- Normal distribution
- Spatial utilities

### 6.3 UI Enhancements:
- Preview generated profile before applying
- "Surprise me" mode with random parameters
- Save/load generation presets

**Implementation Priority**: MEDIUM

---

## 7. ANALYSIS FEATURES

### 7.1 Method Comparison
- "Find a profile where [method A] and [method B] disagree"
- Display the distinguishing profile
- Highlight the different winners

### 7.2 Condorcet Efficiency
- Run many random profiles
- Calculate % of time each method picks Condorcet winner
- Display comparative statistics

### 7.3 Axiom Violation Rates
- Statistical analysis across random profiles
- "How often does [rule] violate [axiom]?"
- Visualization of results

### 7.4 Margin Graph Visualization
- Display the majority/margin graph
- Highlight cycles, paths
- Show Condorcet winner/loser
- Interactive graph manipulation

**Implementation Priority**: LOW-MEDIUM (advanced features)

---

## 8. UI/UX IMPROVEMENTS

### 8.1 Results Display Enhancements
- Expandable rule descriptions
- Link to academic references
- Comparison mode (side-by-side rules)

### 8.2 Profile Editing
- Bulk edit (apply same ranking to multiple voters)
- Copy/paste rankings
- Undo/redo support

### 8.3 Visualization
- Margin graph visualization
- Vote distribution charts
- Score breakdown per candidate

### 8.4 Export Enhancements
- Export analysis results
- Export axiom check results
- Export to more formats

---

## 9. IMPLEMENTATION ROADMAP

### Phase 1: Quick Wins (1-2 weeks equivalent effort)
1. Add missing voting methods to constants.js (~15 methods)
2. Re-enable and expand axiom checking
3. Add `majority` and `pareto` methods
4. Add Dowdall scoring

### Phase 2: Grade Profiles (2-3 weeks)
1. Add GradeProfile support in Python bridge
2. Create grade input UI component
3. Add Score Voting, STAR, Majority Judgement
4. Add Approval and Dis&approval

### Phase 3: Enhanced Analysis (2-3 weeks)
1. Implement axiom panel UI
2. Add violation detail views
3. Implement "find disagreeing profile" feature
4. Add margin graph visualization

### Phase 4: Utility & Spatial (3-4 weeks)
1. Add UtilityProfile support
2. Create utility input UI
3. Add utilitarian methods
4. Add SpatialProfile with 2D visualization
5. Implement spatial profile generation

### Phase 5: Advanced Features (ongoing)
1. Social Welfare Functions (rankings)
2. Probabilistic methods
3. Statistical analysis tools
4. Advanced generators

---

## 10. TECHNICAL CONSIDERATIONS

### Pyodide Integration
- All new methods must work through the existing Pyodide bridge
- Test memory usage with large profiles
- Consider lazy loading for rarely-used methods

### Performance
- Cache axiom check results
- Use web workers for expensive computations
- Implement progress indicators for slow operations

### Backwards Compatibility
- Keep existing URL scheme working
- Maintain export format compatibility
- Support loading old saved profiles

---

## Summary of Priorities

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Add missing voting methods | High | Low | **P1** |
| Re-enable axiom checking | High | Medium | **P1** |
| Grade profiles + Score/STAR | High | Medium | **P1** |
| Margin graph visualization | Medium | Medium | **P2** |
| Method disagreement finder | Medium | Low | **P2** |
| Spatial profile visualization | High | High | **P2** |
| Utility profiles | Medium | Medium | **P3** |
| Social Welfare Functions | Medium | Low | **P3** |
| Probabilistic methods | Low | Low | **P3** |
| Statistical analysis | Low | High | **P4** |
