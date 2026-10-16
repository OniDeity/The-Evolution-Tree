// ============================================================
//  ACT 6 IN ACT 3: MASS EXTINCTIONS, VIRUSES AND GEOLOGICAL ERAS (v3.2)
//  Antimatter Dimensions' Infinity and Eternity, retold. From Loop 3 on, Act 3 goes past the Spark.
//
//  Mass Extinctions (mx): Infinity. With 1.8e308 Biomass, wipe Act 3 out for Lineages: the few lines
//      that carry on. They buy 16 upgrades, and the Big Five (Infinity Challenges) change the rules of a run.
//  Viruses (vi): Replicanti. A population that copies itself up to 1.8e308 and makes every tier stronger;
//      at the cap it bursts into a free viral radiation.
//  Geological Eras (er): Eternity. Close an era to start Mass Extinctions over for Eons; its milestones
//      take Act 3's last choices off your hands.
//  All three survive every Genesis. None of them ever undo the Spark of Sentience.
// ============================================================

function speciesDeepUnlocked() {
    return !!(player.lt && player.lt.genesis >= 3 && speciesUnlocked() && player.ti.sentient)
}

// ------------------------------------------------------------
//  MASS EXTINCTIONS
// ------------------------------------------------------------
function lineageMult() {
    // Survivors carry on: every mass extinction you've lived through adds 20%
    let m = new Decimal(1 + player.mx.crunches / 5)
    if (hasUpgrade("mx", 32)) m = m.times(2)
    if (hasChallenge("mx", 31)) m = m.times(2)
    if (hasUpgrade("lt", 43)) m = m.times(2)
    if (hasMilestone("er", 7)) m = m.times(10)
    m = m.times(eonEffect("lineages"))
    return m
}

// Before Break the Cycle a mass extinction is worth 1 Lineage (times boosts); after it, every 308 more digits of Biomass are worth 10x
function lineageGain() {
    if (!speciesDeepUnlocked() || player.biomass.lt(SENTIENCE)) return new Decimal(0)
    let base = hasUpgrade("mx", 34) ? Decimal.pow(10, player.biomass.log10().div(308).sub(1)) : new Decimal(1)
    return base.times(lineageMult()).floor().max(1)
}

function inExtinction(id) {
    return !!(player.mx && player.mx.activeChallenge == id)
}

// Wipe Act 3 back to a handful of survivors. The Spark of Sentience stays lit.
function extinctionWipe() {
    speciesReset(2)
    player.ar.points = new Decimal(hasUpgrade("mx", 14) ? 1 : 0)
    if (hasUpgrade("mx", 13)) player.sn.points = new Decimal(2)
    player.mx.runTime = 0
    player.mx.peak = new Decimal(0)
    player.mx.stall = 0
}

function massExtinction() {
    let g = lineageGain()
    if (g.lt(1)) return
    player.mx.points = player.mx.points.add(g)
    player.mx.total = player.mx.total.add(g)
    player.mx.best = player.mx.best.max(g)
    player.mx.crunches++
    player.mx.eraCrunches++
    let keys = hasUpgrade("mx", 23) ? player.sn.keystones.slice() : null
    extinctionWipe()
    if (keys && hasUpgrade("mx", 13)) player.sn.keystones = keys
}

const MX_UPGRADES = {
    11: ["Survivors", "Every tier gets stronger with every mass extinction you've lived through.", 1, () => new Decimal(1 + player.mx.crunches).pow(1.5), "tiers"],
    12: ["Living Fossils", "Bacteria get stronger with your Lineages.", 1, () => player.mx.points.add(1).pow(2), "bacteria"],
    13: ["Fast Recovery", "After a mass extinction, start with 2 speciations.", 2],
    14: ["Adaptive Burst", "After a mass extinction, start with 1 radiation.", 3],
    21: ["Opportunists", "Metabolism +0.02.", 5],
    22: ["Empty Niches", "Every tier gets stronger the longer this run has lasted.", 8, () => new Decimal(1 + player.mx.runTime / 60).pow(2), "tiers"],
    23: ["Keystone Memory", "Keystones survive a mass extinction (with Fast Recovery).", 13],
    24: ["Viruses", "Unlock <b>Viruses</b>.", 21],
    31: ["Bounce Back", "Biomass gain x(mass extinctions + 1)².", 50, () => new Decimal(player.mx.crunches + 1).pow(2), "biomass"],
    32: ["Lazarus Taxa", "Lineages x2.", 100],
    33: ["Mass Extinction Events", "Mass extinctions happen on their own: at once, or after Break the Cycle, once your Lineage gain has stopped growing for 30 seconds.", 200],
    34: ["Break the Cycle", "Biomass past 1.8e308 counts: every 308 more digits make a mass extinction worth 10x as many Lineages.", 500],
    41: ["Hothouse", "Every tier gets stronger with your best Lineage gain.", 2000, () => player.mx.best.add(1).pow(0.5), "tiers"],
    42: ["Adaptive Radiation, Again", "Radiations make Metabolism +0.01 stronger each.", 1e4],
    43: ["The Big Five", "Unlock the Big Five, five extinctions that change the rules.", 5e4],
    44: ["Deep Time", "Unlock <b>Geological Eras</b>.", 1e6],
}

function mxEffect(id) {
    return hasUpgrade("mx", id) && MX_UPGRADES[id][3] ? MX_UPGRADES[id][3]() : new Decimal(1)
}

// The Big Five: each changes the rules of a run; reach 1.8e308 Biomass to survive it
const BIG_FIVE = {
    11: { name: "Ordovician", text: "An ice age: Metabolism does nothing, and food is twice as scarce.", reward: "Metabolism +0.05." },
    12: { name: "Devonian", text: "The oceans lose their oxygen: only the first 6 tiers exist.", reward: "Primates and Humans x1e10." },
    21: { name: "Permian", text: "The Great Dying: Biomass gain is raised to ^0.75.", reward: "Biomass gain ^1.02." },
    22: { name: "Triassic", text: "Volcanoes everywhere: speciation needs 3 times as many.", reward: "Speciation needs 20% fewer." },
    31: { name: "Cretaceous", text: "A meteor: every minute, every tier loses 90% of its population.", reward: "Lineages x2." },
}

// Hooks used in species.js
function speciesDeepTierMult(t) {
    if (!player.mx || !speciesDeepUnlocked()) return new Decimal(1)
    let m = mxEffect(11).times(mxEffect(22)).times(mxEffect(41)).times(virusEffect()).times(eonEffect("tiers"))
    if (t == 1) m = m.times(mxEffect(12))
    if (t >= 7 && hasChallenge("mx", 12)) m = m.times(1e10)
    if (hasUpgrade("er", 24)) m = m.times(1e50)
    return m
}

function speciesDeepBiomass(g) {
    if (!player.mx || !speciesDeepUnlocked()) return g
    g = g.times(mxEffect(31))
    if (hasUpgrade("er", 22)) g = g.times(1e100)
    if (hasChallenge("mx", 21)) g = g.pow(1.02)
    if (inExtinction(21)) g = g.pow(0.75)
    return g
}

function speciesDeepMetabolism() {
    if (!player.mx || !speciesDeepUnlocked()) return 0
    let b = 0.03 * player.vi.radiations
    if (hasUpgrade("mx", 21)) b += 0.02
    if (hasChallenge("mx", 11)) b += 0.05
    if (hasUpgrade("mx", 42)) b += 0.01 * player.ar.points.toNumber()
    return b
}

function bigFiveBeaten() {
    return player.mx ? Object.keys(BIG_FIVE).filter(id => hasChallenge("mx", id)).length : 0
}

addLayer("mx", {
    name: "mass extinctions",
    symbol: "Mx",
    row: 54,
    position: 0,
    color: "#a64d79",
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        total: new Decimal(0),
        best: new Decimal(0),
        crunches: 0,
        eraCrunches: 0,
        runTime: 0,
        auto: true,
        meteor: 0,
        peak: new Decimal(0),
        stall: 0,
    }},
    type: "none",
    resource: "Lineages",
    layerShown() { return speciesDeepUnlocked() },
    tooltip() { return format(player.mx.points) + " Lineages" },
    update(diff) {
        if (!speciesDeepUnlocked()) return
        let d = diff * actSpeedCache[3]
        player.mx.runTime += d
        // For automatic mass extinctions: how long (in Act 3 time) since the Lineage gain last grew by 1%
        let g = lineageGain()
        if (g.gt(player.mx.peak.times(1.01))) { player.mx.peak = g; player.mx.stall = 0 } else player.mx.stall += d
        // The Cretaceous: every minute the meteor strikes again
        if (inExtinction(31)) {
            player.mx.meteor += d
            if (player.mx.meteor >= 60) {
                player.mx.meteor = 0
                for (let t = 1; t <= 8; t++) player.ti.amounts[t] = player.ti.amounts[t].times(0.1)
            }
        }
    },
    automate() {
        if (!speciesDeepUnlocked()) return
        if ((hasUpgrade("mx", 33) || hasMilestone("er", 1)) && player.mx.auto && !player.mx.activeChallenge) {
            if (lineageGain().gte(1) && (!hasUpgrade("mx", 34) || player.mx.stall >= 30)) massExtinction()
        }
        if (player.mx.activeChallenge && canCompleteChallenge("mx", player.mx.activeChallenge)) startChallenge("mx", player.mx.activeChallenge)
        if (hasMilestone("er", 6) && !player.mx.activeChallenge) {
            let next = Object.keys(BIG_FIVE).find(id => !hasChallenge("mx", id))
            if (next && player.mx.runTime > 30) startChallenge("mx", Number(next))
        }
    },
    tabFormat: {
        "Mass Extinctions": {
            content: [
                ["display-text", function() { return mxHeader() }],
                "blank",
                lore("Five times, life has nearly ended. Five times, a few lineages made it through, and the world they inherited was wide open."),
                "blank",
                ["display-text", function() {
                    return "With 1.8e308 Biomass, <b>end it all</b>: Act 3 starts over from 10 Biomass, speciations and radiations included, but the Spark of Sentience stays lit. Each mass extinction pays Lineages" +
                        (hasUpgrade("mx", 34) ? " (10x for every 308 more digits of Biomass)" : "") + ", and every one you've lived through makes the next pay 20% more." + "<br>This run has lasted " + formatTime(player.mx.runTime) + " of Act 3 time."
                }],
                "blank",
                ["clickables", [9]],
                ["clickables", [1]],
                "blank",
                "upgrades",
            ],
        },
        "The Big Five": {
            unlocked() { return hasUpgrade("mx", 43) },
            content: [
                ["display-text", function() { return mxHeader() }],
                "blank",
                ["display-text", "Each of the Big Five changes the rules of a run. Starting one wipes Act 3 like a mass extinction (without paying Lineages). Reach 1.8e308 Biomass to survive it."],
                "blank",
                "challenges",
            ],
        },
    },
    clickables: {
        11: {
            title: "Mass extinctions on their own",
            display() { return player.mx.auto ? "On" : "Off" },
            unlocked() { return hasUpgrade("mx", 33) || hasMilestone("er", 1) },
            canClick() { return true },
            onClick() { player.mx.auto = !player.mx.auto },
            style() { return { width: "180px", "min-height": "50px", height: "50px" } },
        },
        91: {
            title: "Mass extinction",
            display() { let g = lineageGain(); return g.lt(1) ? "Reach 1.8e308 Biomass first." : "Wipe out Act 3 for <b>" + format(g) + "</b> Lineages." },
            canClick() { return lineageGain().gte(1) && !player.mx.activeChallenge },
            onClick() { player.mx.last = lineageGain(); massExtinction() },
            style() { return { width: "260px", height: "90px", "min-height": "90px" } },
        },
    },
    upgrades: Object.fromEntries(Object.entries(MX_UPGRADES).map(([id, u]) => [id, Object.assign({
        title: u[0],
        description: u[1],
        cost: new Decimal(u[2]),
        unlocked() { return Number(id) < 20 || hasUpgrade("mx", Number(id) - 10) || hasUpgrade("mx", Number(id) - 9) || hasUpgrade("mx", Number(id) - 11) },
    }, u[3] ? { effect: u[3], effectDisplay() { return "x" + format(upgradeEffect("mx", id)) } } : {})])),
    challenges: Object.fromEntries(Object.entries(BIG_FIVE).map(([id, c]) => [id, {
        name: c.name,
        challengeDescription: c.text,
        goalDescription: "1.8e308 Biomass",
        canComplete() { return player.biomass.gte(SENTIENCE) },
        rewardDescription: c.reward,
        unlocked() { return hasUpgrade("mx", 43) },
        onEnter() { extinctionWipe(); player.mx.meteor = 0 },
        onExit() { extinctionWipe() },
        style() { return { width: "220px", height: "220px" } },
    }])),
})

function mxHeader() {
    return "<h2 style='color:#a64d79'>Mass Extinctions</h2><br>You have <h2 style='color:#a64d79'>" + format(player.mx.points) + "</h2> Lineages, from " + formatWhole(player.mx.crunches) + " mass extinction" + (player.mx.crunches == 1 ? "" : "s") + "."
}

// ------------------------------------------------------------
//  VIRUSES
// ------------------------------------------------------------
const VIRUS_CAP = new Decimal("1.8e308")

function virusesUnlocked() {
    return speciesDeepUnlocked() && hasUpgrade("mx", 24)
}

function virusChance() {
    let c = 0.01 * (1 + getBuyableAmount("vi", 11).toNumber())
    if (hasUpgrade("lt", 44)) c *= 2
    return Math.min(1, c)
}

function virusInterval() {
    return Math.max(0.05, Math.pow(0.9, getBuyableAmount("vi", 12).toNumber())) / (hasUpgrade("er", 13) ? 2 : 1)
}

function virusEffect() {
    if (!player.vi || !virusesUnlocked()) return new Decimal(1)
    return player.vi.viruses.max(1).log10().add(1).pow(2)
}

// At the cap the viruses burst into a viral radiation (Replicanti Galaxies): a free radiation for Metabolism
function viralRadiationMax() {
    return getBuyableAmount("vi", 13).toNumber()
}

function viBuyable(title, base, step, text, max) {
    return {
        title: title,
        cost(x) { return Decimal.pow(step, x).times(base) },
        display() { return text() + "<br>Level " + formatWhole(getBuyableAmount("vi", this.id)) + (max && getBuyableAmount("vi", this.id).gte(max) ? " (max)" : "<br>Cost: " + format(this.cost()) + " Lineages") },
        canAfford() { return (!max || getBuyableAmount("vi", this.id).lt(max)) && player.mx.points.gte(this.cost()) },
        buy() {
            player.mx.points = player.mx.points.sub(this.cost())
            setBuyableAmount("vi", this.id, getBuyableAmount("vi", this.id).add(1))
        },
        style() { return { width: "170px", height: "120px" } },
    }
}

addLayer("vi", {
    name: "viruses",
    symbol: "Vi",
    row: 54,
    position: 1,
    color: "#6aa84f",
    startData() { return { unlocked: true, points: new Decimal(0), viruses: new Decimal(1), radiations: 0 } },
    type: "none",
    branches: ["mx"],
    layerShown() { return virusesUnlocked() },
    tooltip() { return format(player.vi.viruses) + " viruses" },
    update(diff) {
        if (!virusesUnlocked()) return
        let d = diff * actSpeedCache[3]
        player.vi.viruses = player.vi.viruses.times(Decimal.pow(1 + virusChance(), d / virusInterval())).min(VIRUS_CAP)
        if (player.vi.viruses.gte(VIRUS_CAP) && player.vi.radiations < viralRadiationMax()) {
            player.vi.radiations++
            player.vi.viruses = new Decimal(1)
        }
    },
    tabFormat: [
        ["display-text", function() { return "<h2 style='color:#6aa84f'>Viruses</h2><br>You have <h2 style='color:#6aa84f'>" + format(player.vi.viruses) + "</h2> viruses, making every tier x" + format(virusEffect()) + " stronger." }],
        "blank",
        lore("Not quite alive, never quite gone. Every lineage carries the scars of a thousand old infections, and some of them turned out to be useful."),
        "blank",
        ["display-text", function() {
            return "Every " + formatTime(virusInterval()) + " of Act 3 time, each virus has a " + format(virusChance() * 100, 0) + "% chance to copy itself, up to 1.8e308. At the cap they burst into a <b>viral radiation</b> (" + player.vi.radiations + " of " + viralRadiationMax() + " so far): +0.03 Metabolism, like a radiation that never resets, and the count starts over.<br>Viruses never reset on a mass extinction."
        }],
        "blank",
        "buyables",
    ],
    buyables: {
        11: viBuyable("Infectivity", 25, 3, () => "+1% chance to copy. Now " + format(virusChance() * 100, 0) + "%.", 99),
        12: viBuyable("Incubation", 50, 4, () => "Copies 10% sooner (0.05s at the soonest). Now every " + formatTime(virusInterval()) + "."),
        13: viBuyable("Pandemic", 500, 10, () => "+1 viral radiation the viruses can burst into."),
    },
})

// ------------------------------------------------------------
//  GEOLOGICAL ERAS
// ------------------------------------------------------------
function erasUnlocked() {
    return speciesDeepUnlocked() && (hasUpgrade("mx", 44) || player.er.count > 0)
}

function eonGain() {
    if (!erasUnlocked() || player.mx.points.lt(1e6)) return new Decimal(0)
    let g = player.mx.points.log10().sub(5).pow(2).floor()
    g = g.times(eonUpgradeMult())
    return g.floor()
}

function eonUpgradeMult() {
    return hasUpgrade("er", 23) ? 2 : 1
}

function eonEffect(kind) {
    if (!player.er || !erasUnlocked()) return new Decimal(1)
    let e = player.er.total
    if (kind == "tiers" && hasUpgrade("er", 11)) return e.add(1).pow(3)
    if (kind == "lineages" && hasUpgrade("er", 12)) return e.add(1)
    return new Decimal(1)
}

const ERA_NAMES = ["Cambrian", "Ordovician", "Silurian", "Devonian", "Carboniferous", "Permian", "Triassic", "Jurassic", "Cretaceous", "Paleogene", "Neogene", "Quaternary"]

function eraName() {
    return ERA_NAMES[Math.min(player.er.count, ERA_NAMES.length - 1)] + (player.er.count >= ERA_NAMES.length ? " (and beyond)" : "")
}

function closeEra() {
    let g = eonGain()
    if (g.lt(1)) return
    player.er.points = player.er.points.add(g)
    player.er.total = player.er.total.add(g)
    player.er.count++
    let keepMx = ["auto"]
    if (hasMilestone("er", 0)) keepMx.push("challenges")
    if (hasMilestone("er", 2)) keepMx.push("upgrades")
    let crunches = player.mx.crunches
    resetKeeping("mx", keepMx)
    player.mx.crunches = crunches
    if (hasUpgrade("er", 14)) { player.mx.points = new Decimal(100); player.mx.crunches += 10 }
    if (!hasMilestone("er", 5)) resetKeeping("vi", [])
    extinctionWipe()
}

// Era milestones run Act 3's last choices for you
function eraAutomation() {
    if (!erasUnlocked()) return
    // Selection Pressures: fight the next one you haven't beaten, and leave once it's won (or after 5 minutes)
    if (hasMilestone("er", 3) && player.pz) {
        let id = player.pz.activeChallenge
        if (id) { if (canCompleteChallenge("pz", id) || player.pz.resetTime > 300) startChallenge("pz", id) }
        else if (!player.mx.activeChallenge) { let next = PRESSURE_IDS.find(i => !hasChallenge("pz", i)); if (next) startChallenge("pz", next) }
    }
    // Competition backs the top tier, and the founder is whichever of the first four has the most
    if (hasMilestone("er", 4)) {
        player.cu.winner = tiersUnlocked()
        if (competitionGain(player.cu.winner).gte(2) && layers.cu.clickables[91].canClick()) layers.cu.clickables[91].onClick()
        player.ar.founder = [1, 2, 3, 4].reduce((a, t) => player.ti.amounts[t].gt(player.ti.amounts[a]) ? t : a, 1)
    }
}

addLayer("er", {
    name: "geological eras",
    symbol: "Er",
    row: 55,
    position: 0,
    color: "#b45f06",
    startData() { return { unlocked: true, points: new Decimal(0), total: new Decimal(0), count: 0 } },
    type: "none",
    resource: "Eons",
    branches: ["mx", "vi"],
    layerShown() { return erasUnlocked() },
    tooltip() { return formatWhole(player.er.points) + " Eons" },
    automate() { eraAutomation() },
    tabFormat: [
        ["display-text", function() { return "<h2 style='color:#b45f06'>Geological Eras</h2><br>You have <h2 style='color:#b45f06'>" + formatWhole(player.er.points) + "</h2> Eons. This is the " + eraName() + "." }],
        "blank",
        lore("Rock remembers. Every era leaves a layer, and every layer holds the ones who lived and died in it."),
        "blank",
        ["display-text", function() { return "<b>Close the era</b> to start Mass Extinctions over (Lineages, their upgrades and the Big Five, unless milestones keep them) for Eons. You need 1e6 Lineages; Eons come from their digits past 5, squared." }],
        "blank",
        ["clickables", [9]],
        "blank",
        "milestones",
        "blank",
        "upgrades",
    ],
    clickables: {
        91: {
            title: "Close the era",
            display() { let g = eonGain(); return g.lt(1) ? "Reach 1e6 Lineages first." : "Start a new era for <b>" + formatWhole(g) + "</b> Eons." },
            canClick() { return eonGain().gte(1) && !player.mx.activeChallenge },
            onClick() { closeEra() },
            style() { return { width: "260px", height: "90px", "min-height": "90px" } },
        },
    },
    milestones: {
        0: { requirementDescription: "1 era", effectDescription: "Keep the Big Five you've survived.", done() { return player.er.count >= 1 } },
        1: { requirementDescription: "2 eras", effectDescription: "Mass extinctions happen on their own (see the switch in Mass Extinctions).", done() { return player.er.count >= 2 } },
        2: { requirementDescription: "3 eras", effectDescription: "Keep Lineage upgrades.", done() { return player.er.count >= 3 } },
        3: { requirementDescription: "4 eras", effectDescription: "Selection Pressures you haven't beaten are fought on their own.", done() { return player.er.count >= 4 } },
        4: { requirementDescription: "5 eras", effectDescription: "Competition backs your top tier, and the founder is chosen for you.", done() { return player.er.count >= 5 } },
        5: { requirementDescription: "6 eras", effectDescription: "Viruses survive a new era.", done() { return player.er.count >= 6 } },
        6: { requirementDescription: "8 eras", effectDescription: "The Big Five are fought on their own.", done() { return player.er.count >= 8 } },
        7: { requirementDescription: "10 eras", effectDescription: "Lineages x10.", done() { return player.er.count >= 10 } },
    },
    upgrades: {
        11: { title: "Strata", description: "Every tier gets stronger with every Eon you've earned (cubed).", cost: new Decimal(1), effect() { return eonEffect("tiers") }, effectDisplay() { return "x" + format(upgradeEffect("er", 11)) } },
        12: { title: "Index Fossils", description: "Lineages x(Eons earned + 1).", cost: new Decimal(3), effect() { return eonEffect("lineages") }, effectDisplay() { return "x" + format(upgradeEffect("er", 12)) } },
        13: { title: "Continental Drift", description: "Viruses copy themselves twice as often.", cost: new Decimal(10) },
        14: { title: "Hard Rock", description: "A new era starts with 100 Lineages and 10 mass extinctions.", cost: new Decimal(25) },
        21: { title: "Ice Cores", description: "Act 3 runs twice as fast.", cost: new Decimal(60) },
        22: { title: "Superposition", description: "Biomass gain x1e100.", cost: new Decimal(150) },
        23: { title: "Unconformity", description: "Eons x2.", cost: new Decimal(400) },
        24: { title: "The Phanerozoic", description: "Every tier x1e50. Five hundred million years of animals, in one layer of rock.", cost: new Decimal(1000) },
    },
})
