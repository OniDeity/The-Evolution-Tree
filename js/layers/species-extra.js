// ============================================================
//  ACT 3 EXPANSION (optional bonus content; Sentience doesn't need any of it)
//
//  Selection Pressures (pz): Antimatter Dimensions' challenges, retold. Each one changes the rules of a run.
//      Twist: beating one teaches your species an Instinct, an autobuyer you can switch on and off.
//  Specimen Collection (sc): a museum of famous creatures, found by reaching milestones
//  Field Notes         (sf): statistics for Act 3
// ============================================================

const PRESSURES = {
    11: { name: "Island", text: "Life is stuck on a small island. Only the first 4 tiers exist.", goal: "1e25",
          instinct: "t12", reward: "Instinct: buy Bacteria and Fish on their own." },
    12: { name: "Drought", text: "Food is scarce. Food demand is 4x higher.", goal: "1e140",
          instinct: "me", reward: "Instinct: buy Metabolism on its own (while it helps)." },
    13: { name: "Ice Age", text: "Everything is cold-blooded. Metabolism does nothing.", goal: "1e40",
          instinct: "t34", reward: "Instinct: buy Amphibians and Reptiles on their own." },
    14: { name: "Crowded Niche", text: "Every 10 purchases of a tier only multiply it by 1.5 instead of 2.", goal: "1e100",
          instinct: "t56", reward: "Instinct: buy Birds and Mammals on their own." },
    21: { name: "Fragmented Range", text: "Populations are cut off from each other. Speciation needs twice as many purchases.", goal: "1e90",
          instinct: "sn", reward: "Instinct: speciate on its own." },
    22: { name: "Famine", text: "The food pyramid is merciless. A starving tier makes nothing at all.", goal: "1e160",
          instinct: "t78", reward: "Instinct: buy Primates and Humans on their own." },
    23: { name: "Invasive Species", text: "Competitors drive prices up. Every tier's cost grows 10x faster.", goal: "1e90",
          instinct: "cu", reward: "Instinct: compete on its own, whenever it would at least double the winner." },
    24: { name: "Bottleneck", text: "A tiny population, short on variety. Biomass gain is raised to the 0.9.", goal: "1e165",
          instinct: "ar", reward: "Instinct: radiate on its own, keeping your chosen founder." },
}
const PRESSURE_IDS = Object.keys(PRESSURES).map(Number)

const INSTINCTS = [
    ["t12", "Bacteria and Fish"], ["t34", "Amphibians and Reptiles"], ["t56", "Birds and Mammals"], ["t78", "Primates and Humans"],
    ["me", "Metabolism"], ["sn", "Speciation"], ["cu", "Competition"], ["ar", "Radiation"],
]

function inPressure(id) {
    return player.pz && player.pz.activeChallenge == id
}

function hasInstinct(key) {
    // Act 4's first extinction teaches the instincts needed to grow the living world back
    if (player.ex && player.ex.count >= 1 && key != "cu") return true
    return PRESSURE_IDS.some(id => PRESSURES[id].instinct == key && hasChallenge("pz", id))
}

function instinctOn(key) {
    return hasInstinct(key) && player.pz.auto[key] !== false
}

function pressuresBeaten() {
    return player.pz ? PRESSURE_IDS.filter(id => hasChallenge("pz", id)).length : 0
}

// Instincts run every tick: tiers from the top down, then the rest
function runInstincts() {
    if (instinctOn("me")) for (let i = 0; i < 100 && metabolismWorthIt() && layers.me.buyables[11].canAfford(); i++) layers.me.buyables[11].buy()
    let tierKeys = { 1: "t12", 2: "t12", 3: "t34", 4: "t34", 5: "t56", 6: "t56", 7: "t78", 8: "t78" }
    let tiers = []
    for (let t = tiersUnlocked(); t >= 1; t--) if (instinctOn(tierKeys[t])) tiers.push(t)
    buyTiers(tiers)
    if (instinctOn("cu") && tmp.cu.layerShown && competitionGain(player.cu.winner).gte(2) && layers.cu.clickables[91].canClick()) layers.cu.clickables[91].onClick()
    if (instinctOn("ar") && layers.ar.clickables[91].canClick()) layers.ar.clickables[91].onClick()
    else if (instinctOn("sn") && layers.sn.clickables[91].canClick()) layers.sn.clickables[91].onClick()
}

addLayer("pz", {
    name: "selection pressures",
    symbol: "Se",
    row: 22,
    position: 2,
    color: "#f39c12",
    startData() { return { unlocked: true, points: new Decimal(0), auto: {} } },
    type: "none",
    resetsNothing: true,
    branches: ["ar"],
    layerShown() { return speciesUnlocked() && (player.ar.points.gte(1) || pressuresBeaten() > 0) },
    tooltip() { return pressuresBeaten() + " / " + PRESSURE_IDS.length + " pressures beaten" },
    update(diff) {
        if (!speciesUnlocked()) return
        // Like reaching Infinity in a challenge: hitting the goal finishes it right away
        let a = player.pz.activeChallenge
        if (a && canCompleteChallenge("pz", a)) startChallenge("pz", a)
    },
    automate() {
        if (!speciesUnlocked()) return
        runInstincts()
        if (hasMilestone("pz", 0)) for (let l of ["ti", "me"]) for (let id in layers[l].upgrades) if (!isNaN(id)) buyUpg(l, id)
    },
    milestones: {
        0: { requirementDescription: "Beat 4 pressures", effectDescription: "Evolutionary milestones and Metabolism upgrades are bought on their own.", done() { return pressuresBeaten() >= 4 } },
    },
    challenges: Object.fromEntries(PRESSURE_IDS.map(id => [id, {
        name: PRESSURES[id].name,
        challengeDescription() { return PRESSURES[id].text + "<br>Entering or leaving resets your tiers, Metabolism and speciations." },
        goalDescription() { return format(new Decimal(PRESSURES[id].goal)) + " Biomass" },
        canComplete() { return player.biomass.gte(PRESSURES[id].goal) },
        rewardDescription: PRESSURES[id].reward,
        onEnter() { speciesReset(2) },
        onExit() { speciesReset(2) },
        style() { return { width: "250px", height: "260px" } },
    }])),
    clickables: Object.fromEntries(INSTINCTS.map(([key, label], n) => [11 + 10 * Math.floor(n / 4) + n % 4, {
        title: label,
        display() { return !hasInstinct(key) ? "Not learned yet" : instinctOn(key) ? "ON" : "OFF" },
        canClick() { return hasInstinct(key) },
        onClick() { player.pz.auto[key] = !instinctOn(key) },
        style() { return { width: "120px", height: "80px", "min-height": "80px", "background-color": instinctOn(key) ? "#f39c12" : hasInstinct(key) ? "#7a5a20" : "" } },
    }])),
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#f39c12'>Selection Pressures</h2><br>You've beaten <h2 style='color:#f39c12'>" + pressuresBeaten() + "</h2> of " + PRESSURE_IDS.length + " pressures."
        }],
        "blank",
        lore("Nature is not kind. Every drought, island and famine weeds out the unlucky, and what's left is a little better at surviving the next one."),
        "blank",
        ["display-text", "Each pressure changes the rules of a run. Reach its goal and you win straight away. Your species learns an <b>Instinct</b>: something it now does on its own.<br>" +
            "<i>These are optional. You can reach Sentience without them.</i>"],
        "blank",
        ["display-text", "<h3>Instincts</h3>"],
        "blank",
        "clickables",
        "blank",
        "milestones",
        "blank",
        "challenges",
    ],
})

// ------------------------------------------------------------
//  SPECIMEN COLLECTION
// ------------------------------------------------------------
const SPECIMENS = [
    { name: "Megalodon", era: "Miocene", lore: "A shark as long as a bus, with teeth the size of your hand.", hint: "Have 100 Fish bought.",
      done() { return tierBought(2).gte(100) } },
    { name: "Diplocaulus", era: "Permian", lore: "An amphibian with a head shaped like a boomerang. Nobody is quite sure why.", hint: "Have 50 Amphibians bought.",
      done() { return tierBought(3).gte(50) } },
    { name: "Lystrosaurus", era: "Triassic", lore: "A stocky, tusked plant-eater that survived the worst extinction ever and then was everywhere.", hint: "Speciate 3 times in one run.",
      done() { return player.sn.points.gte(3) } },
    { name: "Tyrannosaurus", era: "Cretaceous", lore: "Twelve metres long, with the strongest bite of any land animal.", hint: "Have 50 Reptiles bought.",
      done() { return tierBought(4).gte(50) } },
    { name: "Archaeopteryx", era: "Jurassic", lore: "Feathers, wings, and a mouth full of teeth. Part dinosaur, part bird.", hint: "Buy a Bird.",
      done() { return tierBought(5).gte(1) } },
    { name: "Smilodon", era: "Pleistocene", lore: "The sabre-toothed cat, with fangs as long as a knife blade.", hint: "Have 25 Mammals bought.",
      done() { return tierBought(6).gte(25) } },
    { name: "Woolly Mammoth", era: "Pleistocene", lore: "Built for the cold, and still around when the pyramids were being built.", hint: "Reach Metabolism level 50.",
      done() { return metabolismLevel().gte(50) } },
    { name: "Dodo", era: "Holocene", lore: "A trusting bird on an island with no predators, until there were.", hint: "Compete 10 times.",
      done() { return player.sf.competes >= 10 } },
    { name: "Lucy", era: "Pliocene", lore: "Australopithecus: an ape that walked upright, 3.2 million years ago.", hint: "Have 25 Primates bought.",
      done() { return tierBought(7).gte(25) } },
    { name: "Turkana Boy", era: "Pleistocene", lore: "Homo erectus: tall, long-legged, and very nearly us.", hint: "Have 25 Humans bought.",
      done() { return tierBought(8).gte(25) } },
    { name: "Galápagos Tortoise", era: "Today", lore: "Each island has its own shape of shell. It gave Darwin something to think about.", hint: "Beat a Selection Pressure.",
      done() { return pressuresBeaten() >= 1 } },
    { name: "Lascaux Horse", era: "Paleolithic", lore: "Not a fossil but a painting, made by someone who looked at a horse and wanted to remember it.", hint: "Beat every Selection Pressure.",
      done() { return pressuresBeaten() >= PRESSURE_IDS.length } },
]

function specimensFound() {
    return player.sc ? player.sc.achievements.length : 0
}

function specimenBonus() {
    let b = new Decimal(1 + 0.05 * specimensFound())
    if (specimensFound() >= SPECIMENS.length) b = b.times(2)
    return b
}

addLayer("sc", {
    name: "specimen collection",
    symbol: "Sc",
    row: 19,
    position: 3,
    color: "#d4a373",
    startData() { return { unlocked: true, points: new Decimal(0) } },
    type: "none",
    layerShown() { return speciesUnlocked() },
    nodeStyle: SIDE_NODE_STYLE,
    tooltip() { return specimensFound() + " / " + SPECIMENS.length + " specimens" },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#d4a373'>Specimen Collection</h2><br>You have <h2 style='color:#d4a373'>" + specimensFound() + "</h2> of " + SPECIMENS.length + " specimens, multiplying Biomass gain by <b>" + format(specimenBonus()) + "x</b>.<br>" +
                "Each specimen adds 5% to Biomass gain, and the whole collection doubles it."
        }],
        "blank",
        "achievements",
        "blank",
        ["display-text", function() {
            let found = SPECIMENS.filter((f, n) => hasAchievement("sc", 11 + Math.floor(n / 4) * 10 + n % 4))
            if (!found.length) return "<i>Nothing in the collection yet.</i>"
            return "<h3>The Collection</h3><br>" + found.map(f => "<b>" + f.name + "</b> <i>(" + f.era + ")</i>: " + f.lore).join("<br>")
        }],
    ],
    achievements: Object.assign({}, ...SPECIMENS.map((f, n) => ({
        [11 + Math.floor(n / 4) * 10 + n % 4]: {
            name: f.name,
            done() { return speciesUnlocked() && f.done() },
            tooltip() { return hasAchievement("sc", this.id) ? f.era + ". " + f.lore : f.hint },
            style() { return hasAchievement("sc", this.id) ? { "background-color": "#d4a373" } : {} },
        },
    }))),
})

// ------------------------------------------------------------
//  FIELD NOTES (Act 3)
// ------------------------------------------------------------
addLayer("sf", {
    name: "species field notes",
    symbol: "Fn",
    row: 19,
    position: 4,
    color: "#9fb4c7",
    startData() { return { unlocked: true, points: new Decimal(0), time: 0, bestBiomass: new Decimal(0), speciations: 0, radiations: 0, competes: 0, buried: 0 } },
    type: "none",
    layerShown() { return speciesUnlocked() },
    nodeStyle: SIDE_NODE_STYLE,
    tooltip() { return "Field Notes" },
    update(diff) {
        if (!speciesUnlocked()) return
        player.sf.time += diff
        player.sf.bestBiomass = player.sf.bestBiomass.max(player.biomass)
    },
    tabFormat: [
        ["display-text", function() {
            let rows = [
                ["Time since Act 3 began", formatTime(player.sf.time)],
                ["Most Biomass at once", format(player.sf.bestBiomass)],
                ["Speciations", formatWhole(player.sf.speciations)],
                ["Radiations", formatWhole(player.sf.radiations)],
                ["Times competed", formatWhole(player.sf.competes)],
                ["Metabolism level", formatWhole(metabolismLevel())],
                ["Pressures beaten", pressuresBeaten() + " / " + PRESSURE_IDS.length],
                ["Specimens found", specimensFound() + " / " + SPECIMENS.length],
                ["Sentient", player.ti.sentient ? "Yes" : "Not yet"],
            ]
            return "<h2 style='color:#9fb4c7'>Field Notes</h2><br><br><table style='margin:auto;text-align:left;border-spacing:12px 4px'>" +
                rows.map(r => "<tr><td>" + r[0] + "</td><td><b>" + r[1] + "</b></td></tr>").join("") + "</table>"
        }],
    ],
})
