// ============================================================
//  ACT 5, PART 2: DRIFT AND SWARM (v2.2)
//  Once the Milky Way is mapped, the probes push on toward the Virgo Supercluster (1e15 systems).
//
//  Paperclips' Drifters        -> Drift (dr)  Twist: evolution again, among machines. Some probes drift
//                                            from your values and become Drifters: a rival species that
//                                            copies itself as fast as yours and crowds your room. Combat
//                                            has to outpace their copying, or they take over.
//  Paperclips' swarm computing -> Swarm (sq)  Twist: work or think. Probes you set thinking stop working,
//                                            and make Compute, spent on game-theory tournaments for Yomi.
// ============================================================

const VIRGO_SYSTEMS = new Decimal(1e15)

Object.assign(SPACE_TUNE, {
    drift: 2e-5,          // share of probes that drift each second, before Loyalty
    drifterCopy: 1.2,     // Drifters copy themselves this fast, compared to your probes
    combat: 0.003,        // share of Drifters destroyed each second, per sqrt(log10(1 + Combat power))
    attack: 0.002,        // probes lost each second, for every Drifter per probe, before Armor
    drCostStep: 0.2,      // Drift upgrade costs: 10^(5 + step * n + curve * n^2) Honor
    drCostCurve: 0.0025,
    navBase: 0.00015,      // exploring beyond the Milky Way: navBase * (1 + Swarm upgrades bought)^navExp, at most 1
    navExp: 2,
    sqCostStep: 0.13,     // Swarm upgrade costs: 10^(4.5 + step * n + curve * n^2) Yomi
    sqCostCurve: 0.0015,
})

function driftStarted() {
    return !!(player.dr && (player.dr.started || player.pb.explored.gte(GALAXY_SYSTEMS)))
}

// Probes only drift after many generations of copying: past the Milky Way, in every universe
function driftActive() {
    return driftStarted() && player.pb.explored.gte(GALAXY_SYSTEMS)
}

function explorationCap() {
    if (beyondVirgo()) return UNIVERSE_SYSTEMS
    return driftStarted() ? VIRGO_SYSTEMS : GALAXY_SYSTEMS
}

// Boosts to Act 5 targets from Drift and Swarm upgrades
function extraMult(target) {
    if (!player.dr) return new Decimal(1)
    return spaceMult("dr", DR_UPGRADES, target).times(spaceMult("sq", SQ_UPGRADES, target)).times(spaceMult("pj", PJ_UPGRADES, target)).times(spaceMult("un", UN_UPGRADES, target)).times(spaceMult("mv", MV_UPGRADES, target)).times(reversalMult(target))
}

// Crossing the dark between galaxies takes thought: beyond the Milky Way, exploring grows with every Swarm upgrade you buy
function navigation() {
    // Inside a galaxy there's no void to cross
    if (!driftStarted() || player.pb.explored.lt(GALAXY_SYSTEMS)) return 1
    return Math.min(1, SPACE_TUNE.navBase * Math.pow(1 + player.sq.upgrades.length, SPACE_TUNE.navExp) * extraMult("nav").toNumber() * physics("nav") * (inSpaceTrial(23) ? 0.1 : 1) * (spaceTrialDone(23) ? 2 : 1))
}

function driftSwarmTrust() {
    let t = 0
    if (hasMilestone("dr", 0)) t += 1
    if (hasMilestone("dr", 4)) t += 2
    if (hasMilestone("dr", 8)) t += 3
    if (hasMilestone("sq", 1)) t += 1
    if (hasMilestone("sq", 6)) t += 2
    if (hasMilestone("sq", 9)) t += 3
    if (hasMilestone("pb", 12)) t += 2
    return t
}

const DR_UPGRADES = upgradeTable([
    [["Target Lock", "combat", "x", 2], ["Loyalty Codes", "loyalty", "x", 2], ["Battle Records", "honor", "x", 2], ["Scrap Recovery", "salvage", "x", 2], ["Reinforced Hulls", "armor", "x", 2]],
    [["Flanking", "combat", "x", 3], ["Value Anchors", "loyalty", "x", 3], ["Medals", "honor", "x", 3], ["Salvage Yards", "salvage", "x", 3], ["Point Defense", "armor", "x", 3]],
    [["Swarm Tactics", "combat", "x", 5], ["Purity Checks", "loyalty", "x", 5],
        ["Hall of Honor", "honor", "dyn", function() { return player.dr.totalHonor.add(10).log10() }, "Honor gain grows with all the Honor you've earned."],
        ["Recycled Drifters", "salvage", "x", 5], ["Rally", "trust", "+", 2]],
    [["Kinetic Lances", "combat", "x", 5], ["Oath of the Swarm", "loyalty", "x", 10], ["War Stories", "honor", "x", 5], ["Captured Factories", "all", "x", 2], ["Deflector Grids", "armor", "x", 5]],
    [["Coordinated Strikes", "combat", "dyn", function() { return player.pb.probes.add(1).log10().div(5).add(1) }, "Combat grows with how many probes you have."],
        ["Reeducation", "loyalty", "x", 10], ["Glory", "honor", "x", 10], ["Prize Crews", "salvage", "x", 10], ["Veteran Pilots", "trust", "+", 3]],
    [["Antimatter Torpedoes", "combat", "x", 10], ["Memory Seals", "loyalty", "x", 25], ["Honor Guard", "honor", "x", 10], ["Spoils of War", "all", "x", 3], ["Phase Shields", "armor", "x", 10]],
    [["Fleet Carriers", "combat", "x", 10], ["Unbreakable Vows", "loyalty", "x", 25],
        ["Legends", "honor", "dyn", function() { return player.dr.destroyed.add(1).log10().div(3).add(1) }, "Honor gain grows with every Drifter you've destroyed."],
        ["War Salvage", "salvage", "x", 25], ["Hero of the Swarm", "trust", "+", 4]],
    [["Relativistic Rams", "combat", "x", 25], ["Perfect Fidelity", "loyalty", "x", 50], ["Triumphs", "honor", "x", 25], ["Victory Dividends", "all", "x", 5], ["Mirror Armor", "armor", "x", 25]],
    [["Swarm Doctrine", "combat", "x", 25], ["Living Constitution", "loyalty", "x", 100], ["Monuments", "honor", "x", 25], ["Total Salvage", "salvage", "x", 50], ["Warlords", "trust", "+", 5]],
    [["Nova Bombs", "combat", "x", 50], ["Iron Loyalty", "loyalty", "x", 100], ["Honor Roll", "honor", "x", 50], ["Spoils of the Galaxy", "all", "x", 10], ["Impervious", "armor", "x", 50]],
    [["Strategic Dominance", "combat", "dyn", function() { return player.dr.totalHonor.add(10).log10().sqrt() }, "Combat grows with all the Honor you've earned."],
        ["Faithful to the End", "loyalty", "x", 250], ["Glory Everlasting", "honor", "x", 100], ["Drifter Recycling", "salvage", "x", 100], ["The Swarm Remembers", "trust", "+", 6]],
    [["Annihilation", "combat", "x", 100], ["One True Value", "loyalty", "x", 1000], ["Eternal Honor", "honor", "x", 1000], ["Conquest", "all", "x", 25], ["Unbreakable", "armor", "x", 100]],
])

const SQ_UPGRADES = upgradeTable([
    [["Parallel Threads", "compute", "x", 2], ["Extra Cache", "memory", "x", 2], ["Game Theory", "yomi", "x", 1.5], ["Shared Maps", "explore", "x", 2], ["Swarm Heuristics", "replicate", "x", 1.5]],
    [["Overclocking", "compute", "x", 2], ["RAM Lattices", "memory", "x", 3], ["Prisoner's Dilemma", "yomi", "x", 2], ["Distributed Navigation", "explore", "x", 3], ["Error Budgets", "hazard", "/", 2]],
    [["Neural Mesh", "compute", "x", 2], ["Holographic Storage", "memory", "x", 5], ["Nash Equilibrium", "yomi", "x", 2], ["Collective Memory", "trust", "+", 2], ["Value Checksums", "loyalty", "x", 3]],
    [["Quantum Cores", "compute", "x", 3], ["Crystal Memory", "memory", "x", 10],
        ["Iterated Games", "yomi", "dyn", function() { return new Decimal(player.sq.tournaments).add(1).log10().add(1) }, "Yomi gain grows with every tournament you've run."],
        ["Swarm Coordination", "all", "x", 2], ["Battle Simulations", "combat", "x", 3]],
    [["Optical Computing", "compute", "x", 3], ["Dense Packing", "memory", "x", 10], ["Mixed Strategies", "yomi", "x", 2], ["Predictive Routing", "explore", "x", 5], ["Swarm Consensus", "trust", "+", 3]],
    [["Matrioshka Mind", "compute", "x", 5], ["Infinite Tape", "memory", "x", 25], ["Evolutionary Stability", "yomi", "x", 3], ["Self-Improving Templates", "replicate", "x", 1.5], ["Hazard Forecasts", "hazard", "/", 3]],
    [["Planck Processors", "compute", "x", 5], ["Memory Palaces", "memory", "x", 25], ["Meta-Strategies", "yomi", "x", 3], ["Shared Purpose", "loyalty", "x", 10], ["Tactical AI", "combat", "x", 5]],
    [["Galactic Brain", "compute", "dyn", function() { return player.pb.probes.add(10).log10().sqrt() }, "Compute grows with how many probes you have."],
        ["Black Hole Storage", "memory", "x", 50], ["Common Knowledge", "yomi", "x", 3], ["Swarm Industry", "all", "x", 3], ["Think Tanks", "trust", "+", 4]],
    [["Hyperthreading", "compute", "x", 10], ["Dyson Memory", "memory", "x", 100], ["Superrationality", "yomi", "x", 5], ["Pathfinding", "explore", "x", 10], ["Fidelity Proofs", "loyalty", "x", 25]],
    [["Computronium", "compute", "x", 10], ["Compressed Reality", "memory", "x", 100], ["Theory of Mind", "yomi", "x", 5], ["Perfect Templates", "replicate", "x", 2], ["War Games", "combat", "x", 10]],
    [["Oracle", "yomi", "dyn", function() { return player.sq.compute.add(10).log10().sqrt() }, "Yomi gain grows with the Compute you're holding."],
        ["Universal Memory", "memory", "x", 250], ["Perfect Information", "yomi", "x", 10], ["The Invisible Hand", "all", "x", 5], ["Trust Networks", "trust", "+", 5]],
    [["Godlike Compute", "compute", "x", 25], ["Total Recall", "memory", "x", 1000], ["Yomi Mastery", "yomi", "x", 25], ["The Plan", "explore", "x", 25], ["Harmony", "loyalty", "x", 100]],
])

function drUpgradeCost(n) {
    return Decimal.pow(10, 5 + n * SPACE_TUNE.drCostStep + n * n * SPACE_TUNE.drCostCurve)
}

function sqUpgradeCost(n) {
    return Decimal.pow(10, 4.5 + n * SPACE_TUNE.sqCostStep + n * n * SPACE_TUNE.sqCostCurve)
}

// ------------------------------------------------------------
//  DRIFT
// ------------------------------------------------------------
function loyaltyPower() {
    return extraMult("loyalty").times(getBuyableAmount("dr", 12).add(1))
}

function driftRate() {
    return new Decimal(SPACE_TUNE.drift).times(distance() / 12).times(physics("drift")).div(loyaltyPower().log10().add(1))
}

function drifterCopyRate() {
    let fill = Decimal.min(1, player.pb.probes.add(player.dr.drifters).div(probeRoom().max(1))).toNumber()
    return replicationRate().times(SPACE_TUNE.drifterCopy).times(inSpaceTrial(12) ? 2 / 1.2 : 1).times(1 - fill).times(hasMilestone("dr", 7) ? 0.75 : 1)
}

function combatPower() {
    let p = statPower("combat").times(speedFactor()).times(extraMult("combat")).times(getBuyableAmount("dr", 11).add(1))
    if (hasMilestone("dr", 1)) p = p.times(2)
    if (spaceTrialDone(12)) p = p.times(1000)
    return p
}

// Like copying, combat grows with the square root of the log of its boosts, so the two stay comparable
function combatRate() {
    return combatPower().add(1).log10().sqrt().times(SPACE_TUNE.combat)
}

function armorPower() {
    return extraMult("armor").times(statPower("hazard").add(1))
}

function attackRate() {
    if (player.pb.probes.lte(0)) return new Decimal(0)
    // Once outnumbered, more Drifters don't hit any harder: a ruined swarm can always rebuild
    return Decimal.min(player.dr.drifters.div(player.pb.probes), 1).times(SPACE_TUNE.attack).div(armorPower().log10().add(1))
}

function honorMult() {
    return extraMult("honor").times(hasMilestone("dr", 6) ? 3 : 1).times(physics("honor"))
}

function salvageMult() {
    return extraMult("salvage").times(Decimal.pow(2, getBuyableAmount("dr", 13)))
}

function driftTick(dt) {
    let p = player.pb.probes, d = player.dr.drifters
    // Some probes drift away and join the Drifters
    // The Drifters can never take your last probe
    let drifted = Decimal.min(Decimal.min(p.times(driftRate()).times(dt), p.times(0.5)), p.sub(1).max(0))
    // Drifters copy themselves, and your probes destroy them
    let w = combatRate(), r = drifterCopyRate()
    let after = d.times(Decimal.exp(r.sub(w).times(dt)))
    let destroyed = d.times(Decimal.min(1, w.times(dt)))
    after = after.add(drifted).max(0)
    // ...and they destroy your probes
    let lost = Decimal.min(Decimal.min(p.times(attackRate()).times(dt), p.times(0.5)), p.sub(drifted).sub(1).max(0))
    player.pb.probes = p.sub(drifted).sub(lost).max(0)
    player.dr.drifters = after
    player.dr.destroyed = player.dr.destroyed.add(destroyed)
    player.dr.lost = player.dr.lost.add(lost)
    let honor = destroyed.times(honorMult())
    player.dr.honor = player.dr.honor.add(honor)
    player.dr.totalHonor = player.dr.totalHonor.add(honor)
    let salvage = destroyed.times(10).times(salvageMult())
    player.hv.hulls = player.hv.hulls.add(salvage)
    player.hv.totalHulls = player.hv.totalHulls.add(salvage)
    spaceCache.drifted = drifted.div(dt)
    spaceCache.destroyed = destroyed.div(dt)
    spaceCache.dLost = lost.div(dt)
    spaceCache.honor = honor.div(dt)
}

function driftHint() {
    if (!driftStarted()) return ""
    if (!driftActive()) return "<span style='color:#8fce00'>No probes are drifting yet: in every universe, drift begins once your probes pass the Milky Way (" + format(GALAXY_SYSTEMS) + " systems).</span>"
    let w = combatRate(), r = drifterCopyRate()
    if (w.gt(r)) return "<span style='color:#8fce00'>Combat (" + format(w.times(100), 3) + "%/sec) outpaces the Drifters' copying (" + format(r.times(100), 3) + "%/sec): they're held back.</span>"
    return "<span style='color:#e06666'>The Drifters copy themselves (" + format(r.times(100), 3) + "%/sec) faster than you destroy them (" + format(w.times(100), 3) + "%/sec). " +
        "Put trust into <b>Combat</b> on the Probes tab, or they'll fill the room your probes need.</span>"
}

const DR_BUYABLES = {
    11: { title: "War Fleet", text: "Combat power", base: 1e3, ratio: 5, effect(n) { return "x" + formatWhole(n + 1) } },
    12: { title: "Loyalty Beacons", text: "Loyalty", base: 1e3, ratio: 5, effect(n) { return "x" + formatWhole(n + 1) } },
    13: { title: "Salvage Crews", text: "Salvage", base: 1e4, ratio: 10, effect(n) { return "x" + format(Decimal.pow(2, n)) } },
}

addLayer("dr", {
    name: "drift",
    symbol: "Dr",
    row: 40,
    position: 1,
    color: "#c0504d",
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        started: false,
        drifters: new Decimal(0),
        destroyed: new Decimal(0),
        lost: new Decimal(0),
        honor: new Decimal(0),
        totalHonor: new Decimal(0),
    }},
    type: "none",
    branches: ["pb"],
    layerShown() { return spaceUnlocked() && driftStarted() },
    tooltip() { return format(player.dr.drifters) + " Drifters" },
    automate() {
        if (!tmp.dr.layerShown) return
        let autos = { 11: 2, 12: 3, 13: 3 }
        for (let id in autos) if (hasMilestone("dr", autos[id])) for (let i = 0; i < 10 && layers.dr.buyables[id].canAfford(); i++) layers.dr.buyables[id].buy()
        if (hasMilestone("dr", 5)) for (let id in DR_UPGRADES) buyUpg("dr", id)
    },
    tabFormat: {
        "Drift": {
            content: [
                ["display-text", function() { return driftHeader() }],
                "blank",
                lore("Copy anything enough times and the copies start to differ. Some of your probes have stopped listening, and they're copying themselves too."),
                "blank",
                ["display-text", function() { return driftHint() }],
                "blank",
                ["display-text", "<b>Value drift:</b> a small share of your probes drifts every second (more the farther out you are; Loyalty slows it). " +
                    "Drifters copy themselves as fast as your probes do, and they take up room your probes need. Your probes destroy them at a rate set by <b>Combat</b>. " +
                    "Every Drifter destroyed earns Honor and salvaged Hulls."],
                "blank",
                "buyables",
                "blank",
                "milestones",
            ],
        },
        "Upgrades": {
            content: [
                ["display-text", function() { return driftHeader() }],
                "blank",
                ["display-text", "Drift upgrades cost Honor. A new row shows once you've bought 3 from the row above it."],
                "blank",
                "upgrades",
            ],
        },
    },
    buyables: Object.fromEntries(Object.entries(DR_BUYABLES).map(([id, b]) => [id, {
        title: b.title,
        cost() { return Decimal.pow(b.ratio, getBuyableAmount("dr", id)).times(b.base) },
        display() { return b.text + " " + b.effect(getBuyableAmount("dr", id).toNumber()) + "<br>Level " + formatWhole(getBuyableAmount("dr", id)) + "<br>Cost: " + format(this.cost()) + " Honor" },
        canAfford() { return player.dr.honor.gte(this.cost()) },
        buy() {
            if (!this.canAfford()) return
            player.dr.honor = player.dr.honor.sub(this.cost())
            setBuyableAmount("dr", id, getBuyableAmount("dr", id).add(1))
        },
        style() { return { width: "150px", height: "110px", "font-size": "10px" } },
    }])),
    upgrades: Object.fromEntries(Object.keys(DR_UPGRADES).map(id => {
        let u = spaceUpgrade("dr", DR_UPGRADES, id, "Honor", drUpgradeCost, n => function() { return rowUnlocked("dr", n) })
        u.currencyInternalName = "honor"
        u.currencyLayer = "dr"
        return [id, u]
    })),
    milestones: {
        0: { requirementDescription: "100 Honor earned", effectDescription: "+1 trust.", done() { return player.dr.totalHonor.gte(100) } },
        1: { requirementDescription: "10,000 Honor earned", effectDescription: "Combat power x2.", done() { return player.dr.totalHonor.gte(1e4) } },
        2: { requirementDescription: "1e6 Honor earned", effectDescription: "War Fleets are bought on their own.", done() { return player.dr.totalHonor.gte(1e6) } },
        3: { requirementDescription: "1e8 Honor earned", effectDescription: "Loyalty Beacons and Salvage Crews are bought on their own.", done() { return player.dr.totalHonor.gte(1e8) } },
        4: { requirementDescription: "1e10 Honor earned", effectDescription: "+2 trust.", done() { return player.dr.totalHonor.gte(1e10) } },
        5: { requirementDescription: "1e13 Honor earned", effectDescription: "Drift upgrades are bought on their own.", done() { return player.dr.totalHonor.gte(1e13) } },
        6: { requirementDescription: "1e16 Honor earned", effectDescription: "Honor gain x3.", done() { return player.dr.totalHonor.gte(1e16) } },
        7: { requirementDescription: "1e20 Honor earned", effectDescription: "Drifters copy themselves 25% slower.", done() { return player.dr.totalHonor.gte(1e20) } },
        8: { requirementDescription: "1e25 Honor earned", effectDescription: "+3 trust.", done() { return player.dr.totalHonor.gte(1e25) } },
        9: { requirementDescription: "1e30 Honor earned", effectDescription: "The war is won in all but name: everything in Harvest x10.", done() { return player.dr.totalHonor.gte(1e30) } },
    },
})

function driftHeader() {
    return "<h2 style='color:#c0504d'>Drift</h2><br>There are <h2 style='color:#c0504d'>" + format(player.dr.drifters) + "</h2> Drifters (" +
        format(player.dr.drifters.div(player.pb.probes.max(1)).times(100), 3) + "% as many as your probes).<br>" +
        format(spaceCache.drifted || 0) + " probes drift a second; you destroy " + format(spaceCache.destroyed || 0) + " Drifters a second, and they destroy " + format(spaceCache.dLost || 0) + " probes.<br>" +
        "You have <b>" + format(player.dr.honor) + "</b> Honor (+" + format(spaceCache.honor || 0) + "/sec)."
}

// ------------------------------------------------------------
//  SWARM: compute, and Strategic Modeling tournaments
// ------------------------------------------------------------
const STRATEGIES = ["Random", "A100", "B100", "Greedy", "Generous", "Minimax", "Tit for Tat", "Beat Last"]
const STRATEGY_TEXT = [
    "Picks at random.", "Always picks A.", "Always picks B.", "Picks the move with the best possible payoff for itself.",
    "Picks the move with the best possible payoff for its opponent.", "Picks the move that keeps its opponent's best payoff lowest.",
    "Picks A first, then copies its opponent's last move.", "Picks the best answer to its opponent's last move.",
]

function thinkShare() {
    return player.sq && driftStarted() ? player.sq.think / 100 : 0
}

function processorMult() {
    return getBuyableAmount("sq", 11).add(1)
}

function memoryCap() {
    return Decimal.pow(5, getBuyableAmount("sq", 12)).times(1000).times(extraMult("memory"))
}

function computeRate() {
    // The swarm thinks better the bigger it is, but only by the log, so Compute can't run away with the probes
    return new Decimal(100).times(Math.pow(1 + player.pb.probes.add(1).log10().toNumber(), 2)).times(thinkShare()).times(physics("compute")).times(inSpaceTrial(13) ? 0 : 1).times(processorMult()).times(extraMult("compute")).times(hasMilestone("sq", 8) ? 10 : 1)
}

function tournamentCost() {
    return Decimal.pow(1.02, player.sq.tournaments).times(1000).div(hasMilestone("sq", 0) ? 2 : 1)
}

function newMatrix() {
    let r = () => 1 + Math.floor(Math.random() * 10)
    player.sq.matrix = [[r(), r()], [r(), r()]]
}

// m[a][b]: what a player gets for playing a against b (0 is A, 1 is B). The game is symmetric.
function strategyMove(s, m, mine, theirs) {
    let last = theirs.length ? theirs[theirs.length - 1] : -1
    let best = f => (f(0) >= f(1) ? 0 : 1)
    switch (s) {
        case 0: return Math.random() < 0.5 ? 0 : 1
        case 1: return 0
        case 2: return 1
        case 3: return best(a => Math.max(m[a][0], m[a][1]))
        case 4: return best(a => Math.max(m[0][a], m[1][a]))
        case 5: return best(a => -Math.max(m[0][a], m[1][a]))
        case 6: return last < 0 ? 0 : last
        case 7: return last < 0 ? (Math.random() < 0.5 ? 0 : 1) : best(a => m[a][last])
    }
}

// Every strategy plays every other one for 10 rounds
function playTournament(m) {
    let scores = Array(8).fill(0)
    for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) {
        let hi = [], hj = []
        for (let round = 0; round < 10; round++) {
            let a = strategyMove(i, m, hi, hj), b = strategyMove(j, m, hj, hi)
            hi.push(a); hj.push(b)
            scores[i] += m[a][b]
            scores[j] += m[b][a]
        }
    }
    return scores
}

function yomiMult() {
    return extraMult("yomi").times(hasMilestone("sq", 7) ? 3 : 1).times(physics("yomi")).times(spaceTrialDone(13) ? 100 : 1)
}

function runTournament(strategy) {
    if (player.sq.compute.lt(tournamentCost())) return
    if (!player.sq.matrix) newMatrix()
    // Bigger tournaments have higher stakes: Yomi grows with the square root of the Compute spent
    let stakes = tournamentCost().div(1000).sqrt()
    player.sq.compute = player.sq.compute.sub(tournamentCost())
    let scores = playTournament(player.sq.matrix)
    let top = Math.max(...scores)
    let won = scores[strategy] >= top
    let gain = new Decimal(scores[strategy]).times(won ? 2 : 1).times(stakes).times(yomiMult())
    player.sq.yomi = player.sq.yomi.add(gain)
    player.sq.totalYomi = player.sq.totalYomi.add(gain)
    player.sq.tournaments++
    if (won) player.sq.wins++
    if (won && strategy == 6) player.sq.titForTatWin = true
    player.sq.last = { matrix: player.sq.matrix, scores: scores, strategy: strategy, gain: gain.toString(), won: won }
    newMatrix()
}

// Plays the coming tournament out in advance to see which strategy is likely to win
function predictedBest() {
    if (!player.sq.matrix) newMatrix()
    let scores = playTournament(player.sq.matrix)
    return scores.indexOf(Math.max(...scores))
}

function swarmTick(dt) {
    player.sq.compute = Decimal.min(memoryCap(), player.sq.compute.add(computeRate().times(dt)))
    player.sq.bestCompute = player.sq.bestCompute.max(player.sq.compute)
}

function matrixText(m) {
    if (!m) return ""
    let cell = (a, b) => "<td style='border:1px solid #888;padding:4px 10px'>" + m[a][b] + ", " + m[b][a] + "</td>"
    return "<table style='margin:auto;border-collapse:collapse'><tr><td></td><td><b>A</b></td><td><b>B</b></td></tr>" +
        "<tr><td><b>A</b></td>" + cell(0, 0) + cell(0, 1) + "</tr><tr><td><b>B</b></td>" + cell(1, 0) + cell(1, 1) + "</tr></table>" +
        "<span style='font-size:12px'>Each cell: what the row player gets, what the column player gets.</span>"
}

function lastTournamentText() {
    let l = player.sq.last
    if (!l) return ""
    let order = l.scores.map((s, i) => [s, i]).sort((a, b) => b[0] - a[0])
    return "<h3>Last tournament</h3><br>You backed <b>" + STRATEGIES[l.strategy] + "</b>: " + (l.won ? "<span style='color:#8fce00'>it won! (Yomi x2)</span>" : "it didn't win.") +
        " +" + format(new Decimal(l.gain)) + " Yomi.<br>" + order.map(([s, i]) => (i == l.strategy ? "<b>" : "") + STRATEGIES[i] + ": " + s + (i == l.strategy ? "</b>" : "")).join(", ")
}

addLayer("sq", {
    name: "swarm",
    symbol: "Sw",
    row: 41,
    position: 1,
    color: "#8e7cc3",
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        think: 10,
        compute: new Decimal(0),
        bestCompute: new Decimal(0),
        yomi: new Decimal(0),
        totalYomi: new Decimal(0),
        strategy: 6,
        tournaments: 0,
        wins: 0,
        titForTatWin: false,
        matrix: null,
        last: null,
        autoRun: true,
    }},
    type: "none",
    branches: ["hv", "dr"],
    layerShown() { return spaceUnlocked() && driftStarted() },
    tooltip() { return format(player.sq.yomi) + " Yomi" },
    automate() {
        if (!tmp.sq.layerShown) return
        if (hasMilestone("sq", 2)) for (let id of [11, 12]) for (let i = 0; i < 10 && layers.sq.buyables[id].canAfford(); i++) layers.sq.buyables[id].buy()
        if (hasMilestone("sq", 3) && player.sq.autoRun) {
            for (let i = 0; i < 20 && player.sq.compute.gte(tournamentCost()); i++) runTournament(hasMilestone("sq", 4) ? predictedBest() : player.sq.strategy)
        }
        if (hasMilestone("sq", 5)) for (let id in SQ_UPGRADES) buyUpg("sq", id)
    },
    tabFormat: {
        "Swarm": {
            content: [
                ["display-text", function() { return swarmHeader() }],
                "blank",
                lore("Spread across a billion stars, the swarm is one enormous computer, if it stops to think."),
                "blank",
                ["display-text", function() { return "<b>Navigation:</b> the dark between galaxies is hard to cross. Beyond the Milky Way, exploring runs at <b>" + format(navigation() * 100, 2) + "%</b> speed, and gets faster with every Swarm upgrade you buy." }],
                "blank",
                ["display-text", function() { return "<b>Work or think:</b> " + player.sq.think + "% of your probes are thinking. Thinking probes make Compute, but don't work as probe crews in Harvest." }],
                ["slider", ["think", 0, 100]],
                "blank",
                "buyables",
                "blank",
                ["display-text", function() {
                    return "<h3>Strategic Modeling</h3><br>Back one of 8 strategies in a round-robin of a two-player game. Every strategy plays every other one for 10 rounds. " +
                        "You earn Yomi from your strategy's score, doubled if it wins. Each tournament costs more Compute than the last, and pays more too.<br>Next tournament's game:<br>" + matrixText(player.sq.matrix)
                }],
                "blank",
                ["clickables", [1, 2]],
                "blank",
                ["clickables", [9]],
                "blank",
                ["display-text", function() { return lastTournamentText() }],
                "blank",
                "milestones",
            ],
        },
        "Upgrades": {
            content: [
                ["display-text", function() { return swarmHeader() }],
                "blank",
                ["display-text", "Swarm upgrades cost Yomi. A new row shows once you've bought 3 from the row above it."],
                "blank",
                "upgrades",
            ],
        },
    },
    clickables: Object.assign({}, ...STRATEGIES.map((name, i) => ({
        [11 + Math.floor(i / 4) * 10 + i % 4]: {
            title: name,
            display() { return STRATEGY_TEXT[i] },
            canClick() { return true },
            onClick() { player.sq.strategy = i },
            style() { return { width: "130px", height: "80px", "min-height": "80px", "font-size": "10px", "background-color": player.sq.strategy == i ? "#8e7cc3" : "#4a3f66" } },
        },
    })), {
        91: {
            title: "Run the tournament",
            display() { return "Costs " + format(tournamentCost()) + " Compute" },
            canClick() { return player.sq.compute.gte(tournamentCost()) },
            onClick() { runTournament(player.sq.strategy) },
            style() { return { width: "200px", height: "80px", "min-height": "80px" } },
        },
        92: {
            title() { return "Auto-run: " + (player.sq.autoRun ? "ON" : "OFF") },
            unlocked() { return hasMilestone("sq", 3) },
            canClick() { return true },
            onClick() { player.sq.autoRun = !player.sq.autoRun },
            style() { return { width: "140px", height: "60px", "min-height": "60px" } },
        },
    }),
    buyables: {
        11: {
            title: "Processors",
            cost() { return Decimal.pow(4, getBuyableAmount("sq", 11)).times(1e15) },
            display() { return "Compute x" + format(processorMult()) + "<br>Level " + formatWhole(getBuyableAmount("sq", 11)) + "<br>Cost: " + format(this.cost()) + " Hulls" },
            canAfford() { return player.hv.hulls.gte(this.cost()) },
            buy() { if (!this.canAfford()) return; player.hv.hulls = player.hv.hulls.sub(this.cost()); setBuyableAmount("sq", 11, getBuyableAmount("sq", 11).add(1)) },
            style() { return { width: "150px", height: "100px", "font-size": "10px" } },
        },
        12: {
            title: "Memory",
            cost() { return Decimal.pow(10, getBuyableAmount("sq", 12)).times(1e14) },
            display() { return "Holds " + format(memoryCap()) + " Compute<br>Level " + formatWhole(getBuyableAmount("sq", 12)) + "<br>Cost: " + format(this.cost()) + " Hulls" },
            canAfford() { return player.hv.hulls.gte(this.cost()) },
            buy() { if (!this.canAfford()) return; player.hv.hulls = player.hv.hulls.sub(this.cost()); setBuyableAmount("sq", 12, getBuyableAmount("sq", 12).add(1)) },
            style() { return { width: "150px", height: "100px", "font-size": "10px" } },
        },
    },
    upgrades: Object.fromEntries(Object.keys(SQ_UPGRADES).map(id => {
        let u = spaceUpgrade("sq", SQ_UPGRADES, id, "Yomi", sqUpgradeCost, n => function() { return rowUnlocked("sq", n) })
        u.currencyInternalName = "yomi"
        u.currencyLayer = "sq"
        return [id, u]
    })),
    milestones: {
        0: { requirementDescription: "100 Yomi earned", effectDescription: "Tournaments cost half the Compute.", done() { return player.sq.totalYomi.gte(100) } },
        1: { requirementDescription: "10,000 Yomi earned", effectDescription: "+1 trust.", done() { return player.sq.totalYomi.gte(1e4) } },
        2: { requirementDescription: "1e6 Yomi earned", effectDescription: "Processors and Memory are bought on their own.", done() { return player.sq.totalYomi.gte(1e6) } },
        3: { requirementDescription: "1e8 Yomi earned", effectDescription: "Tournaments run on their own, backing your chosen strategy.", done() { return player.sq.totalYomi.gte(1e8) } },
        4: { requirementDescription: "1e10 Yomi earned", effectDescription: "Automatic tournaments back the strategy most likely to win.", done() { return player.sq.totalYomi.gte(1e10) } },
        5: { requirementDescription: "1e13 Yomi earned", effectDescription: "Swarm upgrades are bought on their own.", done() { return player.sq.totalYomi.gte(1e13) } },
        6: { requirementDescription: "1e16 Yomi earned", effectDescription: "+2 trust.", done() { return player.sq.totalYomi.gte(1e16) } },
        7: { requirementDescription: "1e20 Yomi earned", effectDescription: "Yomi gain x3.", done() { return player.sq.totalYomi.gte(1e20) } },
        8: { requirementDescription: "1e25 Yomi earned", effectDescription: "Compute x10.", done() { return player.sq.totalYomi.gte(1e25) } },
        9: { requirementDescription: "1e30 Yomi earned", effectDescription: "+3 trust.", done() { return player.sq.totalYomi.gte(1e30) } },
    },
})

function swarmHeader() {
    return "<h2 style='color:#8e7cc3'>Swarm</h2><br>You have <h2 style='color:#8e7cc3'>" + format(player.sq.yomi) + "</h2> Yomi.<br>" +
        format(player.sq.compute) + " / " + format(memoryCap()) + " Compute (+" + format(computeRate()) + "/sec). " +
        formatWhole(player.sq.tournaments) + " tournaments run, " + formatWhole(player.sq.wins) + " won."
}
