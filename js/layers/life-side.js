// ============================================================
//  ACT 2: LIFE, SIDE LAYERS
//  These never reset. They sit in a small row at the top of the Life tree.
//
//  Fossil Record (fo): a museum that fills up as you reach milestones; every fossil boosts DNA
//  Biodiversity  (bd): rewards variety, counting the different kinds of things you've collected
//  Field Notes   (fn): statistics for Act 2
// ============================================================

const SIDE_NODE_STYLE = { width: "70px", height: "70px", "font-size": "22px" }

// ------------------------------------------------------------
//  FOSSIL RECORD
// ------------------------------------------------------------
const FOSSILS = [
    { name: "Stromatolite", era: "Archean", lore: "Layered mats of microbes. The oldest fossils on Earth.", hint: "Have 1,000 cells.",
      done() { return player.c.points.gte(1000) } },
    { name: "Acritarch", era: "Proterozoic", lore: "A tiny, spiky shell of something long gone. Nobody is sure what.", hint: "Pick 3 traits.",
      done() { return traitsPicked() >= 3 } },
    { name: "Grypania", era: "Proterozoic", lore: "A coiled ribbon, maybe the first living thing big enough to see.", hint: "Have 5 broods.",
      done() { return player.re.points.gte(5) } },
    { name: "Dickinsonia", era: "Ediacaran", lore: "A soft, quilted oval. Was it an animal? It was something.", hint: "Have 1e6 offspring.",
      done() { return player.re.offspring.gte(1e6) } },
    { name: "Trilobite", era: "Cambrian", lore: "Armored, many-legged, and wildly successful for 270 million years.", hint: "Have 12 mutations.",
      done() { return player.mu.points.gte(12) } },
    { name: "Anomalocaris", era: "Cambrian", lore: "The first great hunter: a metre long, with grasping claws and a ring-shaped mouth.", hint: "Buy the Cambrian Explosion.",
      done() { return hasUpgrade("c", 34) } },
    { name: "Ammonite", era: "Devonian", lore: "Spiral shells, every chamber a little bigger than the last.", hint: "Have 1,000 Heritage.",
      done() { return player.ge.heritage.gte(1000) } },
    { name: "Rugose Coral", era: "Ordovician", lore: "Horn-shaped corals that built the first great reefs.", hint: "Colonize every Reef.",
      done() { return habitatCount("reef") >= 4 } },
    { name: "Sea Scorpion", era: "Silurian", lore: "Eurypterids, some longer than a person, stalking the shallows.", hint: "Own an adaptation for every climate.",
      done() { return [11, 12, 13, 14].every(id => getBuyableAmount("ad", id).gte(1)) } },
    { name: "Tiktaalik", era: "Devonian", lore: "Half fish, half something new: a neck, wrists, and lungs.", hint: "Crawl onto the Shoreline.",
      done() { return reachedLand() } },
    { name: "Dunkleosteus", era: "Devonian", lore: "An armored fish with a bite of bone blades.", hint: "Beat a predator.",
      done() { return predatorWins() >= 1 } },
    { name: "Crinoid", era: "Carboniferous", lore: "Sea lilies: animals that look like flowers, swaying on long stalks.", hint: "Have a Bond of 10 with a partner.",
      done() { return SYMBIONT_IDS.some(id => player.sy.bonds[id] >= 10) } },
    { name: "Coelacanth", era: "Devonian (and today)", lore: "Thought extinct for 66 million years, until one turned up in a fishing net in 1938.", hint: "Have 20 generations.",
      done() { return player.ge.best.gte(20) } },
    { name: "Archaeopteris", era: "Devonian", lore: "One of the first true trees. Forests begin.", hint: "Have 1e100 DNA.",
      done() { return player.dna.gte(1e100) } },
    { name: "Ichthyostega", era: "Devonian", lore: "Four legs, a fish's tail, and a whole new world to walk on.", hint: "Complete your body plan.",
      done() { return bodyPlanDone() } },
    { name: "Meganeura", era: "Carboniferous", lore: "A dragonfly with the wingspan of a hawk, in air thick with oxygen.", hint: "Beat every predator 3 times.",
      done() { return predatorWins() >= 9 } },
]

function fossilsFound() {
    return player.fo ? player.fo.achievements.length : 0
}

function fossilBonus() {
    let b = new Decimal(1 + 0.05 * fossilsFound())
    if (fossilsFound() >= FOSSILS.length) b = b.times(2)
    return b
}

addLayer("fo", {
    name: "fossil record",
    symbol: "Fo",
    row: 19,
    position: 0,
    color: "#c9b28a",
    startData() { return { unlocked: true, points: new Decimal(0) } },
    type: "none",
    resource: "fossils",
    layerShown() { return lifeUnlocked() },
    nodeStyle: SIDE_NODE_STYLE,
    tooltip() { return fossilsFound() + " / " + FOSSILS.length + " fossils" },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#c9b28a'>Fossil Record</h2><br>You have found <h2 style='color:#c9b28a'>" + fossilsFound() + "</h2> of " + FOSSILS.length + " fossils, multiplying DNA gain by <b>" + format(fossilBonus()) + "</b>.<br>" +
                "Each fossil adds 5% to DNA gain, and the whole collection doubles it."
        }],
        "blank",
        "achievements",
        "blank",
        ["display-text", function() {
            let found = FOSSILS.filter((f, n) => hasAchievement("fo", 11 + Math.floor(n / 4) * 10 + n % 4))
            if (!found.length) return "<i>Nothing in the museum yet. Keep evolving.</i>"
            return "<h3>The Museum</h3><br>" + found.map(f => "<b>" + f.name + "</b> <i>(" + f.era + ")</i>: " + f.lore).join("<br>")
        }],
    ],
    achievements: Object.assign({}, ...FOSSILS.map((f, n) => ({
        [11 + Math.floor(n / 4) * 10 + n % 4]: {
            name: f.name,
            done() { return lifeUnlocked() && f.done() },
            tooltip() { return hasAchievement("fo", this.id) ? f.era + ". " + f.lore : f.hint },
            style() { return hasAchievement("fo", this.id) ? { "background-color": "#c9b28a" } : {} },
        },
    }))),
})

// ------------------------------------------------------------
//  BIODIVERSITY. Counts how many different kinds of things you have, and rewards variety.
// ------------------------------------------------------------
function biodiversityParts() {
    if (!player.mc) return []
    let tileTypes = Object.keys(HABITAT_TYPES).filter(t => t != "start" && habitatCount(t) > 0).length
    return [
        ["Trait types", Object.keys(TRAITS).filter(id => player.mu.traits[id] > 0).length, Object.keys(TRAITS).length],
        ["Habitat types", tileTypes, Object.keys(HABITAT_TYPES).length - 1],
        ["Climates adapted to", [11, 12, 13, 14].filter(id => getBuyableAmount("ad", id).gte(1)).length, 4],
        ["Body plan tiers", player.mc.plan.filter(x => x).length, BODY_PLAN.length],
        ["Partners met", Math.min(SYMBIONT_IDS.length, player.sy.points.toNumber()), SYMBIONT_IDS.length],
        ["Behaviors learned", BEHAVIOR_IDS.filter(behaviorUnlocked).length, BEHAVIOR_IDS.length],
        ["Predators beaten", [11, 12, 21].filter(id => player.pr.challenges[id] > 0).length, 3],
    ]
}

function biodiversity() {
    return biodiversityParts().reduce((sum, p) => sum + p[1], 0)
}

const BIODIVERSITY_REWARDS = [
    { at: 3, text: "DNA gain x1.5.", kind: "dna", mult: 1.5 },
    { at: 6, text: "Carrying capacity x2.", kind: "capacity", mult: 2 },
    { at: 9, text: "Births x2.", kind: "births", mult: 2 },
    { at: 12, text: "Each generation hands down 1.5x Heritage.", kind: "heritage", mult: 1.5 },
    { at: 16, text: "Fitness gain x1.5.", kind: "fitness", mult: 1.5 },
    { at: 20, text: "DNA gain x3.", kind: "dna", mult: 3 },
    { at: 25, text: "Cell gain x3.", kind: "cells", mult: 3 },
    { at: 30, text: "Carrying capacity x5.", kind: "capacity", mult: 5 },
    { at: 36, text: "Every kind of life, everywhere. DNA gain x10.", kind: "dna", mult: 10 },
]

function biodiversityBonus(kind) {
    let b = new Decimal(1)
    if (!player.bd) return b
    BIODIVERSITY_REWARDS.forEach((r, n) => { if (r.kind == kind && hasMilestone("bd", n)) b = b.times(r.mult) })
    if (kind == "dna") b = b.times(fossilBonus())
    return b
}

addLayer("bd", {
    name: "biodiversity",
    symbol: "Bd",
    row: 19,
    position: 1,
    color: "#4fc07a",
    startData() { return { unlocked: true, points: new Decimal(0) } },
    type: "none",
    resource: "biodiversity",
    layerShown() { return lifeUnlocked() },
    nodeStyle: SIDE_NODE_STYLE,
    tooltip() { return "Biodiversity: " + biodiversity() },
    tabFormat: [
        ["display-text", function() {
            let parts = biodiversityParts()
            let max = parts.reduce((s, p) => s + p[2], 0)
            return "<h2 style='color:#4fc07a'>Biodiversity</h2><br>Life does best when it tries everything.<br>Your score counts how many <i>different</i> kinds of things you have, not how many of each.<br><br>" +
                "<h2 style='color:#4fc07a'>" + biodiversity() + "</h2> / " + max + "<br><br>" +
                parts.map(p => p[0] + ": <b>" + p[1] + "</b> / " + p[2]).join("<br>")
        }],
        "blank",
        "milestones",
    ],
    milestones: Object.assign({}, ...BIODIVERSITY_REWARDS.map((r, n) => ({
        [n]: {
            requirementDescription: "Biodiversity " + r.at,
            effectDescription: r.text,
            done() { return lifeUnlocked() && biodiversity() >= r.at },
        },
    }))),
})

// ------------------------------------------------------------
//  FIELD NOTES. Statistics for Act 2.
// ------------------------------------------------------------
const LIFE_ROW_NAMES = { 10: "Cells", 11: "Mutation and Reproduction", 12: "Generation, Adaptation and Habitat", 13: "Row 4 (Multicellular, Symbiosis, Instincts, Predators)" }

addLayer("fn", {
    name: "field notes",
    symbol: "Fn",
    row: 19,
    position: 2,
    color: "#9fb4c7",
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        time: 0,
        bestDNA: new Decimal(0),
        generations: 0,
        gifts: 0,
        resets: { 10: 0, 11: 0, 12: 0, 13: 0 },
    }},
    type: "none",
    layerShown() { return lifeUnlocked() },
    nodeStyle: SIDE_NODE_STYLE,
    tooltip() { return "Field Notes" },
    update(diff) {
        if (!lifeUnlocked()) return
        player.fn.time += diff
        player.fn.bestDNA = player.fn.bestDNA.max(player.dna)
    },
    tabFormat: [
        ["display-text", function() {
            let rows = [
                ["Time since life began", formatTime(player.fn.time)],
                ["Most DNA at once", format(player.fn.bestDNA)],
                ["Most cells", format(player.c.best)],
                ["Traits picked", formatWhole(traitsPicked())],
                ["Generations passed", formatWhole(player.fn.generations)],
                ["Heritage", format(player.ge.heritage)],
                ["Climates lived through", formatWhole(Math.floor(player.ad.climateTime / CLIMATE_LENGTH))],
                ["Tiles colonized", formatWhole(Object.values(player.hb.grid).filter(x => x).length) + " / 25"],
                ["Gifts given to partners", formatWhole(player.fn.gifts)],
                ["Predator wins", formatWhole(predatorWins()) + " / 9"],
                ["Fossils found", fossilsFound() + " / " + FOSSILS.length],
            ]
            for (let row in LIFE_ROW_NAMES) rows.push([LIFE_ROW_NAMES[row] + " resets", formatWhole(player.fn.resets[row] || 0)])
            return "<h2 style='color:#9fb4c7'>Field Notes</h2><br><br><table style='margin:auto;text-align:left;border-spacing:12px 4px'>" +
                rows.map(r => "<tr><td>" + r[0] + "</td><td><b>" + r[1] + "</b></td></tr>").join("") + "</table>"
        }],
    ],
})
