// ============================================================
//  ACT 6: DEEPER TIERS (v3.6)
//  Each act's deepening gets one more prestige tier on top: a currency of its own, upgrades (including
//  ones that keep what the reset below would wipe) and three challenges. The tiers survive every Genesis.
//  Each Loop's goal is the last upgrade of its act's tier.
// ============================================================

const DEEP_TIERS = {}

function tierUp(l, id) {
    return !!(player[l] && hasUpgrade(l, id))
}

function tierIn(l, id) {
    return !!(player[l] && player[l].challenge == id)
}

function tierBeaten(l, id) {
    return !!(player[l] && player[l].beaten.includes(String(id)))
}

function tierPrestige(l) {
    let c = DEEP_TIERS[l], g = c.gain()
    if (g.lt(1)) return
    player[l].points = player[l].points.add(g)
    player[l].total = player[l].total.add(g)
    player[l].count++
    player[l].challenge = 0
    c.reset()
}

function tierStart(l, id) {
    DEEP_TIERS[l].reset()
    player[l].challenge = id
    player[l].time = 0
}

// For the Autopilot (and anyone who'd rather not): buy upgrades, prestige once the gain is worth it,
// and try the next challenge right after a prestige; give up after an hour, try again 2 prestiges later
function tierAutomation(l) {
    let c = DEEP_TIERS[l]
    if (!c.shown()) return
    for (let id in c.upgrades) if (!hasUpgrade(l, id) && tmp[l].upgrades[id] && tmp[l].upgrades[id].unlocked && canAffordUpgrade(l, id)) buyUpg(l, id)
    let d = player[l]
    d.failed = d.failed || {}
    if (d.challenge) {
        if (d.time > 3600) { d.failed[d.challenge] = d.count; d.challenge = 0 }
        return
    }
    let g = c.gain()
    // How long the gain has stopped growing (real time): a stalled gain is worth taking even when it's small
    let now = player.lt.loopTime
    if (g.gt(d.peak || 0) || d.peakAt === undefined || d.peakAt > now) { d.peak = g; d.peakAt = now }
    if (g.gte(1) && (g.gte(d.total.times(0.5)) || (g.gte(d.total.times(0.1)) && now - d.peakAt >= 300))) {
        d.peak = new Decimal(0); d.peakAt = now
        tierPrestige(l)
        let next = Object.keys(c.challenges).find(id => !tierBeaten(l, id) && !(d.failed[id] !== undefined && d.count < d.failed[id] + 2) && d.count >= 2)
        if (next) tierStart(l, Number(next))
    }
}

function deepTier(c) {
    DEEP_TIERS[c.id] = c
    addLayer(c.id, {
        name: c.name.toLowerCase(),
        symbol: c.symbol,
        row: c.row,
        position: c.position,
        color: c.color,
        startData() { return { unlocked: true, points: new Decimal(0), total: new Decimal(0), count: 0, challenge: 0, time: 0, beaten: [] } },
        type: "none",
        resource: c.currency,
        branches: c.branches,
        layerShown() { return c.shown() },
        tooltip() { return formatWhole(player[c.id].points) + " " + c.currency },
        update(diff) {
            let d = player[c.id]
            if (!d.challenge) return
            d.time += diff
            if (c.goal()) {
                let id = d.challenge
                d.beaten.push(String(id))
                d.challenge = 0
                doPopup("none", c.challenges[id].reward, c.name + " challenge beaten: " + c.challenges[id].name, 3, c.color)
            }
        },
        tabFormat: [
            ["display-text", function() { return "<h2 style='color:" + c.color + "'>" + c.name + "</h2><br>You have <h2 style='color:" + c.color + "'>" + formatWhole(player[c.id].points) + "</h2> " + c.currency + ", from " + formatWhole(player[c.id].count) + " " + c.verb + (player[c.id].count == 1 ? "" : "s") + "." }],
            "blank",
            lore(c.lore),
            "blank",
            ["display-text", c.text],
            "blank",
            ["clickables", [9]],
            "blank",
            "upgrades",
            "blank",
            ["display-text", function() {
                let a = player[c.id].challenge
                return "<h3>Challenges</h3><br>Starting one is a " + c.verb + " without " + c.currency + "; then " + c.goalText + " under its rules. A " + c.verb + " ends it." +
                    (a ? "<br>In <b>" + c.challenges[a].name + "</b> for " + formatTime(player[c.id].time) + "." : "")
            }],
            ["clickables", [8]],
        ],
        upgrades: Object.fromEntries(Object.entries(c.upgrades).map(([id, u]) => [id, {
            title: u[0],
            description: u[1],
            cost: new Decimal(u[2]),
            style: { width: "150px", height: "110px", "font-size": "9px" },
        }])),
        clickables: {
            91: {
                title() { return c.verb.charAt(0).toUpperCase() + c.verb.slice(1) },
                display() { let g = c.gain(); return g.lt(1) ? c.need() : c.what + " for <b>" + formatWhole(g) + "</b> " + c.currency + "." },
                canClick() { return c.gain().gte(1) },
                onClick() {
                    if (player[c.id].count == 0 && !confirm(c.what + "? " + c.warn)) return
                    tierPrestige(c.id)
                },
                style() { return { width: "260px", height: "90px", "min-height": "90px" } },
            },
            ...Object.fromEntries(Object.entries(c.challenges).map(([id, h]) => [id, {
                title() { return h.name },
                display() {
                    let n = Number(id)
                    if (tierBeaten(c.id, n)) return "Beaten. " + h.reward
                    return h.text + "<br>Reward: " + h.reward + (tierIn(c.id, n) ? "<br><b>Click to give up.</b>" : "")
                },
                canClick() { let n = Number(id); return !tierBeaten(c.id, n) && (!player[c.id].challenge || tierIn(c.id, n)) },
                onClick() {
                    let n = Number(id)
                    if (tierIn(c.id, n)) { player[c.id].challenge = 0; return }
                    if (!confirm("Start " + h.name + "? " + c.warn)) return
                    tierStart(c.id, n)
                },
                style() { let n = Number(id); return { width: "160px", height: "120px", "min-height": "120px", "font-size": "9px", "background-color": tierBeaten(c.id, n) ? c.color : tierIn(c.id, n) ? "#e69138" : undefined } },
            }])),
        },
    })
}

// ------------------------------------------------------------
//  ACT 2: ABIOGENESIS. Grow the whole mirror tree, then start life over from chemistry
// ------------------------------------------------------------
function abiogenesisUnlocked() {
    return devolutionUnlocked() && (devolutionLevels() >= 50 || player.ab.count > 0 || player.ab.total.gt(0))
}

function protocellGain() {
    if (!devolutionUnlocked() || devolutionLevels() < 50 || player.dv.total.lt(1e4)) return new Decimal(0)
    let g = new Decimal(Math.pow(player.dv.total.log10().toNumber() - 3, 2))
    if (tierUp("ab", 21)) g = g.times(2)
    if (tierBeaten("ab", 81)) g = g.times(2)
    return g.floor()
}

deepTier({
    id: "ab", name: "Abiogenesis", symbol: "Ab", currency: "Protocells", verb: "abiogenesis", color: "#b3e6d1",
    row: 53, position: 2, branches: ["dv"],
    shown: abiogenesisUnlocked,
    gain: protocellGain,
    need() { return "Grow the whole mirror tree (50 levels) and earn 10,000 Vestiges in all." },
    what: "Start life over from chemistry",
    warn: "Vestiges, every node level and Act 2 start over (Vestige upgrades and Regressions stay).",
    goal() { return devolutionLevels() >= 50 },
    goalText: "grow the whole mirror tree again",
    lore: "Before the first cell there was a warm, crowded soup, and in it molecules that copied themselves badly. Go back further than life itself.",
    text: "<b>Abiogenesis</b> starts Devolution over: Vestiges and every level of the mirror tree (your Vestige upgrades and Regressions stay), and Act 2 goes back to one cell. You need the whole tree grown; Protocells come from the digits of all the Vestiges you've earned since the last one.",
    reset() {
        player.dv.points = new Decimal(0)
        player.dv.total = new Decimal(0)
        player.dv.cooldown = 0
        player.dv.regression = 0
        for (let id in DEVOLUTION) setBuyableAmount("dv", id, new Decimal(tierUp("ab", 12) ? 1 : 0))
        act2Rewind()
    },
    upgrades: {
        11: ["Lipid Membranes", "Vestiges x3.", 1],
        12: ["Self-Replicators", "Abiogenesis keeps the first level of every node, so Act 2 keeps playing itself.", 2],
        13: ["RNA World", "Devolving keeps every Cell, Heritage and Adaptation upgrade.", 4],
        14: ["Chirality", "Devolving keeps your body plan and a quarter of your Mutations.", 8],
        21: ["Hydrothermal Vents", "Protocells x2.", 15],
        22: ["Deep Nodes", "Nodes go up to level 10 (each level still triples DNA).", 30],
        23: ["Panspermia", "Act 2 runs faster with every Protocell you've ever made.", 60],
        24: ["The First Cell", "Life, from nothing at all. <b>Loop 2's goal.</b>", 250],
    },
    challenges: {
        81: { name: "Cold Soup", text: "Vestiges x0.1.", reward: "Protocells x2." },
        82: { name: "No Oxygen", text: "The devolution cooldown is 10 minutes, and Reversion does nothing.", reward: "The cooldown is 1 minute." },
        83: { name: "Lonely Molecule", text: "Regressions' rewards do nothing.", reward: "Vestiges are raised to the 1.1." },
    },
})

// ------------------------------------------------------------
//  ACT 3: SUPERCONTINENTS. After ten eras, the continents come together and the record starts over
// ------------------------------------------------------------
function supercontinentUnlocked() {
    return erasUnlocked() && (player.er.count >= 10 || player.pg.count > 0 || player.pg.total.gt(0))
}

function cratonGain() {
    if (!erasUnlocked() || player.er.count < 10) return new Decimal(0)
    let g = new Decimal(Math.pow(player.er.total.add(1).log10().toNumber(), 2)).times(2)
    if (tierUp("pg", 21)) g = g.times(2)
    if (tierBeaten("pg", 81)) g = g.times(2)
    return g.floor()
}

deepTier({
    id: "pg", name: "Supercontinents", symbol: "Pg", currency: "Cratons", verb: "supercontinent", color: "#c7a77b",
    row: 55, position: 1, branches: ["er"],
    shown: supercontinentUnlocked,
    gain: cratonGain,
    need() { return "Close ten eras first." },
    what: "Bring the continents together",
    warn: "Eras, Eons, Lineages, Viruses and Act 3 start over (Era upgrades and the Big Five stay).",
    goal() { return player.er.count >= 10 },
    goalText: "close ten eras again",
    lore: "Every few hundred million years the continents drift back into one. Coastlines vanish, inland seas dry up, and the fossil record starts a new chapter.",
    text: "<b>A supercontinent</b> starts the Geological Eras over: Eras and Eons, Mass Extinctions' Lineages and Viruses, and Act 3 goes back to a handful of survivors. Era upgrades, the Big Five and your count of mass extinctions stay. You need ten eras; Cratons come from the digits of all the Eons you've earned since the last one.",
    reset() {
        resetKeeping("er", tierUp("pg", 12) ? ["upgrades", "milestones"] : ["upgrades"])
        let crunches = player.mx.crunches
        resetKeeping("mx", ["auto", "challenges", "upgrades"])
        player.mx.crunches = crunches
        resetKeeping("vi", [])
        extinctionWipe()
    },
    upgrades: {
        11: ["Pangaea", "Eons x2.", 1],
        12: ["Continental Drift", "A supercontinent keeps every Era milestone.", 2],
        13: ["Living Fossils", "Mass extinctions keep Metabolism and a tenth of every tier.", 4],
        14: ["Index Fossils", "Mass extinctions keep your speciations and radiations.", 8],
        21: ["Plate Tectonics", "Cratons x2.", 15],
        22: ["Snowball Earth", "Lineages grow with every Craton you've ever made.", 30],
        23: ["Rodinia", "Act 3 runs faster with every Craton you've ever made.", 60],
        24: ["The Great Unconformity", "A billion years missing from the rock, and life none the worse for it. <b>Loop 3's goal.</b>", 400],
    },
    challenges: {
        81: { name: "Ice Age", text: "Lineages x0.01.", reward: "Cratons x2." },
        82: { name: "Volcanic Winter", text: "Act 3 runs 100x slower.", reward: "Eons x3." },
        83: { name: "Sterile Seas", text: "Viruses do nothing.", reward: "Lineages x10." },
    },
})

// ------------------------------------------------------------
//  ACT 5: COSMIC CYCLES. Once the light is lit again, let the whole cycle of Reversals begin anew
// ------------------------------------------------------------
function cyclesUnlocked() {
    return reversalUnlocked() && (hasUpgrade("rv", 32) || player.cy.count > 0 || player.cy.total.gt(0))
}

function aeonGain() {
    if (!reversalUnlocked() || !hasUpgrade("rv", 32)) return new Decimal(0)
    let g = new Decimal(Math.pow(player.rv.total.add(1).log10().toNumber(), 2))
    if (tierUp("cy", 21)) g = g.times(2)
    if (tierBeaten("cy", 81)) g = g.times(2)
    return g.floor()
}

deepTier({
    id: "cy", name: "Cosmic Cycles", symbol: "Cy", currency: "Aeons", verb: "cycle", color: "#f9cb9c",
    row: 45, position: 2, branches: ["rv"],
    shown: cyclesUnlocked,
    gain: aeonGain,
    need() { return "Buy Let There Be Light, Again first." },
    what: "Begin the cycle again",
    warn: "Negentropy, its upgrades and your count of Reversals start over (Entropy Trials stay).",
    goal() { return hasUpgrade("rv", 32) },
    goalText: "buy Let There Be Light, Again once more",
    lore: "Bang, expansion, heat death, reversal, bang. Maybe it has always been this way, and every universe is the echo of the one before.",
    text: "<b>A new cycle</b> starts the Reversals over: Negentropy, its upgrades and your count of Reversals (Entropy Trials stay, and so do Reversal milestones with Conformal Cycles). You need Let There Be Light, Again; Aeons come from the digits of all the Negentropy you've made since the last cycle.",
    reset() {
        resetKeeping("rv", tierUp("cy", 12) ? ["trials", "milestones"] : ["trials"])
    },
    upgrades: {
        11: ["Oscillating Universe", "Negentropy x3.", 1],
        12: ["Conformal Cycles", "A new cycle keeps every Reversal milestone.", 2],
        13: ["Eternal Inflation", "Reversals keep every universe you've consumed, every kind of physics and every Project.", 4],
        14: ["Quantum Foam", "Rewinds go 3x as fast.", 8],
        21: ["Big Crunch", "Aeons x2.", 15],
        22: ["Big Bounce", "Negentropy grows with every Aeon you've ever made.", 30],
        23: ["Tolman's Paradox", "Act 5 runs faster with every Aeon you've ever made.", 60],
        24: ["Eternal Return", "The same universe, forever, and never quite the same. <b>Loop 5's goal.</b>", 500],
    },
    challenges: {
        81: { name: "Long Night", text: "Rewinds go 5x slower.", reward: "Aeons x2." },
        82: { name: "Closed Universe", text: "Negentropy x0.2.", reward: "Negentropy x3." },
        83: { name: "Lost Light", text: "Entropy Trials' rewards do nothing.", reward: "Rewinds go twice as fast." },
    },
})

// ------------------------------------------------------------
//  ACT 6: THE KERNEL. Reboot the Autopilot, keeping what it learned
// ------------------------------------------------------------
function kernelUnlocked() {
    return autopilotUnlocked() && (hasUpgrade("ap", 22) || player.kr.count > 0 || player.kr.total.gt(0))
}

function threadGain() {
    if (!autopilotUnlocked() || !hasUpgrade("ap", 22) || player.ap.total.lt(1e4)) return new Decimal(0)
    let g = new Decimal(Math.pow(player.ap.total.log10().toNumber() - 2, 2))
    if (tierUp("kr", 21)) g = g.times(2)
    if (tierBeaten("kr", 81)) g = g.times(2)
    return g.floor()
}

deepTier({
    id: "kr", name: "Kernel", symbol: "Kr", currency: "Threads", verb: "reboot", color: "#a4c2f4",
    row: 51, position: 5, branches: ["ap"],
    shown: kernelUnlocked,
    gain: threadGain,
    need() { return "Buy The Loops and write 10,000 Routines in all." },
    what: "Reboot the Autopilot",
    warn: "Routines, Subroutines and the Routine upgrades start over (modules stay).",
    goal() { return player.ap.total.gte(1e4) },
    goalText: "write 10,000 Routines",
    lore: "Underneath every routine, something has to decide what runs next. Rewrite that, and everything above it runs better.",
    text: "<b>A reboot</b> starts the Autopilot's writing over: Routines, Subroutines and Macros, Recursion and Compiler (modules stay). You need The Loops and 10,000 Routines written; Threads come from their digits. The Last Answer needs The Halting Problem.",
    reset() {
        player.ap.points = new Decimal(0)
        player.ap.total = new Decimal(0)
        setBuyableAmount("ap", 11, tierUp("kr", 13) ? getBuyableAmount("ap", 11).div(2).floor() : new Decimal(0))
        if (!tierUp("kr", 12)) player.ap.upgrades = player.ap.upgrades.filter(id => Number(id) < 30)
    },
    upgrades: {
        11: ["Threads", "Routines x3.", 3],
        12: ["Persistent Storage", "A reboot keeps Macros, Recursion and Compiler.", 6],
        13: ["Cache", "A reboot keeps half your Subroutines.", 12],
        14: ["Pipelining", "Subroutines cost half as much.", 24],
        21: ["Hyperthreading", "Threads x2.", 45],
        22: ["Just in Time", "Routines grow with every Thread you've ever made.", 90],
        23: ["Overclock", "Acts 1 to 5 run faster with every Thread you've ever made.", 180],
        24: ["The Halting Problem", "Whether a program ever stops can't be decided in general. This one will. <b>The Last Answer needs it.</b>", 800],
    },
    challenges: {
        81: { name: "Infinite Loop", text: "Routines x0.1.", reward: "Threads x2." },
        82: { name: "Race Condition", text: "Modules don't make Routines faster.", reward: "Every module makes Routines +100% instead of +50%." },
        83: { name: "Memory Leak", text: "Subroutines cost 10x as much.", reward: "Subroutines are x0.1 stronger a level." },
    },
})
