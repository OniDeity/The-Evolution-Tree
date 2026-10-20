// ============================================================
//  ACT 2: LIFE
//  The Prestige Tree again, at biological scale. Life has its own tree and its own
//  resource, DNA, so resets in Act 2 never touch the Cosmos (and vice versa).
//
//  Prestige   -> Cells        (c)   Twist: cells divide on their own up to a carrying capacity
//  Boosters   -> Mutations    (mu)  Twist: every mutation offers a choice of two random traits
//  Generators -> Reproduction (re)  Twist: offspring are born and die, settling at an equilibrium
//
//  Act 2 layers use rows 10+ so that Act 1 resets (rows 0-3) never reach them, and they
//  reset each other through lifeReset() instead of the usual row resets.
// ============================================================

const LIFE_LAYERS = ["c", "mu", "re", "ge", "ad", "hb", "mc", "sy", "in", "pr"]

function lifeUnlocked() {
    return hasUpgrade("pl", 23)
}

const DNA_PACING = 0.93

function dnaGain() {
    if (!lifeUnlocked() || !hasUpgrade("c", 11)) return new Decimal(0)
    let gain = new Decimal(1)
    if (hasUpgrade("c", 12)) gain = gain.times(upgradeEffect("c", 12))
    if (hasUpgrade("c", 13)) gain = gain.times(upgradeEffect("c", 13))
    if (hasUpgrade("c", 22)) gain = gain.times(upgradeEffect("c", 22))
    if (hasUpgrade("c", 31)) gain = gain.times(3)
    if (hasUpgrade("c", 32)) gain = gain.times(upgradeEffect("c", 32))
    if (player.mu.unlocked) gain = gain.times(tmp.mu.effect)
    if (player.re.unlocked) gain = gain.times(tmp.re.offspringEffect)
    gain = gain.times(traitEffect("flagellum")).times(traitEffect("photo")).times(traitEffect("chemo"))
    gain = gain.times(lifeBonus("dna"))
    if (hasUpgrade("lt", 14)) gain = gain.times(10)
    gain = gain.times(devolutionDNA())
    // Pacing: stretches Act 2 evenly so something new unlocks about once a minute
    gain = gain.max(1).pow(DNA_PACING)
    // Predators: every fight is harder than the last
    if (player.pr && player.pr.activeChallenge) gain = gain.pow(1 - 0.03 * predatorLevel(player.pr.activeChallenge))
    if (typeof inRegression == "function" && inRegression(82)) gain = gain.pow(0.85)
    return gain
}

// Prestiging in Act 2 resets DNA and every Act 2 layer in a lower row, keeping what that layer's milestones protect
function lifeReset(row) {
    // Like energy in Act 1: a Cell reset empties your DNA, higher resets leave you 10 to start over with
    player.dna = new Decimal(row > 10 ? 10 : 0)
    if (player.fn) player.fn.resets[row] = (player.fn.resets[row] || 0) + 1
    for (let l of LIFE_LAYERS) {
        if (layers[l].row >= row) continue
        let keep = layers[l].lifeKeep ? layers[l].lifeKeep(row) : []
        // Copy what's kept first: layerDataReset resets nested objects (like traits) in place,
        // so keeping them by reference would silently wipe them
        let saved = {}
        for (let k of keep) if (player[l][k] !== undefined) saved[k] = deepCopy(player[l][k])
        layerDataReset(l, [])
        for (let k in saved) player[l][k] = saved[k]
    }
}

function deepCopy(value) {
    if (value instanceof Decimal) return new Decimal(value)
    if (Array.isArray(value)) return value.map(deepCopy)
    if (value && typeof value == "object") {
        let copy = {}
        for (let k in value) copy[k] = deepCopy(value[k])
        return copy
    }
    return value
}

// ------------------------------------------------------------
//  THE LIFE TREE (opened from the "Life" node next to Achievements)
// ------------------------------------------------------------
addLayer("life", {
    name: "life",
    symbol: "Life",
    row: "side",
    position: 1,
    color: "#7ed957",
    startData() { return { unlocked: true, points: new Decimal(0) } },
    type: "none",
    leftTab: true,
    previousTab: "tree-tab",
    layerShown() { return lifeUnlocked() },
    tooltip() { return "Act 2: Life" },
    nodeStyle: { "font-size": "20px" },
    tabFormat: [
        "blank",
        ["display-text", function() { return "<h2 style='color:#7ed957'>Act 2: Life</h2><br>You have <h2 style='color:#7ed957;text-shadow:0 0 10px #7ed957'>" + format(player.dna) + "</h2> DNA (+" + format(dnaGain()) + "/sec)" }],
        "blank",
        ["tree", [["fo", "gx", "bd", "dv", "ab", "fn"], ["c", "ph"], ["gt", "mu", "re", "eg"], ["ge", "ad", "hb", "oc"], ["mc", "in", "pr", "sy"], ["hs", "ho", "te", "se"]]],
    ],
})

// ------------------------------------------------------------
//  CELLS (Prestige). Cells divide on their own, up to a carrying capacity.
// ------------------------------------------------------------
addLayer("c", {
    name: "cells",
    symbol: "C",
    position: 0,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#7ed957",
    requires: new Decimal(10),
    resource: "cells",
    baseResource: "DNA",
    baseAmount() { return player.dna },
    type: "normal",
    exponent: 0.4,
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("c", 23)) mult = mult.times(upgradeEffect("c", 23))
        mult = mult.times(traitEffect("cilia"))
        mult = mult.times(lifeBonus("cells"))
        return mult
    },
    gainExp() { return new Decimal(1) },
    row: 10,
    hotkeys: [
        {key: "c", description: "C: Reset for cells", onPress() { if (lifeUnlocked() && canReset(this.layer)) doReset(this.layer) }},
    ],
    layerShown() { return lifeUnlocked() },
    resetsNothing: true,
    onPrestige() { lifeReset(this.row) },
    passiveGeneration() { return hasLifeRow3Milestone(1) ? 1 : 0 },
    lifeKeep(row) {
        if (row >= 12 || hasLifeRow3Milestone(0)) return ["upgrades"]
        if (row == 11 && (hasMilestone("mu", 0) || hasMilestone("re", 0))) return ["upgrades"]
        return []
    },
    capacity() {
        let k = new Decimal(50)
        if (hasUpgrade("c", 14)) k = k.times(5)
        if (hasUpgrade("c", 24)) k = k.times(upgradeEffect("c", 24))
        if (hasUpgrade("c", 33)) k = k.times(10)
        k = k.times(traitEffect("membrane"))
        if (player.re.unlocked) k = k.times(buyableEffect("re", 12).capacity).times(player.re.points.add(1))
        k = k.times(lifeBonus("capacity"))
        return k
    },
    divisionRate() {
        let r = 0.05
        if (hasUpgrade("c", 21)) r *= 2
        if (hasUpgrade("c", 31)) r *= 1.5
        r *= traitEffect("fission").toNumber()
        r *= lifeBonus("division").toNumber()
        return r
    },
    // Logistic growth, solved exactly so it stays stable for any tick length:
    // N(t + dt) = K / (1 + (K / N - 1) * e^(-r dt))
    update(diff) {
        if (!lifeUnlocked()) return
        // A head start, so you can afford your first cell
        if (!player.c.unlocked && player.dna.lt(10)) player.dna = new Decimal(10)
        player.dna = player.dna.add(dnaGain().times(diff))
        let n = player.c.points
        if (n.lte(0)) return
        let k = tmp.c.capacity
        let decay = Math.exp(-tmp.c.divisionRate * diff)
        player.c.points = k.div(k.div(n).sub(1).times(decay).add(1))
        // Hunted: predators eat a share of your cells every second
        if (player.pr && inChallenge("pr", 11)) player.c.points = player.c.points.times(Math.pow(1 - 0.05 * predatorLevel(11), diff))
        player.c.best = player.c.best.max(player.c.points)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        "blank",
        ["display-text", function() {
            let full = player.c.points.div(tmp.c.capacity).min(1).toNumber()
            let bar = "<div style='width:300px;height:14px;border:2px solid #7ed957;border-radius:7px;margin:auto;overflow:hidden'><div style='width:" + (full * 100) + "%;height:100%;background:#7ed957'></div></div>"
            return "Your cells divide on their own (" + format(tmp.c.divisionRate * 100) + "% per second) until they fill your <b>carrying capacity</b> of " + format(tmp.c.capacity) + ". Cells above capacity starve, so a reset only helps while there's room to grow.<br>Capacity grows with Cell upgrades, broods, Longevity and the Thick Membrane trait.<br><br>" + bar
        }],
        "blank",
        lore("Somewhere in a warm, shallow sea, a fatty bubble closes around a scrap of self-copying chemistry. It isn't much. But it is the first thing that is <b>alive</b>."),
        "blank",
        "upgrades",
    ],
    upgrades: {
        11: {
            title: "Abiogenesis",
            description: "Life from non-life. Generate 1 DNA per second.",
            cost: new Decimal(1),
        },
        12: {
            title: "RNA World",
            description: "Cells boost DNA gain.",
            cost: new Decimal(1),
            unlocked() { return hasUpgrade("c", 11) },
            effect() { return player.c.points.add(2).sqrt() },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        13: {
            title: "Self-Replication",
            description: "DNA boosts its own gain.",
            cost: new Decimal(5),
            unlocked() { return hasUpgrade("c", 12) },
            effect() { return player.dna.add(1).log10().pow(0.75).add(1) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        14: {
            title: "Lipid Membrane",
            description: "Carrying capacity is 5x bigger.",
            cost: new Decimal(15),
            unlocked() { return hasUpgrade("c", 13) },
        },
        21: {
            title: "Binary Fission",
            description: "Cells divide twice as fast.",
            cost: new Decimal(60),
            unlocked() { return player.mu.unlocked || player.re.unlocked },
        },
        22: {
            title: "Ribosomes",
            description: "Protein factories. DNA gain is boosted by your Cell upgrades.",
            cost: new Decimal(250),
            unlocked() { return hasUpgrade("c", 21) },
            effect() { return Decimal.pow(1.15, player.c.upgrades.length) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        23: {
            title: "Primordial Soup",
            description: "The energy of the Cosmos boosts cell gain.",
            cost: new Decimal(1000),
            unlocked() { return hasUpgrade("c", 22) },
            effect() { return player.points.add(1).log10().add(1).sqrt() },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        24: {
            title: "Cytoskeleton",
            description: "Carrying capacity is multiplied by your number of Cell upgrades.",
            cost: new Decimal(4000),
            unlocked() { return hasUpgrade("c", 23) },
            effect() { return new Decimal(player.c.upgrades.length).max(1) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        31: {
            title: "Mitochondria",
            description: "An ancient bacterium moves in and never leaves. Triple DNA gain, and cells divide 1.5x faster.",
            cost: new Decimal(2e4),
            unlocked() { return hasUpgrade("c", 24) && player.mu.unlocked && player.re.unlocked },
        },
        32: {
            title: "Chloroplasts",
            description: "Sunlight becomes food. Starlight boosts DNA gain.",
            cost: new Decimal(1e5),
            unlocked() { return hasUpgrade("c", 31) },
            effect() { return player.st.starlight.add(1).log10().add(1) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        33: {
            title: "Nucleus",
            description: "DNA gets a room of its own. Carrying capacity is 10x bigger.",
            cost: new Decimal(6e5),
            unlocked() { return hasUpgrade("c", 32) },
        },
        34: {
            title: "Cambrian Explosion",
            description: "Life is ready to get complicated. <b>Unlocks Generations, Adaptation and Habitats.</b><br>Requires 12 mutations and 12 broods.",
            cost: new Decimal(1e6),
            unlocked() { return hasUpgrade("c", 33) },
            canAfford() { return player.mu.points.gte(12) && player.re.points.gte(12) },
        },
    },
})

// ------------------------------------------------------------
//  MUTATIONS (Boosters). Every mutation lets you pick one of two random traits.
// ------------------------------------------------------------
const TRAITS = {
    flagellum: { name: "Flagellum", text: "A tail to swim with. DNA gain x1.5.", per: lvl => Decimal.pow(1.5, lvl) },
    membrane: { name: "Thick Membrane", text: "Carrying capacity x2.", per: lvl => Decimal.pow(2, lvl) },
    fission: { name: "Rapid Fission", text: "Cells divide 1.25x faster.", per: lvl => Decimal.pow(1.25, lvl) },
    cilia: { name: "Cilia", text: "Tiny hairs that sweep in food. Cell gain x1.4.", per: lvl => Decimal.pow(1.4, lvl) },
    photo: { name: "Photoreceptor", text: "An eyespot. Starlight boosts DNA gain.", per: lvl => player.st.starlight.add(1).log10().div(20).add(1).pow(lvl) },
    chemo: { name: "Chemosynthesis", text: "Living off minerals. Heavy Elements boost DNA gain.", per: lvl => player.st.heavy.add(1).log10().div(5).add(1).pow(lvl) },
    toxin: { name: "Toxin Resistance", text: "Offspring live 1.5x longer.", per: lvl => Decimal.pow(1.5, lvl) },
    repair: { name: "DNA Repair", text: "Mutations are 2x cheaper.", per: lvl => Decimal.pow(2, lvl) },
}

// After 5 copies of the same trait (8 with Gene Duplication), extra copies count for less (as a square root)
function effectiveTraitLevel(n) {
    let cap = traitSoftcap()
    return n <= cap ? n : cap + Math.sqrt(n - cap)
}

function traitEffect(id) {
    if (!player.mu || !player.mu.traits || (typeof inRegression == "function" && inRegression(83))) return new Decimal(1)
    return TRAITS[id].per(effectiveTraitLevel(player.mu.traits[id] || 0) + borrowedLevel(id)).pow(traitEnhancement(id))
}

// Take one of the traits on offer; the next one along drifts into the Gene Transfer pool
function pickTrait(n) {
    let offers = traitOffers()
    player.mu.traits[offers[n]]++
    passTrait(offers[(n + 1) % offers.length])
}

function traitsPicked() {
    let n = 0
    for (let id in TRAITS) n += player.mu.traits[id] || 0
    return n
}

function pendingTraits() {
    return Math.max(0, player.mu.points.toNumber() - traitsPicked())
}

// The traits on offer depend only on how many you've picked (and how often you've rerolled), so reloading doesn't reroll them
function traitOffers(ahead = 0) {
    let ids = Object.keys(TRAITS)
    if (offerCount() >= ids.length) return ids
    let seed = ((traitsPicked() + 1 + ahead) * 2654435761 + (player.gx ? player.gx.shift : 0) * 97531) % 4294967296
    let rand = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296 }
    let offers = []
    if (lockedTrait()) offers.push(lockedTrait())
    while (offers.length < offerCount()) {
        let rest = ids.filter(id => !offers.includes(id))
        offers.push(rest[Math.floor(rand() * rest.length)])
    }
    return offers
}

addLayer("mu", {
    name: "mutations",
    symbol: "Mu",
    position: 0,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        unlockOrder: 0,
        traits: { flagellum: 0, membrane: 0, fission: 0, cilia: 0, photo: 0, chemo: 0, toxin: 0, repair: 0 },
    }},
    color: "#e85d9e",
    requires() { return new Decimal(200).times(player.mu.unlockOrder > 0 ? 20 : 1) },
    resource: "mutations",
    baseResource: "DNA",
    baseAmount() { return player.dna },
    type: "static",
    base: 3,
    exponent: 1.2,
    gainMult() { return new Decimal(1).div(traitEffect("repair")).div(hasMilestone("gt", 0) ? 1.25 : 1) },
    gainExp() { return new Decimal(1) },
    canBuyMax() { return hasMilestone("mu", 1) },
    row: 11,
    branches: ["c"],
    increaseUnlockOrder: ["re"],
    hotkeys: [
        {key: "m", description: "M: Reset for mutations", onPress() { if (lifeUnlocked() && canReset(this.layer)) doReset(this.layer) }},
    ],
    layerShown() { return lifeUnlocked() && player.c.unlocked },
    resetsNothing: true,
    autoPrestige() { return hasMilestone("ge", 3) },
    onPrestige() { if (!hasMilestone("ge", 3)) lifeReset(this.row) },
    lifeKeep(row) {
        let keep = []
        if (row >= 12 || hasLifeRow3Milestone(0)) keep.push("milestones", "traits")
        return keep
    },
    effect() { return Decimal.pow(new Decimal(1.3).add(player.mc && player.mc.unlocked ? tmp.mc.effect : 0), player.mu.points) },
    effectDescription() { return "which multiply DNA gain by " + format(tmp.mu.effect) },
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        "blank",
        lore("Copying is never perfect. Most mistakes kill. A few, purely by chance, help, and the cells that carry them leave more descendants than the rest."),
        "blank",
        ["display-text", function() {
            let pending = pendingTraits()
            return "<h3>Natural Selection</h3><br>" + (offerCount() > 3 ? "Design mode: every trait is on offer." : "Every mutation offers " + ["", "", "two", "three"][offerCount()] + " random traits.") + " Pick one to keep." +
                (pending > 0 ? "<br><b>You have " + pending + " trait" + (pending > 1 ? "s" : "") + " to pick.</b>" : "<br>Get another mutation to pick a new trait.") +
                (hasUpgrade("gx", 11) && pending > 0 ? "<br><i>Next offer: " + traitOffers(1).map(id => TRAITS[id].name).join(", ") + "</i>" : "")
        }],
        "blank",
        ["clickables", [1, 2]],
        "blank",
        ["display-text", function() {
            let owned = Object.keys(TRAITS).filter(id => player.mu.traits[id] > 0)
            if (!owned.length) return ""
            return "<b>Your traits:</b><br>" + owned.map(id => TRAITS[id].name + " x" + player.mu.traits[id]).join(", ") + "<br><i>After 5 copies of a trait, extra copies count for less.</i>"
        }],
        "blank",
        "milestones",
    ],
    clickables: Object.assign({}, ...[0, 1, 2, 3, 4, 5, 6, 7].map(n => ({
        [11 + n]: {
            unlocked() { return n < offerCount() },
            // Hidden slots (beyond the offers you have) still get their text worked out, so they must not look up a missing trait
            title() { let id = traitOffers()[n]; return pendingTraits() > 0 && id ? TRAITS[id].name : "?" },
            display() {
                let id = traitOffers()[n]
                if (pendingTraits() <= 0 || !id) return "Get another mutation to see what natural selection offers."
                return TRAITS[id].text + "<br><br>You have: " + (player.mu.traits[id] || 0)
            },
            canClick() { return pendingTraits() > 0 },
            onClick() { pickTrait(n) },
            style() { return offerCount() > 3 ? { width: "130px", height: "120px", "font-size": "10px" } : { width: "200px", height: "150px" } },
        },
    })), {
        22: {
            title: "Reroll",
            display() { return "New offers for " + formatWhole(rerollCost()) + " Base Pairs." },
            unlocked() { return hasUpgrade("gx", 12) && offerCount() < 8 },
            canClick() { return pendingTraits() > 0 && player.gx.points.gte(rerollCost()) },
            onClick() { rerollTraits() },
            style() { return { width: "200px", height: "80px" } },
        },
        21: {
            title: "Let nature decide",
            display() { return "Take the first offer for all " + pendingTraits() + " traits you have waiting." },
            unlocked() { return pendingTraits() >= 5 },
            canClick() { return pendingTraits() > 0 },
            onClick() { while (pendingTraits() > 0) pickTrait(0) },
            style() { return { width: "200px", height: "80px" } },
        },
    }),
    milestones: {
        0: {
            requirementDescription: "3 mutations",
            effectDescription: "Keep Cell upgrades on Mutation and Reproduction resets.",
            done() { return player.mu.best.gte(3) },
        },
        1: {
            requirementDescription: "8 mutations",
            effectDescription: "You can buy max mutations.",
            done() { return player.mu.best.gte(8) },
        },
        2: {
            requirementDescription: "40 mutations",
            effectDescription: "Waiting traits are picked on their own, taking whichever offer you have fewer copies of.",
            done() { return player.mu.best.gte(40) },
        },
    },
    automate() {
        if (!hasMilestone("mu", 2) && !devolved("mu")) return
        for (let i = 0; i < 50 && pendingTraits() > 0; i++) pickTrait(autoTraitPick(traitOffers()))
    },
})

// ------------------------------------------------------------
//  REPRODUCTION (Generators). Offspring are born and die, so they settle at births x lifespan.
// ------------------------------------------------------------
addLayer("re", {
    name: "reproduction",
    symbol: "Re",
    position: 1,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        unlockOrder: 0,
        offspring: new Decimal(0),
    }},
    color: "#ffb86b",
    requires() { return new Decimal(200).times(player.re.unlockOrder > 0 ? 20 : 1) },
    resource: "broods",
    baseResource: "DNA",
    baseAmount() { return player.dna },
    type: "static",
    base: 3,
    exponent: 1.2,
    gainMult() { return new Decimal(1) },
    gainExp() { return new Decimal(1) },
    canBuyMax() { return hasMilestone("re", 1) },
    row: 11,
    branches: ["c"],
    increaseUnlockOrder: ["mu"],
    hotkeys: [
        {key: "r", description: "R: Reset for broods", onPress() { if (lifeUnlocked() && canReset(this.layer)) doReset(this.layer) }},
    ],
    layerShown() { return lifeUnlocked() && player.c.unlocked },
    resetsNothing: true,
    autoPrestige() { return hasMilestone("hb", 3) },
    onPrestige() { if (!hasMilestone("hb", 3)) lifeReset(this.row) },
    lifeKeep(row) {
        let keep = []
        if (row >= 12 || hasLifeRow3Milestone(0)) keep.push("milestones", "buyables")
        return keep
    },
    births() {
        return Decimal.pow(2, player.re.points).sub(1).times(buyableEffect("re", 11)).times(lifeBonus("births"))
    },
    lifespan() {
        return new Decimal(20).times(buyableEffect("re", 12).lifespan).times(traitEffect("toxin")).times(lifeBonus("lifespan"))
    },
    equilibrium() {
        return tmp.re.births.times(tmp.re.lifespan)
    },
    offspringEffect() {
        return player.re.offspring.add(1).pow(0.15)
    },
    automate() {
        if (hasLifeRow3Milestone(2) || devolved("re")) buyBuyable("re", getBuyableAmount("re", 11).lte(getBuyableAmount("re", 12)) ? 11 : 12)
    },
    // Births add offspring and deaths remove them: dO/dt = births - O / lifespan, solved exactly
    // When offspring live a long time, a tick only changes the population by a sliver, and the exact
    // formula loses that sliver to rounding. So for short ticks, step it directly instead.
    update(diff) {
        if (!player.re.unlocked) return
        let eq = tmp.re.equilibrium, o = player.re.offspring
        let x = new Decimal(diff).div(tmp.re.lifespan)
        let next
        if (x.lt(1e-4)) {
            next = o.add(tmp.re.births.times(diff)).sub(o.times(x))
            if (o.lte(eq)) next = next.min(eq)
        } else {
            let fade = Math.exp(-x.toNumber())
            next = o.times(fade).add(eq.times(1 - fade))
        }
        player.re.offspring = next.max(0)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return "You have <h2 style='color:#ffb86b;text-shadow:0 0 10px #ffb86b'>" + format(player.re.offspring) + "</h2> offspring, which multiply DNA gain by " + format(tmp.re.offspringEffect) }],
        "resource-display",
        "blank",
        ["display-text", function() {
            return "<h3>Life and Death</h3><br>Your broods produce " + format(tmp.re.births) + " offspring per second, and each one lives about " + format(tmp.re.lifespan) + " seconds.<br>" +
                "Your population settles where births balance deaths: <b>" + format(tmp.re.equilibrium) + "</b> offspring."
        }],
        "blank",
        lore("Splitting in two works. But cells that swap genes before they divide shuffle the deck, and their children are a little different from each other. Some of them are bound to be better."),
        "blank",
        "buyables",
        "blank",
        "milestones",
    ],
    // Fecundity and Longevity share one price: buying either makes both more expensive
    buyables: {
        11: {
            title: "Fecundity",
            cost() { return reproductionCost() },
            effect(x) { return Decimal.pow(2, x) },
            display() {
                return "More offspring per brood. Births x2.<br><br>Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>Cost: " + format(this.cost()) + " offspring<br>Effect: " + format(buyableEffect(this.layer, this.id)) + "x births<br><i>Fills up fast.</i>"
            },
            canAfford() { return player.re.offspring.gte(this.cost()) },
            buy() {
                if (!this.canAfford()) return
                player.re.offspring = player.re.offspring.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            title: "Longevity",
            cost() { return reproductionCost() },
            effect(x) { return { lifespan: Decimal.pow(2, x), capacity: Decimal.pow(1.5, x) } },
            display() {
                let eff = buyableEffect(this.layer, this.id)
                return "Offspring live twice as long, and longer-lived cells need more room: carrying capacity x1.5.<br><br>Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>Cost: " + format(this.cost()) + " offspring<br>Effect: " + format(eff.lifespan) + "x lifespan, " + format(eff.capacity) + "x capacity<br><i>Fills up slowly.</i>"
            },
            canAfford() { return player.re.offspring.gte(this.cost()) },
            buy() {
                if (!this.canAfford()) return
                player.re.offspring = player.re.offspring.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
    milestones: {
        0: {
            requirementDescription: "3 broods",
            effectDescription: "Keep Cell upgrades on Mutation and Reproduction resets.",
            done() { return player.re.best.gte(3) },
        },
        1: {
            requirementDescription: "8 broods",
            effectDescription: "You can buy max broods.",
            done() { return player.re.best.gte(8) },
        },
    },
})

function reproductionCost() {
    let bought = getBuyableAmount("re", 11).add(getBuyableAmount("re", 12))
    return Decimal.pow(4, bought).times(10)
}
