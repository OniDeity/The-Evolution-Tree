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
// and try the next challenge right after a prestige; give up after 30 minutes, try again 2 prestiges later
function tierAutomation(l) {
    let c = DEEP_TIERS[l]
    if (!c.shown()) return
    for (let id in c.upgrades) if (!hasUpgrade(l, id) && tmp[l].upgrades[id] && tmp[l].upgrades[id].unlocked && canAffordUpgrade(l, id)) buyUpg(l, id)
    let d = player[l]
    d.failed = d.failed || {}
    if (d.challenge) {
        if (d.time > 1800) { d.failed[d.challenge] = d.count; d.challenge = 0 }
        return
    }
    let g = c.gain()
    if (g.gte(1) && g.gte(d.total.times(0.5))) {
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
        24: ["The First Cell", "Life, from nothing at all. <b>Loop 2's goal.</b>", 150],
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
    let g = new Decimal(Math.pow(player.er.total.add(1).log10().toNumber(), 2))
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
        24: ["The Great Unconformity", "A billion years missing from the rock, and life none the worse for it. <b>Loop 3's goal.</b>", 150],
    },
    challenges: {
        81: { name: "Ice Age", text: "Lineages x0.01.", reward: "Cratons x2." },
        82: { name: "Volcanic Winter", text: "Act 3 runs 100x slower.", reward: "Eons x3." },
        83: { name: "Sterile Seas", text: "Viruses do nothing.", reward: "Lineages x10." },
    },
})
