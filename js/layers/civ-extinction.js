// ============================================================
//  ACT 4: THE EXTINCTION AND DEEP TIME
//
//  Reset (Kittens' Karma, Evolve's MAD) -> Extinction (ex)
//      Twist: you are the extinction. The bigger the civilization that falls (its people, its discoveries
//      and its footprint), the more Strata it leaves behind. Every extinction also wipes out Act 3's
//      living world, which grows back faster with every layer of Strata.
//  Metaphysics / Plasmid genes         -> Deep Time (dt): permanent upgrades bought with Strata
//  Challenges                          -> Trials: optional runs under harder rules
//  Ending                              -> Eternity: a civilization that lives within the biosphere's means
// ============================================================

const ETERNITY_PEOPLE = 150
const ETERNITY_HEALTH = 0.9

// Strata are spent on Deep Time, but every Stratum you've ever laid down keeps counting here
function strataBonus() {
    if (!player.ex) return 1
    return 1 + player.ex.total.add(1).log10().toNumber()
}

// Act 3's living world grows back faster on top of all those layers of rock
function strataTierBoost() {
    if (!player.ex) return new Decimal(1)
    return player.ex.total.add(1).pow(2)
}

function canExtinct() {
    return hasTech("industrialization") && !player.ex.activeChallenge
}

function strataGain() {
    if (!canExtinct()) return new Decimal(0)
    // People count the most: a big civilization leaves far more behind than a quick, small one
    let g = Math.pow(player.ex.peakPeople / 10, 1.1) * Math.pow(techCount() / 14, 2) * Math.sqrt(1 + player.ex.peakFootprint / 100)
    if (hasUpgrade("dt", 42)) g *= 2
    if (hasMilestone("ex", 4)) g *= 1.5
    g *= lostSpeciesBonus().strata
    return new Decimal(Math.floor(g))
}

// Wipes the civilization back to a handful of apes around a fire. Deep Time decides what survives.
function civReset() {
    for (let k in player.sm.res) player.sm.res[k] = 0
    for (let b of BUILDINGS) setBuyableAmount("sm", b.id, new Decimal(0))
    player.vg.people = 0
    player.vg.growth = 0
    player.vg.starve = 0
    player.vg.engineerProgress = 0
    for (let k in player.vg.jobs) player.vg.jobs[k] = 0
    let keep = 0
    if (hasUpgrade("dt", 11)) keep = 3
    if (hasUpgrade("dt", 24)) keep = 8
    if (hasUpgrade("dt", 33)) keep = TECHS.length
    let kept = TECHS.slice(0, keep).map(t => t.id)
    player.kn.upgrades = player.kn.upgrades.filter(id => kept.includes(Number(id)))
    if (!hasMilestone("ex", 1)) player.wk.upgrades = []
    if (hasUpgrade("dt", 12)) {
        setBuyableAmount("sm", BUILDING_IDS.field, new Decimal(10))
        setBuyableAmount("sm", BUILDING_IDS.hut, new Decimal(5))
        setBuyableAmount("sm", BUILDING_IDS.library, new Decimal(3))
        player.sm.res.food = 500
        player.sm.res.wood = 100
    }
    player.ex.peakPeople = 0
    player.ex.peakFootprint = 0
}

// Act 3's world dies with the civilization: tiers, Metabolism, speciations and radiations are gone.
// Evolutionary milestones, Instincts and everything off to the side survive.
function wipeAct3() {
    if (player.pz.activeChallenge) player.pz.activeChallenge = null
    speciesReset(2)
    player.ar.points = new Decimal(0)
    player.ex.peakBiomass = new Decimal(0)
    if (hasUpgrade("dt", 22)) player.biomass = new Decimal(1e30)
}

function doExtinction() {
    let gain = strataGain()
    if (gain.lt(1)) return
    player.ex.points = player.ex.points.add(gain)
    player.ex.total = player.ex.total.add(gain)
    player.ex.best = player.ex.best.max(gain)
    player.ex.count++
    player.ch.lastRun = player.ch.runTime
    player.ch.fastest = player.ch.fastest ? Math.min(player.ch.fastest, player.ch.runTime) : player.ch.runTime
    player.ch.runTime = 0
    civReset()
    wipeAct3()
}

const TRIALS = {
    11: { key: "winter", name: "Winter Is Coming", text: "The world is cold. Food grows at a quarter of its normal rate outside spring, and a tenth in winter.",
          reward: "Food x1.5." },
    12: { key: "overshoot", name: "Overshoot", text: "Your footprint is doubled.",
          reward: "The biosphere is 50% more resilient." },
    13: { key: "band", name: "Small Band", text: "No more than 10 people, however much housing you build.",
          reward: "People eat 20% less." },
    14: { key: "dark", name: "Dark Age", text: "Half of everything you write down is lost: Knowledge storage is halved.",
          reward: "Knowledge x1.5." },
}

function inTrial(key) {
    let a = player.ex && player.ex.activeChallenge
    return !!a && TRIALS[a] && TRIALS[a].key == key
}

function trialDone(key) {
    return Object.keys(TRIALS).some(id => TRIALS[id].key == key && hasChallenge("ex", id))
}

function trialsBeaten() {
    return player.ex ? Object.keys(TRIALS).filter(id => hasChallenge("ex", id)).length : 0
}

function eternityReady() {
    return hasUpgrade("dt", 44) && hasTech("rewilding") && player.vg.people >= ETERNITY_PEOPLE && civCache.health >= ETERNITY_HEALTH
}

addLayer("ex", {
    name: "extinction",
    symbol: "Ex",
    row: 32,
    position: 1,
    color: "#d9774b",
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        total: new Decimal(0),
        best: new Decimal(0),
        count: 0,
        peakPeople: 0,
        peakFootprint: 0,
        peakBiomass: new Decimal(0),
        autoResearch: true,
        autoWorkshop: true,
        eternity: false,
    }},
    type: "none",
    resource: "Strata",
    branches: ["vg", "kn"],
    layerShown() { return civUnlocked() && (hasTech("physics") || player.ex.count > 0 || player.ex.total.gt(0)) },
    tooltip() { return formatWhole(player.ex.points) + " Strata" },
    automate() {
        if (!civUnlocked()) return
        if (hasMilestone("ex", 2) && player.ex.autoResearch) for (let t of TECHS) buyUpg("kn", t.id)
        if (hasMilestone("ex", 3) && player.ex.autoWorkshop) for (let id in WORKSHOP) buyUpg("wk", id)
        // Trials, like Selection Pressures, finish the moment you reach the goal
        let a = player.ex.activeChallenge
        if (a && canCompleteChallenge("ex", a)) startChallenge("ex", a)
    },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#d9774b'>Extinction</h2><br>You have <h2 style='color:#d9774b'>" + formatWhole(player.ex.points) + "</h2> Strata to spend, and have laid down " + formatWhole(player.ex.total) + " in all.<br>" +
                "Every Stratum ever laid down makes your civilization stronger (<b>x" + format(strataBonus(), 2) + "</b>) and Act 3's species tiers grow back faster (<b>x" + format(strataTierBoost()) + "</b>)."
        }],
        "blank",
        lore("Five times, most of life on Earth has died at once. Each time, the dead were buried in a layer of rock, and each time, life came back. The sixth is happening now, and this time it has a cause that can think."),
        "blank",
        ["display-text", function() {
            if (!hasTech("industrialization")) return "Research <b>Industrialization</b> to bring on an extinction."
            return "An extinction ends your civilization <b>and</b> wipes out Act 3's species tiers. It lays down Strata based on how many discoveries you made (" + techCount() + "), " +
                "the most people you had (" + formatWhole(player.ex.peakPeople) + ") and the biggest footprint you left (" + format(player.ex.peakFootprint, 1) + ")."
        }],
        "blank",
        ["clickables", [1]],
        "blank",
        ["clickables", [2]],
        "blank",
        "milestones",
        "blank",
        ["display-text", function() { return player.ex.count >= 1 ? "<h3>Trials</h3><br>Optional runs under harder rules. Entering or leaving one starts your civilization over (but leaves Act 3 alone). Reach Industrialization to win.<br>You've beaten " + trialsBeaten() + " of 4." : "" }],
        "blank",
        "challenges",
        "blank",
        ["clickables", [9]],
    ],
    clickables: {
        11: {
            title: "Bring on the extinction",
            display() {
                if (player.ex.activeChallenge) return "Not during a Trial."
                if (!hasTech("industrialization")) return "Needs Industrialization."
                return "Lay down <b>" + formatWhole(strataGain()) + "</b> Strata."
            },
            canClick() { return strataGain().gte(1) },
            onClick() { doExtinction() },
            style() { return { width: "240px", height: "110px", "min-height": "110px" } },
        },
        21: {
            title() { return "Auto-research: " + (player.ex.autoResearch ? "ON" : "OFF") },
            unlocked() { return hasMilestone("ex", 2) },
            canClick() { return true },
            onClick() { player.ex.autoResearch = !player.ex.autoResearch },
            style() { return { width: "160px", "min-height": "50px", height: "50px" } },
        },
        22: {
            title() { return "Auto-workshop: " + (player.ex.autoWorkshop ? "ON" : "OFF") },
            unlocked() { return hasMilestone("ex", 3) },
            canClick() { return true },
            onClick() { player.ex.autoWorkshop = !player.ex.autoWorkshop },
            style() { return { width: "160px", "min-height": "50px", height: "50px" } },
        },
        91: {
            title: "Eternity",
            display() {
                if (player.ex.eternity) return "A civilization that will outlast every extinction. <b>Act 4 is complete.</b>"
                return "Live within the biosphere's means, for good. <b>Finish Act 4.</b><br>Needs The Long Now, Rewilding, " + ETERNITY_PEOPLE + " people (" + formatWhole(player.vg.people) + ") and a biosphere at " +
                    ETERNITY_HEALTH * 100 + "% health or better (" + format(civCache.health * 100, 1) + "%)."
            },
            unlocked() { return hasUpgrade("dt", 44) || player.ex.eternity },
            canClick() { return eternityReady() && !player.ex.eternity },
            onClick() { player.ex.eternity = true },
            style() { return { width: "300px", height: "150px", "min-height": "150px" } },
        },
    },
    milestones: {
        0: { requirementDescription: "1 extinction", effectDescription: "Deep Time opens: spend Strata on things that survive every extinction. Act 3 learns every Instinct but Competition, so its living world grows back on its own.", done() { return player.ex.count >= 1 } },
        1: { requirementDescription: "2 extinctions", effectDescription: "Keep Workshop improvements through extinctions.", done() { return player.ex.count >= 2 } },
        2: { requirementDescription: "3 extinctions", effectDescription: "Techs are researched on their own as soon as you can afford them.", done() { return player.ex.count >= 3 } },
        3: { requirementDescription: "5 extinctions", effectDescription: "Workshop improvements are bought on their own.", done() { return player.ex.count >= 5 } },
        4: { requirementDescription: "8 extinctions", effectDescription: "Strata gain x1.5.", done() { return player.ex.count >= 8 } },
    },
    challenges: Object.fromEntries(Object.entries(TRIALS).map(([id, t]) => [id, {
        name: t.name,
        unlocked() { return player.ex.count >= 1 },
        challengeDescription() { return t.text },
        goalDescription: "Research Industrialization",
        canComplete() { return hasTech("industrialization") },
        rewardDescription: t.reward,
        onEnter() { civReset() },
        onExit() { civReset() },
        style() { return { width: "240px", height: "240px" } },
    }])),
})

// ------------------------------------------------------------
//  DEEP TIME: permanent upgrades bought with Strata
// ------------------------------------------------------------
function deepTime(title, description, cost) {
    return {
        title: title,
        description: description,
        cost: new Decimal(cost),
        currencyDisplayName: "Strata",
        currencyInternalName: "points",
        currencyLayer: "ex",
    }
}

addLayer("dt", {
    name: "deep time",
    symbol: "DT",
    row: 32,
    position: 2,
    color: "#8e6c4a",
    startData() { return { unlocked: true, points: new Decimal(0), autoJobs: true, autoBuild: true, skip: {} } },
    type: "none",
    branches: ["ex"],
    layerShown() { return civUnlocked() && player.ex.count >= 1 },
    tooltip() { return player.dt.upgrades.length + " / 16 Deep Time" },
    tabFormat: [
        ["display-text", function() { return "<h2 style='color:#8e6c4a'>Deep Time</h2><br>You have <h2 style='color:#d9774b'>" + formatWhole(player.ex.points) + "</h2> Strata. What you buy here survives every extinction." }],
        "blank",
        lore("A civilization lasts a few thousand years. The rock it leaves behind lasts a few hundred million. Some things, it turns out, can be remembered for that long."),
        "blank",
        ["clickables", [1]],
        "blank",
        "upgrades",
    ],
    clickables: {
        11: {
            title() { return "Division of Labor: " + (player.dt.autoJobs !== false ? "ON" : "OFF") },
            unlocked() { return hasUpgrade("dt", 13) },
            canClick() { return true },
            onClick() { player.dt.autoJobs = player.dt.autoJobs === false },
            style() { return { width: "200px", "min-height": "50px", height: "50px" } },
        },
        12: {
            title() { return "Builders' Instinct: " + (player.dt.autoBuild !== false ? "ON" : "OFF") },
            unlocked() { return hasUpgrade("dt", 32) },
            canClick() { return true },
            onClick() { player.dt.autoBuild = player.dt.autoBuild === false },
            style() { return { width: "200px", "min-height": "50px", height: "50px" } },
        },
    },
    upgrades: {
        11: deepTime("Oral Tradition", "Keep Agriculture, Mining and Writing through extinctions.", 1),
        12: deepTime("Ancestral Lands", "Every civilization starts with 10 Fields, 5 Huts, 3 Libraries, 500 Food and 100 Wood.", 2),
        13: deepTime("Division of Labor", "Newcomers take a job on their own: Farmer if food is short, otherwise whichever job has the fewest hands.", 3),
        14: deepTime("Seed Bank", "Food x1.5, and winter only halves your food instead of quartering it.", 5),
        21: deepTime("Library of Alexandria", "Knowledge x1.5, Knowledge storage x1.5.", 8),
        22: deepTime("Deep Roots", "After an extinction, Act 3's Biomass starts at 1e30.", 12),
        23: deepTime("Masonry Memory", "Buildings are 15% cheaper.", 20),
        24: deepTime("Cultural Memory", "Keep every tech up to Philosophy through extinctions.", 30),
        31: deepTime("Gentle Hands", "Footprint x0.75.", 45),
        32: deepTime("Builders' Instinct", "Buildings are bought on their own when they cost less than half of what you have (except Factories and Power Plants), and you start with the Assembly Line.", 65),
        33: deepTime("Eternal Archive", "Keep every tech through extinctions.", 90),
        34: deepTime("Resilient Earth", "The biosphere can take twice the footprint.", 125),
        41: deepTime("Golden Age", "Everything your civilization makes x2.", 175),
        42: deepTime("Deep Strata", "Strata gain x2.", 200),
        43: deepTime("Stewardship", "Footprint x0.5.", 300),
        44: deepTime("The Long Now", "Unlock Eternity, the end of Act 4.", 400),
    },
})
