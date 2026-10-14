// ============================================================
//  ACT 2: LIFE, ROW 3
//
//  Time    -> Generations (ge)  Twist: a generation clock passes Heritage down each time it fills
//  Enhance -> Adaptation  (ad)  Twist: the climate cycles, and each adaptation only shines in its climate
//  Space   -> Habitats    (hb)  Twist: a map of the sea to colonize outward, tile by tile
// ============================================================

function lifeRow3Unlocked() {
    return hasUpgrade("c", 34)
}

function hasLifeRow3Milestone(id) {
    return hasMilestone("ge", id) || hasMilestone("ad", id) || hasMilestone("hb", id)
}

function lifeRow3Milestones(resource, extra) {
    let shared = [
        [1, "Keep Mutation and Reproduction milestones, Cell upgrades, your traits, and Fecundity and Longevity on all resets."],
        [2, "Gain 100% of your Cell gain every second."],
        [3, "Automatically buy Fecundity and Longevity."],
    ]
    let m = {}
    shared.forEach(([req, text], id) => {
        m[id] = {
            requirementDescription: req + " total " + resource,
            effectDescription: text,
            done() { return player[this.layer].total.gte(req) },
        }
    })
    return Object.assign(m, extra)
}

// All of Row 3's bonuses to the rest of Act 2, by what they boost
function lifeBonus(kind) {
    let b = new Decimal(1)
    if (player.mc) b = b.times(lifeRow4Bonus(kind)).times(predatorPenalty(kind))
    if (!player.ge || !lifeRow3Unlocked()) return b
    if (kind == "dna") {
        b = b.times(heritageEffect().dna)
        b = b.times(adaptationEffect(11))
        b = b.times(Decimal.pow(2, habitatCount("open")))
        if (hasUpgrade("ad", 12)) b = b.times(upgradeEffect("ad", 12))
        if (hasUpgrade("ge", 21)) b = b.times(upgradeEffect("ge", 21))
    }
    if (kind == "capacity") {
        b = b.times(heritageEffect().capacity)
        b = b.times(adaptationEffect(12))
        b = b.times(Decimal.pow(3, habitatCount("reef")))
    }
    if (kind == "births") b = b.times(adaptationEffect(13))
    if (kind == "division") {
        b = b.times(adaptationEffect(14))
        b = b.times(Decimal.pow(1.2, habitatCount("tide")))
    }
    if (kind == "lifespan") {
        b = b.times(Decimal.pow(1.5, habitatCount("deep")))
        if (hasUpgrade("ge", 12)) b = b.times(upgradeEffect("ge", 12))
    }
    if (kind == "cells") {
        if (hasUpgrade("ge", 14)) b = b.times(upgradeEffect("ge", 14))
    }
    return b
}

// ------------------------------------------------------------
//  GENERATIONS (Time). Every time the clock fills, a generation passes and Heritage is handed down.
// ------------------------------------------------------------
function heritageEffect() {
    let h = player.ge.heritage.add(1)
    return { dna: h.sqrt(), capacity: h.pow(0.25) }
}

addLayer("ge", {
    name: "generations",
    symbol: "Ge",
    position: 0,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        progress: 0,
        heritage: new Decimal(0),
        lastGift: new Decimal(0),
    }},
    color: "#c9a0ff",
    requires: new Decimal(1e13),
    resource: "generations",
    baseResource: "DNA",
    baseAmount() { return player.dna },
    type: "static",
    base: 10,
    exponent: 1.3,
    gainMult() { return new Decimal(1) },
    gainExp() { return new Decimal(1) },
    canBuyMax() { return hasMilestone("ge", 4) },
    row: 12,
    branches: ["mu"],
    hotkeys: [
        {key: "n", description: "N: Reset for generations", onPress() { if (lifeRow3Unlocked() && canReset(this.layer)) doReset(this.layer) }},
    ],
    layerShown() { return lifeUnlocked() && lifeRow3Unlocked() },
    resetsNothing: true,
    autoPrestige() { return hasLifeRow4Milestone(1) },
    onPrestige() { if (!hasLifeRow4Milestone(1)) lifeReset(this.row) },
    lifeKeep(row) { return ["milestones", "upgrades", "heritage", "progress", "lastGift"] },
    generationLength() {
        let len = 90 * Math.pow(0.85, player.ge.points.toNumber())
        if (hasUpgrade("ge", 13)) len *= 0.75
        return Math.max(5, len)
    },
    // What one generation hands down: how well your cells and offspring are doing right now
    heritagePerGeneration() {
        let gift = player.c.points.add(1).log10().add(player.re.offspring.add(1).log10()).times(player.ge.points)
        if (hasUpgrade("ge", 11)) gift = gift.times(2)
        gift = gift.times(Decimal.pow(2, habitatCount("vent")))
        gift = gift.times(lifeBonus("heritage"))
        return gift
    },
    update(diff) {
        if (!player.ge.unlocked) return
        player.ge.progress += diff
        let len = tmp.ge.generationLength
        if (player.ge.progress >= len) {
            let passed = Math.floor(player.ge.progress / len)
            player.ge.progress -= passed * len
            player.ge.lastGift = tmp.ge.heritagePerGeneration
            player.ge.heritage = player.ge.heritage.add(tmp.ge.heritagePerGeneration.times(passed))
        }
    },
    effectDescription() {
        return "and a new generation is born every " + format(tmp.ge.generationLength) + " seconds"
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        "blank",
        ["display-text", function() {
            let len = tmp.ge.generationLength
            let pct = Math.min(1, player.ge.progress / len)
            let bar = "<div style='width:300px;height:14px;border:2px solid #c9a0ff;border-radius:7px;margin:auto;overflow:hidden'><div style='width:" + (pct * 100) + "%;height:100%;background:#c9a0ff'></div></div>"
            let h = heritageEffect()
            return "<h3>The Generation Clock</h3><br>Next generation in " + format(len - player.ge.progress) + "s<br>" + bar + "<br>" +
                "Each generation hands down Heritage based on your cells and offspring <i>at that moment</i>.<br>" +
                "Right now it would hand down <b>" + format(tmp.ge.heritagePerGeneration) + "</b> (last time: " + format(player.ge.lastGift) + ").<br><br>" +
                "You have <h2 style='color:#c9a0ff;text-shadow:0 0 10px #c9a0ff'>" + format(player.ge.heritage) + "</h2> Heritage, multiplying DNA gain by " + format(h.dna) + " and carrying capacity by " + format(h.capacity)
        }],
        "blank",
        lore("Nothing lives forever. But every cell that divides before it dies passes on what worked, and over thousands of generations the small advantages pile up."),
        "blank",
        "milestones",
        "upgrades",
    ],
    milestones: lifeRow3Milestones("generations", {
        3: {
            requirementDescription: "5 generations",
            effectDescription: "Automatically gain mutations, and mutations reset nothing.",
            done() { return player.ge.best.gte(5) },
        },
        4: {
            requirementDescription: "8 generations",
            effectDescription: "You can buy max generations.",
            done() { return player.ge.best.gte(8) },
        },
    }),
    upgrades: heritageUpgrades({
        11: { title: "Epigenetics", description: "Experience leaves a mark on the genes. Each generation hands down twice as much Heritage.", cost: 50 },
        12: { title: "Parental Care", description: "Heritage makes offspring live longer.", cost: 200,
            effect() { return player.ge.heritage.add(1).log10().add(1) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Imprinting", description: "Generations pass 25% faster.", cost: 1000 },
        14: { title: "Living Fossils", description: "Heritage boosts cell gain.", cost: 5000,
            effect() { return player.ge.heritage.add(1).pow(0.2) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        21: { title: "Kin Selection", description: "Helping your relatives helps your genes. Generations boost DNA gain.", cost: 2e4,
            effect() { return player.ge.points.add(1).pow(2) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    }),
})

function heritageUpgrades(list) {
    let n = 0
    for (let id in list) {
        let u = list[id]
        u.cost = new Decimal(u.cost)
        u.currencyDisplayName = "Heritage"
        u.currencyInternalName = "heritage"
        u.currencyLayer = "ge"
        let prev = Object.keys(list)[n - 1]
        if (prev) u.unlocked = function() { return hasUpgrade("ge", prev) }
        n++
    }
    return list
}

// ------------------------------------------------------------
//  ADAPTATION (Enhance). The climate cycles, and each adaptation works fully only in its own climate.
// ------------------------------------------------------------
const CLIMATES = [
    { name: "Warm Seas", color: "#ff9f5a", adaptation: 11 },
    { name: "Ice Age", color: "#9fd8ff", adaptation: 12 },
    { name: "Acid Oceans", color: "#c6e05a", adaptation: 13 },
    { name: "Oxygen Boom", color: "#ffffff", adaptation: 14 },
]
const CLIMATE_LENGTH = 150

function currentClimate() {
    return Math.floor(player.ad.climateTime / CLIMATE_LENGTH) % CLIMATES.length
}

// How strongly an adaptation works: fully in its own climate, partly in the others
function adaptationStrength(id) {
    if (CLIMATES[currentClimate()].adaptation == id || bodyPart("warm")) return 1
    return hasUpgrade("ad", 11) ? 0.5 : 0.25
}

function adaptationEffect(id) {
    if (!player.ad.unlocked) return new Decimal(1)
    return ADAPTATIONS[id].base.pow(getBuyableAmount("ad", id).times(adaptationStrength(id)))
}

const ADAPTATIONS = {
    11: { title: "Heat Shock Proteins", text: "Thrive in Warm Seas. DNA gain x3 each.", base: new Decimal(3) },
    12: { title: "Antifreeze Proteins", text: "Thrive in an Ice Age. Carrying capacity x4 each.", base: new Decimal(4) },
    13: { title: "Mineral Shells", text: "Thrive in Acid Oceans. Births x3 each.", base: new Decimal(3) },
    14: { title: "Aerobic Respiration", text: "Thrive in an Oxygen Boom. Cells divide 1.3x faster each.", base: new Decimal(1.3) },
}

addLayer("ad", {
    name: "adaptation",
    symbol: "Ad",
    position: 1,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        climateTime: 0,
    }},
    color: "#5ad1c6",
    requires: new Decimal(1e5),
    resource: "fitness",
    baseResource: "cells",
    baseAmount() { return player.c.points },
    type: "normal",
    exponent: 0.25,
    gainMult() { return lifeBonus("fitness") },
    gainExp() { return new Decimal(1) },
    passiveGeneration() { return hasLifeRow4Milestone(2) ? 1 : hasMilestone("ad", 3) ? 0.1 : 0 },
    lifeKeep(row) { return ["milestones", "upgrades", "buyables", "climateTime"] },
    row: 12,
    branches: ["mu", "re"],
    hotkeys: [
        {key: "t", description: "T: Reset for fitness", onPress() { if (lifeRow3Unlocked() && canReset(this.layer)) doReset(this.layer) }},
    ],
    layerShown() { return lifeUnlocked() && lifeRow3Unlocked() },
    resetsNothing: true,
    onPrestige() { lifeReset(this.row) },
    update(diff) {
        if (player.ad.unlocked) player.ad.climateTime += diff
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        "blank",
        ["display-text", function() {
            let now = CLIMATES[currentClimate()], next = CLIMATES[(currentClimate() + 1) % CLIMATES.length]
            let left = CLIMATE_LENGTH - player.ad.climateTime % CLIMATE_LENGTH
            return "<h3>Climate: <span style='color:" + now.color + "'>" + now.name + "</span></h3><br>" +
                "Changes to <span style='color:" + next.color + "'>" + next.name + "</span> in " + formatTime(left) + "<br>" +
                "Each adaptation works fully in its own climate, and at " + (hasUpgrade("ad", 11) ? "half" : "a quarter of its") + " strength in the others."
        }],
        "blank",
        lore("The world keeps changing under life's feet. Seas warm and freeze, turn acid, fill with oxygen. Whatever can't change with them disappears."),
        "blank",
        "buyables",
        "blank",
        "milestones",
        "upgrades",
    ],
    buyables: Object.assign({}, ...Object.keys(ADAPTATIONS).map(id => ({
        [id]: {
            title() { return ADAPTATIONS[id].title },
            cost(x) { return Decimal.pow(2.5, x).floor() },
            display() {
                let active = adaptationStrength(Number(id)) == 1
                return ADAPTATIONS[id].text + "<br><br>Amount: " + formatWhole(getBuyableAmount("ad", id)) +
                    "<br>Cost: " + format(this.cost()) + " fitness<br>Effect: " + format(adaptationEffect(Number(id))) + "x" +
                    (active ? "<br><b>In its climate now!</b>" : "")
            },
            canAfford() { return player.ad.points.gte(this.cost()) },
            buy() {
                if (!this.canAfford()) return
                player.ad.points = player.ad.points.sub(this.cost())
                setBuyableAmount("ad", id, getBuyableAmount("ad", id).add(1))
            },
            style() {
                let c = CLIMATES.find(c => c.adaptation == Number(id))
                return adaptationStrength(Number(id)) == 1 && this.canAfford() ? { "box-shadow": "0 0 15px " + c.color } : {}
            },
        },
    }))),
    milestones: lifeRow3Milestones("fitness", {
        3: {
            requirementDescription: "25 fitness",
            effectDescription: "Gain 10% of your fitness gain every second.",
            done() { return player.ad.best.gte(25) },
        },
    }),
    upgrades: {
        11: {
            title: "Phenotypic Plasticity",
            description: "Bend instead of break. Adaptations work at half strength outside their climate.",
            cost: new Decimal(5),
        },
        12: {
            title: "Natural Selection",
            description: "Fitness boosts DNA gain.",
            cost: new Decimal(15),
            unlocked() { return hasUpgrade("ad", 11) },
            effect() { return player.ad.points.add(1).sqrt() },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        13: {
            title: "Lungs",
            description: "A pouch of air, swallowed and held. Lets you colonize the Shoreline in Habitats.",
            cost: new Decimal(50),
            unlocked() { return hasUpgrade("ad", 12) },
        },
    },
})

// ------------------------------------------------------------
//  HABITATS (Space). Colonize the sea outward from where life began, one neighboring tile at a time.
// ------------------------------------------------------------
const HABITAT_TYPES = {
    start: { name: "Birthplace", color: "#7ed957", text: "Where life began." },
    open: { name: "Open Ocean", color: "#3a7bd5", text: "DNA gain x2." },
    reef: { name: "Reef", color: "#ff7eb6", text: "Carrying capacity x3." },
    deep: { name: "Deep Ocean", color: "#1d2f6f", text: "Offspring live 1.5x longer." },
    vent: { name: "Hydrothermal Vent", color: "#d9534f", text: "Each generation hands down 2x Heritage." },
    tide: { name: "Tide Pool", color: "#5ad1c6", text: "Cells divide 1.2x faster." },
    shore: { name: "Shoreline", color: "#e8d48a", text: "Dry land. Needs Lungs, 8 generations and 3 colonists." },
}

const HABITAT_MAP = [
    ["vent", "deep", "deep", "deep", "vent"],
    ["deep", "open", "reef", "open", "deep"],
    ["open", "reef", "start", "reef", "open"],
    ["tide", "open", "reef", "open", "tide"],
    ["shore", "tide", "shore", "tide", "shore"],
]

function habitatType(id) {
    return HABITAT_MAP[Math.floor(id / 100) - 1][id % 100 - 1]
}

function habitatCount(type) {
    if (!player.hb || !player.hb.unlocked) return 0
    let n = 0
    for (let id in player.hb.grid) if (player.hb.grid[id] && habitatType(Number(id)) == type) n++
    return n
}

function colonistsUsed() {
    let used = 0
    for (let id in player.hb.grid) if (player.hb.grid[id] && habitatType(Number(id)) != "start") used += habitatCost(Number(id))
    return used
}

function freeColonists() {
    return player.hb.points.toNumber() - colonistsUsed()
}

function habitatCost(id) {
    return habitatType(id) == "shore" ? 3 : 1
}

function nextToColony(id) {
    let r = Math.floor(id / 100), c = id % 100
    return [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].some(([rr, cc]) => player.hb.grid[rr * 100 + cc])
}

function canColonize(id) {
    if (player.hb.grid[id] || !nextToColony(id)) return false
    if (freeColonists() < habitatCost(id)) return false
    if (habitatType(id) == "shore" && !(hasUpgrade("ad", 13) && player.ge.best.gte(8))) return false
    return true
}

function reachedLand() {
    return habitatCount("shore") > 0
}

addLayer("hb", {
    name: "habitats",
    symbol: "Hb",
    position: 2,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#3a7bd5",
    requires: new Decimal(1e13),
    resource: "colonists",
    baseResource: "DNA",
    baseAmount() { return player.dna },
    type: "static",
    base: 1000,
    exponent: 1.3,
    gainMult() { return new Decimal(1) },
    gainExp() { return new Decimal(1) },
    canBuyMax() { return hasMilestone("hb", 4) },
    row: 12,
    branches: ["re"],
    hotkeys: [
        {key: "o", description: "O: Reset for colonists", onPress() { if (lifeRow3Unlocked() && canReset(this.layer)) doReset(this.layer) }},
    ],
    layerShown() { return lifeUnlocked() && lifeRow3Unlocked() },
    resetsNothing: true,
    autoPrestige() { return hasLifeRow4Milestone(1) },
    onPrestige() { if (!hasLifeRow4Milestone(1)) lifeReset(this.row) },
    // Colonists stay with the tiles they settled
    lifeKeep(row) { return ["milestones", "grid", "points", "best", "total"] },
    grid: {
        rows: 5,
        cols: 5,
        getStartData(id) { return id == 303 },
        getUnlocked() { return true },
        getCanClick(data, id) { return canColonize(id) },
        onClick(data, id) { player.hb.grid[id] = true },
        getTitle(data, id) { return HABITAT_TYPES[habitatType(id)].name },
        getDisplay(data, id) {
            let t = HABITAT_TYPES[habitatType(id)]
            if (data) return habitatType(id) == "start" ? t.text : "Colonized<br>" + t.text
            if (!nextToColony(id)) return "Too far away"
            return t.text + "<br>Cost: " + habitatCost(id) + " colonist" + (habitatCost(id) > 1 ? "s" : "")
        },
        getStyle(data, id) {
            let t = HABITAT_TYPES[habitatType(id)]
            return {
                width: "min(17vw, 92px)", height: "min(17vw, 92px)", "font-size": "9px", "border-radius": "8px", overflow: "hidden", padding: "2px",
                "background-color": data ? t.color : (nextToColony(id) ? "#333" : "#1a1a1a"),
                color: data && ["deep", "open"].includes(habitatType(id)) ? "white" : (data ? "black" : "#bbb"),
                border: "2px solid " + t.color,
                opacity: data || nextToColony(id) ? 1 : 0.5,
            }
        },
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        "blank",
        ["display-text", function() {
            return "<h3>The Shallow Sea</h3><br>Spread outward from where life began. You can only colonize next to tiles you already hold.<br>" +
                "Free colonists: <b>" + formatWhole(Math.max(0, freeColonists())) + "</b>"
        }],
        "blank",
        "grid",
        "blank",
        lore("Life spreads into every corner it can reach: sunlit reefs, black depths, scalding vents. The last frontier is the strangest of all: the dry, empty land."),
        "blank",
        "milestones",
    ],
    milestones: lifeRow3Milestones("colonists", {
        3: {
            requirementDescription: "5 colonists",
            effectDescription: "Automatically gain broods, and broods reset nothing.",
            done() { return player.hb.best.gte(5) },
        },
        4: {
            requirementDescription: "8 colonists",
            effectDescription: "You can buy max colonists.",
            done() { return player.hb.best.gte(8) },
        },
    }),
})
