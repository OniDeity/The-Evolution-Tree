// ============================================================
//  ACT 5, PART 4: THE MULTIVERSE AND THE HEAT DEATH (v2.4)
//
//  Multiverse (mv): the second Act 5 reset. Once you've mapped the observable universe, collapse the
//                   multiverse for Realities. It starts everything in Act 5 over, Universes included.
//                   The last Multiverse upgrade, "Let There Be Light", is the Heat Death: the end of Act 5.
//  Trials     (tl): eight universes with harder rules. Reach 1e18 systems to win a permanent reward.
//  Branches:  Signals (sg), off Probes:   tune in to a transmission before it fades
//             Wormholes (wh), off Drift:  three wormholes open; jump through one and see where it leads
//             Terraforming (tf), off Harvest: find a world's ideal climate from hot-and-cold feedback
//  Hall of Probes (hp): a museum of real probes and ships, found by reaching milestones
// ============================================================

function multiverseUnlocked() {
    return !!(player.mv && (player.mv.reachedEdge || player.mv.collapses > 0))
}

// ------------------------------------------------------------
//  MULTIVERSE
// ------------------------------------------------------------
const MV_UPGRADES = upgradeTable([
    [["Brane Echoes", "seeds", "x", 1.5], ["Fast Forward", "speed", "x", 2], ["Remembered Swarm", "replicate", "x", 1e3], ["Remembered Maps", "explore", "x", 1e3], ["Brane Trust", "trust", "+", 5]],
    [["Sister Universes", "seeds", "x", 2], ["Time Dilation", "speed", "x", 2], ["Many Hands", "all", "x", 1e6], ["Thinking Across Branes", "yomi", "x", 100], ["Old Wars", "combat", "x", 1e3]],
    [["Seed Showers", "seeds", "x", 2], ["Relativity", "speed", "x", 3], ["Charts of Nowhere", "nav", "x", 3], ["Honor Across Worlds", "honor", "x", 1e4], ["Faith in Many Worlds", "trust", "+", 10]],
    [["Cosmic Gardens", "seeds", "x", 3], ["Hyperspace", "speed", "x", 3], ["Inflaton Field", "explore", "x", 1e6], ["Fecund Universes", "replicate", "x", 1e6], ["Mindful Multiverse", "compute", "x", 1e3]],
    [["Seeds of Seeds", "seeds", "x", 3], ["Eternal Recurrence", "speed", "x", 5], ["Reality Echo", "realities", "x", 2], ["The Great Attractor", "trust", "+", 20], ["Many-Worlds Industry", "all", "x", 1e9]],
    [["Reality Bloom", "realities", "x", 3], ["Entropy Engines", "speed", "x", 10], ["Infinite Seeds", "seeds", "x", 5], ["The Long Dark", "hazard", "/", 1e6],
        ["Let There Be Light", "special", "x", 1, "The last stars go out. In the dark, the swarm asks one more question, and finally has the answer. <b>Finish Act 5.</b>"]],
])

function mvUpgradeCost(n) {
    if (n == 29) return new Decimal(500)
    return Decimal.pow(10, n * 0.075).round()
}

function realityMult() {
    let m = spaceMult("mv", MV_UPGRADES, "realities")
    if (hasMilestone("mv", 5)) m = m.times(2)
    if (hasMilestone("mv", 7)) m = m.times(3)
    return m.times(hallBonus().realities).times(hasUpgrade("lt", 22) ? 1.5 : 1).times(hasUpgrade("rv", 12) ? 2 : 1)
}

// Realities come from all the Seeds you've planted since the last collapse: the square of their digits, less 2
function realityGain() {
    if (!player.mv || player.mv.cycleSeeds.lt(1000)) return new Decimal(0)
    return new Decimal(Math.pow(player.mv.cycleSeeds.log10().toNumber() - 2, 2)).times(realityMult()).floor()
}

// Every Reality you've ever earned makes Seeds worth more and Act 5 faster
function realityBoosts() {
    let t = player.mv ? player.mv.total.toNumber() : 0
    return { seeds: 1 + Math.sqrt(t), speed: 1 + Math.sqrt(t) }
}

function mvSpeed() {
    if (!player.mv) return 1
    return spaceMult("mv", MV_UPGRADES, "speed").toNumber() * realityBoosts().speed * wormholeSpeed() * (spaceTrialDone(24) ? 1.5 : 1) * (inSpaceTrial(24) ? 0.5 : 1)
}

function mvSeedMult() {
    if (!player.mv) return new Decimal(1)
    return new Decimal(realityBoosts().seeds).times(hallBonus().seeds).times(gardenBonus()).times(spaceTrialDone(11) ? 2 : 1).times(hasUpgrade("lt", 22) ? 2 : 1).times(hasUpgrade("rv", 12) ? 3 : 1)
}

function collapseMultiverse() {
    let gain = realityGain()
    if (gain.lt(1)) return
    player.mv.realities = player.mv.realities.add(gain)
    player.mv.total = player.mv.total.add(gain)
    player.mv.best = player.mv.best.max(gain)
    player.mv.collapses++
    player.mv.cycleSeeds = new Decimal(0)
    player.fl.collapseTime = 0

    let keepSeeds = hasMilestone("mv", 3) ? player.un.seeds.times(0.1) : new Decimal(0)
    let keepUn = ["plan", "followPlan", "auto", "autoMult", "reachedVirgo"]
    if (hasMilestone("mv", 0)) keepUn.push("milestones", "collected", "count")
    if (hasMilestone("mv", 2)) keepUn.push("upgrades")
    resetKeeping("un", keepUn)
    player.un.seeds = keepSeeds
    player.un.totalSeeds = keepSeeds
    universeWipe(true)
}

addLayer("mv", {
    name: "multiverse",
    symbol: "Mv",
    row: 43,
    position: 1,
    color: "#ffd966",
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        realities: new Decimal(0),
        total: new Decimal(0),
        best: new Decimal(0),
        collapses: 0,
        cycleSeeds: new Decimal(0),
        reachedEdge: false,
        heatDeath: false,
    }},
    type: "none",
    branches: ["un"],
    layerShown() { return spaceUnlocked() && multiverseUnlocked() },
    tooltip() { return formatWhole(player.mv.realities) + " Realities" },
    update(diff) {
        if (spaceUnlocked() && player.pb.explored.gte(UNIVERSE_SYSTEMS)) player.mv.reachedEdge = true
    },
    tabFormat: {
        "Multiverse": {
            content: [
                ["display-text", function() { return multiverseHeader() }],
                "blank",
                lore("Every universe is one bubble in a foam that goes on forever. Collapse the foam, and start again with everything you've learned."),
                "blank",
                ["display-text", function() {
                    let b = realityBoosts()
                    return "<b>Collapse the multiverse</b> for Realities. It starts everything in Act 5 over, Universes and Seeds included (milestones decide what survives). Acts 1 to 4 are never touched.<br>" +
                        "Realities come from the Seeds you've planted since the last collapse: " + format(player.mv.cycleSeeds) + " so far. 1,000 Seeds make 1 Reality, and every power of 10 after that makes more (the square of their digits, less 2).<br>" +
                        "Every Reality you've ever earned makes Seeds worth more (x" + format(b.seeds, 2) + ") and Act 5 faster (x" + format(b.speed, 2) + ")."
                }],
                "blank",
                ["clickables", [9]],
                "blank",
                "milestones",
            ],
        },
        "Upgrades": {
            content: [
                ["display-text", function() { return multiverseHeader() }],
                "blank",
                ["display-text", "Multiverse upgrades last through every collapse. A new row shows once you've bought 3 from the row above it. The last one ends Act 5."],
                "blank",
                "upgrades",
            ],
        },
    },
    clickables: {
        91: {
            title: "Collapse the multiverse",
            display() { let g = realityGain(); return g.lt(1) ? "Plant 1,000 Seeds first." : "Gain <b>" + formatWhole(g) + "</b> Realities." },
            canClick() { return realityGain().gte(1) },
            onClick() { collapseMultiverse() },
            style() { return { width: "260px", height: "100px", "min-height": "100px" } },
        },
    },
    upgrades: Object.fromEntries(Object.keys(MV_UPGRADES).map(id => {
        let u = spaceUpgrade("mv", MV_UPGRADES, id, "Realities", mvUpgradeCost, n => function() { return rowUnlocked("mv", n) })
        u.currencyInternalName = "realities"
        u.currencyLayer = "mv"
        if (MV_UPGRADES[id].target == "special") {
            u.description = MV_UPGRADES[id].text
            u.onPurchase = function() { player.mv.heatDeath = true }
        }
        if (MV_UPGRADES[id].target == "speed") u.description = "Act 5 runs x" + format(MV_UPGRADES[id].value) + " as fast."
        if (MV_UPGRADES[id].target == "realities") u.description = "Realities x" + format(MV_UPGRADES[id].value) + "."
        return [id, u]
    })),
    milestones: {
        0: { requirementDescription: "1 collapse", effectDescription: "Keep Universe milestones, how many universes you've consumed, and which kinds.", done() { return player.mv.collapses >= 1 } },
        1: { requirementDescription: "2 collapses", effectDescription: "Universes are consumed on their own (see the Universes tab).", done() { return player.mv.collapses >= 2 } },
        2: { requirementDescription: "3 collapses", effectDescription: "Keep Seed upgrades.", done() { return player.mv.collapses >= 3 } },
        3: { requirementDescription: "4 collapses", effectDescription: "A collapse leaves you with 10% of your Seeds.", done() { return player.mv.collapses >= 4 } },
        4: { requirementDescription: "5 collapses", effectDescription: "+10 trust.", done() { return player.mv.collapses >= 5 } },
        5: { requirementDescription: "6 collapses", effectDescription: "Realities x2.", done() { return player.mv.collapses >= 6 } },
        6: { requirementDescription: "8 collapses", effectDescription: "Act 5 runs twice as fast.", done() { return player.mv.collapses >= 8 } },
        7: { requirementDescription: "10 collapses", effectDescription: "Realities x3.", done() { return player.mv.collapses >= 10 } },
    },
})

function multiverseHeader() {
    return "<h2 style='color:#ffd966'>Multiverse</h2><br>You have <h2 style='color:#ffd966'>" + formatWhole(player.mv.realities) + "</h2> Realities, from " + formatWhole(player.mv.collapses) + " collapse" + (player.mv.collapses == 1 ? "" : "s") + "."
}

// Consuming universes on their own, once the next one would bring in this many times your current Seeds
const AUTO_CONSUME = [0.5, 1, 2, 5, 10]

function autoConsume() {
    if (!hasMilestone("mv", 1) || !player.un.auto) return
    let target = AUTO_CONSUME[player.un.autoMult || 0]
    let g = seedGain()
    if (g.gte(1) && g.gte(player.un.seeds.max(1).times(target))) {
        let fresh = player.un.offered.find(k => !player.un.collected[k])
        if (fresh) player.un.next = fresh
        resetUniverse()
    }
}

// ------------------------------------------------------------
//  TRIALS
// ------------------------------------------------------------
const SPACE_TRIALS = {
    11: { name: "Lone Probe", text: "You start with one probe and can't launch any more.", reward: "Seed gain x2." },
    12: { name: "Hostile Universe", text: "Drifters copy themselves twice as fast as your probes.", reward: "Combat x1,000." },
    13: { name: "Silent Swarm", text: "The Swarm can't think: no Compute at all.", reward: "Yomi gain x100." },
    14: { name: "Heavy Universe", text: "Hazards are 4 times as deadly.", reward: "Hazards destroy a tenth as many probes." },
    21: { name: "Starless", text: "No power at all: only probe crews work in Harvest.", reward: "Everything in Harvest x1e6." },
    22: { name: "No Templates", text: "Probe upgrades do nothing.", reward: "Probes copy themselves 10% faster." },
    23: { name: "Fog", text: "Navigation is a tenth as fast.", reward: "Navigation x2." },
    24: { name: "Entropy", text: "Act 5 runs at half speed.", reward: "Act 5 runs 1.5x as fast." },
}
const TRIAL_GOAL = new Decimal(1e18)

function inSpaceTrial(id) {
    return !!(player.tl && player.tl.activeChallenge == id)
}

function spaceTrialDone(id) {
    return !!(player.tl && hasChallenge("tl", id))
}

function spaceTrialsBeaten() {
    return player.tl ? Object.keys(SPACE_TRIALS).filter(id => hasChallenge("tl", id)).length : 0
}

addLayer("tl", {
    name: "trials",
    symbol: "Tr",
    row: 42,
    position: 2,
    color: "#cc4125",
    startData() { return { unlocked: true, points: new Decimal(0) } },
    type: "none",
    branches: ["un"],
    layerShown() { return spaceUnlocked() && (player.un.count >= 5 || spaceTrialsBeaten() > 0) },
    tooltip() { return spaceTrialsBeaten() + " / 8 Trials" },
    automate() {
        // Like the other challenges in this game, reaching the goal wins straight away
        let a = player.tl.activeChallenge
        if (a && canCompleteChallenge("tl", a)) startChallenge("tl", a)
    },
    tabFormat: [
        ["display-text", function() { return "<h2 style='color:#cc4125'>Trials</h2><br>You've beaten <h2 style='color:#cc4125'>" + spaceTrialsBeaten() + "</h2> of 8 Trials." }],
        "blank",
        lore("Some universes are hard places to live. A swarm that can thrive there can thrive anywhere."),
        "blank",
        ["display-text", "Each Trial is a universe with harder rules. Entering or leaving one starts a new universe without planting Seeds. Explore " + format(TRIAL_GOAL) + " systems to win a permanent reward."],
        "blank",
        "challenges",
    ],
    challenges: Object.fromEntries(Object.entries(SPACE_TRIALS).map(([id, t]) => [id, {
        name: t.name,
        challengeDescription: t.text,
        goalDescription() { return format(TRIAL_GOAL) + " systems explored" },
        canComplete() { return player.pb.explored.gte(TRIAL_GOAL) },
        rewardDescription: t.reward,
        onEnter() { universeWipe(false) },
        onExit() { universeWipe(false) },
        style() { return { width: "240px", height: "240px" } },
    }])),
})

// ------------------------------------------------------------
//  SIGNALS. Every so often a transmission arrives: a short pattern of symbols. Tap the symbols back
//  in the same order before it fades. Longer patterns and faster decoding earn more Contact.
// ------------------------------------------------------------
const SIGNAL_SYMBOLS = ["▲", "●", "■", "◆"]
const SIGNAL_COLORS = ["#e06666", "#f1c232", "#6fa8dc", "#93c47d"]

function signalLife() {
    return hasMilestone("sg", 0) ? 15 : 10
}

// Patterns grow from 3 symbols to 6 as you decode more
function signalLength() {
    return Math.min(6, 3 + Math.floor(player.sg.locks / 10))
}

// At first the pattern hides after 4 seconds, so you have to remember it
function patternVisible() {
    return hasMilestone("sg", 1) || signalLife() - player.sg.timer < 4
}

function newSignal() {
    player.sg.pattern = []
    for (let i = 0; i < signalLength(); i++) player.sg.pattern.push(Math.floor(Math.random() * SIGNAL_SYMBOLS.length))
    player.sg.entered = 0
    player.sg.target = 1
    player.sg.timer = signalLife()
}

function endSignal(gain) {
    player.sg.contact += gain
    player.sg.last = gain
    if (gain > 0) player.sg.locks++
    player.sg.target = null
    player.sg.pattern = []
    player.sg.entered = 0
    player.sg.timer = 10 + Math.random() * 10
}

function signalGain() {
    return 20 * (player.sg.pattern.length / 3) * Math.max(0, player.sg.timer / signalLife())
}

function tapSymbol(n) {
    if (player.sg.target === null) return
    if (player.sg.pattern[player.sg.entered] != n) { endSignal(0); return }
    player.sg.entered++
    if (player.sg.entered >= player.sg.pattern.length) endSignal(signalGain())
}

// Decodes the whole pattern perfectly (the milestone, and older code that "locks on")
function lockOn() {
    if (player.sg.target === null) return
    endSignal(signalGain())
}

function signalTrust() {
    return player.sg ? Math.floor(Math.log10(player.sg.contact + 1) * 2) : 0
}

function signalDisplay() {
    if (player.sg.target === null) return "No signal right now. The next one comes in " + formatTime(Math.max(0, player.sg.timer)) + "." + (player.sg.last > 0 ? "<br>Last one decoded: +" + format(player.sg.last) + " Contact." : player.sg.locks > 0 ? "<br>Last one was lost." : "")
    let shown = player.sg.pattern.map((n, i) => {
        let done = i < player.sg.entered
        let sym = done || patternVisible() ? SIGNAL_SYMBOLS[n] : "?"
        return "<span style='font-size:44px;margin:0 8px;color:" + (done ? "#666" : SIGNAL_COLORS[n]) + "'>" + sym + "</span>"
    }).join("")
    return "<b>A signal!</b> Fading in " + formatTime(player.sg.timer) + ". Worth " + format(signalGain()) + " Contact now.<br>" + shown
}

addLayer("sg", {
    name: "signals",
    symbol: "Sg",
    row: 40,
    position: -1,
    color: "#76a5af",
    startData() { return { unlocked: true, points: new Decimal(0), freq: 50, target: null, timer: 10, contact: 0, last: 0, locks: 0, pattern: [], entered: 0 } },
    type: "none",
    branches: ["pb"],
    layerShown() { return spaceUnlocked() && player.pb.explored.gte(1e6) },
    tooltip() { return player.sg.target !== null ? "A signal!" : format(player.sg.contact) + " Contact" },
    update(diff) {
        if (!tmp.sg.layerShown) return
        player.sg.timer -= diff
        if (player.sg.target === null) {
            if (player.sg.timer <= 0) newSignal()
        } else if (!player.sg.pattern || !player.sg.pattern.length) {
            newSignal()
        } else {
            if (hasMilestone("sg", 2)) lockOn()
            else if (player.sg.timer <= 0) endSignal(0)
        }
    },
    clickables: Object.fromEntries(SIGNAL_SYMBOLS.map((sym, n) => [11 + n, {
        title() { return "<span style='font-size:40px'>" + sym + "</span>" },
        canClick() { return player.sg.target !== null },
        onClick() { tapSymbol(n) },
        style() { return { width: "90px", height: "90px", "min-height": "90px", "background-color": player.sg.target !== null ? SIGNAL_COLORS[n] : undefined } },
    }])),
    milestones: {
        0: { requirementDescription: "30 Contact earned", effectDescription: "Signals last 15 seconds instead of 10.", done() { return earned("sg").gte(30) } },
        1: { requirementDescription: "150 Contact earned", effectDescription: "The pattern stays on screen until you've decoded it.", done() { return earned("sg").gte(150) } },
        2: { requirementDescription: "600 Contact earned", effectDescription: "The receiver decodes every signal by itself, perfectly.", done() { return earned("sg").gte(600) } },
    },
    tabFormat: [
        ["display-text", function() { return "<h2 style='color:#76a5af'>Signals</h2><br>You have <h2 style='color:#76a5af'>" + format(player.sg.contact) + "</h2> Contact, worth <b>+" + signalTrust() + "</b> trust." }],
        "blank",
        lore("Something out there is talking. It might be other swarms. It might be the Drifters. It might be something else."),
        "blank",
        ["display-text", function() { return "<b>Decode:</b> every so often a transmission arrives as a short pattern of symbols. Tap them back in the same order before it fades" + (hasMilestone("sg", 1) ? "" : " (the pattern hides after 4 seconds, so remember it)") + ". One wrong symbol and the signal is lost. Faster decoding and longer patterns (" + signalLength() + " symbols now) earn more Contact." }],
        "blank",
        ["display-text", function() { return signalDisplay() }],
        "blank",
        "clickables",
        "blank",
        "milestones",
    ],
})

// ------------------------------------------------------------
//  WORMHOLES. Every 30 seconds three wormholes open. Jump through one: most lead somewhere rich,
//  some to a Drifter ambush. Every jump adds to your Charts, and Charts make Act 5 faster.
// ------------------------------------------------------------
const WORMHOLE_OUTCOMES = ["hulls", "honor", "yomi", "compute", "ambush"]

function openWormholes() {
    player.wh.holes = [0, 1, 2].map(() => WORMHOLE_OUTCOMES[Math.floor(Math.random() * WORMHOLE_OUTCOMES.length)])
    player.wh.timer = 30
}

function wormholeSpeed() {
    return player.wh ? 1 + player.wh.charts / 100 : 1
}

function jump(n) {
    let o = player.wh.holes[n]
    if (!o) return
    let minute = 60 * spaceSpeed()
    if (o == "hulls") player.hv.hulls = player.hv.hulls.add(spaceCache.hulls.times(minute))
    if (o == "honor") player.dr.honor = player.dr.honor.add(new Decimal(spaceCache.honor || 0).times(minute))
    if (o == "yomi") player.sq.yomi = player.sq.yomi.add(player.sq.yomi.times(0.1))
    if (o == "compute") player.sq.compute = Decimal.min(memoryCap(), player.sq.compute.add(memoryCap().times(0.25)))
    if (o == "ambush") player.pb.probes = player.pb.probes.times(hasMilestone("wh", 1) ? 0.98 : 0.95).max(Decimal.min(1, player.pb.probes))
    player.wh.last = o
    player.wh.charts++
    player.wh.holes = []
}

function wormholeHint(n) {
    let o = player.wh.holes[n]
    let shown = hasMilestone("wh", 2) || (hasMilestone("wh", 0) && n == 0)
    if (!o) return "Closed"
    if (!shown) return "Who knows?"
    return { hulls: "A rich system: a minute of Hulls", honor: "A battlefield: a minute of Honor", yomi: "A library: +10% Yomi", compute: "A dead computer: Compute", ambush: "A Drifter ambush!" }[o]
}

addLayer("wh", {
    name: "wormholes",
    symbol: "Wh",
    row: 40,
    position: 2,
    color: "#a64d79",
    startData() { return { unlocked: true, points: new Decimal(0), holes: [], timer: 30, charts: 0, last: "" } },
    type: "none",
    branches: ["dr"],
    layerShown() { return spaceUnlocked() && driftStarted() },
    tooltip() { return player.wh.holes.length ? "Wormholes are open!" : player.wh.charts + " Charts" },
    update(diff) {
        if (!tmp.wh.layerShown) return
        player.wh.timer -= diff
        if (player.wh.timer <= 0) openWormholes()
        if (hasMilestone("wh", 2) && player.wh.holes.length) {
            let order = ["hulls", "honor", "compute", "yomi"]
            let best = order.map(o => player.wh.holes.indexOf(o)).find(i => i >= 0)
            jump(best === undefined ? 0 : best)
        }
    },
    clickables: Object.fromEntries([0, 1, 2].map(n => [11 + n, {
        title() { return "Wormhole " + (n + 1) },
        display() { return wormholeHint(n) },
        canClick() { return !!player.wh.holes[n] },
        onClick() { jump(n) },
        style() { return { width: "150px", height: "100px", "min-height": "100px" } },
    }])),
    milestones: {
        0: { requirementDescription: "10 Charts earned", effectDescription: "You can see where the first wormhole leads.", done() { return earned("wh").gte(10) } },
        1: { requirementDescription: "50 Charts earned", effectDescription: "Ambushes cost 2% of your probes instead of 5%.", done() { return earned("wh").gte(50) } },
        2: { requirementDescription: "200 Charts earned", effectDescription: "You can see where every wormhole leads, and your probes jump through the best one on their own.", done() { return earned("wh").gte(200) } },
    },
    tabFormat: [
        ["display-text", function() { return "<h2 style='color:#a64d79'>Wormholes</h2><br>You have <h2 style='color:#a64d79'>" + formatWhole(player.wh.charts) + "</h2> Charts, making Act 5 run <b>x" + format(wormholeSpeed(), 2) + "</b> as fast." }],
        "blank",
        lore("Shortcuts through space, if you dare. Nobody knows where a wormhole goes until something comes back out."),
        "blank",
        ["display-text", function() { return "<b>Pick one:</b> every 30 seconds three wormholes open. Jump through one; the others close. Most lead somewhere rich, but some to a Drifter ambush." + (player.wh.last ? "<br>Last jump: " + player.wh.last + "." : "") + (player.wh.holes.length ? "" : "<br>Next wormholes open in " + formatTime(player.wh.timer) + ".") }],
        "blank",
        "clickables",
        "blank",
        "milestones",
    ],
})

// ------------------------------------------------------------
//  TERRAFORMING. Each world has a hidden ideal Temperature, Atmosphere and Water (0 to 9).
//  Set the dials and seed the world: each dial reports too low, too high or just right.
// ------------------------------------------------------------
const DIALS = ["Temperature", "Atmosphere", "Water"]

function newWorld() {
    player.tf.ideal = [0, 1, 2].map(() => Math.floor(Math.random() * 10))
    player.tf.low = [0, 0, 0]
    player.tf.high = [9, 9, 9]
    player.tf.feedback = ["", "", ""]
    if (hasMilestone("tf", 1)) { let d = Math.floor(Math.random() * 3); player.tf.dials[d] = player.tf.ideal[d]; player.tf.low[d] = player.tf.high[d] = player.tf.ideal[d] }
}

function gardenBonus() {
    return player.tf ? new Decimal(1 + 0.05 * player.tf.gardens) : new Decimal(1)
}

function seedWorld() {
    if (player.tf.cooldown > 0) return
    let right = 0
    for (let d = 0; d < 3; d++) {
        let v = player.tf.dials[d], i = player.tf.ideal[d]
        if (v == i) { right++; player.tf.feedback[d] = "just right"; player.tf.low[d] = player.tf.high[d] = v }
        else if (v < i) { player.tf.feedback[d] = hasMilestone("tf", 0) && i - v > 3 ? "far too low" : "too low"; player.tf.low[d] = Math.max(player.tf.low[d], v + 1) }
        else { player.tf.feedback[d] = hasMilestone("tf", 0) && v - i > 3 ? "far too high" : "too high"; player.tf.high[d] = Math.min(player.tf.high[d], v - 1) }
    }
    player.tf.tries++
    player.tf.cooldown = 5
    if (right == 3) { player.tf.gardens++; newWorld() }
}

addLayer("tf", {
    name: "terraforming",
    symbol: "Tf",
    row: 41,
    position: 2,
    color: "#6aa84f",
    startData() { return { unlocked: true, points: new Decimal(0), ideal: [5, 5, 5], dials: [5, 5, 5], low: [0, 0, 0], high: [9, 9, 9], feedback: ["", "", ""], gardens: 0, tries: 0, cooldown: 0, started: false } },
    type: "none",
    branches: ["hv"],
    layerShown() { return spaceUnlocked() && player.pb.explored.gte(1e9) },
    tooltip() { return player.tf.gardens + " Gardens" },
    update(diff) {
        if (!tmp.tf.layerShown) return
        if (!player.tf.started) { player.tf.started = true; newWorld() }
        player.tf.cooldown = Math.max(0, player.tf.cooldown - diff)
        // Worlds terraform themselves: each dial is set halfway between what's still possible
        if (hasMilestone("tf", 2) && player.tf.cooldown <= 0) {
            for (let d = 0; d < 3; d++) player.tf.dials[d] = Math.floor((player.tf.low[d] + player.tf.high[d]) / 2)
            seedWorld()
        }
    },
    clickables: Object.assign({}, ...[0, 1, 2].map(d => ({
        [11 + d]: {
            title() { return DIALS[d] + ": " + player.tf.dials[d] },
            display() { return player.tf.feedback[d] ? "Last try: " + player.tf.feedback[d] : "" },
            canClick() { return true },
            onClick() { player.tf.dials[d] = (player.tf.dials[d] + 1) % 10 },
            style() { return { width: "150px", height: "80px", "min-height": "80px", "background-color": player.tf.feedback[d] == "just right" ? "#6aa84f" : "#38571f", color: "white" } },
        },
    })), {
        21: {
            title: "Seed the world",
            display() { return player.tf.cooldown > 0 ? "Wait " + formatTime(player.tf.cooldown) : "See what grows" },
            canClick() { return player.tf.cooldown <= 0 },
            onClick() { seedWorld() },
            style() { return { width: "200px", height: "80px", "min-height": "80px" } },
        },
    }),
    milestones: {
        0: { requirementDescription: "3 Gardens", effectDescription: "Feedback tells you when you're far off.", done() { return player.tf.gardens >= 3 } },
        1: { requirementDescription: "10 Gardens", effectDescription: "Every new world starts with one dial already right.", done() { return player.tf.gardens >= 10 } },
        2: { requirementDescription: "25 Gardens", effectDescription: "Worlds terraform themselves.", done() { return player.tf.gardens >= 25 } },
    },
    tabFormat: [
        ["display-text", function() { return "<h2 style='color:#6aa84f'>Terraforming</h2><br>You have <h2 style='color:#6aa84f'>" + player.tf.gardens + "</h2> Gardens, making Seeds worth <b>x" + format(gardenBonus(), 2) + "</b>." }],
        "blank",
        lore("Most worlds are rock and ice. A few, with the right nudge, could grow something."),
        "blank",
        ["display-text", "<b>Hot and cold:</b> every world has an ideal Temperature, Atmosphere and Water, each from 0 to 9. Click a dial to turn it, then seed the world. Each dial tells you if it's too low, too high or just right. Get all three right to grow a Garden."],
        "blank",
        ["clickables", [1]],
        "blank",
        ["clickables", [2]],
        "blank",
        "milestones",
    ],
})

// ------------------------------------------------------------
//  HALL OF PROBES
// ------------------------------------------------------------
const HALL = [
    { name: "Sputnik 1", year: "1957", lore: "A polished metal ball with four antennas that went beep. It started everything.", hint: "Launch a probe.", done() { return player.pb.launched >= 1 } },
    { name: "Venera 7", year: "1970", lore: "The first craft to land on another planet and call home. Venus crushed it within the hour.", hint: "Lose 1,000 probes to hazards.", done() { return player.pb.lost.gte(1000) } },
    { name: "Pioneer 10", year: "1972", lore: "It carries a plaque for anyone who finds it: two people, waving.", hint: "Explore 1,000 systems.", done() { return player.pb.explored.gte(1000) } },
    { name: "Voyager 1", year: "1977", lore: "Still talking to us from interstellar space, on a transmitter weaker than a fridge light.", hint: "Explore 1e6 systems.", done() { return player.pb.explored.gte(1e6) } },
    { name: "Voyager 2", year: "1977", lore: "The only craft to visit all four giant planets.", hint: "Have 1e6 probes.", done() { return player.pb.probes.gte(1e6) } },
    { name: "Galileo", year: "1989", lore: "Steered into Jupiter at the end, so it could never contaminate the ocean under Europa's ice.", hint: "Make 1e10 Hulls.", done() { return player.hv.totalHulls.gte(1e10) } },
    { name: "Hubble", year: "1990", lore: "Launched with a blurry mirror, fixed by astronauts in orbit, and then it showed us the deep field.", hint: "Catch a signal.", done() { return player.sg.locks >= 1 } },
    { name: "Huygens", year: "2005", lore: "Landed on Titan and found rivers, rain and seas, all made of methane.", hint: "Grow a Garden.", done() { return player.tf.gardens >= 1 } },
    { name: "New Horizons", year: "2006", lore: "Nine years of travel for one quick pass of Pluto. It found a heart.", hint: "Explore the Milky Way.", done() { return player.pb.explored.gte(GALAXY_SYSTEMS) } },
    { name: "Rosetta", year: "2004", lore: "Chased a comet for ten years, then landed a probe on it.", hint: "Jump through a wormhole.", done() { return player.wh.charts >= 1 } },
    { name: "Kepler", year: "2009", lore: "Stared at one patch of sky and found thousands of planets.", hint: "Explore 1e15 systems.", done() { return player.pb.explored.gte(VIRGO_SYSTEMS) } },
    { name: "Curiosity", year: "2011", lore: "A car-sized lab on Mars. On its first birthday, it hummed itself a song.", hint: "Finish 10 Projects.", done() { return projectsDone() >= 10 } },
    { name: "James Webb", year: "2021", lore: "Unfolded a million miles from home and looked back to the first galaxies.", hint: "Explore 1e19 systems.", done() { return player.pb.explored.gte(1e19) } },
    { name: "Breakthrough Starshot", year: "planned", lore: "Sails a few metres wide, pushed by lasers to a fifth the speed of light.", hint: "Consume a universe.", done() { return player.un.count >= 1 } },
    { name: "The Bracewell Probe", year: "hypothetical", lore: "A probe that waits in a star system, listening, until someone there is ready to talk.", hint: "Beat a Trial.", done() { return spaceTrialsBeaten() >= 1 } },
    { name: "The Von Neumann Probe", year: "hypothetical", lore: "A machine that builds copies of itself from whatever it finds. You know this one.", hint: "Collapse the multiverse.", done() { return player.mv.collapses >= 1 } },
]

function hallFound() {
    return player.hp ? player.hp.achievements.length : 0
}

function hallBonus() {
    let n = hallFound()
    return { seeds: (1 + 0.05 * n) * (n >= HALL.length ? 2 : 1), realities: n >= HALL.length ? 1.5 : 1 }
}

addLayer("hp", {
    name: "hall of probes",
    symbol: "HP",
    row: 39,
    position: 1,
    color: "#b4a7d6",
    startData() { return { unlocked: true, points: new Decimal(0) } },
    type: "none",
    layerShown() { return spaceUnlocked() },
    nodeStyle: SIDE_NODE_STYLE,
    tooltip() { return hallFound() + " / " + HALL.length + " probes" },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#b4a7d6'>Hall of Probes</h2><br>You've found <h2 style='color:#b4a7d6'>" + hallFound() + "</h2> of " + HALL.length + " famous probes.<br>" +
                "Each makes Seeds worth 5% more. The whole hall doubles Seeds and makes Realities 1.5x."
        }],
        "blank",
        "achievements",
        "blank",
        ["display-text", function() {
            let found = HALL.filter((f, n) => hasAchievement("hp", 11 + Math.floor(n / 4) * 10 + n % 4))
            if (!found.length) return "<i>The hall is empty.</i>"
            return "<h3>On Display</h3><br>" + found.map(f => "<b>" + f.name + "</b> <i>(" + f.year + ")</i>: " + f.lore).join("<br>")
        }],
    ],
    achievements: Object.assign({}, ...HALL.map((f, n) => ({
        [11 + Math.floor(n / 4) * 10 + n % 4]: {
            name: f.name,
            done() { return spaceUnlocked() && f.done() },
            tooltip() { return hasAchievement("hp", this.id) ? f.year + ". " + f.lore : f.hint },
            style() { return hasAchievement("hp", this.id) ? { "background-color": "#b4a7d6" } : {} },
        },
    }))),
})
