// ============================================================
//  ACT 6 IN ACT 2: GENETIC ENGINEERING AND DEVOLUTION (v3.1)
//  From Loop 2 on, Act 2 gets two new layers. Both survive every Genesis.
//
//  Genetic Engineering (gx): the payoff for the trait draft. Base Pairs come from DNA; spend them to
//      reroll offers, lock a trait into every offer, see a third option, and finally design traits outright.
//  Devolution (dv): Plague Tree's "Unvaxxed", retold. After the Tree of Life, give it all back: Act 2
//      starts over from one cell for Vestiges, which grow a mirror of the Life tree from Predators down
//      to Cells. Every node makes DNA stronger and takes one of Act 2's choices off your hands.
// ============================================================

function geneticsUnlocked() {
    return !!(player.lt && player.lt.genesis >= 2 && lifeUnlocked())
}

// ------------------------------------------------------------
//  GENETIC ENGINEERING
// ------------------------------------------------------------
function basePairGain() {
    if (!geneticsUnlocked()) return new Decimal(0)
    let g = new Decimal(Math.pow(player.dna.add(1).log10().toNumber() / 10, 2))
    if (hasUpgrade("lt", 41)) g = g.times(2)
    if (hasUpgrade("gx", 23)) g = g.times(2)
    return g
}

function offerCount() {
    if (hasUpgrade("gx", 22) && player.gx.design) return Object.keys(TRAITS).length
    return hasUpgrade("gx", 14) ? 3 : 2
}

function lockedTrait() {
    return player.gx && hasUpgrade("gx", 13) && player.gx.target ? player.gx.target : null
}

function traitSoftcap() {
    return hasUpgrade("gx", 21) ? 8 : 5
}

function traitEnhancement(id) {
    if (!player.gx) return 1
    return 1 + 0.1 * getBuyableAmount("gx", 11 + Object.keys(TRAITS).indexOf(id)).toNumber()
}

function rerollCost() {
    return new Decimal(10).times(Decimal.pow(1.1, player.gx.rerolls)).floor()
}

function rerollTraits() {
    if (!hasUpgrade("gx", 12) || pendingTraits() <= 0 || player.gx.points.lt(rerollCost())) return
    player.gx.points = player.gx.points.sub(rerollCost())
    player.gx.rerolls++
    player.gx.shift++
}

// Which offer the automatic draft takes: your chosen trait if it's there and still counts fully, or else the one you have fewest of
function autoTraitPick(offers) {
    if (hasUpgrade("gx", 24) && player.gx.target && offers.includes(player.gx.target) && (player.mu.traits[player.gx.target] || 0) < traitSoftcap()) return offers.indexOf(player.gx.target)
    let best = 0
    offers.forEach((id, n) => { if ((player.mu.traits[id] || 0) < (player.mu.traits[offers[best]] || 0)) best = n })
    return best
}

const GX_UPGRADES = {
    11: ["Sequencing", "See the next offer before you take this one.", 100],
    12: ["Reroll", "Reroll the traits on offer for a few Base Pairs (the price grows 10% each time).", 500],
    13: ["Gene Lock", "Your chosen trait (below) is always one of the offers.", 2000],
    14: ["Third Strand", "Every mutation offers three traits.", 1e4],
    21: ["Gene Duplication", "Traits count fully up to 8 copies instead of 5.", 5e4],
    22: ["CRISPR", "Design traits outright: switch on design mode and every trait is on offer.", 2e5],
    23: ["Polymerase", "Base Pairs x2.", 1e5],
    24: ["Directed Evolution", "The automatic draft always takes your chosen trait when it's offered, until it stops counting fully.", 1e6],
}

addLayer("gx", {
    name: "genetic engineering",
    symbol: "Gx",
    row: 53,
    position: 0,
    color: "#ff6fb5",
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        total: new Decimal(0),
        target: "flagellum",
        design: false,
        rerolls: 0,
        shift: 0,
    }},
    type: "none",
    resource: "Base Pairs",
    layerShown() { return geneticsUnlocked() },
    tooltip() { return format(player.gx.points) + " Base Pairs" },
    update(diff) {
        if (!geneticsUnlocked()) return
        let g = basePairGain().times(diff * actSpeedCache[2])
        player.gx.points = player.gx.points.add(g)
        player.gx.total = player.gx.total.add(g)
    },
    tabFormat: [
        ["display-text", function() { return "<h2 style='color:#ff6fb5'>Genetic Engineering</h2><br>You have <h2 style='color:#ff6fb5'>" + format(player.gx.points) + "</h2> Base Pairs (+" + format(basePairGain().times(actSpeedCache[2])) + "/sec)" }],
        "blank",
        lore("Natural selection works blind. This time, something is watching, and it has opinions."),
        "blank",
        ["display-text", "Base Pairs come from DNA (the square of its digits, over 10, every second) and last through every Genesis. Upgrades change the trait draft in Mutations; the bottom row makes single traits stronger."],
        "blank",
        "upgrades",
        "blank",
        ["display-text", function() { return "<b>Chosen trait:</b> " + TRAITS[player.gx.target].name + (hasUpgrade("gx", 13) ? " (locked into every offer)" : "") }],
        ["clickables", [1]],
        "blank",
        ["clickables", [2]],
        "blank",
        "buyables",
    ],
    upgrades: Object.fromEntries(Object.entries(GX_UPGRADES).map(([id, u]) => [id, {
        title: u[0],
        description: u[1],
        cost: new Decimal(u[2]),
        unlocked() { return Number(id) < 20 || hasUpgrade("gx", 14) },
    }])),
    clickables: Object.assign({}, ...Object.keys(TRAITS).map((id, n) => ({
        [11 + n]: {
            title() { return TRAITS[id].name },
            canClick() { return true },
            onClick() { player.gx.target = id },
            style() { return { width: "120px", "min-height": "45px", height: "45px", "font-size": "9px", "background-color": player.gx.target == id ? "#ff6fb5" : "#7a3a5a" } },
        },
    })), {
        21: {
            title: "Design mode",
            display() { return player.gx.design ? "On: every trait is on offer" : "Off: natural selection offers" },
            unlocked() { return hasUpgrade("gx", 22) },
            canClick() { return true },
            onClick() { player.gx.design = !player.gx.design },
            style() { return { width: "180px", "min-height": "60px", height: "60px" } },
        },
    }),
    buyables: Object.fromEntries(Object.keys(TRAITS).map((id, n) => [11 + n, {
        title() { return "Enhance " + TRAITS[id].name },
        cost(x) { return Decimal.pow(3, x).times(1000) },
        display() { return "This trait's effect ^" + format(traitEnhancement(id), 1) + " (+0.1 a level).<br>Level " + formatWhole(getBuyableAmount("gx", this.id)) + "<br>Cost: " + format(this.cost()) + " Base Pairs" },
        canAfford() { return player.gx.points.gte(this.cost()) },
        buy() {
            player.gx.points = player.gx.points.sub(this.cost())
            setBuyableAmount("gx", this.id, getBuyableAmount("gx", this.id).add(1))
        },
        style() { return { width: "120px", height: "110px", "font-size": "10px" } },
    }])),
})

// ------------------------------------------------------------
//  DEVOLUTION
// ------------------------------------------------------------
const DEVOLUTION = {
    11: { layer: "pr", name: "Vestigial Claws", auto: "Predators are fought on their own, once your DNA would beat them." },
    21: { layer: "in", name: "Vestigial Reflexes", auto: "Your daily routine is planned for you." },
    22: { layer: "sy", name: "Vestigial Partners", auto: "Partners are tended on their own." },
    23: { layer: "mc", name: "Vestigial Limbs", auto: "The body plan is chosen for you: your last complete one, or a good default." },
    31: { layer: "hb", name: "Vestigial Gills", auto: "Free colonists settle on their own, toward the Shoreline first." },
    32: { layer: "ad", name: "Vestigial Fur", auto: "Adaptations are bought on their own." },
    33: { layer: "ge", name: "Junk DNA", auto: "Heritage upgrades are bought on their own." },
    41: { layer: "re", name: "Vestigial Eggs", auto: "Fecundity and Longevity are bought on their own." },
    42: { layer: "mu", name: "Pseudogenes", auto: "Waiting traits are picked on their own." },
    51: { layer: "c", name: "The Last Common Ancestor", auto: "Act 2 starts with every Cell upgrade but the Cambrian Explosion. <b>Back to one cell.</b>" },
}
const DEVOLUTION_MAX = 5
const DEFAULT_BODY_PLAN = ["a", "a", "b", "b", "a", "a"]

function devolutionUnlocked() {
    return !!(player.dv && player.lt && player.lt.genesis >= 2 && (player.dv.count > 0 || hasUpgrade("mc", 11)))
}

function devolved(layer) {
    if (!player.dv || !player.lt || player.lt.genesis == 0) return false
    let id = Object.keys(DEVOLUTION).find(k => DEVOLUTION[k].layer == layer)
    return getBuyableAmount("dv", id).gte(1)
}

function devolutionLevels() {
    return Object.keys(DEVOLUTION).reduce((a, id) => a + getBuyableAmount("dv", id).toNumber(), 0)
}

// Every level anywhere in the mirror tree triples DNA gain
function devolutionDNA() {
    if (!player.dv || !player.lt || player.lt.genesis == 0) return new Decimal(1)
    return Decimal.pow(3, devolutionLevels())
}

function vestigeMult() {
    let m = new Decimal(1)
    if (hasUpgrade("lt", 42)) m = m.times(2)
    if (hasUpgrade("dv", 11)) m = m.times(2)
    if (regressionBeaten(81)) m = m.times(2)
    if (hasUpgrade("dv", 21)) m = m.times(1 + player.dv.count / 10)
    if (hasUpgrade("dv", 23)) m = m.times(1 + Object.keys(DEVOLUTION).filter(id => getBuyableAmount("dv", id).gte(DEVOLUTION_MAX)).length / 2)
    return m
}

function vestigeGain() {
    if (!devolutionUnlocked() || player.dna.lt(1e100)) return new Decimal(0)
    return new Decimal(Math.pow(player.dna.log10().toNumber() / 50, regressionBeaten(83) ? 3.5 : 3)).times(vestigeMult()).floor()
}

// Life needs time to forget: devolving has a cooldown in Act 2's time, so a faster Act 2 shortens it
function devolveCooldown() {
    return hasUpgrade("dv", 12) ? 180 : 600
}

function canDevolve() {
    return vestigeGain().gte(1) && player.dv.cooldown <= 0
}

// Back to one cell: every Act 2 layer starts over. The Tree of Life itself stays (and, with Ancestral Memory, every milestone)
function act2Rewind() {
    for (let l of LIFE_LAYERS) resetKeeping(l, l == "mc" ? ["upgrades"].concat(hasUpgrade("dv", 13) ? ["milestones"] : []) : hasUpgrade("dv", 13) ? ["milestones"] : [])
    player.dna = new Decimal(10)
    act2HeadStarts()
}

function devolve() {
    let g = vestigeGain()
    if (!canDevolve()) return
    checkRegression()
    player.dv.regression = 0
    player.dv.cooldown = devolveCooldown()
    player.dv.peak = new Decimal(0)
    player.dv.stall = 0
    player.dv.points = player.dv.points.add(g)
    player.dv.total = player.dv.total.add(g)
    player.dv.count++
    player.dv.loopCount++
    act2Rewind()
}

// ------------------------------------------------------------
//  REGRESSIONS: devolve under a handicap and reach the goal for a lasting reward
// ------------------------------------------------------------
const REGRESSIONS = {
    81: { name: "Blind Cave Fish", text: "The body plan does nothing.", goal: new Decimal(1e150), reward: "Vestiges x2." },
    82: { name: "Parasite", text: "DNA gain is raised to the 0.85.", goal: new Decimal(1e170), reward: "Every node costs half as much." },
    83: { name: "Flightless", text: "Traits do nothing.", goal: new Decimal(1e150), reward: "Vestiges come from DNA's digits to the 3.5 instead of cubed." },
    84: { name: "Neoteny", text: "Act 2 runs at a fifth of its speed.", goal: new Decimal(1e200), reward: "Act 2 runs twice as fast." },
}

function inRegression(id) {
    return !!(player.dv && player.dv.regression == id)
}

function regressionBeaten(id) {
    return !!(player.dv && player.dv.regressions.includes(String(id)))
}

function startRegression(id) {
    player.dv.regression = id
    player.dv.regressionTime = 0
    act2Rewind()
}

function checkRegression() {
    let id = player.dv.regression
    if (id && player.dna.gte(REGRESSIONS[id].goal) && !regressionBeaten(id)) {
        player.dv.regressions.push(String(id))
        player.dv.regression = 0
        doPopup("none", REGRESSIONS[id].reward, "Regression beaten: " + REGRESSIONS[id].name, 3, "#8fb3a0")
    }
}

// For the Autopilot: buy Vestige upgrades, and try the next Regression right after a devolution;
// give up after 30 minutes and try again 3 devolutions later
function regressionAutomation() {
    for (let id in DV_UPGRADES) if (!hasUpgrade("dv", id) && canAffordUpgrade("dv", id)) buyUpg("dv", id)
    if (!hasUpgrade("dv", 14)) return
    player.dv.failed = player.dv.failed || {}
    let a = player.dv.regression
    if (a) { if (player.dv.regressionTime > 1800) { player.dv.failed[a] = player.dv.count; player.dv.regression = 0 } return }
    if (player.dv.cooldown <= 0 || player.dna.gte(1e10)) return
    let next = Object.keys(REGRESSIONS).find(id => !regressionBeaten(id) && !(player.dv.failed[id] !== undefined && player.dv.count < player.dv.failed[id] + 3))
    if (next) startRegression(Number(next))
}

const DV_UPGRADES = {
    11: ["Rudiments", "Vestiges x2.", 5],
    12: ["Reversion", "Life forgets faster: the cooldown is 3 minutes instead of 10.", 15],
    13: ["Ancestral Memory", "Devolving (and starting a Regression) keeps every Act 2 milestone.", 40],
    14: ["Regressions", "Unlock <b>Regressions</b>: devolve under a handicap, for a lasting reward.", 80],
    21: ["Deep Roots", "Vestiges grow with every devolution you've done.", 150],
    22: ["Recapitulation", "Act 2 plays itself: every reset, choice and predator, all the way to the Tree of Life.", 300],
    23: ["Convergence", "Vestiges grow with every node at its last level.", 800],
    24: ["Vestigial Everything", "Act 2 runs 3x as fast.", 2000],
}

// Head starts for Act 2, after a Genesis or a Devolution
function act2HeadStarts() {
    if (hasUpgrade("mm", 12)) { grantMilestones("ge", [0, 1, 2]); grantMilestones("mu", [0, 1, 2]) }
    if (hasUpgrade("mm", 22)) grantMilestones("mc", [0, 1, 2])
    if (hasUpgrade("mm", 42)) grantMilestones("mc", [3])
    if (hasUpgrade("mm", 32) && player.gx.target) player.mu.traits[player.gx.target] += 5
    if (devolved("c")) for (let id of [11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33]) if (!hasUpgrade("c", id)) player.c.upgrades.push(id)
}

function dvNodeUnlocked(id) {
    let row = Math.floor(id / 10)
    if (row == 1) return true
    return Object.keys(DEVOLUTION).some(k => Math.floor(k / 10) == row - 1 && getBuyableAmount("dv", k).gte(1))
}

// What Devolution does for you every tick
function devolutionAutomation() {
    if (!lifeUnlocked() || player.lt.genesis == 0) return
    if (devolved("mc") && player.mc.unlocked) {
        for (let t = 0; t < BODY_PLAN.length; t++) {
            if (player.mc.plan[t] || t >= player.mc.points.toNumber()) continue
            if (t > 0 && !player.mc.plan[t - 1]) break
            player.mc.plan[t] = (player.dv.plan && player.dv.plan[t]) || DEFAULT_BODY_PLAN[t]
        }
    }
    if (player.mc.unlocked && bodyPlanDone()) player.dv.plan = player.mc.plan.slice()
    if (devolved("ge") && player.ge.unlocked) for (let id in layers.ge.upgrades) if (!isNaN(id) && !hasUpgrade("ge", id) && tmp.ge.upgrades[id] && tmp.ge.upgrades[id].unlocked && canAffordUpgrade("ge", id)) buyUpg("ge", id)
    if (devolved("sy") && player.sy.unlocked && !hasMilestone("sy", 3)) for (let id of SYMBIONT_IDS) if (symbiontUnlocked(id) && giftBond(id) > autoGiftThreshold(id)) giveGift(id)
    if (devolved("in") && player.in.unlocked && (player.in.clock - (player.dv.routineAt || 0) >= 30 || player.in.clock < player.dv.routineAt)) {
        player.dv.routineAt = player.in.clock
        let r = bestRoutine()
        if (r) player.in.routine = [0, 1, 2, 3].map(i => r[i] || null)
    }
    if (devolved("pr") && player.pr.unlocked) autoPredators()
}

// The routine that gives the most, mostly in DNA, then capacity, Heritage and births
function bestRoutine() {
    let opts = BEHAVIOR_IDS.filter(behaviorUnlocked)
    let s = instinctStrength().toNumber(), best = null, bs = -Infinity
    function score(steps) {
        let dna = 0, cap = 0, births = 0, her = 0
        for (let i = 0; i < steps.length; i++) {
            let now = steps[i], before = steps[(i - 1 + steps.length) % steps.length], p = s
            if (before == "rest" && steps.length > 1) p *= 2
            if (COMBOS.some(([a, b]) => a == before && b == now) && steps.length > 1) p *= 1.5
            let m = Math.pow(BEHAVIORS[now].mult, Math.min(5, p)), k = BEHAVIORS[now].kind
            dna += k == "dna" ? m : 1; cap += k == "capacity" ? m : 1; births += k == "births" ? m : 1; her += k == "heritage" ? m : 1
        }
        let n = steps.length
        return Math.log10(dna / n) + 0.35 * Math.log10(cap / n) + 0.1 * Math.log10(births / n) + 0.25 * Math.log10(her / n)
    }
    function rec(arr, len) {
        if (arr.length == len) { let sc = score(arr); if (sc > bs + 1e-9) { bs = sc; best = arr.slice() } return }
        for (let o of opts) { arr.push(o); rec(arr, len); arr.pop() }
    }
    for (let len = 1; len <= routineSlots(); len++) rec([], len)
    return best
}

// Fight the predator with the easiest goal once DNA is well past it; leave if a fight lasts 10 real minutes
// (real time: a fast Act 2 would otherwise give up a winnable fight in seconds)
function autoPredators() {
    let id = player.pr.activeChallenge
    if (id) {
        if (canCompleteChallenge("pr", id)) { startChallenge("pr", id); return }
        if (player.dv.fightTime > 600) startChallenge("pr", id)
        return
    }
    let open = [11, 12, 21].filter(i => (player.pr.challenges[i] || 0) < 3)
    if (!open.length || player.mc.resetTime < 30) return
    let pick = open.reduce((a, i) => predatorGoal(i).lt(predatorGoal(a)) ? i : a, open[0])
    let margin = pick == 12 ? 1e8 : 100
    if (player.dna.gte(predatorGoal(pick).times(margin))) startChallenge("pr", pick)
}

addLayer("dv", {
    name: "devolution",
    symbol: "Dv",
    row: 53,
    position: 1,
    color: "#8fb3a0",
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        total: new Decimal(0),
        count: 0,
        loopCount: 0,
        plan: null,
        routineAt: 0,
        cooldown: 0,
        auto: true,
        peak: new Decimal(0),
        stall: 0,
        clock: 0,
        fightTime: 0,
        regression: 0,
        regressionTime: 0,
        regressions: [],
    }},
    type: "none",
    resource: "Vestiges",
    layerShown() { return devolutionUnlocked() },
    tooltip() { return formatWhole(player.dv.points) + " Vestiges" },
    update(diff) {
        let act2 = diff * actSpeedCache[2]
        player.dv.clock += diff
        if (player.pr && player.pr.activeChallenge) player.dv.fightTime += diff; else player.dv.fightTime = 0
        if (player.dv.regression) player.dv.regressionTime += diff
        if (player.dv.cooldown > 0) player.dv.cooldown = Math.max(0, player.dv.cooldown - act2)
        // For the automatic devolve: how long since the Vestige gain last grew (in Act 2's time)
        let g = vestigeGain()
        if (g.gt(player.dv.peak)) { player.dv.peak = g; player.dv.stall = 0 } else player.dv.stall += act2
    },
    automate() {
        devolutionAutomation()
        checkRegression()
        // Recapitulation: Act 2 plays itself (unless the Autopilot already does)
        if (hasUpgrade("dv", 22) && lifeUnlocked() && player.lt.genesis >= 2 && !(typeof apOn == "function" && apOn(12))) AUTOPILOT.act2(player.dv.clock)
        // Devolve on its own once the cooldown is over and the gain has stopped growing for a minute (never in the middle of a Regression)
        if (hasMilestone("dv", 0) && player.dv.auto && canDevolve() && player.dv.stall >= 60 && !player.dv.regression && player.lt.endings.includes("tol")) devolve()
    },
    milestones: {
        0: { requirementDescription: "5 devolutions", effectDescription: "Once this Loop has reached the Tree of Life, devolve on your own whenever the cooldown is over and your Vestige gain has stopped growing for a minute (see the switch below).", done() { return player.dv.count >= 5 } },
    },
    tabFormat: [
        ["display-text", function() { return "<h2 style='color:#8fb3a0'>Devolution</h2><br>You have <h2 style='color:#8fb3a0'>" + formatWhole(player.dv.points) + "</h2> Vestiges, from " + formatWhole(player.dv.count) + " devolution" + (player.dv.count == 1 ? "" : "s") + "." }],
        "blank",
        lore("Evolution has no direction. Blind cave fish lose their eyes, whales lose their legs, and parasites lose almost everything. Sometimes the way forward is back."),
        "blank",
        ["display-text", function() {
            return "<b>Devolve</b> to start Act 2 over from one cell, keeping the Tree of Life. You need 1e100 DNA; Vestiges come from its digits (cubed, over 50). After each devolution, life needs " + formatTime(devolveCooldown()) + " to forget before the next (in Act 2's time, so Act 2's speed shortens it).<br>" +
                "Vestiges grow a mirror of the Life tree, from Predators down to Cells. Each node opens the row below it. Every level anywhere triples DNA gain (now <b>x" + format(devolutionDNA()) + "</b>), and each node's first level takes one of Act 2's choices off your hands. Nodes last through every Genesis."
        }],
        "blank",
        ["clickables", [9]],
        ["clickables", [1]],
        "blank",
        "milestones",
        "upgrades",
        "blank",
        ["display-text", function() {
            if (!hasUpgrade("dv", 14)) return ""
            let a = player.dv.regression
            return "<h3>Regressions</h3><br>Starting one sends Act 2 back to one cell (without Vestiges). Reach its goal to beat it; devolving ends it." +
                (a ? "<br>In <b>" + REGRESSIONS[a].name + "</b>: " + format(player.dna) + " / " + format(REGRESSIONS[a].goal) + " DNA." : "")
        }],
        ["clickables", [8]],
        "blank",
        ["row", [["buyable", 11]]],
        ["row", [["buyable", 21], ["buyable", 22], ["buyable", 23]]],
        ["row", [["buyable", 31], ["buyable", 32], ["buyable", 33]]],
        ["row", [["buyable", 41], ["buyable", 42]]],
        ["row", [["buyable", 51]]],
    ],
    upgrades: Object.fromEntries(Object.entries(DV_UPGRADES).map(([id, u]) => [id, {
        title: u[0],
        description: u[1],
        cost: new Decimal(u[2]),
        currencyDisplayName: "Vestiges",
        style: { width: "150px", height: "110px", "font-size": "9px" },
    }])),
    clickables: {
        ...Object.fromEntries(Object.entries(REGRESSIONS).map(([id, r]) => [id, {
            title() { return r.name },
            display() {
                let n = Number(id)
                if (regressionBeaten(n)) return "Beaten. " + r.reward
                return r.text + "<br>Goal: " + format(r.goal) + " DNA<br>Reward: " + r.reward + (inRegression(n) ? "<br><b>Click to give up.</b>" : "")
            },
            unlocked() { return hasUpgrade("dv", 14) },
            canClick() { return !regressionBeaten(Number(id)) && (!player.dv.regression || inRegression(Number(id))) },
            onClick() {
                let n = Number(id)
                if (inRegression(n)) { player.dv.regression = 0; return }
                if (!confirm("Start " + r.name + "? Act 2 goes back to one cell.")) return
                startRegression(n)
            },
            style() { return { width: "160px", height: "120px", "min-height": "120px", "font-size": "9px", "background-color": regressionBeaten(Number(id)) ? "#8fb3a0" : inRegression(Number(id)) ? "#c9a26b" : undefined } },
        }])),
        11: {
            title: "Devolving on its own",
            display() { return player.dv.auto ? "On" : "Off" },
            unlocked() { return hasMilestone("dv", 0) },
            canClick() { return true },
            onClick() { player.dv.auto = !player.dv.auto },
            style() { return { width: "160px", "min-height": "50px", height: "50px" } },
        },
        91: {
            title: "Devolve",
            display() {
                let g = vestigeGain()
                if (g.lt(1)) return "Reach 1e100 DNA first."
                if (player.dv.cooldown > 0) return "Life needs time to forget: " + formatTime(player.dv.cooldown / actSpeedCache[2]) + " more (" + formatWhole(g) + " Vestiges waiting)."
                return "Start Act 2 over from one cell for <b>" + formatWhole(g) + "</b> Vestiges."
            },
            canClick() { return canDevolve() },
            onClick() {
                if (player.dv.count == 0 && !confirm("Devolving starts all of Act 2 over from one cell (the Tree of Life stays). Ready?")) return
                devolve()
            },
            style() { return { width: "260px", height: "90px", "min-height": "90px" } },
        },
    },
    buyables: Object.fromEntries(Object.entries(DEVOLUTION).map(([id, d]) => [id, {
        title() { return d.name },
        cost(x) { return Decimal.pow(3, Math.floor(id / 10) - 1).times(Decimal.pow(2, x)).times(8).div(regressionBeaten(82) ? 2 : 1).ceil() },
        display() {
            let n = getBuyableAmount("dv", this.id).toNumber()
            return "<i>" + layers[d.layer].name + "</i><br>" + d.auto + "<br>Level " + n + " / " + DEVOLUTION_MAX + (n < DEVOLUTION_MAX ? "<br>Cost: " + formatWhole(this.cost()) + " Vestiges" : "")
        },
        unlocked() { return true },
        canAfford() { return dvNodeUnlocked(Number(id)) && getBuyableAmount("dv", this.id).lt(DEVOLUTION_MAX) && player.dv.points.gte(this.cost()) },
        buy() {
            player.dv.points = player.dv.points.sub(this.cost())
            setBuyableAmount("dv", this.id, getBuyableAmount("dv", this.id).add(1))
            if (d.layer == "c") act2HeadStarts()
        },
        style() {
            let n = getBuyableAmount("dv", this.id).toNumber()
            return { width: "150px", height: "130px", "font-size": "9px", opacity: dvNodeUnlocked(Number(id)) ? 1 : 0.4, "background-color": n >= 1 ? "#8fb3a0" : undefined }
        },
    }])),
})
