// ============================================================
//  ACT 6 IN ACT 5: REVERSAL (v3.4)
//  "The Last Question", turned around. From Loop 5 on, the Heat Death is not the end of Act 5:
//  reverse it. A Reversal rewinds all of Act 5 (the multiverse included) for Negentropy, but every
//  Reversal leaves the universe a little older: each rewind takes longer than the last.
//  Negentropy buys rewound constants that more than make up for it, and its milestones automate
//  the last of Act 5. It survives every Genesis.
// ============================================================

function reversalUnlocked() {
    return !!(player.lt && player.lt.genesis >= 5 && spaceUnlocked())
}

// Entropy: a Reversal pays its Negentropy only once the universe has finished rewinding, in real time.
// Every Reversal so far makes the next rewind take 2 minutes longer
const REWIND_BASE = 120
function rewindTime() {
    return REWIND_BASE * (1 + player.rv.count)
}

function rewindSpeed() {
    let s = 1
    if (hasUpgrade("rv", 11)) s *= 1.5
    if (hasUpgrade("rv", 21)) s *= 1 + Math.log10(player.rv.total.toNumber() + 1) / 2
    if (hasUpgrade("rv", 31)) s *= 2
    if (entropyTrialBeaten(92)) s *= 2
    return s
}

function rewinding() {
    return !!(player.rv && player.rv.rewind > 0)
}

function negentropyGain() {
    if (!reversalUnlocked() || !player.mv.heatDeath) return new Decimal(0)
    let g = new Decimal(1 + player.rv.count).times(player.mv.total.add(1).log10().add(1)).div(2)
    if (hasUpgrade("rv", 22)) g = g.times(2)
    if (hasUpgrade("lt", 46)) g = g.times(2)
    if (entropyTrialBeaten(91)) g = g.times(2)
    if (entropyTrialBeaten(94)) g = g.times(1 + player.rv.count / 5)
    return g.floor()
}

// Negentropy upgrades that multiply Act 5's own resources (hooked into extraMult)
function reversalMult(target) {
    if (!player.rv) return 1
    if (hasUpgrade("rv", 14) && ["harvest", "wire", "factory"].includes(target)) return 100
    if (hasUpgrade("rv", 23) && ["yomi", "honor"].includes(target)) return 1e6
    return 1
}

// Every Act gets a little faster from all the Negentropy you've ever made
function negentropyAllSpeed() {
    if (!player.rv || !hasUpgrade("rv", 24)) return 1
    return 1 + Math.log10(player.rv.total.toNumber() + 1) / 4
}

function reverse() {
    let g = negentropyGain()
    if (g.lt(1) || rewinding()) return
    player.rv.pending = g
    player.rv.rewind = rewindTime()
    player.rv.count++
    // Rewind Act 5: probes, harvest, drift, swarm, projects, universes and the multiverse start over.
    // Trials won, the Hall of Probes and the branches stay.
    let keepMv = hasMilestone("rv", 4) ? ["upgrades", "milestones"] : hasMilestone("rv", 0) ? ["milestones"] : []
    let keepUn = ["auto", "autoMult"]
    if (hasMilestone("rv", 1)) keepUn.push("milestones")
    resetKeeping("mv", keepMv)
    // The Heat Death itself is never kept: it has to be bought again
    player.mv.upgrades = player.mv.upgrades.filter(id => id != 65)
    resetKeeping("un", keepUn)
    player.rv.bestRate = 0
    player.rv.cycleTime = 0
    player.rv.lastCollapses = player.mv.collapses
    player.mv.heatDeath = false
    player.mv.reachedEdge = false
    universeWipe(true)
    resetKeeping("pb", hasMilestone("rv", 2) ? ["milestones", "upgrades", "autoLaunch", "autoTrust", "trustSplit"] : ["autoLaunch"])
    resetKeeping("hv", hasMilestone("rv", 2) ? ["milestones", "upgrades", "auto"] : ["auto"])
    if (hasUpgrade("rv", 13)) { player.un.count = 10; for (let k of PHYSICS_KEYS) player.un.collected[k] = true }
    keepReplicating()
}

// Reversal milestones finish automating Act 5
function reversalAutomation() {
    if (!reversalUnlocked()) return
    if (hasMilestone("rv", 0)) for (let id in MV_UPGRADES) if (MV_UPGRADES[id].target != "special" && tmp.mv.upgrades[id] && tmp.mv.upgrades[id].unlocked && canAffordUpgrade("mv", id)) buyUpg("mv", id)
    if (hasMilestone("rv", 1) && beyondVirgo()) for (let id in UN_UPGRADES) if (tmp.un.upgrades[id] && tmp.un.upgrades[id].unlocked && canAffordUpgrade("un", id)) buyUpg("un", id)
    // Collapse once Realities would come in at least as fast as the best so far this cycle
    if (hasMilestone("rv", 3) && multiverseUnlocked()) {
        let g = realityGain(), t = Math.max(1, player.rv.cycleTime)
        // (or after half an hour regardless, so a record from an old cycle can never stall it)
        if (g.gte(1) && t > 60 && (g.div(t).gte(player.rv.bestRate * 0.8) || t > 1800)) { player.rv.bestRate = Math.max(player.rv.bestRate, g.div(t).toNumber()); collapseMultiverse(); player.rv.bestRate *= 0.9 }
    }
    if (hasMilestone("rv", 5)) {
        let a = player.tl.activeChallenge
        if (!a && tmp.tl.layerShown) { let next = Object.keys(SPACE_TRIALS).find(id => !hasChallenge("tl", id)); if (next && player.un.runTime > 120) startChallenge("tl", Number(next)) }
        if (a && player.un.runTime > 3600) startChallenge("tl", a)
    }
    if (hasMilestone("rv", 6) && !player.mv.heatDeath && canAffordUpgrade("mv", 65)) buyUpg("mv", 65)
    // A Trial that hasn't reached the Heat Death in an hour is given up, and tried again 2 Reversals later
    if (player.rv.trial && player.rv.trialTime > 3600) { player.rv.failed = player.rv.failed || {}; player.rv.failed[player.rv.trial] = player.rv.count; player.rv.trial = 0 }
}

// ------------------------------------------------------------
//  ENTROPY TRIALS: reverse into a harder universe and reach the Heat Death for a lasting reward
// ------------------------------------------------------------
const ENTROPY_TRIALS = {
    91: { name: "Big Freeze", text: "Act 5 runs a million times slower.", reward: "Negentropy x2." },
    92: { name: "Big Rip", text: "Multiverse upgrades do nothing (but Let There Be Light).", reward: "Rewinds go twice as fast." },
    93: { name: "False Vacuum", text: "Seeds x1e-9.", reward: "Realities x3." },
    94: { name: "Heat Death, Twice", text: "Realities x1e-6.", reward: "Negentropy grows with every Reversal you've done." },
}

function inEntropyTrial(id) {
    return !!(player.rv && player.rv.trial == id && reversalUnlocked())
}

function entropyTrialBeaten(id) {
    return !!(player.rv && player.rv.trials.includes(String(id)))
}

function entropyTrialsUnlocked() {
    return !!(player.rv && player.rv.count >= 2)
}

// Reverse, and run the next universe under a Trial's rules
function reverseInto(id) {
    if (negentropyGain().lt(1) || rewinding()) return
    reverse()
    player.rv.trial = id
    player.rv.trialTime = 0
}

// For the Autopilot: reverse into the next Trial not yet beaten (one that just failed waits 2 Reversals)
function reverseNext() {
    player.rv.failed = player.rv.failed || {}
    let next = entropyTrialsUnlocked() && Object.keys(ENTROPY_TRIALS).find(id => !entropyTrialBeaten(id) && !(player.rv.failed[id] !== undefined && player.rv.count < player.rv.failed[id] + 2))
    if (next) reverseInto(Number(next)); else reverse()
}

const RV_UPGRADES = {
    11: ["Time's Arrow", "Rewinds go 1.5x as fast.", 4],
    12: ["Cold Start", "Seeds x3 and Realities x2.", 10],
    13: ["Remembered Universes", "A Reversal starts with 10 universes already consumed, and every kind of physics collected.", 20],
    14: ["Maxwell's Demon", "Matter, Wire and Hulls are made 100x as fast.", 30],
    21: ["Order from Chaos", "Rewinds go faster with all the Negentropy you've ever made.", 60],
    22: ["Self-Organization", "Negentropy x2.", 120],
    23: ["Boltzmann Brains", "Yomi and Honor x1e6.", 200],
    24: ["Arrow Reversed", "Acts 1 to 5 all run faster with all the Negentropy you've ever made.", 400],
    31: ["The Big Bounce", "Rewinds go twice as fast.", 500],
    32: ["Let There Be Light, Again", "The universe remembers how it began. <b>Light up a new universe.</b>", 1000],
}

addLayer("rv", {
    name: "reversal",
    symbol: "Rv",
    row: 44,
    position: 2,
    color: "#ffe599",
    startData() { return { unlocked: true, points: new Decimal(0), total: new Decimal(0), count: 0, bestRate: 0, cycleTime: 0, lastCollapses: 0, rewind: 0, pending: new Decimal(0), trial: 0, trialTime: 0, trials: [] } },
    type: "none",
    resource: "Negentropy",
    branches: ["mv"],
    layerShown() { return reversalUnlocked() && (player.mv.heatDeath || player.rv.count > 0) },
    tooltip() { return formatWhole(player.rv.points) + " Negentropy" },
    update(diff) {
        // A Trial is beaten by reaching the Heat Death under its rules; given up after an hour
        if (player.rv.trial) {
            player.rv.trialTime += diff
            if (player.mv.heatDeath) {
                let t = player.rv.trial
                player.rv.trials.push(String(t))
                player.rv.trial = 0
                doPopup("none", ENTROPY_TRIALS[t].reward, "Entropy Trial beaten: " + ENTROPY_TRIALS[t].name, 3, "#ffe599")
            }
        }
        // The rewind runs in real time; its Negentropy arrives when it's done
        if (player.rv.rewind > 0) {
            player.rv.rewind -= diff * rewindSpeed()
            if (player.rv.rewind <= 0) {
                player.rv.rewind = 0
                player.rv.points = player.rv.points.add(player.rv.pending)
                player.rv.total = player.rv.total.add(player.rv.pending)
                player.rv.pending = new Decimal(0)
            }
        }
        // How long this multiverse cycle has run (real time), for the auto-collapse
        if (player.mv.collapses != player.rv.lastCollapses) { player.rv.lastCollapses = player.mv.collapses; player.rv.cycleTime = 0 }
        else player.rv.cycleTime += diff
    },
    automate() { reversalAutomation() },
    tabFormat: [
        ["display-text", function() { return "<h2 style='color:#ffe599'>Reversal</h2><br>You have <h2 style='color:#ffe599'>" + formatWhole(player.rv.points) + "</h2> Negentropy, from " + formatWhole(player.rv.count) + " Reversal" + (player.rv.count == 1 ? "" : "s") + "." }],
        "blank",
        lore("\"How can the net amount of entropy of the universe be massively decreased?\" For a long time there was insufficient data for a meaningful answer. Not any more."),
        "blank",
        ["display-text", function() {
            return "After the Heat Death, <b>reverse</b> it: all of Act 5 starts over from its first probe (the multiverse too), and pays Negentropy (more for every Reversal so far, and for every Reality you've earned this time).<br>" +
                "But entropy fights back: the Negentropy only arrives once the universe has finished rewinding, and every Reversal makes the next rewind 2 minutes longer. The next one takes <b>" + formatTime(rewindTime() / rewindSpeed()) + "</b>." +
                (rewinding() ? "<br><br>Rewinding: <b>" + formatTime(player.rv.rewind / rewindSpeed()) + "</b> left before <b>" + formatWhole(player.rv.pending) + "</b> Negentropy arrives." : "")
        }],
        "blank",
        ["clickables", [9]],
        "blank",
        "milestones",
        "blank",
        "upgrades",
        "blank",
        ["display-text", function() {
            if (!entropyTrialsUnlocked()) return "<span style='opacity:0.7'>Entropy Trials open after 2 Reversals.</span>"
            let a = player.rv.trial
            return "<h3>Entropy Trials</h3><br>Reverse into a harder universe, then reach the Heat Death under its rules for a lasting reward." + (a ? "<br>In <b>" + ENTROPY_TRIALS[a].name + "</b> for " + formatTime(player.rv.trialTime) + "." : "")
        }],
        ["clickables", [8]],
    ],
    clickables: {
        ...Object.fromEntries(Object.entries(ENTROPY_TRIALS).map(([id, t]) => [id - 10, {
            title() { return t.name },
            display() {
                let n = Number(id)
                if (entropyTrialBeaten(n)) return "Beaten. " + t.reward
                if (inEntropyTrial(n)) return t.text + "<br>Reward: " + t.reward + "<br><b>Click to give up.</b>"
                return t.text + "<br>Reward: " + t.reward + "<br>" + (negentropyGain().gte(1) && !rewinding() ? "<b>Click to reverse into it.</b>" : "Reverse into it after the next Heat Death.")
            },
            unlocked() { return entropyTrialsUnlocked() },
            canClick() {
                let n = Number(id)
                if (entropyTrialBeaten(n)) return false
                if (inEntropyTrial(n)) return true
                return !player.rv.trial && negentropyGain().gte(1) && !rewinding()
            },
            onClick() {
                let n = Number(id)
                if (inEntropyTrial(n)) { player.rv.trial = 0; return }
                reverseInto(n)
            },
            style() { return { width: "160px", height: "120px", "min-height": "120px", "font-size": "9px", "background-color": entropyTrialBeaten(Number(id)) ? "#c9b25a" : inEntropyTrial(Number(id)) ? "#e69138" : undefined } },
        }])),
        91: {
            title: "Reverse",
            display() { let g = negentropyGain(); return rewinding() ? "Still rewinding..." : g.lt(1) ? "Reach the Heat Death first." : "Rewind Act 5 for <b>" + formatWhole(g) + "</b> Negentropy." },
            canClick() { return negentropyGain().gte(1) && !rewinding() },
            onClick() {
                if (player.rv.count == 0 && !confirm("Reversing rewinds all of Act 5, the multiverse included, and the Heat Death must be reached again. Ready?")) return
                reverse()
            },
            style() { return { width: "260px", height: "90px", "min-height": "90px" } },
        },
    },
    milestones: {
        0: { requirementDescription: "1 Reversal", effectDescription: "Keep Multiverse milestones, and Multiverse upgrades are bought on their own (all but the last).", done() { return player.rv.count >= 1 } },
        1: { requirementDescription: "2 Reversals", effectDescription: "Keep Universe milestones, and Seed upgrades are bought on their own.", done() { return player.rv.count >= 2 } },
        2: { requirementDescription: "3 Reversals", effectDescription: "Keep Probe and Harvest upgrades and milestones.", done() { return player.rv.count >= 3 } },
        3: { requirementDescription: "4 Reversals", effectDescription: "The multiverse collapses on its own, once Realities would come in nearly as fast as they ever have this cycle.", done() { return player.rv.count >= 4 } },
        4: { requirementDescription: "5 Reversals", effectDescription: "Keep Multiverse upgrades.", done() { return player.rv.count >= 5 } },
        5: { requirementDescription: "6 Reversals", effectDescription: "Trials you haven't won are fought on their own.", done() { return player.rv.count >= 6 } },
        6: { requirementDescription: "8 Reversals", effectDescription: "Let There Be Light (the Heat Death) is bought on its own.", done() { return player.rv.count >= 8 } },
    },
    upgrades: Object.fromEntries(Object.entries(RV_UPGRADES).map(([id, u]) => [id, {
        title: u[0],
        description: u[1],
        cost: new Decimal(u[2]),
        unlocked() { return Number(id) < 30 || hasUpgrade("rv", 24) },
    }])),
})
