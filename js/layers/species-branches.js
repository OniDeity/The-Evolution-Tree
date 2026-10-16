// ============================================================
//  ACT 3 BRANCHES
//  Small layers further out on the Species tree: modest helpers with something to do while
//  you wait out a wall. Speciation and Radiation never reset them.
//
//  Insects     (ix), off Tiers:       the swarm booms and busts; harvest it near the peak
//  Coal        (cf), off Metabolism:  bury Biomass before you reset, and dig it up later as Coal
//  Coevolution (cv), off Speciation:  keep predators and prey in balance
// ============================================================

// ------------------------------------------------------------
//  INSECTS. The swarm rises and falls on a 40 second cycle. Harvest it for Chitin;
//  the bigger the swarm, the more you get. Then wait for it to recover.
// ------------------------------------------------------------
const SWARM_PERIOD = 40

function swarmSize() {
    // Booms and busts: 0 to 10, peaking once per cycle
    return 5 - 5 * Math.cos(2 * Math.PI * player.ix.phase / SWARM_PERIOD)
}

function swarmCooldown() {
    return hasMilestone("ix", 1) ? 15 : 30
}

function chitinEffect() {
    return player.ix ? player.ix.chitin.add(1).pow(0.15) : new Decimal(1)
}

function harvestSwarm() {
    player.ix.chitin = player.ix.chitin.add(swarmSize())
    player.ix.cooldown = swarmCooldown()
    player.ix.harvests++
}

addLayer("ix", {
    name: "insects",
    symbol: "Is",
    row: 20,
    position: 1,
    color: "#8bc34a",
    startData() { return { unlocked: true, points: new Decimal(0), phase: 0, chitin: new Decimal(0), cooldown: 0, harvests: 0 } },
    type: "none",
    branches: ["ti"],
    layerShown() { return speciesUnlocked() && (player.sn.points.gte(1) || player.ar.points.gt(0)) },
    tooltip() { return "Swarm " + format(swarmSize(), 1) + " / 10" },
    update(diff) {
        if (!tmp.ix.layerShown) return
        player.ix.phase = (player.ix.phase + diff) % SWARM_PERIOD
        player.ix.cooldown = Math.max(0, player.ix.cooldown - diff)
        if (hasMilestone("ix", 2) && player.ix.cooldown <= 0 && swarmSize() >= 9.5) harvestSwarm()
    },
    bars: {
        swarm: {
            direction: RIGHT,
            width: 300,
            height: 30,
            progress() { return swarmSize() / 10 },
            display() { return "Swarm: " + format(swarmSize(), 1) + " / 10" },
            fillStyle: { "background-color": "#8bc34a" },
            textStyle: { color: "white", "text-shadow": "0 0 4px black, 0 0 2px black" },
        },
    },
    clickables: {
        11: {
            title: "Harvest",
            display() { return player.ix.cooldown > 0 ? "The swarm is recovering: " + formatTime(player.ix.cooldown) : "Gain <b>" + format(swarmSize(), 2) + "</b> Chitin." },
            canClick() { return player.ix.cooldown <= 0 },
            onClick() { harvestSwarm() },
            style() { return { width: "200px", "min-height": "80px", height: "80px" } },
        },
    },
    milestones: {
        0: { requirementDescription: "50 Chitin earned", effectDescription: "Bacteria x2.", done() { return earned("ix").gte(50) } },
        1: { requirementDescription: "200 Chitin earned", effectDescription: "The swarm recovers in 15 seconds instead of 30.", done() { return earned("ix").gte(200) } },
        2: { requirementDescription: "800 Chitin earned", effectDescription: "Harvest the swarm on its own when it's near its peak.", done() { return earned("ix").gte(800) } },
    },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#8bc34a'>Insects</h2><br>You have <h2 style='color:#8bc34a'>" + format(player.ix.chitin) + "</h2> Chitin, multiplying Biomass gain by <b>x" + format(chitinEffect()) + "</b>."
        }],
        "blank",
        lore("Alongside everything with a backbone, a second tree of life took over the world: six legs, hard shells, and numbers beyond counting."),
        "blank",
        ["display-text", "<b>Boom and bust:</b> the swarm grows and crashes every " + SWARM_PERIOD + " seconds. Harvest it for Chitin equal to its size, then let it recover."],
        "blank",
        ["bar", "swarm"],
        "blank",
        "clickables",
        "blank",
        "milestones",
    ],
})

// ------------------------------------------------------------
//  COAL. Bury half your Biomass in a seam. Three minutes later it's Coal (based on how much you buried).
//  Speciation and Radiation reset Biomass anyway, so the best time to bury is right before one.
// ------------------------------------------------------------
const SEAM_TIME = 180

function maxSeams() {
    return hasMilestone("cf", 1) ? 5 : 3
}

function coalFrom(buried) {
    return buried.add(1).log10().times(hasMilestone("cf", 2) ? 1.5 : 1)
}

function coalDemandDivider() {
    return player.cf ? player.cf.coal.add(1).pow(0.03).toNumber() : 1
}

addLayer("cf", {
    name: "coal",
    symbol: "Co",
    row: 21,
    position: 3,
    color: "#5d5d5d",
    startData() { return { unlocked: true, points: new Decimal(0), coal: new Decimal(0), seams: [], buried: 0 } },
    type: "none",
    branches: ["me"],
    layerShown() { return speciesUnlocked() && hasUpgrade("me", 11) },
    tooltip() { return format(player.cf.coal) + " Coal" },
    update(diff) {
        if (!tmp.cf.layerShown) return
        for (let s of player.cf.seams) s.time = Math.max(0, s.time - diff)
        if (hasMilestone("cf", 0)) layers.cf.clickables[12].onClick()
    },
    clickables: {
        11: {
            title: "Bury",
            display() { return "Bury half your Biomass (" + format(player.biomass.div(2)) + ") in a new seam. It becomes <b>" + format(coalFrom(player.biomass.div(2))) + "</b> Coal in 3 minutes." },
            canClick() { return player.cf.seams.length < maxSeams() && player.biomass.gte(100) },
            onClick() {
                let half = player.biomass.div(2)
                player.biomass = player.biomass.sub(half)
                player.cf.seams.push({ coal: coalFrom(half).toNumber(), time: SEAM_TIME })
                player.cf.buried++
            },
            style() { return { width: "220px", "min-height": "90px", height: "90px" } },
        },
        12: {
            title: "Dig up",
            display() {
                let ready = player.cf.seams.filter(s => s.time <= 0)
                return ready.length ? "Collect " + format(ready.reduce((a, s) => a + s.coal, 0)) + " Coal from " + ready.length + " seam" + (ready.length > 1 ? "s" : "") : "No seam is ready yet."
            },
            canClick() { return player.cf.seams.some(s => s.time <= 0) },
            onClick() {
                for (let s of player.cf.seams) if (s.time <= 0) player.cf.coal = player.cf.coal.add(s.coal)
                player.cf.seams = player.cf.seams.filter(s => s.time > 0)
            },
            style() { return { width: "220px", "min-height": "90px", height: "90px" } },
        },
    },
    milestones: {
        0: { requirementDescription: "500 Coal earned", effectDescription: "Ready seams are dug up on their own.", done() { return earned("cf").gte(500) } },
        1: { requirementDescription: "1,500 Coal earned", effectDescription: "You can have 5 seams at once.", done() { return earned("cf").gte(1500) } },
        2: { requirementDescription: "5,000 Coal earned", effectDescription: "Seams give 1.5x Coal.", done() { return earned("cf").gte(5000) } },
        3: { requirementDescription: "10,000 Coal earned", effectDescription: "Right before you speciate or radiate, Biomass is buried on its own in any free seam.", done() { return earned("cf").gte(10000) } },
    },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#9a9a9a'>Coal</h2><br>You have <h2 style='color:#9a9a9a'>" + format(player.cf.coal) + "</h2> Coal, dividing your food demand by <b>" + format(coalDemandDivider()) + "</b>."
        }],
        "blank",
        lore("Great swamp forests fell and were buried before anything could rot them. Squeezed for millions of years, they turned to coal."),
        "blank",
        ["display-text", function() {
            return "<b>Bury it for later:</b> bury half your Biomass in a seam, and it turns into Coal after 3 minutes. Bigger seams give more, but only by the log.<br>" +
                "Speciating or radiating resets your Biomass anyway, so bury some right before you do.<br><br>" +
                "Seams: " + player.cf.seams.length + " / " + maxSeams() +
                (player.cf.seams.length ? "<br>" + player.cf.seams.map(s => s.time > 0 ? format(s.coal) + " Coal in " + formatTime(s.time) : format(s.coal) + " Coal, ready").join("<br>") : "")
        }],
        "blank",
        "clickables",
        "blank",
        "milestones",
    ],
})

// ------------------------------------------------------------
//  COEVOLUTION. Predators and prey are locked in an arms race. The balance wanders on its own;
//  nudge it back. The closer to even, the more Fitness you earn every second.
// ------------------------------------------------------------
function coevolutionRate() {
    let off = Math.abs(player.cv.balance) / 100
    return Math.pow(1 - off, 2) * (hasMilestone("cv", 2) ? 2 : 1)
}

function coevolutionEffect() {
    return player.cv ? player.cv.fitness.add(1).pow(0.015) : new Decimal(1)
}

function nudgeSize() {
    return hasMilestone("cv", 0) ? 25 : 15
}

addLayer("cv", {
    name: "coevolution",
    symbol: "Cv",
    row: 21,
    position: 4,
    color: "#d35400",
    startData() { return { unlocked: true, points: new Decimal(0), balance: 0, push: 0, fitness: new Decimal(0) } },
    type: "none",
    branches: ["sn"],
    layerShown() { return speciesUnlocked() && (player.sn.points.gte(5) || player.ar.points.gt(0)) },
    tooltip() { return "Balance " + format(player.cv.balance, 0) },
    update(diff) {
        if (!tmp.cv.layerShown) return
        // The arms race wanders: it drifts one way for a while, then the other
        if (Math.random() < diff / 8) player.cv.push = (Math.random() * 2 - 1) * (hasMilestone("cv", 1) ? 3 : 5)
        player.cv.balance = Math.max(-100, Math.min(100, player.cv.balance + player.cv.push * diff))
        player.cv.fitness = player.cv.fitness.add(coevolutionRate() * diff)
        if (hasMilestone("cv", 3)) {
            if (player.cv.balance > 20) layers.cv.clickables[11].onClick()
            else if (player.cv.balance < -20) layers.cv.clickables[12].onClick()
        }
    },
    bars: {
        balance: {
            direction: RIGHT,
            width: 300,
            height: 30,
            progress() { return (player.cv.balance + 100) / 200 },
            display() { let b = player.cv.balance; return Math.abs(b) < 10 ? "Balanced" : b > 0 ? "Predators winning (" + format(b, 0) + ")" : "Prey winning (" + format(-b, 0) + ")" },
            fillStyle: { "background-color": "#d35400" },
            baseStyle: { "background-color": "#3b7d4f" },
            textStyle: { color: "white", "text-shadow": "0 0 4px black, 0 0 2px black" },
        },
    },
    clickables: {
        11: {
            title: "Help the prey",
            display() { return "Faster legs, better hiding. Balance -" + nudgeSize() },
            canClick() { return player.cv.balance > -100 },
            onClick() { player.cv.balance = Math.max(-100, player.cv.balance - nudgeSize()) },
            style() { return { width: "150px", "min-height": "80px", height: "80px", "background-color": "#3b7d4f", color: "white" } },
        },
        12: {
            title: "Help the predators",
            display() { return "Sharper eyes, stronger jaws. Balance +" + nudgeSize() },
            canClick() { return player.cv.balance < 100 },
            onClick() { player.cv.balance = Math.min(100, player.cv.balance + nudgeSize()) },
            style() { return { width: "150px", "min-height": "80px", height: "80px", "background-color": "#d35400", color: "white" } },
        },
    },
    milestones: {
        0: { requirementDescription: "300 Fitness earned", effectDescription: "Each nudge moves the balance 25 instead of 15.", done() { return earned("cv").gte(300) } },
        1: { requirementDescription: "1,000 Fitness earned", effectDescription: "The arms race wanders more slowly.", done() { return earned("cv").gte(1000) } },
        2: { requirementDescription: "3,000 Fitness earned", effectDescription: "Fitness gain x2.", done() { return earned("cv").gte(3000) } },
        3: { requirementDescription: "10,000 Fitness earned", effectDescription: "The balance is nudged back on its own whenever it drifts past 20.", done() { return earned("cv").gte(10000) } },
    },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#d35400'>Coevolution</h2><br>You have <h2 style='color:#d35400'>" + format(player.cv.fitness) + "</h2> Fitness (+" + format(coevolutionRate(), 2) + "/sec), making every tier <b>x" + format(coevolutionEffect(), 3) + "</b> stronger."
        }],
        "blank",
        lore("Every time the gazelle gets faster, so does the cheetah. Neither one ever gets ahead for long."),
        "blank",
        ["display-text", "<b>Arms race:</b> the balance between predators and prey wanders on its own. The closer it is to even, the more Fitness you earn."],
        "blank",
        ["bar", "balance"],
        "blank",
        "clickables",
        "blank",
        "milestones",
    ],
})
