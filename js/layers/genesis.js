// ============================================================
//  ACT 6: GENESIS, the first New Game+
//  Antimatter Dimensions' Reality, retold. After the Heat Death, say "Let there be light" again:
//  a Genesis wipes Acts 1 to 5 and starts a new Loop from the Big Bang. Each Loop runs faster than
//  the last, and opens something new inside the earlier acts.
//
//  Reality Machines -> Light     (lt)  Earned during a Loop: every act ending you reach pays Light
//  Perks            -> Memories  (mm)  One Memory per ending; a perk tree with one column per act
//  Black Hole       -> Singularity (si) Every so often, Acts 1 to 5 run many times as fast for a while
//  Glyphs           -> Constants (cn)  Act 1's deepening (constants.js)
//
//  Act 6 layers use rows 50+ and are never reset by anything. Achievements always survive a Genesis.
// ============================================================

const ACT_LAYERS = {
    1: ["p", "at", "gr", "st", "fu", "pl", "ga", "bh", "de", "hz", "nu", "ps", "as", "qf", "ma", "sw", "dm", "ob", "sl"],
    2: ["life", "c", "mu", "re", "ge", "ad", "hb", "mc", "sy", "in", "pr", "ph", "gt", "eg", "oc", "ho", "hs", "te", "se", "fo", "bd", "fn"],
    3: ["species", "ti", "me", "sn", "ar", "cu", "ix", "cf", "cv", "pz", "sc", "sf"],
    4: ["extinction", "sm", "vg", "kn", "wk", "ex", "dt", "tr", "br", "wn", "ls", "ch"],
    5: ["ds", "pb", "hv", "dr", "sq", "pj", "un", "mv", "tl", "sg", "wh", "tf", "hp", "fl"],
}
const LAYER_ACT = {}
for (let a in ACT_LAYERS) for (let l of ACT_LAYERS[a]) LAYER_ACT[l] = Number(a)

// Branches you play against the clock (catch it while it lasts, tap in time, answer before it's too late)
// keep their own pace, so a faster act never makes them harder
const SPEED_EXEMPT = ["nu", "ps", "sw", "ph", "oc", "ho", "hs", "te", "ix", "cv", "tr", "sg"]

const GENESIS_LAYERS = ["gn", "lt", "mm", "si", "cn", "gx", "dv", "mx", "vi", "er"]

function genesisUnlocked() {
    return !!(player.lt && (player.lt.genesis > 0 || (player.mv && player.mv.heatDeath)))
}

// ------------------------------------------------------------
//  TIME. Each act has its own speed: Light buys it, and the Singularity multiplies all of them
// ------------------------------------------------------------
function actSpeed(act) {
    if (!player.lt || !genesisUnlocked()) return 1
    let s = 1 + 0.5 * getBuyableAmount("lt", 10 + act).toNumber()
    if (hasUpgrade("lt", 35)) s *= 1.5
    if (act == 2 && hasMilestone("lt", 1)) s *= 1.25
    if (act == 3 && hasUpgrade("er", 21)) s *= 2
    s *= singularityFactor()
    if (act == 1) s *= constantEffect("tick")
    return s
}

// Called by the game loop once a tick
var actSpeedCache = [1, 1, 1, 1, 1, 1]
function updateActSpeeds() {
    for (let a = 1; a <= 5; a++) actSpeedCache[a] = actSpeed(a)
}

function layerSpeed(layer) {
    let a = LAYER_ACT[layer]
    if (!a || SPEED_EXEMPT.includes(layer)) return 1
    return actSpeedCache[a]
}

// ------------------------------------------------------------
//  ENDINGS. Each one pays Light and a Memory the first time you reach it in a Loop
// ------------------------------------------------------------
const ENDINGS = [
    { key: "hz", act: 1, name: "the Habitable Zone", light: 2, done() { return hasUpgrade("pl", 23) } },
    { key: "tol", act: 2, name: "the Tree of Life", light: 3, done() { return hasUpgrade("mc", 11) } },
    { key: "spark", act: 3, name: "the Spark of Sentience", light: 4, done() { return !!player.ti.sentient } },
    { key: "eternity", act: 4, name: "Eternity", light: 6, done() { return !!player.ex.eternity } },
    { key: "mw", act: 5, name: "the Milky Way", light: 4, done() { return player.pb.explored.gte(GALAXY_SYSTEMS) || player.un.count > 0 || player.mv.collapses > 0 } },
    { key: "virgo", act: 5, name: "the Virgo Supercluster", light: 5, done() { return !!player.un.reachedVirgo } },
    { key: "edge", act: 5, name: "the observable universe", light: 8, done() { return !!player.mv.reachedEdge } },
    { key: "heat", act: 5, name: "the Heat Death", light: 15, done() { return !!player.mv.heatDeath } },
]

function lightMult() {
    let m = new Decimal(1)
    if (hasUpgrade("lt", 12)) m = m.times(1.5)
    if (hasUpgrade("lt", 31)) m = m.times(1 + 0.25 * player.lt.genesis)
    m = m.times(constantEffect("glow")).times(genesisAchievementBonus())
    return m
}

function endingLight(e) {
    return new Decimal(e.light).times(lightMult()).floor().max(1)
}

function endingMemories() {
    return (hasUpgrade("mm", 46) ? 2 : 1) + (hasMilestone("lt", 2) ? 1 : 0)
}

function genesisLight() {
    let g = new Decimal(20).times(lightMult())
    if (hasUpgrade("lt", 33)) g = g.times(2)
    return g.floor()
}

function checkEndings() {
    for (let e of ENDINGS) {
        if (player.lt.endings.includes(e.key) || !e.done()) continue
        player.lt.endings.push(e.key)
        let l = endingLight(e)
        player.lt.points = player.lt.points.add(l)
        player.lt.total = player.lt.total.add(l)
        player.mm.points = player.mm.points.add(endingMemories())
        player.mm.total = player.mm.total.add(endingMemories())
        if (player.lt.genesis > 0) {
            player.lt.splits[e.key] = player.lt.loopTime
            if (player.lt.best[e.key] === undefined || player.lt.loopTime < player.lt.best[e.key]) player.lt.best[e.key] = player.lt.loopTime
        }
        if (player.lt.genesis > 0) doPopup("none", "+" + formatWhole(l) + " Light and +" + endingMemories() + " Memor" + (endingMemories() == 1 ? "y" : "ies"), "You reached " + e.name, 3, "#fff4c2")
        else if (player.lt.endings.length == ENDINGS.length) doPopup("none", "Every ending of your first universe pays Light and a Memory. Open Genesis to begin again.", "Act 6: Genesis", 5, "#fff4c2")
    }
}

// ------------------------------------------------------------
//  GENESIS
// ------------------------------------------------------------
// Each Loop opens the next act's deepening, and its Genesis also needs that deepening's goal
const LOOP_GOALS = {
    2: { name: "Fully Vestigial", text: "every Devolution node at level 5", done() { return devolutionLevels() >= 50 } },
    3: { name: "The Phanerozoic", text: "survive all of the Big Five and reach the 10th Geological Era", done() { return bigFiveBeaten() >= 5 && player.er.count >= 10 } },
}

function loopGoal() {
    return LOOP_GOALS[player.lt.genesis]
}

function canGenesis() {
    return genesisUnlocked() && player.mv.heatDeath && (!loopGoal() || loopGoal().done())
}

function doGenesis() {
    if (!canGenesis()) return
    checkEndings()
    let g = genesisLight()
    player.lt.points = player.lt.points.add(g)
    player.lt.total = player.lt.total.add(g)
    player.mm.points = player.mm.points.add(2)
    player.mm.total = player.mm.total.add(2)
    if (player.lt.genesis > 0) {
        player.lt.history.unshift({ n: player.lt.genesis, time: player.lt.loopTime, light: player.lt.loopLight.add(g).toNumber() })
        if (player.lt.history.length > 10) player.lt.history.pop()
        if (player.lt.fastest === null || player.lt.loopTime < player.lt.fastest) player.lt.fastest = player.lt.loopTime
    }
    player.lt.genesis++
    rememberLoop()
    genesisReset()
}

// What a Memory needs to know about the Loop that just ended, before it's wiped
function rememberLoop() {
    for (let id of ["11", "12", "21", "22", "31", "32"]) if (hasChallenge("hz", id) && !player.mm.hazards.includes(id)) player.mm.hazards.push(id)
    for (let id of PRESSURE_IDS) if (hasChallenge("pz", id) && !player.mm.pressures.includes(id)) player.mm.pressures.push(id)
    player.mm.deepTime = player.dt.upgrades.map(Number)
    player.cn.loopBest = new Decimal(0)
    player.cn.measured = 0
    player.dv.loopCount = 0
    player.mx.runTime = 0
}

function genesisKeeps() {
    let keep = ["a"].concat(GENESIS_LAYERS)
    if (hasUpgrade("mm", 16)) keep.push("ob", "sl")
    if (hasUpgrade("mm", 26)) keep.push("fo", "fn", "sc", "sf")
    if (hasUpgrade("mm", 36)) keep.push("ls", "ch", "hp", "fl")
    return keep
}

function genesisReset() {
    let keep = genesisKeeps()
    let fresh = getStartPlayer()
    for (let l in layers) {
        if (keep.includes(l) || !fresh[l]) continue
        player[l] = fresh[l]
    }
    player.points = fresh.points
    player.dna = fresh.dna
    player.biomass = fresh.biomass
    player.earned = {}
    player.lt.endings = []
    player.lt.splits = {}
    player.lt.loopTime = 0
    player.lt.loopLight = new Decimal(0)
    // The end screen comes back when this Loop reaches the Heat Death
    player.keepGoing = false
    tmp.gameEnded = false
    headStarts()
    updateTemp()
}

function grantMilestones(layer, ids) {
    for (let id of ids) if (!player[layer].milestones.includes(String(id))) player[layer].milestones.push(String(id))
}

// What your Memories give each new Loop to start with
function headStarts() {
    if (hasUpgrade("mm", 11)) grantMilestones("st", [0, 1, 2])
    if (hasUpgrade("mm", 21)) grantMilestones("ga", [0, 1, 2])
    if (hasUpgrade("mm", 41)) for (let id of player.mm.hazards) player.hz.challenges[id] = 1
    act2HeadStarts()
    if (hasUpgrade("mm", 13)) for (let id of player.mm.pressures) player.pz.challenges[id] = 1
    if (hasUpgrade("mm", 23)) grantMilestones("pz", [0])
    if (hasUpgrade("mm", 33)) player.biomass = new Decimal(1e50)
    if (hasUpgrade("mm", 43)) for (let id in layers.ti.upgrades) if (!isNaN(id) && !player.ti.upgrades.includes(Number(id))) player.ti.upgrades.push(Number(id))
    if (hasUpgrade("mm", 14)) grantMilestones("ex", [0, 1, 2, 3])
    if (hasUpgrade("mm", 24)) for (let id of player.mm.deepTime) if (!player.dt.upgrades.includes(id)) player.dt.upgrades.push(id)
    if (hasUpgrade("mm", 15)) { grantMilestones("hv", [0, 1, 2, 3, 4, 5]); grantMilestones("pb", [1, 2, 4]) }
    if (hasUpgrade("mm", 25)) { grantMilestones("un", [0, 1, 2, 3]); grantMilestones("mv", [0, 1, 2, 3]) }
}

// Act 1's one-time choices, made for you once you've remembered them
function act1Choices() {
    if (!hasUpgrade("mm", 41) || player.mm.choicesOff) return
    if (player.ga && player.ga.shapes) {
        let shapes = Object.keys(GALAXY_SHAPES)
        player.ga.next = shapes.reduce((a, s) => player.ga.shapes[s] < player.ga.shapes[a] ? s : a, shapes[0])
    }
    if (player.pl && player.pl.unlocked) {
        while (unplacedPlanets() >= 1) {
            if (player.pl.orbits.hab < 5) { player.pl.orbits.hab++; continue }
            let order = ["inner", "hab", "frost", "outer"]
            let o = order.reduce((a, b) => player.pl.orbits[b] < player.pl.orbits[a] ? b : a)
            player.pl.orbits[o]++
        }
    }
}

function loopName() {
    return player.lt.genesis == 0 ? "your first universe" : "Loop " + player.lt.genesis
}

function genesisHeader() {
    return "<h2 style='color:#fff4c2'>Act 6: Genesis</h2><br>You have <h2 style='color:#fff4c2;text-shadow:0 0 10px #fff4c2'>" + formatWhole(player.lt.points) +
        "</h2> Light and " + formatWhole(player.mm.points) + " Memories. This is " + loopName() + (player.lt.genesis > 0 ? " (" + formatTime(player.lt.loopTime) + " so far)" : "") + "."
}

// ------------------------------------------------------------
//  THE GENESIS TREE (opened from the "Genesis" node next to Diaspora)
// ------------------------------------------------------------
addLayer("gn", {
    name: "genesis",
    symbol: "Gn",
    row: "side",
    position: 5,
    color: "#fff4c2",
    startData() { return { unlocked: true, points: new Decimal(0) } },
    type: "none",
    leftTab: true,
    previousTab: "tree-tab",
    layerShown() { return genesisUnlocked() },
    tooltip() { return "Act 6: Genesis" },
    nodeStyle: { "font-size": "26px", color: "#3a3220" },
    tabFormat: [
        "blank",
        ["display-text", function() { return genesisHeader() }],
        "blank",
        ["display-text", function() { return genesisGuide() }],
        "blank",
        ["tree", [["lt"], ["mm", "si"]]],
    ],
})

function genesisGuide() {
    if (player.lt.genesis == 0) return "The last stars are out. Open <b>Light</b> and say \"Let there be light\" to start again from the Big Bang, keeping your achievements, Light and Memories."
    let next = ENDINGS.find(e => !player.lt.endings.includes(e.key))
    let speeds = []
    for (let a = 1; a <= 5; a++) speeds.push("Act " + a + " x" + format(actSpeedCache[a], 2))
    let goal = loopGoal() ? "<br>This Loop's goal: <b>" + loopGoal().name + "</b>, " + loopGoal().text + (loopGoal().done() ? " ✓" : "") + "." : ""
    return (next ? "Next ending: <b>" + next.name + "</b> (+" + formatWhole(endingLight(next)) + " Light). " : canGenesis() ? "Every ending reached: the Genesis is ready. " : "Every ending reached. ") + goal + "<br>Speeds: " + speeds.join(", ")
}

// ------------------------------------------------------------
//  LIGHT
// ------------------------------------------------------------
function lightUpgrade(title, description, cost, extra = {}) {
    return Object.assign({ title: title, description: description, cost: new Decimal(cost) }, extra)
}

function speedCost(n) {
    let c = Decimal.pow(2, n).times(4)
    if (hasUpgrade("lt", 25)) c = c.div(2)
    return c.ceil()
}

const ACT_SPEED_NAMES = { 1: ["Dawn", "The Cosmos"], 2: ["Spring", "Life"], 3: ["Bloom", "Species"], 4: ["Fire", "Extinction"], 5: ["Voyage", "Diaspora"] }

addLayer("lt", {
    name: "light",
    symbol: "Lt",
    row: 50,
    position: 0,
    color: "#fff4c2",
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        total: new Decimal(0),
        genesis: 0,
        endings: [],
        splits: {},
        best: {},
        loopTime: 0,
        loopLight: new Decimal(0),
        fastest: null,
        history: [],
    }},
    type: "none",
    resource: "Light",
    layerShown() { return genesisUnlocked() },
    tooltip() { return formatWhole(player.lt.points) + " Light" },
    nodeStyle: { color: "#3a3220" },
    update(diff) {
        if (!genesisUnlocked()) return
        // Head starts can make a layer passive before its first reset; it still counts as found
        if (player.lt.genesis > 0) for (let a in ACT_LAYERS) for (let l of ACT_LAYERS[a]) {
            let d = player[l]
            if (d && !d.unlocked && d.points instanceof Decimal && d.points.gt(0) && layers[l].type != "none") d.unlocked = true
        }
        let before = player.lt.points
        checkEndings()
        player.lt.loopLight = player.lt.loopLight.add(player.lt.points.sub(before).max(0))
        if (player.lt.genesis > 0) player.lt.loopTime += diff
    },
    automate() {
        if (genesisUnlocked()) act1Choices()
    },
    tabFormat: {
        "Genesis": {
            content: [
                ["display-text", function() { return genesisHeader() }],
                "blank",
                lore("Universe after universe, until the last stars burned out. Then, in the dark, a voice: \"Let there be light.\""),
                "blank",
                ["display-text", function() {
                    return "<b>Genesis</b> starts everything over from the Big Bang: Acts 1 to 5, the museums included. You keep your achievements, Light, Memories, Constants and the Singularity.<br>" +
                        "Every act ending you reach in a Loop pays Light and a Memory, once per Loop. A Genesis pays " + formatWhole(genesisLight()) + " Light and 2 Memories more. It needs the Heat Death."
                }],
                "blank",
                ["clickables", [9]],
                "blank",
                ["display-text", function() { return endingTable() }],
                "blank",
                "milestones",
            ],
        },
        "Upgrades": {
            content: [
                ["display-text", function() { return genesisHeader() }],
                "blank",
                ["display-text", "Light upgrades last forever. Act speeds make one act run faster; each level costs twice as much as the last."],
                "blank",
                ["buyables", [1]],
                "blank",
                "upgrades",
            ],
        },
        "Loops": {
            content: [
                ["display-text", function() { return genesisHeader() }],
                "blank",
                ["display-text", function() { return loopStats() }],
            ],
        },
    },
    clickables: {
        91: {
            title: "Let there be light",
            display() {
                if (canGenesis()) return "Start a new Loop and gain <b>" + formatWhole(genesisLight()) + "</b> Light and 2 Memories."
                if (!player.mv.heatDeath) return "Reach the Heat Death first (the last Multiverse upgrade)." + (loopGoal() ? "<br>This Loop's goal too: " + loopGoal().text + "." : "")
                return "This Loop's goal first: <b>" + loopGoal().name + "</b> (" + loopGoal().text + ")."
            },
            canClick() { return canGenesis() },
            onClick() {
                if (player.lt.genesis == 0 && !confirm("Genesis starts Acts 1 to 5 over from the Big Bang. You keep achievements, Light, Memories, Constants and the Singularity. Ready?")) return
                doGenesis()
            },
            style() { return { width: "300px", height: "120px", "min-height": "120px", "background-color": canGenesis() ? "#fff4c2" : undefined, color: "#3a3220" } },
        },
    },
    buyables: Object.fromEntries([1, 2, 3, 4, 5].map(a => [10 + a, {
        title() { return ACT_SPEED_NAMES[a][0] },
        cost(x) { return speedCost(x) },
        display() {
            let n = getBuyableAmount("lt", this.id).toNumber()
            return "Act " + a + " (" + ACT_SPEED_NAMES[a][1] + ") runs x" + format(1 + 0.5 * n, 1) + " as fast (+0.5x a level).<br>Level " + n + "<br>Cost: " + formatWhole(this.cost()) + " Light"
        },
        canAfford() { return player.lt.points.gte(this.cost()) },
        buy() {
            player.lt.points = player.lt.points.sub(this.cost())
            setBuyableAmount("lt", this.id, getBuyableAmount("lt", this.id).add(1))
        },
        style() { return { width: "140px", height: "120px" } },
    }])),
    upgrades: {
        11: lightUpgrade("Event Horizon", "Unlock the <b>Singularity</b>: every so often, Acts 1 to 5 run many times as fast for a while.", 5),
        12: lightUpgrade("Afterglow", "Light x1.5.", 10),
        13: lightUpgrade("Primordial Fire", "Act 1: energy x1,000.", 3),
        14: lightUpgrade("Ancient DNA", "Act 2: DNA x10.", 6),
        15: lightUpgrade("Living Fossils", "Act 3: Biomass x100,000.", 10),
        21: lightUpgrade("Oral Tradition", "Act 4: Strata x2.", 15, { unlocked() { return player.lt.genesis > 0 } }),
        22: lightUpgrade("Old Signals", "Act 5: Seeds x2 and Realities x1.5.", 20, { unlocked() { return player.lt.genesis > 0 } }),
        23: lightUpgrade("Bright Constants", "Constants are 25% stronger.", 15, { unlocked() { return player.lt.genesis > 0 } }),
        24: lightUpgrade("Accretion Disk", "The Singularity is twice as strong.", 25, { unlocked() { return hasUpgrade("lt", 11) } }),
        25: lightUpgrade("Red Shift", "Act speeds cost half as much.", 30, { unlocked() { return player.lt.genesis > 0 } }),
        31: lightUpgrade("Cosmic Background", "Light +25% for every Genesis you've done.", 40, { unlocked() { return hasUpgrade("lt", 12) && player.lt.genesis > 0 } }),
        32: lightUpgrade("Fine Structure", "+1 Constant slot.", 35, { unlocked() { return player.lt.genesis > 0 } }),
        33: lightUpgrade("Ancient Light", "A Genesis pays twice as much Light.", 50, { unlocked() { return player.lt.genesis > 0 } }),
        34: lightUpgrade("Time Crystals", "The Singularity lasts twice as long.", 60, { unlocked() { return hasUpgrade("lt", 24) } }),
        35: lightUpgrade("Clockwork Universe", "Acts 1 to 5 run 1.5x as fast.", 80, { unlocked() { return player.lt.genesis > 0 } }),
        41: lightUpgrade("Genetic Memory", "Base Pairs x2.", 60, { unlocked() { return player.lt.genesis > 0 } }),
        42: lightUpgrade("Atavism", "Vestiges x2.", 90, { unlocked() { return player.lt.genesis > 0 } }),
        43: lightUpgrade("Lineage Memory", "Lineages x2.", 120, { unlocked() { return player.lt.genesis >= 2 } }),
        44: lightUpgrade("Viral Load", "Viruses copy themselves twice as often.", 150, { unlocked() { return player.lt.genesis >= 2 } }),
    },
    milestones: {
        0: { requirementDescription: "1 Genesis", effectDescription: "Dissolving a constant leaves twice the Echo.", done() { return player.lt.genesis >= 1 } },
        1: { requirementDescription: "Reach the Tree of Life within 2 hours of a Genesis", effectDescription: "Act 2 runs 1.25x as fast.", done() { return player.lt.genesis > 0 && player.lt.best.tol !== undefined && player.lt.best.tol <= 7200 } },
        2: { requirementDescription: "Reach Eternity within 6 hours of a Genesis", effectDescription: "+1 Memory for each ending.", done() { return player.lt.genesis > 0 && player.lt.best.eternity !== undefined && player.lt.best.eternity <= 21600 } },
    },
})

function endingTable() {
    let rows = ENDINGS.map(e => {
        let got = player.lt.endings.includes(e.key)
        let split = player.lt.splits[e.key] !== undefined ? formatTime(player.lt.splits[e.key]) : (got ? "reached" : "")
        let best = player.lt.best[e.key] !== undefined ? formatTime(player.lt.best[e.key]) : "-"
        return "<tr style='opacity:" + (got ? 1 : 0.6) + "'><td style='text-align:left;padding:2px 10px'>Act " + e.act + ": " + e.name + "</td><td style='padding:2px 10px'>" + (got ? "✓ " : "") + formatWhole(endingLight(e)) + " Light</td><td style='padding:2px 10px'>" + split + "</td><td style='padding:2px 10px'>" + best + "</td></tr>"
    })
    return "<table style='margin:auto'><tr><th style='text-align:left;padding:2px 10px'>Ending</th><th>Pays</th><th>This Loop</th><th>Best</th></tr>" + rows.join("") + "</table>"
}

function loopStats() {
    let s = "Genesis count: <b>" + player.lt.genesis + "</b><br>Light earned in all: " + formatWhole(player.lt.total) + "<br>Memories earned in all: " + formatWhole(player.mm.total) + "<br>"
    if (player.lt.fastest !== null) s += "Fastest Loop: " + formatTime(player.lt.fastest) + "<br>"
    if (player.lt.history.length) {
        s += "<br><b>Last Loops</b><br>"
        for (let h of player.lt.history) s += "Loop " + h.n + ": " + formatTime(h.time) + ", " + formatWhole(h.light) + " Light<br>"
    }
    return s
}

// ------------------------------------------------------------
//  MEMORIES: a perk tree. Each column is one act, and a perk opens the one below it
// ------------------------------------------------------------
const MEMORY_COLUMNS = { 1: "Act 1<br>Cosmos", 2: "Act 2<br>Life", 3: "Act 3<br>Species", 4: "Act 4<br>Extinction", 5: "Act 5<br>Diaspora", 6: "Museums" }

const MEMORIES = {
    11: ["Remembered Particles", "Every Loop starts with the first three Row 2 milestones (Particle upgrades kept and bought on their own, Particles made passively)."],
    21: ["Remembered Galaxies", "Every Loop starts with the first three Row 3 milestones (Stars and Planets come on their own)."],
    31: ["Constant Watch", "Constants are measured on their own, and +1 Constant slot."],
    41: ["Cosmic Instinct", "Every Loop starts with each Cosmic Hazard you've ever survived. Galaxy shapes and planet orbits are chosen for you (the Habitable orbit first)."],
    12: ["Inherited Traits", "Every Loop starts with Act 2's first three Row 3 milestones and all three Mutation milestones."],
    22: ["Ancestral Body", "Every Loop starts with Act 2's first three Row 4 milestones."],
    32: ["Inherited Genome", "Every Loop (and every devolution) starts with 5 copies of your chosen trait."],
    42: ["Old Body", "Every Loop starts with the Multicellular milestone that makes forms on their own."],
    13: ["Old Instincts", "Every Loop starts with each Selection Pressure you've ever beaten, and its Instinct."],
    23: ["Evolutionary Memory", "Every Loop starts with the Selection Pressure milestone: Evolutionary milestones and Metabolism upgrades are bought on their own."],
    33: ["Quick Spark", "Every Loop starts Act 3 with 1e50 Biomass."],
    43: ["Long Lineage", "Every Loop starts with every Evolutionary milestone already bought."],
    14: ["Oral History", "Every Loop starts with Act 4's first four Extinction milestones."],
    24: ["Deep Memory", "Every Loop starts with the Deep Time upgrades you had when the last one ended."],
    15: ["Flight Plans", "Every Loop starts with Harvest's first six milestones and the Probe milestones that launch, calibrate and upgrade on their own."],
    25: ["Remembered Universes", "Every Loop starts with the first four Universe and Multiverse milestones."],
    16: ["The Observatory", "A Genesis keeps the Observatory and the Star Log."],
    26: ["The Fossil Record", "A Genesis keeps the Fossil Record, Specimen Collection and both Field Notes."],
    36: ["The Hall of Fame", "A Genesis keeps Lost Species, the Chronicle, the Hall of Probes and the Flight Log."],
    46: ["Long Memory", "Every ending pays 2 Memories instead of 1."],
}

// The perk grid, with gaps kept so every column stays under its act
function memoryGrid() {
    let rows = []
    for (let c = 1; c <= 6; c++) {
        let row = [["display-text", "<div style='display:inline-block;width:80px;font-size:12px;opacity:0.8;text-align:center'>" + MEMORY_COLUMNS[c] + "</div>"]]
        for (let r = 1; r <= 4; r++) row.push(MEMORIES[r * 10 + c] ? ["upgrade", r * 10 + c] : ["display-text", "<div style='display:inline-block;width:128px'></div>"])
        rows.push(["row", row])
    }
    return rows
}

function memoryCost(id) {
    return new Decimal(Math.floor(id / 10))
}

addLayer("mm", {
    name: "memories",
    symbol: "Mm",
    row: 51,
    position: 0,
    color: "#d9c8ff",
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        total: new Decimal(0),
        hazards: [],
        pressures: [],
        deepTime: [],
        choicesOff: false,
    }},
    type: "none",
    resource: "Memories",
    branches: ["lt"],
    layerShown() { return genesisUnlocked() },
    tooltip() { return formatWhole(player.mm.points) + " Memories" },
    tabFormat: [
        ["display-text", function() { return genesisHeader() }],
        "blank",
        lore("Some things survive the end of everything. Not much: a habit, a shape, a half-remembered way of doing things."),
        "blank",
        ["display-text", "Memories last forever. Each row belongs to one act; a perk opens the next one along, and costs as many Memories as its place in the row. Most take effect from the next Loop."],
        "blank",
    ].concat(memoryGrid()).concat([
        "blank",
        ["clickables", [1]],
    ]),
    clickables: {
        11: {
            title: "Act 1's choices",
            display() { return player.mm.choicesOff ? "Made by hand" : "Made for you" },
            unlocked() { return hasUpgrade("mm", 41) },
            canClick() { return true },
            onClick() { player.mm.choicesOff = !player.mm.choicesOff },
            style() { return { width: "160px", "min-height": "50px", height: "50px" } },
        },
    },
    upgrades: Object.fromEntries(Object.entries(MEMORIES).map(([id, m]) => [id, {
        title: m[0],
        description: m[1],
        cost: memoryCost(Number(id)),
        canAfford() { let above = Number(id) - 10; return above < 11 || hasUpgrade("mm", above) },
        style: { width: "120px", height: "150px", "font-size": "9px" },
    }])),
})

// ------------------------------------------------------------
//  THE SINGULARITY: AD's Black Hole. Real time passes in cycles: a long quiet stretch, then a
//  burst where Acts 1 to 5 run many times as fast
// ------------------------------------------------------------
function singularityStats() {
    let p = 4 * Math.pow(1.4, getBuyableAmount("si", 11).toNumber())
    let d = 15 * Math.pow(1.25, getBuyableAmount("si", 12).toNumber())
    let i = Math.max(10, 300 * Math.pow(0.85, getBuyableAmount("si", 13).toNumber()))
    if (hasUpgrade("lt", 24)) p *= 2
    if (hasUpgrade("lt", 34)) d *= 2
    return { power: p, duration: d, interval: i }
}

function singularityActive() {
    if (!player.si || !hasUpgrade("lt", 11) || player.si.paused) return false
    return player.si.phase >= singularityStats().interval
}

function singularityFactor() {
    return singularityActive() ? singularityStats().power : 1
}

// The average speed over a whole cycle
function singularityAverage() {
    let s = singularityStats()
    return (s.interval + s.duration * s.power) / (s.interval + s.duration)
}

function siBuyable(title, base, text) {
    return {
        title: title,
        cost(x) { return Decimal.pow(2, x).times(base).ceil() },
        display() { return text() + "<br>Level " + formatWhole(getBuyableAmount("si", this.id)) + "<br>Cost: " + formatWhole(this.cost()) + " Light" },
        canAfford() { return player.lt.points.gte(this.cost()) },
        buy() {
            player.lt.points = player.lt.points.sub(this.cost())
            setBuyableAmount("si", this.id, getBuyableAmount("si", this.id).add(1))
        },
        style() { return { width: "160px", height: "120px" } },
    }
}

addLayer("si", {
    name: "singularity",
    symbol: "Si",
    row: 51,
    position: 1,
    color: "#9b7bff",
    startData() { return { unlocked: true, points: new Decimal(0), phase: 0, paused: false } },
    type: "none",
    branches: ["lt"],
    layerShown() { return genesisUnlocked() && hasUpgrade("lt", 11) },
    tooltip() { return singularityActive() ? "Active: x" + format(singularityStats().power, 1) : "Quiet" },
    update(diff) {
        if (!hasUpgrade("lt", 11) || player.si.paused) return
        let s = singularityStats()
        player.si.phase += diff
        if (player.si.phase >= s.interval + s.duration) player.si.phase = (player.si.phase - s.interval - s.duration) % (s.interval + s.duration)
    },
    tabFormat: [
        ["display-text", function() { return genesisHeader() }],
        "blank",
        lore("Everything that ever fell in is still falling. Near the edge, a moment outside is an age within."),
        "blank",
        ["display-text", function() {
            let s = singularityStats()
            let state = player.si.paused ? "<b>Paused.</b>" : singularityActive() ? "<b style='color:#9b7bff'>Active</b> for " + formatTime(s.interval + s.duration - player.si.phase) + " more: Acts 1 to 5 run x" + format(s.power, 2) + " as fast."
                : "Quiet. The next burst comes in " + formatTime(s.interval - player.si.phase) + "."
            return state + "<br>Every " + formatTime(s.interval) + " of real time, the Singularity flares for " + formatTime(s.duration) + ". On average it makes Acts 1 to 5 x" + format(singularityAverage(), 2) + " as fast."
        }],
        "blank",
        "buyables",
        "blank",
        "clickables",
    ],
    buyables: {
        11: siBuyable("Mass", 5, () => "Bursts are x1.4 stronger. Now x" + format(singularityStats().power, 2) + "."),
        12: siBuyable("Spin", 5, () => "Bursts last 25% longer. Now " + formatTime(singularityStats().duration) + "."),
        13: siBuyable("Accretion", 5, () => "Bursts come 15% sooner (10 seconds at the soonest). Now every " + formatTime(singularityStats().interval) + "."),
    },
    clickables: {
        11: {
            title() { return player.si.paused ? "Resume" : "Pause" },
            display() { return "Pausing stops the clock: save a burst for when you need it." },
            canClick() { return true },
            onClick() { player.si.paused = !player.si.paused },
            style() { return { width: "160px", "min-height": "80px", height: "80px" } },
        },
    },
})
