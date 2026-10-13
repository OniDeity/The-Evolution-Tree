// ============================================================
//  ACT 1: THE COSMOS
//  A retelling of The Prestige Tree, from the Big Bang to the first habitable world.
//
//  Prestige   -> Particles (p)
//  Boosters   -> Atoms     (at)
//  Generators -> Gravity   (gr)
//  Time       -> Stars     (st)
//  Enhance    -> Fusion    (fu)
//  Space      -> Planets   (pl)
// ============================================================

function inflationSoftcap() {
    return new Decimal(hasUpgrade("de", 11) ? 1e30 : 1e15)
}

function lore(text) {
    return ["display-text", "<i style='opacity:0.75'>" + text + "</i>"]
}

// True if any Row 2 layer (Stars, Fusion, Planets) has reached the given milestone.
// They share their first milestones so that it doesn't matter which one you pick first.
function hasRow2Milestone(id) {
    return hasMilestone("st", id) || hasMilestone("fu", id) || hasMilestone("pl", id)
}

function row2Unlocked() {
    return player.st.unlocked || player.fu.unlocked || player.pl.unlocked
}

const ROW2_SHARED_MILESTONES = {
    0: {
        requirementDescription: "1 total",
        effectDescription: "Keep Atom and Gravity milestones on all resets.",
    },
    1: {
        requirementDescription: "2 total",
        effectDescription: "Keep Particle upgrades on all resets, and automatically buy them.",
    },
    2: {
        requirementDescription: "3 total",
        effectDescription: "Gain 100% of your Particle gain every second.",
    },
}

function row2Milestones(layer, resource, extra) {
    let m = {}
    for (let id in ROW2_SHARED_MILESTONES) {
        let base = ROW2_SHARED_MILESTONES[id]
        let req = parseInt(base.requirementDescription)
        m[id] = {
            requirementDescription: base.requirementDescription + " " + resource,
            effectDescription: base.effectDescription,
            done() { return player[layer].total.gte(req) },
        }
    }
    return Object.assign(m, extra)
}

// ------------------------------------------------------------
//  ROW 0: PARTICLES
// ------------------------------------------------------------
addLayer("p", {
    name: "particles",
    symbol: "P",
    position: 0,
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#9be7ff",
    requires: new Decimal(10),
    resource: "particles",
    baseResource: "energy",
    baseAmount() { return player.points },
    type: "normal",
    exponent: 0.5,
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("p", 21)) mult = mult.times(1.8)
        if (hasUpgrade("p", 23)) mult = mult.times(upgradeEffect("p", 23))
        if (hasUpgrade("at", 11)) mult = mult.times(upgradeEffect("at", 11))
        if (hasUpgrade("gr", 11)) mult = mult.times(upgradeEffect("gr", 11))
        if (hasUpgrade("bh", 11)) mult = mult.times(upgradeEffect("bh", 11))
        if (hasUpgrade("p", 14)) mult = mult.times(2)
        if (hasUpgrade("st", 14)) mult = mult.times(upgradeEffect("st", 14))
        if (hasUpgrade("gr", 14)) mult = mult.times(upgradeEffect("gr", 14))
        if (hasUpgrade("fu", 23)) mult = mult.times(upgradeEffect("fu", 23))
        if (hasUpgrade("ga", 21)) mult = mult.times(upgradeEffect("ga", 21))
        if (hasUpgrade("de", 23)) mult = mult.times(tmp.de.expansionEffect.sqrt())
        if (player.fu.unlocked) mult = mult.times(buyableEffect("fu", 11).particles)
        if (hasUpgrade("pl", 22)) mult = mult.times(upgradeEffect("pl", 22))
        return mult
    },
    gainExp() {
        return new Decimal(inChallenge("hz", 22) ? 0.5 : 1)
    },
    row: 0,
    hotkeys: [
        {key: "p", description: "P: Reset for particles", onPress() { if (canReset(this.layer)) doReset(this.layer) }},
    ],
    layerShown() { return true },
    passiveGeneration() { return hasRow2Milestone(2) ? 1 : 0 },
    autoUpgrade() { return hasRow2Milestone(1) },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        let keep = []
        if (layers[resettingLayer].row == 1 && (hasMilestone("at", 0) || hasMilestone("gr", 0))) keep.push("upgrades", "buyables")
        if (hasRow2Milestone(1)) keep.push("upgrades", "buyables")
        layerDataReset(this.layer, keep)
    },
    buyables: {
        11: {
            title: "Quark Flavors",
            cost(x) { return Decimal.pow(100, x).times(1e12) },
            purchaseLimit: 6,
            effect(x) { return Decimal.pow(1.5, x) },
            display() {
                let x = getBuyableAmount(this.layer, this.id).toNumber()
                let names = ["Up", "Down", "Strange", "Charm", "Bottom", "Top"]
                let found = names.slice(0, x).join(", ") || "none yet"
                let next = x < 6 ? "<br>Next: <b>" + names[x] + "</b> for " + format(this.cost()) + " particles" : "<br><b>All six found!</b>"
                return "Discover a new kind of quark. Each one multiplies energy gain by 1.5.<br><br>Found: " + found + next +
                    "<br>Effect: " + format(buyableEffect(this.layer, this.id)) + "x energy"
            },
            canAfford() { return player.p.points.gte(this.cost()) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() { return hasUpgrade("p", 23) },
        },
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        "blank",
        lore("In the beginning there was nothing. Then, for no reason anyone has ever been able to explain, there was <b>everything</b>, all at once, unbearably hot and crammed into a space smaller than an atom."),
        "blank",
        "buyables",
        "blank",
        "upgrades",
    ],
    upgrades: {
        14: {
            title: "Gluon Plasma",
            description: "Quarks and gluons swim freely in the heat. Double particle gain.",
            cost: new Decimal(1e13),
            unlocked() { return hasUpgrade("p", 23) },
        },
        24: {
            title: "Neutrino Decoupling",
            description: "Ghostly neutrinos fly off and never look back. Atoms and gravity wells boost energy gain.",
            cost: new Decimal(1e16),
            unlocked() { return hasUpgrade("p", 14) },
            effect() {
                return player.at.points.add(player.gr.points).add(1).sqrt()
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        34: {
            title: "Photon Epoch",
            description: "<b>Cooling</b> uses a better formula.",
            cost: new Decimal(1e18),
            unlocked() { return hasUpgrade("p", 24) },
        },
        44: {
            title: "Electroweak Split",
            description: "Atoms and gravity wells are 5x cheaper.",
            cost: new Decimal(1e21),
            unlocked() { return hasUpgrade("p", 34) },
        },
        11: {
            title: "Big Bang",
            description: "Generate 1 energy per second.",
            cost: new Decimal(1),
        },
        12: {
            title: "Inflation",
            description: "Particles boost energy gain.",
            cost: new Decimal(1),
            unlocked() { return hasUpgrade("p", 11) },
            effect() {
                let exp = hasUpgrade("p", 32) ? 0.6 : 0.5
                return softcap(player.p.points.add(2).pow(exp), inflationSoftcap(), 0.3)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" + (upgradeEffect(this.layer, this.id).gte(inflationSoftcap()) ? " (softcapped)" : "") },
        },
        13: {
            title: "Cooling",
            description: "Energy boosts its own gain.",
            cost: new Decimal(5),
            unlocked() { return hasUpgrade("p", 12) },
            effect() {
                return player.points.add(1).log10().pow(hasUpgrade("p", 34) ? 0.8 : 0.75).add(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        21: {
            title: "Matter-Antimatter Asymmetry",
            description: "For every billion antiparticles, a billion and one particles. Gain 1.8x more particles.",
            cost: new Decimal(20),
            unlocked() { return player.at.unlocked || player.gr.unlocked },
        },
        22: {
            title: "Fundamental Forces",
            description: "Energy gain is boosted by the number of upgrades you've bought here.",
            cost: new Decimal(75),
            unlocked() { return hasUpgrade("p", 21) },
            effect() {
                return Decimal.pow(1.4, player.p.upgrades.length)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        23: {
            title: "Recombination",
            description: "Energy boosts particle gain.",
            cost: new Decimal(5000),
            unlocked() { return hasUpgrade("p", 22) },
            effect() {
                return player.points.add(1).log10().cbrt().add(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        31: {
            title: "Dark Matter",
            description: "An invisible scaffold for everything else. Particles boost Gravitational Force production.",
            cost: new Decimal(1e20),
            unlocked() { return row2Unlocked() && hasUpgrade("p", 23) },
            effect() {
                return player.p.points.add(1).log10().add(1).pow(2)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        32: {
            title: "Baryogenesis",
            description: "<b>Inflation</b> uses a better formula.",
            cost: new Decimal(1e26),
            unlocked() { return hasUpgrade("p", 31) },
        },
        33: {
            title: "Quantum Foam",
            description: "Energy gain is boosted by your achievements.",
            cost: new Decimal(1e45),
            unlocked() { return hasUpgrade("p", 32) },
            effect() {
                return Decimal.pow(1.25, player.a.achievements.length)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
    },
})

// ------------------------------------------------------------
//  ROW 1: ATOMS (Boosters)
// ------------------------------------------------------------
addLayer("at", {
    name: "atoms",
    symbol: "At",
    position: 0,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#ffd166",
    requires() { return new Decimal(200).times(player.at.unlockOrder > 0 ? 5000 : 1) },
    resource: "atoms",
    baseResource: "energy",
    baseAmount() { return player.points },
    type: "static",
    base: 5,
    exponent: 1.25,
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("at", 13)) mult = mult.div(upgradeEffect("at", 13))
        if (hasUpgrade("st", 13)) mult = mult.div(upgradeEffect("st", 13))
        if (hasUpgrade("p", 44)) mult = mult.div(5)
        return mult
    },
    gainExp() { return new Decimal(1) },
    canBuyMax() { return hasMilestone("at", 1) },
    autoPrestige() { return hasMilestone("st", 3) },
    resetsNothing() { return hasMilestone("st", 3) },
    row: 1,
    branches: ["p"],
    increaseUnlockOrder: ["gr"],
    hotkeys: [
        {key: "a", description: "A: Reset for atoms", onPress() { if (canReset(this.layer)) doReset(this.layer) }},
    ],
    layerShown() { return player.p.unlocked },
    effectBase() {
        let base = new Decimal(2)
        if (hasUpgrade("at", 12)) base = base.add(upgradeEffect("at", 12))
        if (hasUpgrade("at", 14)) base = base.add(0.15)
        if (hasUpgrade("st", 34)) base = base.add(0.1)
        if (hasUpgrade("hz", 12)) base = base.add(0.5)
        if (hasUpgrade("at", 21)) base = base.add(upgradeEffect("at", 21))
        if (player.st.unlocked) base = base.add(tmp.st.starlightAtomBase)
        if (hasChallenge("hz", 11)) base = base.add(challengeEffect("hz", 11))
        if (player.ga.unlocked) base = base.times(tmp.ga.effect)
        return base
    },
    effect() {
        if (inChallenge("hz", 11)) return new Decimal(1)
        return softcap(Decimal.pow(tmp.at.effectBase, player.at.points), new Decimal(1e25), 0.5)
    },
    effectDescription() {
        return "which multiply energy gain by " + format(tmp.at.effect) + (tmp.at.effect.gte(1e25) ? " (softcapped)" : "") + " (" + format(tmp.at.effectBase) + "x each)"
    },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        let keep = []
        if (hasRow2Milestone(0)) keep.push("milestones")
        if (hasMilestone("st", 4)) keep.push("upgrades")
        layerDataReset(this.layer, keep)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        "blank",
        lore("Three hundred and eighty thousand years after the beginning, the universe cools enough for electrons to settle around nuclei. For the first time, light can travel freely. The cosmos becomes transparent."),
        "blank",
        "milestones",
        "upgrades",
    ],
    milestones: {
        0: {
            requirementDescription: "8 atoms",
            effectDescription: "Keep Particle upgrades on Row 1 resets.",
            done() { return player.at.best.gte(8) },
        },
        1: {
            requirementDescription: "15 atoms",
            effectDescription: "You can buy max atoms.",
            done() { return player.at.best.gte(15) },
        },
    },
    upgrades: {
        14: {
            title: "Deuterium",
            description: "Heavy hydrogen. Add 0.15 to the Atom base.",
            cost: new Decimal(17),
            unlocked() { return hasUpgrade("at", 13) },
        },
        24: {
            title: "Beryllium",
            description: "Atoms boost Gravitational Force production.",
            cost: new Decimal(21),
            unlocked() { return hasUpgrade("at", 14) },
            effect() {
                return player.at.points.add(1).sqrt()
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        11: {
            title: "Hydrogen",
            description: "The simplest atom. Atoms boost particle gain.",
            cost: new Decimal(3),
            effect() {
                return player.at.points.add(1).pow(1.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        12: {
            title: "Helium",
            description: "Particles add to the Atom base.",
            cost: new Decimal(6),
            unlocked() { return hasUpgrade("at", 11) },
            effect() {
                return player.p.points.add(1).log10().sqrt().div(3)
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) },
        },
        13: {
            title: "Lithium",
            description: "Atoms are cheaper based on your energy.",
            cost: new Decimal(8),
            unlocked() { return hasUpgrade("at", 12) },
            effect() {
                return player.points.add(1).log10().add(1).pow(1.5)
            },
            effectDisplay() { return "/" + format(upgradeEffect(this.layer, this.id)) },
        },
        21: {
            title: "Carbon",
            description: "Forged in stars, the backbone of everything to come. Stars add to the Atom base.",
            cost: new Decimal(25),
            unlocked() { return player.st.unlocked && hasUpgrade("at", 13) },
            effect() {
                return player.st.points.div(4)
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) },
        },
        22: {
            title: "Oxygen",
            description: "Atoms boost Starlight gain.",
            cost: new Decimal(30),
            unlocked() { return hasUpgrade("at", 21) },
            effect() {
                return player.at.points.add(1).pow(2)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        23: {
            title: "Iron",
            description: "The end of the line for fusion. Atoms boost Fusion gain.",
            cost: new Decimal(40),
            unlocked() { return hasUpgrade("at", 22) && player.fu.unlocked },
            effect() {
                return player.at.points.add(1).pow(0.25)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
    },
})

// ------------------------------------------------------------
//  ROW 1: GRAVITY (Generators)
// ------------------------------------------------------------
addLayer("gr", {
    name: "gravity",
    symbol: "G",
    position: 1,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        force: new Decimal(0),
    }},
    color: "#a28bff",
    requires() { return new Decimal(200).times(player.gr.unlockOrder > 0 ? 5000 : 1) },
    resource: "gravity wells",
    baseResource: "energy",
    baseAmount() { return player.points },
    type: "static",
    base: 5,
    exponent: 1.25,
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("pl", 13)) mult = mult.div(upgradeEffect("pl", 13))
        if (hasUpgrade("p", 44)) mult = mult.div(5)
        if (hasUpgrade("gr", 24)) mult = mult.div(upgradeEffect("gr", 24))
        return mult
    },
    gainExp() { return new Decimal(1) },
    canBuyMax() { return hasMilestone("gr", 1) },
    autoPrestige() { return hasMilestone("pl", 3) },
    resetsNothing() { return hasMilestone("pl", 3) },
    row: 1,
    branches: ["p"],
    increaseUnlockOrder: ["at"],
    hotkeys: [
        {key: "g", description: "G: Reset for gravity wells", onPress() { if (canReset(this.layer)) doReset(this.layer) }},
    ],
    layerShown() { return player.p.unlocked },
    effectBase() {
        let base = new Decimal(2)
        if (hasUpgrade("gr", 12)) base = base.add(1)
        if (hasUpgrade("st", 23)) base = base.add(upgradeEffect("st", 23))
        return base
    },
    effect() {
        let gain = Decimal.pow(tmp.gr.effectBase, player.gr.points).sub(1)
        if (hasUpgrade("p", 31)) gain = gain.times(upgradeEffect("p", 31))
        if (hasUpgrade("gr", 21)) gain = gain.times(upgradeEffect("gr", 21))
        if (player.pl.unlocked) gain = gain.times(buyableEffect("pl", 12))
        if (player.bh.unlocked) gain = gain.times(tmp.bh.radiationEffect)
        if (hasUpgrade("at", 24)) gain = gain.times(upgradeEffect("at", 24))
        if (hasUpgrade("st", 22)) gain = gain.times(upgradeEffect("st", 22))
        if (hasUpgrade("st", 15)) gain = gain.times(10)
        return gain
    },
    effectDescription() {
        return "which are generating " + format(tmp.gr.effect) + " Gravitational Force/sec"
    },
    forceExp() {
        let exp = new Decimal(1/3)
        if (hasUpgrade("gr", 13)) exp = new Decimal(0.4)
        if (hasUpgrade("gr", 23)) exp = new Decimal(0.5)
        return exp
    },
    forceEffect() {
        if (inChallenge("hz", 21)) return new Decimal(1)
        return player.gr.force.add(1).pow(tmp.gr.forceExp)
    },
    update(diff) {
        if (player.gr.unlocked) player.gr.force = player.gr.force.add(tmp.gr.effect.times(diff))
    },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        let keep = []
        if (hasRow2Milestone(0)) keep.push("milestones")
        if (hasMilestone("pl", 4)) keep.push("upgrades")
        layerDataReset(this.layer, keep)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return "You have <h2 style='color:#a28bff;text-shadow:0 0 10px #a28bff'>" + format(player.gr.force) + "</h2> Gravitational Force, which multiplies energy gain by " + format(tmp.gr.forceEffect) }],
        "resource-display",
        "blank",
        lore("Tiny ripples in the young universe, slightly denser than their surroundings, begin to pull. Slowly, patiently, matter falls together."),
        "blank",
        "milestones",
        "upgrades",
    ],
    milestones: {
        0: {
            requirementDescription: "8 gravity wells",
            effectDescription: "Keep Particle upgrades on Row 1 resets.",
            done() { return player.gr.best.gte(8) },
        },
        1: {
            requirementDescription: "15 gravity wells",
            effectDescription: "You can buy max gravity wells.",
            done() { return player.gr.best.gte(15) },
        },
    },
    upgrades: {
        14: {
            title: "Tidal Forces",
            description: "Gravity wells boost particle gain.",
            cost: new Decimal(17),
            unlocked() { return hasUpgrade("gr", 13) },
            effect() {
                return player.gr.points.add(1).sqrt()
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        24: {
            title: "Roche Limit",
            description: "Gravitational Force makes gravity wells cheaper.",
            cost: new Decimal(20),
            unlocked() { return hasUpgrade("gr", 14) },
            effect() {
                return player.gr.force.add(1).log10().add(1).sqrt()
            },
            effectDisplay() { return "/" + format(upgradeEffect(this.layer, this.id)) },
        },
        11: {
            title: "Accretion",
            description: "Gravitational Force boosts particle gain.",
            cost: new Decimal(3),
            effect() {
                return player.gr.force.add(1).pow(0.2)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        12: {
            title: "Orbits",
            description: "Gravity wells are more effective (base +1).",
            cost: new Decimal(6),
            unlocked() { return hasUpgrade("gr", 11) },
        },
        13: {
            title: "Collapse",
            description: "Gravitational Force uses a better formula.",
            cost: new Decimal(9),
            unlocked() { return hasUpgrade("gr", 12) },
        },
        21: {
            title: "Curved Spacetime",
            description: "Planets boost Gravitational Force production.",
            cost: new Decimal(25),
            unlocked() { return player.pl.unlocked && hasUpgrade("gr", 13) },
            effect() {
                return player.pl.points.add(1).pow(3)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        22: {
            title: "Gravitational Lensing",
            description: "Gravitational Force boosts Starlight gain.",
            cost: new Decimal(30),
            unlocked() { return player.st.unlocked && hasUpgrade("gr", 13) },
            effect() {
                return player.gr.force.add(1).log10().add(1).pow(2)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        23: {
            title: "Event Horizon",
            description: "Gravitational Force uses an even better formula.",
            cost: new Decimal(40),
            unlocked() { return hasUpgrade("gr", 21) || hasUpgrade("gr", 22) },
        },
    },
})

// ------------------------------------------------------------
//  ROW 2: STARS (Time)
// ------------------------------------------------------------
addLayer("st", {
    name: "stars",
    symbol: "St",
    position: 0,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        starlight: new Decimal(0),
    }},
    color: "#ffb347",
    requires: new Decimal(1e30),
    resource: "stars",
    baseResource: "energy",
    baseAmount() { return player.points },
    type: "static",
    base: 1e4,
    exponent: 1.4,
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("ga", 23)) mult = mult.div(upgradeEffect("ga", 23))
        return mult
    },
    gainExp() { return new Decimal(1) },
    canBuyMax() { return hasMilestone("st", 4) },
    row: 2,
    branches: ["at"],
    hotkeys: [
        {key: "s", description: "S: Reset for stars", onPress() { if (canReset(this.layer)) doReset(this.layer) }},
    ],
    layerShown() { return player.at.unlocked },
    autoPrestige() { return hasRow3Milestone(2) },
    resetsNothing() { return hasRow3Milestone(2) },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        let keep = []
        if (hasRow3Milestone(0)) keep.push("milestones")
        if (hasRow3Milestone(1)) keep.push("upgrades")
        layerDataReset(this.layer, keep)
    },
    starlightGain() {
        let gain = player.st.points.pow(2)
        if (hasUpgrade("st", 11)) gain = gain.times(upgradeEffect("st", 11))
        if (hasUpgrade("at", 22)) gain = gain.times(upgradeEffect("at", 22))
        if (hasUpgrade("gr", 22)) gain = gain.times(upgradeEffect("gr", 22))
        if (player.pl.unlocked) gain = gain.times(buyableEffect("pl", 13))
        if (hasUpgrade("ga", 11)) gain = gain.times(upgradeEffect("ga", 11))
        if (player.hz.unlocked) gain = gain.times(tmp.hz.effect)
        if (hasUpgrade("bh", 23)) gain = gain.times(upgradeEffect("bh", 23))
        if (hasUpgrade("de", 22)) gain = gain.times(upgradeEffect("de", 22))
        if (hasUpgrade("st", 24)) gain = gain.times(2)
        return gain
    },
    starlightEffect() {
        let exp = hasUpgrade("st", 12) ? 0.4 : 0.3
        if (hasUpgrade("pl", 21)) exp += player.pl.points.toNumber() * 0.01
        if (hasChallenge("hz", 21)) exp += 0.05
        if (hasUpgrade("hz", 13)) exp += 0.03
        if (inChallenge("hz", 21)) return new Decimal(1)
        return player.st.starlight.add(1).pow(exp)
    },
    starlightAtomBase() {
        return player.st.starlight.add(1).log10().sqrt().div(3)
    },
    update(diff) {
        if (player.st.unlocked) player.st.starlight = player.st.starlight.add(tmp.st.starlightGain.times(diff))
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return "You have <h2 style='color:#ffb347;text-shadow:0 0 10px #ffb347'>" + format(player.st.starlight) + "</h2> Starlight (+" + format(tmp.st.starlightGain) + "/sec), which multiplies energy gain by " + format(tmp.st.starlightEffect) + " and adds " + format(tmp.st.starlightAtomBase) + " to the Atom base" }],
        "resource-display",
        "blank",
        lore("A hundred million years of darkness end as clouds of hydrogen collapse under their own weight and ignite. The first stars are monsters, hundreds of times heavier than the Sun, and they burn out fast."),
        "blank",
        "milestones",
        "upgrades",
    ],
    milestones: row2Milestones("st", "stars", {
        3: {
            requirementDescription: "5 stars",
            effectDescription: "Automatically gain atoms, and atoms reset nothing.",
            done() { return player.st.best.gte(5) },
        },
        4: {
            requirementDescription: "8 stars",
            effectDescription: "You can buy max stars, and keep Atom upgrades on all resets.",
            done() { return player.st.best.gte(8) },
        },
    }),
    upgrades: {
        14: {
            title: "First Light",
            description: "Starlight boosts particle gain.",
            cost: new Decimal(100),
            currencyDisplayName: "starlight",
            currencyInternalName: "starlight",
            currencyLayer: "st",
            unlocked() { return true },
            effect() {
                return player.st.starlight.add(1).log10().add(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        24: {
            title: "Population III",
            description: "The very first stars, made of pure hydrogen and helium. Double Starlight gain.",
            cost: new Decimal(250),
            currencyDisplayName: "starlight",
            currencyInternalName: "starlight",
            currencyLayer: "st",
            unlocked() { return hasUpgrade("st", 14) },
        },
        34: {
            title: "Population II",
            description: "Old stars with a dusting of metals. Add 0.1 to the Atom base.",
            cost: new Decimal(2e6),
            currencyDisplayName: "starlight",
            currencyInternalName: "starlight",
            currencyLayer: "st",
            unlocked() { return hasUpgrade("st", 24) },
        },
        44: {
            title: "Population I",
            description: "Young, metal-rich stars like the Sun. Fusion gain is multiplied by 1.5.",
            cost: new Decimal(1e10),
            currencyDisplayName: "starlight",
            currencyInternalName: "starlight",
            currencyLayer: "st",
            unlocked() { return hasUpgrade("st", 34) },
        },
        15: {
            title: "Blue Supergiant",
            description: "Gravitational Force production is multiplied by 10.",
            cost: new Decimal(1e13),
            currencyDisplayName: "starlight",
            currencyInternalName: "starlight",
            currencyLayer: "st",
            unlocked() { return hasUpgrade("st", 44) },
        },
        25: {
            title: "Hypergiant",
            description: "Starlight boosts energy gain.",
            cost: new Decimal(1e16),
            currencyDisplayName: "starlight",
            currencyInternalName: "starlight",
            currencyLayer: "st",
            unlocked() { return hasUpgrade("st", 15) },
            effect() {
                return player.st.starlight.add(1).log10().add(1).pow(2)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        22: {
            title: "Neutron Star",
            description: "A city-sized atomic nucleus. Starlight boosts Gravitational Force production.",
            cost: new Decimal(8),
            unlocked() { return hasUpgrade("st", 13) },
            effect() {
                return player.st.starlight.add(1).pow(0.05)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        23: {
            title: "Pulsar",
            description: "Stars add to the gravity well base.",
            cost: new Decimal(10),
            unlocked() { return hasUpgrade("st", 22) },
            effect() {
                return player.st.points.div(25)
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) },
        },
        11: {
            title: "Main Sequence",
            description: "Energy boosts Starlight gain.",
            cost: new Decimal(2),
            effect() {
                return player.points.add(1).log10().add(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        12: {
            title: "Red Giants",
            description: "Starlight's energy effect is stronger.",
            cost: new Decimal(4),
            unlocked() { return hasUpgrade("st", 11) },
        },
        13: {
            title: "Stellar Nurseries",
            description: "Starlight makes Atoms cheaper.",
            cost: new Decimal(6),
            unlocked() { return hasUpgrade("st", 12) },
            effect() {
                return player.st.starlight.add(1).pow(0.5)
            },
            effectDisplay() { return "/" + format(upgradeEffect(this.layer, this.id)) },
        },
        21: {
            title: "Supernova",
            description: "A star dies, and scatters heavy elements across the galaxy. Stars boost Fusion gain.",
            cost: new Decimal(9),
            unlocked() { return hasUpgrade("st", 13) && player.fu.unlocked },
            effect() {
                return player.st.points.add(1).sqrt()
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
    },
})

// ------------------------------------------------------------
//  ROW 2: FUSION (Enhance)
// ------------------------------------------------------------
addLayer("fu", {
    name: "fusion",
    symbol: "F",
    position: 1,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#ff6b6b",
    requires: new Decimal(1e24),
    resource: "fusion power",
    baseResource: "particles",
    baseAmount() { return player.p.points },
    type: "normal",
    exponent: 0.08,
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("at", 23)) mult = mult.times(upgradeEffect("at", 23))
        if (hasUpgrade("st", 21)) mult = mult.times(upgradeEffect("st", 21))
        if (hasUpgrade("fu", 12)) mult = mult.times(upgradeEffect("fu", 12))
        if (hasUpgrade("ga", 12)) mult = mult.times(upgradeEffect("ga", 12))
        if (hasUpgrade("st", 44)) mult = mult.times(1.5)
        if (hasUpgrade("bh", 12)) mult = mult.times(upgradeEffect("bh", 12))
        return mult
    },
    gainExp() { return new Decimal(1) },
    passiveGeneration() { return hasMilestone("fu", 4) ? 0.1 : 0 },
    row: 2,
    branches: ["at", "gr"],
    hotkeys: [
        {key: "f", description: "F: Reset for fusion power", onPress() { if (canReset(this.layer)) doReset(this.layer) }},
    ],
    layerShown() { return player.at.unlocked && player.gr.unlocked },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        let keep = []
        if (hasRow3Milestone(0)) keep.push("milestones")
        if (hasRow3Milestone(1)) keep.push("upgrades")
        layerDataReset(this.layer, keep)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        "blank",
        lore("Inside the stars, hydrogen is crushed into helium, helium into carbon, carbon into oxygen... every element heavier than lithium in your body was cooked in a stellar core."),
        "blank",
        "milestones",
        "buyables",
        "blank",
        "upgrades",
    ],
    milestones: row2Milestones("fu", "fusion power", {
        3: {
            requirementDescription: "10 fusion power",
            effectDescription: "Automatically buy Fusion Reactors.",
            done() { return player.fu.best.gte(10) },
        },
        4: {
            requirementDescription: "100 fusion power",
            effectDescription: "Gain 10% of your Fusion gain every second.",
            done() { return player.fu.best.gte(100) },
        },
    }),
    automate() {
        if (hasMilestone("fu", 3)) buyBuyable("fu", 11)
    },
    buyables: {
        11: {
            title: "Fusion Reactor",
            cost(x) {
                return Decimal.pow(3, x.pow(1.4))
            },
            base() {
                let b = new Decimal(2)
                if (hasUpgrade("fu", 11)) b = b.add(upgradeEffect("fu", 11))
                if (hasUpgrade("fu", 21)) b = b.add(0.25)
                return b
            },
            effect(x) {
                let base = this.base()
                return {
                    particles: Decimal.pow(base, x),
                    energy: x.add(1).pow(hasUpgrade("fu", 13) ? 4 : 2),
                }
            },
            display() {
                let eff = buyableEffect(this.layer, this.id)
                return "Multiply particle gain by " + format(this.base()) + " and boost energy gain.<br><br>" +
                    "Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + "<br>" +
                    "Cost: " + format(this.cost()) + " fusion power<br>" +
                    "Effect: " + format(eff.particles) + "x particles, " + format(eff.energy) + "x energy"
            },
            canAfford() { return player.fu.points.gte(this.cost()) },
            buy() {
                player.fu.points = player.fu.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
    upgrades: {
        21: {
            title: "Carbon Burning",
            description: "Add 0.25 to the Fusion Reactor base.",
            cost: new Decimal(1000),
            unlocked() { return hasUpgrade("fu", 13) },
        },
        22: {
            title: "Neon Burning",
            description: "Fusion power boosts energy gain.",
            cost: new Decimal(1e5),
            unlocked() { return hasUpgrade("fu", 21) },
            effect() {
                return player.fu.points.add(1).pow(0.2)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        23: {
            title: "Silicon Burning",
            description: "The last stage before collapse. Fusion power boosts particle gain.",
            cost: new Decimal(1e7),
            unlocked() { return hasUpgrade("fu", 22) },
            effect() {
                return player.fu.points.add(1).pow(0.1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        11: {
            title: "Proton-Proton Chain",
            description: "Fusion Reactors are more effective based on your energy.",
            cost: new Decimal(25),
            effect() {
                return player.points.add(1).log10().add(1).log10().div(2)
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) },
        },
        12: {
            title: "CNO Cycle",
            description: "Fusion Reactors boost Fusion gain.",
            cost: new Decimal(100),
            unlocked() { return hasUpgrade("fu", 11) },
            effect() {
                return getBuyableAmount("fu", 11).add(1).sqrt()
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        13: {
            title: "Triple-Alpha Process",
            description: "Fusion Reactors' energy effect is squared.",
            cost: new Decimal(1000),
            unlocked() { return hasUpgrade("fu", 12) },
        },
    },
})

// ------------------------------------------------------------
//  ROW 2: PLANETS (Space)
// ------------------------------------------------------------
addLayer("pl", {
    name: "planets",
    symbol: "Pl",
    position: 2,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#3ddc97",
    requires: new Decimal(1e30),
    resource: "planets",
    baseResource: "energy",
    baseAmount() { return player.points },
    type: "static",
    base: 1e4,
    exponent: 1.4,
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("bh", 22)) mult = mult.div(upgradeEffect("bh", 22))
        return mult
    },
    gainExp() { return new Decimal(1) },
    canBuyMax() { return hasMilestone("pl", 4) },
    row: 2,
    branches: ["gr"],
    hotkeys: [
        {key: "l", description: "L: Reset for planets", onPress() { if (canReset(this.layer)) doReset(this.layer) }},
    ],
    layerShown() { return player.gr.unlocked },
    autoPrestige() { return hasRow3Milestone(2) },
    resetsNothing() { return hasRow3Milestone(2) },
    automate() {
        if (hasRow3Milestone(2)) for (let id of [13, 12, 11]) buyBuyable("pl", id)
    },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        let keep = []
        if (hasRow3Milestone(0)) keep.push("milestones")
        if (hasRow3Milestone(1)) keep.push("upgrades")
        layerDataReset(this.layer, keep)
    },
    // "Land" works like Space in the Prestige Tree: every planet gives land, and every feature you build uses some.
    totalLand() {
        let land = player.pl.best.times(2)
        if (hasUpgrade("pl", 11)) land = land.add(player.pl.best)
        if (hasChallenge("hz", 22)) land = land.add(player.pl.best.times(2))
        if (hasUpgrade("pl", 34)) land = land.add(player.pl.best)
        if (hasUpgrade("hz", 14)) land = land.add(player.pl.best)
        return land.floor()
    },
    usedLand() {
        let used = new Decimal(0)
        for (let id of [11, 12, 13]) used = used.add(getBuyableAmount("pl", id))
        return used
    },
    freeLand() {
        return tmp.pl.totalLand.sub(tmp.pl.usedLand)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return "You have <h2 style='color:#3ddc97;text-shadow:0 0 10px #3ddc97'>" + formatWhole(tmp.pl.freeLand) + "</h2> / " + formatWhole(tmp.pl.totalLand) + " Land (based on best planets)" }],
        "resource-display",
        "blank",
        lore("Around the second and third generations of stars, leftover dust and ice clump into rocks, the rocks into boulders, the boulders into worlds."),
        "blank",
        "milestones",
        "buyables",
        "blank",
        "upgrades",
    ],
    milestones: row2Milestones("pl", "planets", {
        3: {
            requirementDescription: "5 planets",
            effectDescription: "Automatically gain gravity wells, and gravity wells reset nothing.",
            done() { return player.pl.best.gte(5) },
        },
        4: {
            requirementDescription: "8 planets",
            effectDescription: "You can buy max planets, and keep Gravity upgrades on all resets.",
            done() { return player.pl.best.gte(8) },
        },
    }),
    buyables: {
        11: {
            title: "Moons",
            cost(x) { return Decimal.pow(1e4, x.pow(1.5)).times(1e40) },
            effect(x) { return Decimal.pow(hasUpgrade("pl", 12) ? 6 : 3, x) },
            display() {
                return "Tidal forces stir the planet. Multiply energy gain.<br><br>" + buildingText(this)
            },
            canAfford() { return tmp.pl.freeLand.gte(1) && player.points.gte(this.cost()) },
            buy() { buyBuilding(this) },
        },
        12: {
            title: "Rings",
            cost(x) { return Decimal.pow(1e5, x.pow(1.5)).times(1e42) },
            effect(x) { return Decimal.pow(hasUpgrade("pl", 14) ? 15 : 10, x) },
            display() {
                return "Debris spirals into a halo. Multiply Gravitational Force production.<br><br>" + buildingText(this)
            },
            canAfford() { return tmp.pl.freeLand.gte(1) && player.points.gte(this.cost()) },
            buy() { buyBuilding(this) },
        },
        13: {
            title: "Atmosphere",
            cost(x) { return Decimal.pow(1e6, x.pow(1.5)).times(1e45) },
            effect(x) { return Decimal.pow(hasUpgrade("pl", 24) ? 5 : 4, x) },
            display() {
                return "A blanket of gas catches the light. Multiply Starlight gain.<br><br>" + buildingText(this)
            },
            canAfford() { return tmp.pl.freeLand.gte(1) && player.points.gte(this.cost()) },
            buy() { buyBuilding(this) },
        },
    },
    upgrades: {
        14: {
            title: "Gas Giants",
            description: "Rings are much stronger.",
            cost: new Decimal(6),
            unlocked() { return hasUpgrade("pl", 13) },
        },
        24: {
            title: "Ice Line",
            description: "Atmospheres are much stronger.",
            cost: new Decimal(8),
            unlocked() { return hasUpgrade("pl", 14) },
        },
        34: {
            title: "Late Heavy Bombardment",
            description: "Comets deliver water and rock. Each of your best planets gives 1 more Land.",
            cost: new Decimal(9),
            unlocked() { return hasUpgrade("pl", 24) },
        },
        11: {
            title: "Plate Tectonics",
            description: "Each of your best planets gives 1 more Land.",
            cost: new Decimal(2),
        },
        12: {
            title: "Tidal Locking",
            description: "Moons are much stronger.",
            cost: new Decimal(4),
            unlocked() { return hasUpgrade("pl", 11) },
        },
        13: {
            title: "Asteroid Belt",
            description: "Planets make gravity wells cheaper.",
            cost: new Decimal(5),
            unlocked() { return hasUpgrade("pl", 12) },
            effect() {
                return Decimal.pow(10, player.pl.points)
            },
            effectDisplay() { return "/" + format(upgradeEffect(this.layer, this.id)) },
        },
        21: {
            title: "Liquid Water",
            description: "Not too hot, not too cold. Each planet makes Starlight's energy effect stronger.",
            cost: new Decimal(8),
            unlocked() { return hasUpgrade("pl", 13) },
        },
        22: {
            title: "Magnetosphere",
            description: "A shield against the solar wind. Planets boost particle gain.",
            cost: new Decimal(9),
            unlocked() { return hasUpgrade("pl", 21) },
            effect() {
                return player.pl.points.add(1).pow(2)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        23: {
            title: "Habitable Zone",
            description: "A world where life might begin. <b>Finish Act 1.</b><br>Requires surviving every Cosmic Hazard and buying every Galaxy, Black Hole, Dark Energy and Cosmic Hazard upgrade.",
            cost: new Decimal(10),
            unlocked() { return hasUpgrade("pl", 22) },
            canAfford() { return ["11", "12", "21", "22"].every(id => hasChallenge("hz", id)) && row3UpgradesDone() },
        },
    },
})

function buildingText(buyable) {
    return "Amount: " + formatWhole(getBuyableAmount(buyable.layer, buyable.id)) + "<br>" +
        "Cost: " + format(buyable.cost()) + " energy, 1 Land<br>" +
        "Effect: " + format(buyableEffect(buyable.layer, buyable.id)) + "x"
}

function buyBuilding(buyable) {
    player.points = player.points.sub(buyable.cost())
    setBuyableAmount(buyable.layer, buyable.id, getBuyableAmount(buyable.layer, buyable.id).add(1))
}
