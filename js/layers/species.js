// ============================================================
//  ACT 3: SPECIES
//  Antimatter Dimensions, retold. It has its own tree and its own resource, Biomass,
//  and like Act 2 it never resets the earlier acts (all of its layers use rows 20+).
//
//  8 Dimensions          -> 8 species tiers   (ti)  Twist: the food pyramid; a tier starves if the one below has fewer purchases
//  Tickspeed             -> Metabolism        (me)  Twist: food demand; faster metabolism eats a growing share of your Biomass, less with more Bacteria
//  Dimension Boosts      -> Speciation        (sn)  Twist: keystone species; each speciation doubles one chosen tier again
//  Antimatter Galaxies   -> Adaptive Radiation (ar) Twist: the founder effect; one chosen tier keeps 10% of its population
//  Dimensional Sacrifice -> Competition       (cu)  Twist: choose the winner; any tier can out-compete everything below it
//  Infinity              -> the Spark of Sentience, at 1.8e308 Biomass
// ============================================================

const TIERS = [
    null,
    { name: "Bacteria", cost: 10, step: 1e3, makes: "Biomass", lore: "Tiny, endless, and the base of everything." },
    { name: "Fish", cost: 100, step: 1e4, makes: "Bacteria", lore: "Every fish carries a whole world of bacteria inside it." },
    { name: "Amphibians", cost: 1e4, step: 1e5, makes: "Fish", lore: "They return to the water to lay their eggs." },
    { name: "Reptiles", cost: 1e6, step: 1e6, makes: "Amphibians", lore: "Eggs with shells, so life can leave the water for good." },
    { name: "Birds", cost: 1e9, step: 1e8, makes: "Reptiles", lore: "Dinosaurs that never went away." },
    { name: "Mammals", cost: 1e13, step: 1e10, makes: "Birds", lore: "Warm, furry, and raising their young with milk." },
    { name: "Primates", cost: 1e18, step: 1e12, makes: "Mammals", lore: "Grasping hands and forward-facing eyes." },
    { name: "Humans", cost: 1e24, step: 1e15, makes: "Primates", lore: "A primate that started to ask why." },
]
const SENTIENCE = new Decimal("1.8e308")
const BIOMASS_PACING = 0.8

function speciesUnlocked() {
    return hasUpgrade("mc", 11)
}

function tierBought(t) {
    return getBuyableAmount("ti", 10 + t)
}

function tiersUnlocked() {
    return Math.min(8, 4 + player.sn.points.toNumber())
}

function tierCost(t, bought) {
    if (bought === undefined) bought = tierBought(t)
    return Decimal.pow(TIERS[t].step, bought.div(10).floor()).times(TIERS[t].cost)
}

// The food pyramid: a tier works at full strength only while the tier below it has more purchases
function tierStarving(t) {
    return t > 1 && tierBought(t - 1).lt(tierBought(t)) && tierBought(t).gt(0)
}

function tierMult(t) {
    let m = Decimal.pow(2, tierBought(t).div(10).floor())
    m = m.times(Decimal.pow(2, player.sn.points))
    m = m.times(Decimal.pow(2, player.sn.keystones[t] || 0))
    m = m.times(player.cu.mults[t])
    if (tierStarving(t)) m = m.times(hasUpgrade("ti", 14) ? 0.75 : 0.5)
    m = m.times(speciesAchievementBonus())
    m = m.times(evolutionBonus(t))
    m = m.times(coevolutionEffect())
    return m
}

// ------------------------------------------------------------
//  METABOLISM (Tickspeed). Faster metabolism speeds up every tier, but eats more of your Biomass.
// ------------------------------------------------------------
function metabolismLevel() {
    return getBuyableAmount("me", 11)
}

function metabolismBase() {
    let b = 1.125 + 0.03 * player.ar.points.toNumber()
    if (hasUpgrade("me", 11)) b += 0.01
    return b
}

function metabolismSpeed() {
    return Decimal.pow(metabolismBase(), metabolismLevel())
}

// Share of Biomass eaten by your metabolism. It grows with the square of the level.
// The bigger the base of the food pyramid (Bacteria), the faster a metabolism it can feed
function foodDemandScale() {
    let k = 0.01 / player.ti.amounts[1].add(10).log10().toNumber() / (1 + player.ar.points.toNumber())
    if (hasUpgrade("me", 12)) k /= 2
    if (hasUpgrade("me", 13)) k /= 2
    if (hasUpgrade("ti", 32)) k *= 0.8
    k /= coalDemandDivider()
    return k
}

function foodDemand() {
    return foodDemandAt(metabolismLevel())
}

function biomassGain() {
    if (!speciesUnlocked()) return new Decimal(0)
    let g = player.ti.amounts[1].times(tierMult(1)).times(metabolismSpeed()).times(1 - foodDemand())
    // Life's long history makes everything after it easier
    g = g.times(player.dna.add(1).log10().div(100).add(1))
    if (hasUpgrade("ti", 34)) g = g.times(upgradeEffect("ti", 34))
    if (hasUpgrade("ti", 43)) g = g.times(upgradeEffect("ti", 43))
    g = g.times(chitinEffect())
    // Pacing: stretches the act so something new comes along about once a minute
    g = g.max(1).pow(BIOMASS_PACING)
    if (player.ti.amounts[1].eq(0)) g = new Decimal(0)
    return g
}

// ------------------------------------------------------------
//  THE SPECIES TREE (opened from the "Species" node)
// ------------------------------------------------------------
addLayer("species", {
    name: "species",
    symbol: "Sp",
    row: "side",
    position: 2,
    color: "#e0c068",
    startData() { return { unlocked: true, points: new Decimal(0) } },
    type: "none",
    leftTab: true,
    previousTab: "tree-tab",
    layerShown() { return speciesUnlocked() },
    tooltip() { return "Act 3: Species" },
    nodeStyle: { "font-size": "28px" },
    tabFormat: [
        "blank",
        ["display-text", function() { return "<h2 style='color:#e0c068'>Act 3: Species</h2><br>You have <h2 style='color:#e0c068;text-shadow:0 0 10px #e0c068'>" + format(player.biomass) + "</h2> Biomass (+" + format(biomassGain()) + "/sec)" }],
        "blank",
        ["tree", [["ti", "ix"], ["cf", "me", "sn", "cv"], ["cu", "ar"]]],
    ],
})

// ------------------------------------------------------------
//  SPECIES TIERS (the 8 Dimensions)
// ------------------------------------------------------------
addLayer("ti", {
    name: "species tiers",
    symbol: "Ti",
    row: 20,
    position: 0,
    color: "#e0c068",
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        amounts: [null, ...Array(8).fill(0).map(() => new Decimal(0))],
        sentient: false,
    }},
    type: "none",
    layerShown() { return speciesUnlocked() },
    tooltip() { return format(player.biomass) + " Biomass" },
    update(diff) {
        if (!speciesUnlocked()) return
        if (player.biomass.lt(10) && tierBought(1).eq(0)) player.biomass = new Decimal(10)
        let speed = metabolismSpeed()
        for (let t = 8; t >= 2; t--) {
            if (t > tiersUnlocked()) continue
            player.ti.amounts[t - 1] = player.ti.amounts[t - 1].add(player.ti.amounts[t].times(tierMult(t)).times(speed).times(diff))
        }
        player.biomass = player.biomass.add(biomassGain().times(diff))
    },
    tabFormat: [
        ["display-text", function() {
            return "You have <h2 style='color:#e0c068'>" + format(player.biomass) + "</h2> Biomass (+" + format(biomassGain()) + "/sec)<br>" +
                "Metabolism speeds everything up x" + format(metabolismSpeed()) + ", and eats " + format(foodDemand() * 100) + "% of your Biomass."
        }],
        "blank",
        lore("Life has filled every corner of the world. Now it stacks up: small things feed bigger things, which feed bigger things still, all the way up to a strange, curious ape."),
        "blank",
        ["display-text", "<b>The food pyramid:</b> a tier works at full strength only while the tier below it has <i>more purchases</i>. Otherwise it starves and runs at half strength.<br>Every 10 purchases of a tier double it."],
        "blank",
        ["clickables", [9]],
        "blank",
        ...[1, 2, 3, 4, 5, 6, 7, 8].map(t => ["row", [["display-text", function() { return tierRowText(t) }], ["buyable", 10 + t], ["clickable", 10 + t]]]),
        "blank",
        ["clickables", [10]],
        "blank",
        ["display-text", "<h3>Evolutionary milestones</h3><br>Bought with Biomass. They are never lost."],
        "blank",
        "upgrades",
    ],
    upgrades: {
        11: evoUpgrade("Endosymbiosis", "Cells swallow cells and keep them. Bacteria x3.", 1e7),
        12: evoUpgrade("Scales", "Fish and Amphibians x2.", 1e13),
        13: evoUpgrade("The Amniotic Egg", "Reptiles get stronger with every speciation.", 1e22, function() { return player.sn.points.add(1) }),
        14: evoUpgrade("Feathers", "Starving tiers run at 75% strength instead of 50%.", 1e34),
        21: evoUpgrade("Milk", "Mammals x3.", 1e50),
        22: evoUpgrade("Opposable Thumbs", "Primates get stronger with how many Primates you've bought.", 1e65, function() { return tierBought(7).div(10).add(1) }),
        23: evoUpgrade("Camouflage", "Birds x3.", 1e72),
        24: evoUpgrade("Language", "Humans get stronger with how many Humans you've bought.", 1e88, function() { return tierBought(8).add(1).sqrt() }),
        31: evoUpgrade("Social Groups", "Every tier gets stronger with each radiation.", 1e96, function() { return player.ar.points.add(1).div(4).add(1) }),
        32: evoUpgrade("Tool Use", "Food is easier to get. Food demand x0.8.", 1e115),
        33: evoUpgrade("Migration", "Speciation needs 5 fewer Humans.", 1e130),
        34: evoUpgrade("Food Webs", "Biomass makes more Biomass.", 1e140, function() { return player.biomass.add(10).log10().pow(1.5) }),
        41: evoUpgrade("Pack Hunting", "Bacteria are doubled again by every speciation.", 1e150, function() { return Decimal.pow(2, player.sn.points) }),
        42: evoUpgrade("Niche Construction", "Competition boosts are stronger (^1.25).", 1e165),
        43: evoUpgrade("Storytelling", "Biomass gets stronger with how many Humans you've bought.", 1e190, function() { return tierBought(8).add(1) }),
        44: evoUpgrade("Big Brains", "Expensive to run, but worth it. Humans x100.", 1e240),
    },
    buyables: Object.assign({}, ...[1, 2, 3, 4, 5, 6, 7, 8].map(t => ({
        [10 + t]: {
            title() { return "" },
            cost() { return tierCost(t) },
            unlocked() { return t <= tiersUnlocked() },
            display() { return "Buy 1<br>" + format(this.cost()) },
            canAfford() { return t <= tiersUnlocked() && player.biomass.gte(this.cost()) },
            buy() {
                if (!this.canAfford()) return
                player.biomass = player.biomass.sub(this.cost())
                player.ti.amounts[t] = player.ti.amounts[t].add(1)
                setBuyableAmount("ti", 10 + t, tierBought(t).add(1))
            },
            style() { return { width: "110px", height: "50px", "min-height": "50px", "border-radius": "8px", "font-size": "10px" } },
        },
    }))),
    clickables: Object.assign({}, ...[1, 2, 3, 4, 5, 6, 7, 8].map(t => ({
        [10 + t]: {
            display() { return "Until 10<br>" + format(costUntil10(t)) },
            unlocked() { return t <= tiersUnlocked() },
            canClick() { return t <= tiersUnlocked() && player.biomass.gte(costUntil10(t)) },
            onClick() { buyUntil10(t) },
            style() { return { width: "110px", "min-height": "50px", height: "50px", "border-radius": "8px", "font-size": "10px" } },
        },
    })), {
        91: {
            title: "Max All",
            display() { return "Buy Metabolism while it helps, then as many of every tier as you can, top tier first. (Hotkey: M)" },
            canClick() { return true },
            onClick() { maxAllSpecies() },
            style() { return { width: "240px", "min-height": "60px", height: "60px" } },
        },
        101: {
            title: "The Spark of Sentience",
            display() { return "A mind that knows it exists. <b>Finish Act 3.</b><br>Requires " + format(SENTIENCE) + " Biomass." },
            unlocked() { return player.biomass.gte(SENTIENCE) || player.ti.sentient },
            canClick() { return player.biomass.gte(SENTIENCE) && !player.ti.sentient },
            onClick() { player.ti.sentient = true },
            style() { return { width: "260px", height: "130px" } },
        },
    }),
    hotkeys: [
        {key: "m", description: "M: Max all species tiers and Metabolism", onPress() { if (speciesUnlocked()) maxAllSpecies() }},
    ],
})

function evoUpgrade(title, description, cost, effect) {
    let u = {
        title: title,
        description: description,
        cost: new Decimal(cost),
        currencyDisplayName: "Biomass",
        currencyInternalName: "biomass",
        unlocked() { return hasUpgrade("ti", 11) || player.biomass.gte(1e5) },
    }
    if (effect) {
        u.effect = effect
        u.effectDisplay = function() { return "x" + format(upgradeEffect(this.layer, this.id)) }
    }
    return u
}

// Multipliers from Evolutionary milestones
function evolutionBonus(t) {
    let m = new Decimal(1)
    if (t == 1 && hasUpgrade("ti", 11)) m = m.times(3)
    if (t == 1 && hasMilestone("ix", 0)) m = m.times(2)
    if ((t == 2 || t == 3) && hasUpgrade("ti", 12)) m = m.times(2)
    if (t == 4 && hasUpgrade("ti", 13)) m = m.times(upgradeEffect("ti", 13))
    if (t == 6 && hasUpgrade("ti", 21)) m = m.times(3)
    if (t == 7 && hasUpgrade("ti", 22)) m = m.times(upgradeEffect("ti", 22))
    if (t == 5 && hasUpgrade("ti", 23)) m = m.times(3)
    if (t == 8 && hasUpgrade("ti", 24)) m = m.times(upgradeEffect("ti", 24))
    if (hasUpgrade("ti", 31)) m = m.times(upgradeEffect("ti", 31))
    if (t == 1 && hasUpgrade("ti", 41)) m = m.times(upgradeEffect("ti", 41))
    if (t == 8 && hasUpgrade("ti", 44)) m = m.times(100)
    return m
}

function tierRowText(t) {
    if (t > tiersUnlocked()) return "<div style='width:330px;text-align:left;opacity:0.5'><b>" + TIERS[t].name + "</b>: unlocked by Speciation</div>"
    let starving = tierStarving(t) ? " <span style='color:#e74c3c'>(starving)</span>" : ""
    return "<div style='width:330px;text-align:left'><b>" + TIERS[t].name + "</b> x" + format(tierMult(t)) + starving + "<br>" +
        "<span style='font-size:12px'>" + format(player.ti.amounts[t]) + " (" + formatWhole(tierBought(t)) + " bought), making " + TIERS[t].makes + "</span></div>"
}

function costUntil10(t) {
    let bought = tierBought(t)
    let left = new Decimal(10 - bought.toNumber() % 10)
    return tierCost(t).times(left)
}

function buyUntil10(t) {
    let bought = tierBought(t)
    let left = new Decimal(10 - bought.toNumber() % 10)
    let cost = tierCost(t).times(left)
    if (player.biomass.lt(cost)) return
    player.biomass = player.biomass.sub(cost)
    player.ti.amounts[t] = player.ti.amounts[t].add(left)
    setBuyableAmount("ti", 10 + t, bought.add(left))
}

// A Metabolism level is worth buying while its speed-up beats the extra food it eats
function metabolismWorthIt() {
    let l = metabolismLevel()
    return metabolismBase() * (1 - foodDemandAt(l.add(1))) > 1 - foodDemandAt(l)
}

// Spend everything: Metabolism first (while it's worth it), then tiers from the top down, in sets of 10, then singles
function maxAllSpecies() {
    for (let i = 0; i < 100 && metabolismWorthIt() && layers.me.buyables[11].canAfford(); i++) layers.me.buyables[11].buy()
    for (let t = tiersUnlocked(); t >= 1; t--) {
        for (let i = 0; i < 100 && player.biomass.gte(costUntil10(t)); i++) buyUntil10(t)
        for (let i = 0; i < 10 && layers.ti.buyables[10 + t].canAfford(); i++) layers.ti.buyables[10 + t].buy()
    }
}

// Every Act 3 reset goes through here. Speciation resets the tiers and Metabolism;
// Adaptive Radiation also resets speciations.
function speciesReset(depth) {
    player.biomass = new Decimal(10)
    for (let t = 1; t <= 8; t++) {
        player.ti.amounts[t] = new Decimal(0)
        setBuyableAmount("ti", 10 + t, new Decimal(0))
    }
    setBuyableAmount("me", 11, new Decimal(0))
    player.cu.mults = [null, ...Array(8).fill(0).map(() => new Decimal(1))]
    player.cu.lost = [null, ...Array(8).fill(0).map(() => new Decimal(0))]
    if (depth >= 2) {
        player.sn.points = new Decimal(0)
        player.sn.keystones = [null, 0, 0, 0, 0, 0, 0, 0, 0]
    }
}

// ------------------------------------------------------------
//  METABOLISM (Tickspeed)
// ------------------------------------------------------------
addLayer("me", {
    name: "metabolism",
    symbol: "Me",
    row: 21,
    position: 0,
    color: "#ff7f50",
    startData() { return { unlocked: true, points: new Decimal(0) } },
    type: "none",
    layerShown() { return speciesUnlocked() },
    branches: ["ti"],
    tooltip() { return "Metabolism x" + format(metabolismSpeed()) },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#ff7f50'>Metabolism</h2><br>Each level makes every species x" + format(metabolismBase(), 3) + " faster.<br>" +
                "Right now: <b>x" + format(metabolismSpeed()) + "</b> speed, and your metabolism eats <b>" + format(foodDemand() * 100) + "%</b> of your Biomass.<br><br>" +
                "<b>Food demand</b> grows with the square of your level, so past a point another level costs you more than it gives.<br>" +
                "A bigger base of Bacteria can feed a faster metabolism, so that point moves up as your Bacteria grow."
        }],
        "blank",
        lore("A faster metabolism means growing, moving and breeding faster. It also means eating more, all the time."),
        "blank",
        "buyables",
        "blank",
        ["clickables", [1]],
        "blank",
        "upgrades",
    ],
    buyables: {
        11: {
            title: "Faster Metabolism",
            cost() { return Decimal.pow(10, metabolismLevel()).times(1000) },
            display() {
                return "Every species x" + format(metabolismBase(), 3) + " faster.<br><br>Level: " + formatWhole(metabolismLevel()) +
                    "<br>Cost: " + format(this.cost()) + " Biomass<br>Food demand after this: " + format(Math.min(99, foodDemandAt(metabolismLevel().add(1)) * 100)) + "%"
            },
            canAfford() { return player.biomass.gte(this.cost()) },
            buy() {
                if (!this.canAfford()) return
                player.biomass = player.biomass.sub(this.cost())
                setBuyableAmount("me", 11, metabolismLevel().add(1))
            },
        },
    },
    clickables: {
        11: {
            title: "Slow down",
            display() { return "Drop one Metabolism level (no refund)." },
            canClick() { return metabolismLevel().gt(0) },
            onClick() { setBuyableAmount("me", 11, metabolismLevel().sub(1)) },
            style() { return { width: "160px", "min-height": "60px", height: "60px" } },
        },
    },
    upgrades: {
        11: {
            title: "Warm Blood",
            description: "Metabolism is a little stronger (+0.01 per level).",
            cost: new Decimal(1e15),
            currencyDisplayName: "Biomass",
            currencyInternalName: "biomass",
        },
        12: {
            title: "Efficient Digestion",
            description: "Halve your food demand.",
            cost: new Decimal(1e30),
            currencyDisplayName: "Biomass",
            currencyInternalName: "biomass",
            unlocked() { return hasUpgrade("me", 11) },
        },
        13: {
            title: "Cooking",
            description: "Fire does half the digesting. Halve your food demand again.",
            cost: new Decimal(1e80),
            currencyDisplayName: "Biomass",
            currencyInternalName: "biomass",
            unlocked() { return hasUpgrade("me", 12) },
        },
    },
})

function foodDemandAt(level) {
    return Math.min(0.99, foodDemandScale() * Math.pow(new Decimal(level).toNumber(), 2))
}

// ------------------------------------------------------------
//  SPECIATION (Dimension Boosts). Each one doubles every tier, and doubles your keystone tier again.
// ------------------------------------------------------------
function speciationReq() {
    let n = player.sn.points.toNumber()
    if (n < 4) return { tier: n + 4, amount: 20 }
    return { tier: 8, amount: 20 + 15 * (n - 4) - (hasUpgrade("ti", 33) ? 5 : 0) }
}

addLayer("sn", {
    name: "speciation",
    symbol: "Sn",
    row: 21,
    position: 1,
    color: "#7ec8e3",
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        keystone: 1,
        keystones: [null, 0, 0, 0, 0, 0, 0, 0, 0],
    }},
    type: "none",
    resource: "speciations",
    layerShown() { return speciesUnlocked() },
    branches: ["ti"],
    tooltip() { return formatWhole(player.sn.points) + " speciations" },
    tabFormat: [
        ["display-text", function() {
            let r = speciationReq()
            return "<h2 style='color:#7ec8e3'>Speciation</h2><br>You have <h2 style='color:#7ec8e3'>" + formatWhole(player.sn.points) + "</h2> speciations, doubling every tier " + formatWhole(player.sn.points) + " times.<br>" +
                "The first four each unlock a new tier.<br><br>Next speciation needs <b>" + r.amount + " " + TIERS[r.tier].name + "</b> bought (you have " + formatWhole(tierBought(r.tier)) + ").<br>" +
                "Speciating resets your Biomass, tiers and Metabolism."
        }],
        "blank",
        lore("A population splits: a river changes course, a mountain rises, and on each side, life goes its own way."),
        "blank",
        ["display-text", function() { return "<h3>Keystone species</h3><br>Choose the tier your next speciation centers on. It gets doubled a second time.<br>Keystone now: <b>" + TIERS[player.sn.keystone].name + "</b>" }],
        "blank",
        ["clickables", [1, 2]],
        "blank",
        ["clickables", [9]],
    ],
    clickables: Object.assign({}, ...[1, 2, 3, 4, 5, 6, 7, 8].map(t => ({
        [10 * (t <= 4 ? 1 : 2) + ((t - 1) % 4) + 1]: {
            title() { return TIERS[t].name },
            display() { return "Keystone x" + formatWhole(Decimal.pow(2, player.sn.keystones[t] || 0)) },
            canClick() { return true },
            onClick() { player.sn.keystone = t },
            style() { return { width: "110px", height: "70px", "min-height": "70px", "background-color": player.sn.keystone == t ? "#7ec8e3" : "#3d6474" } },
        },
    })), {
        91: {
            title: "Speciate",
            display() { let r = speciationReq(); return "Needs " + r.amount + " " + TIERS[r.tier].name + " bought" },
            canClick() { let r = speciationReq(); return tierBought(r.tier).gte(r.amount) },
            onClick() {
                player.sn.keystones[player.sn.keystone]++
                player.sn.points = player.sn.points.add(1)
                speciesReset(1)
            },
            style() { return { width: "220px", height: "90px" } },
        },
    }),
})

// ------------------------------------------------------------
//  ADAPTIVE RADIATION (Antimatter Galaxies). Stronger metabolism, but resets speciations.
//  Pick a founder tier first: it keeps 10% of its population through the reset.
// ------------------------------------------------------------
function radiationReq() {
    return 60 + 40 * player.ar.points.toNumber()
}

addLayer("ar", {
    name: "adaptive radiation",
    symbol: "Ar",
    row: 22,
    position: 1,
    color: "#b38cff",
    startData() { return { unlocked: true, points: new Decimal(0), founder: 1 } },
    type: "none",
    resource: "radiations",
    layerShown() { return speciesUnlocked() },
    branches: ["sn"],
    tooltip() { return formatWhole(player.ar.points) + " radiations" },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#b38cff'>Adaptive Radiation</h2><br>You have <h2 style='color:#b38cff'>" + formatWhole(player.ar.points) + "</h2> radiations.<br>" +
                "Each one makes Metabolism stronger (+0.03 per level) and its food demand smaller.<br><br>" +
                "Next radiation needs <b>" + radiationReq() + " Humans</b> bought (you have " + formatWhole(tierBought(8)) + ").<br>Radiating resets your speciations too."
        }],
        "blank",
        lore("When a new door opens, life pours through it. One kind of creature becomes dozens, each one trying something different."),
        "blank",
        ["display-text", function() { return "<h3>The founder effect</h3><br>Choose a founder tier. It keeps 10% of its population through the reset, and your next run starts from there.<br>Founder now: <b>" + TIERS[player.ar.founder].name + "</b>" }],
        "blank",
        ["clickables", [1, 2]],
        "blank",
        ["clickables", [9]],
    ],
    clickables: Object.assign({}, ...[1, 2, 3, 4, 5, 6, 7, 8].map(t => ({
        [10 * (t <= 4 ? 1 : 2) + ((t - 1) % 4) + 1]: {
            title() { return TIERS[t].name },
            display() { return format(player.ti.amounts[t].div(10)) + " would survive" },
            canClick() { return true },
            onClick() { player.ar.founder = t },
            style() { return { width: "110px", height: "70px", "min-height": "70px", "background-color": player.ar.founder == t ? "#b38cff" : "#4e3d73" } },
        },
    })), {
        91: {
            title: "Radiate",
            display() { return "Needs " + radiationReq() + " Humans bought" },
            canClick() { return tierBought(8).gte(radiationReq()) },
            onClick() {
                let f = player.ar.founder, survivors = player.ti.amounts[f].div(10)
                player.ar.points = player.ar.points.add(1)
                speciesReset(2)
                player.ti.amounts[f] = survivors
            },
            style() { return { width: "220px", height: "90px" } },
        },
    }),
})

// ------------------------------------------------------------
//  COMPETITION (Dimensional Sacrifice). Pick a winner; every tier below it is wiped out to boost it.
// ------------------------------------------------------------
// Like Dimensional Sacrifice, the boost depends on everything a tier has ever out-competed,
// so competing again only pays off once there's a lot more to wipe out.
function competitionMult(lost) {
    return lost.add(1).log10().div(10).pow(hasUpgrade("ti", 42) ? 2.5 : 2).max(1)
}

function competitionLoss(w) {
    let lost = new Decimal(0)
    for (let t = 1; t < w; t++) lost = lost.add(player.ti.amounts[t])
    return lost
}

function competitionGain(w) {
    return competitionMult(player.cu.lost[w].add(competitionLoss(w))).div(player.cu.mults[w]).max(1)
}

addLayer("cu", {
    name: "competition",
    symbol: "Cu",
    row: 22,
    position: 0,
    color: "#e74c3c",
    startData() { return { unlocked: true, points: new Decimal(0), winner: 8, mults: [null, ...Array(8).fill(0).map(() => new Decimal(1))], lost: [null, ...Array(8).fill(0).map(() => new Decimal(0))] } },
    type: "none",
    layerShown() { return speciesUnlocked() && (player.sn.points.gte(5) || player.ar.points.gt(0)) },
    branches: ["sn"],
    tooltip() { return "Competition" },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#e74c3c'>Competition</h2><br>Pick a winner. Every tier below it is wiped out, and the winner gets a boost based on how many it out-competed.<br>" +
                "The boost grows with everything that tier has ever out-competed, and lasts until your next Speciation or Radiation."
        }],
        "blank",
        lore("Two species can't share one niche forever. Sooner or later, one of them wins."),
        "blank",
        ["display-text", function() { let w = player.cu.winner; return "Winner: <b>" + TIERS[w].name + "</b>, currently x" + format(player.cu.mults[w]) + ".<br>Competing now would multiply it by <b>x" + format(competitionGain(w)) + "</b>." }],
        "blank",
        ["clickables", [1, 2]],
        "blank",
        ["clickables", [9]],
    ],
    clickables: Object.assign({}, ...[2, 3, 4, 5, 6, 7, 8].map(t => ({
        [10 * (t <= 4 ? 1 : 2) + ((t - 1) % 4) + 1]: {
            title() { return TIERS[t].name },
            display() { return "x" + format(player.cu.mults[t]) },
            unlocked() { return t <= tiersUnlocked() },
            canClick() { return true },
            onClick() { player.cu.winner = t },
            style() { return { width: "110px", height: "70px", "min-height": "70px", "background-color": player.cu.winner == t ? "#e74c3c" : "#6e2a23" } },
        },
    })), {
        91: {
            title: "Compete",
            display() { let w = player.cu.winner; return player.ti.amounts[w].lt(1) ? "You need some " + TIERS[w].name + " to win" : "Wipe out every tier below " + TIERS[w].name + " for x" + format(competitionGain(w)) },
            canClick() { let w = player.cu.winner; return w <= tiersUnlocked() && player.ti.amounts[w].gte(1) && competitionGain(w).gt(1.01) },
            onClick() {
                let w = player.cu.winner
                player.cu.lost[w] = player.cu.lost[w].add(competitionLoss(w))
                player.cu.mults[w] = competitionMult(player.cu.lost[w])
                for (let t = 1; t < w; t++) player.ti.amounts[t] = new Decimal(0)
            },
            style() { return { width: "240px", height: "90px" } },
        },
    }),
})

// Act 3 achievements each make every tier 5% stronger
function speciesAchievementBonus() {
    let n = player.a.achievements.filter(id => Number(id) >= 111).length
    return new Decimal(1 + 0.05 * n)
}
