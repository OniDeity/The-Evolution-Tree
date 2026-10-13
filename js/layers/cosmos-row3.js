// ============================================================
//  ACT 1: THE COSMOS, ROW 3
//
//  Super-Boosters   -> Galaxies       (ga)
//  Super-Generators -> Black Holes    (bh)
//  Quirks           -> Dark Energy    (de)
//  Hindrances       -> Cosmic Hazards (hz)
// ============================================================

function hasRow3Milestone(id) {
    return hasMilestone("ga", id) || hasMilestone("bh", id) || hasMilestone("de", id) || hasMilestone("hz", id)
}

function row3UpgradesDone() {
    return ["ga", "bh", "de", "hz"].every(l => Object.keys(layers[l].upgrades).filter(id => !isNaN(id)).every(id => hasUpgrade(l, id)))
}

function row3Milestones(resource, extra) {
    let shared = [
        [1, "Keep Row 2 milestones on all resets."],
        [2, "Keep Row 2 upgrades on all resets."],
        [3, "Automatically gain stars and planets, and they reset nothing. Stars go supernova on their own when that would at least double your Heavy Elements."],
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

// ------------------------------------------------------------
//  GALAXIES (Super-Boosters)
// ------------------------------------------------------------
addLayer("ga", {
    name: "galaxies",
    symbol: "Ga",
    position: 0,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#d48cff",
    requires: new Decimal(58),
    resource: "galaxies",
    baseResource: "atoms",
    baseAmount() { return player.at.points },
    type: "static",
    base: 1.04,
    exponent: 1.2,
    gainMult() { return new Decimal(1) },
    gainExp() { return new Decimal(1) },
    canBuyMax() { return hasMilestone("ga", 3) },
    row: 3,
    branches: ["at", "st"],
    hotkeys: [
        {key: "x", description: "X: Reset for galaxies", onPress() { if (canReset(this.layer)) doReset(this.layer) }},
    ],
    layerShown() { return player.st.unlocked },
    effect() {
        return player.ga.points.times(hasUpgrade("ga", 22) ? 0.25 : 0.2).add(1)
    },
    effectDescription() {
        return "which multiply the Atom base by " + format(tmp.ga.effect)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        "blank",
        lore("Stars gather into vast spinning islands, each one a hundred billion suns, and the islands gather into clusters. The universe takes on a shape: a web of light stretched across the dark."),
        "blank",
        "milestones",
        "upgrades",
    ],
    milestones: row3Milestones("galaxies", {
        3: {
            requirementDescription: "5 galaxies",
            effectDescription: "You can buy max galaxies.",
            done() { return player.ga.best.gte(5) },
        },
    }),
    upgrades: {
        21: {
            title: "Andromeda",
            description: "Our nearest neighbor, on a collision course. Galaxies boost particle gain.",
            cost: new Decimal(4),
            unlocked() { return hasUpgrade("ga", 13) },
            effect() {
                return Decimal.pow(2, player.ga.points)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        22: {
            title: "Dwarf Galaxies",
            description: "Galaxies are more effective.",
            cost: new Decimal(5),
            unlocked() { return hasUpgrade("ga", 21) },
        },
        23: {
            title: "Galaxy Cluster",
            description: "Galaxies make stars cheaper.",
            cost: new Decimal(6),
            unlocked() { return hasUpgrade("ga", 22) },
            effect() {
                return Decimal.pow(10, player.ga.points)
            },
            effectDisplay() { return "/" + format(upgradeEffect(this.layer, this.id)) },
        },
        11: {
            title: "Spiral Arms",
            description: "Galaxies boost Starlight gain.",
            cost: new Decimal(2),
            effect() {
                return player.ga.points.add(1).pow(5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        12: {
            title: "Galactic Core",
            description: "Galaxies boost Fusion gain.",
            cost: new Decimal(3),
            unlocked() { return hasUpgrade("ga", 11) },
            effect() {
                return player.ga.points.add(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        13: {
            title: "Local Group",
            description: "Galaxies boost Dark Energy gain.",
            cost: new Decimal(5),
            unlocked() { return hasUpgrade("ga", 12) },
            effect() {
                return player.ga.points.add(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
    },
})

// ------------------------------------------------------------
//  BLACK HOLES (Super-Generators)
// ------------------------------------------------------------
addLayer("bh", {
    name: "black holes",
    symbol: "BH",
    position: 3,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        radiation: new Decimal(0),
    }},
    color: "#5b5b8f",
    requires: new Decimal(58),
    resource: "black holes",
    baseResource: "gravity wells",
    baseAmount() { return player.gr.points },
    type: "static",
    base: 1.04,
    exponent: 1.2,
    gainMult() { return new Decimal(1) },
    gainExp() { return new Decimal(1) },
    canBuyMax() { return hasMilestone("bh", 3) },
    row: 3,
    branches: ["gr", "pl"],
    hotkeys: [
        {key: "b", description: "B: Reset for black holes", onPress() { if (canReset(this.layer)) doReset(this.layer) }},
    ],
    layerShown() { return player.pl.unlocked },
    effect() {
        return Decimal.pow(3, player.bh.points).sub(1)
    },
    effectDescription() {
        return "which are emitting " + format(tmp.bh.effect) + " Hawking Radiation/sec"
    },
    radiationEffect() {
        return player.bh.radiation.add(1).pow(hasUpgrade("bh", 21) ? 1.75 : 1.5)
    },
    update(diff) {
        if (player.bh.unlocked) player.bh.radiation = player.bh.radiation.add(tmp.bh.effect.times(diff))
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return "You have <h2 style='color:#9b9bdf;text-shadow:0 0 10px #9b9bdf'>" + format(player.bh.radiation) + "</h2> Hawking Radiation, which multiplies Gravitational Force production by " + format(tmp.bh.radiationEffect) }],
        "resource-display",
        "blank",
        lore("The heaviest stars don't explode. They fall inward forever, tearing a hole in spacetime that not even light can climb out of. Yet even black holes glow, very faintly, as they slowly evaporate."),
        "blank",
        "milestones",
        "upgrades",
    ],
    milestones: row3Milestones("black holes", {
        3: {
            requirementDescription: "5 black holes",
            effectDescription: "You can buy max black holes.",
            done() { return player.bh.best.gte(5) },
        },
    }),
    upgrades: {
        21: {
            title: "Accretion Disk",
            description: "Hawking Radiation's effect is stronger.",
            cost: new Decimal(4),
            unlocked() { return hasUpgrade("bh", 13) },
        },
        22: {
            title: "Kugelblitz",
            description: "A black hole made of pure light. Black holes make planets cheaper.",
            cost: new Decimal(5),
            unlocked() { return hasUpgrade("bh", 21) },
            effect() {
                return Decimal.pow(10, player.bh.points)
            },
            effectDisplay() { return "/" + format(upgradeEffect(this.layer, this.id)) },
        },
        23: {
            title: "Supermassive",
            description: "Hawking Radiation boosts Starlight gain.",
            cost: new Decimal(6),
            unlocked() { return hasUpgrade("bh", 22) },
            effect() {
                return player.bh.radiation.add(1).pow(0.2)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        11: {
            title: "Spaghettification",
            description: "Hawking Radiation boosts particle gain.",
            cost: new Decimal(2),
            effect() {
                return player.bh.radiation.add(1).sqrt()
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        12: {
            title: "Quasar",
            description: "Black holes boost Fusion gain.",
            cost: new Decimal(3),
            unlocked() { return hasUpgrade("bh", 11) },
            effect() {
                return player.bh.points.add(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        13: {
            title: "Information Paradox",
            description: "Hawking Radiation boosts Dark Energy gain.",
            cost: new Decimal(5),
            unlocked() { return hasUpgrade("bh", 12) },
            effect() {
                return player.bh.radiation.add(1).log10().add(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
    },
})

// ------------------------------------------------------------
//  DARK ENERGY (Quirks)
// ------------------------------------------------------------
addLayer("de", {
    name: "dark energy",
    symbol: "DE",
    position: 1,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        expansion: new Decimal(0),
    }},
    color: "#3a6ea5",
    requires: new Decimal(1e100),
    resource: "dark energy",
    baseResource: "energy",
    baseAmount() { return player.points },
    type: "normal",
    exponent: 0.02,
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("ga", 13)) mult = mult.times(upgradeEffect("ga", 13))
        if (hasUpgrade("bh", 13)) mult = mult.times(upgradeEffect("bh", 13))
        if (hasUpgrade("de", 21)) mult = mult.times(upgradeEffect("de", 21))
        return mult
    },
    gainExp() { return new Decimal(1) },
    passiveGeneration() { return hasMilestone("de", 3) ? 0.1 : 0 },
    row: 3,
    branches: ["fu"],
    hotkeys: [
        {key: "d", description: "D: Reset for dark energy", onPress() { if (canReset(this.layer)) doReset(this.layer) }},
    ],
    layerShown() { return player.fu.unlocked && player.st.unlocked && player.pl.unlocked },
    expansionGain() {
        return Decimal.pow(2, getBuyableAmount("de", 11)).sub(1)
    },
    expansionEffect() {
        let exp = hasUpgrade("de", 12) ? 0.7 : 0.5
        return player.de.expansion.add(1).pow(exp)
    },
    update(diff) {
        if (player.de.unlocked) player.de.expansion = player.de.expansion.add(tmp.de.expansionGain.times(diff))
    },
    automate() {
        if (hasMilestone("de", 4)) buyBuyable("de", 11)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return "You have <h2 style='color:#6fa8e8;text-shadow:0 0 10px #6fa8e8'>" + format(player.de.expansion) + "</h2> Expansion (+" + format(tmp.de.expansionGain) + "/sec), which multiplies energy gain by " + format(tmp.de.expansionEffect) }],
        "resource-display",
        "blank",
        lore("Gravity should be slowing the universe down. It isn't. Something invisible fills empty space and pushes everything apart, faster and faster. Nobody knows what it is. It makes up most of everything."),
        "blank",
        "milestones",
        "buyables",
        "blank",
        "upgrades",
    ],
    milestones: row3Milestones("dark energy", {
        3: {
            requirementDescription: "25 dark energy",
            effectDescription: "Gain 10% of your Dark Energy gain every second.",
            done() { return player.de.best.gte(25) },
        },
        4: {
            requirementDescription: "100 dark energy",
            effectDescription: "Automatically buy Expansion Layers.",
            done() { return player.de.best.gte(100) },
        },
    }),
    buyables: {
        11: {
            title: "Expansion Layer",
            cost(x) {
                let c = Decimal.pow(2, x.pow(1.5))
                if (hasUpgrade("de", 13)) c = c.div(upgradeEffect("de", 13))
                return c.floor()
            },
            display() {
                return "Each layer doubles Expansion production.<br><br>" +
                    "Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + "<br>" +
                    "Cost: " + format(this.cost()) + " dark energy"
            },
            canAfford() { return player.de.points.gte(this.cost()) },
            buy() {
                player.de.points = player.de.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
    upgrades: {
        21: {
            title: "Phantom Energy",
            description: "Expansion boosts Dark Energy gain.",
            cost: new Decimal(30),
            unlocked() { return hasUpgrade("de", 13) },
            effect() {
                return player.de.expansion.add(1).log10().add(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        22: {
            title: "Quintessence",
            description: "Expansion boosts Starlight gain.",
            cost: new Decimal(80),
            unlocked() { return hasUpgrade("de", 21) },
            effect() {
                return player.de.expansion.add(1).pow(0.2)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        23: {
            title: "Big Rip",
            description: "Expansion also boosts particle gain.",
            cost: new Decimal(200),
            unlocked() { return hasUpgrade("de", 22) },
        },
        11: {
            title: "Eternal Inflation",
            description: "<b>Inflation</b>'s softcap starts much later.",
            cost: new Decimal(3),
        },
        12: {
            title: "Accelerating Universe",
            description: "Expansion's effect is stronger.",
            cost: new Decimal(6),
            unlocked() { return hasUpgrade("de", 11) },
        },
        13: {
            title: "Dark Flow",
            description: "Expansion makes Expansion Layers cheaper.",
            cost: new Decimal(15),
            unlocked() { return hasUpgrade("de", 12) },
            effect() {
                return player.de.expansion.add(1).log10().add(1)
            },
            effectDisplay() { return "/" + format(upgradeEffect(this.layer, this.id)) },
        },
    },
})

// ------------------------------------------------------------
//  COSMIC HAZARDS (Hindrances)
// ------------------------------------------------------------
addLayer("hz", {
    name: "cosmic hazards",
    symbol: "Hz",
    position: 2,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#e05d2e",
    requires: new Decimal(1e18),
    resource: "resilience",
    baseResource: "starlight",
    baseAmount() { return player.st.starlight },
    type: "normal",
    exponent: 0.2,
    gainMult() { return new Decimal(1) },
    gainExp() { return new Decimal(1) },
    passiveGeneration() { return hasMilestone("hz", 3) ? 0.1 : 0 },
    row: 3,
    branches: ["pl"],
    hotkeys: [
        {key: "h", description: "H: Reset for resilience", onPress() { if (canReset(this.layer)) doReset(this.layer) }},
    ],
    layerShown() { return player.st.unlocked && player.pl.unlocked },
    effect() {
        return player.hz.points.add(1).pow(2)
    },
    effectDescription() {
        return "which multiplies Starlight gain by " + format(tmp.hz.effect)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        "blank",
        lore("The universe is not a safe place. Gamma-ray bursts sterilize whole galaxies. Somewhere, the vacuum itself might be unstable. A world that hopes to carry life must survive all of it."),
        "blank",
        "milestones",
        "upgrades",
        "challenges",
    ],
    upgrades: {
        11: {
            title: "Shielding",
            description: "Resilience boosts energy gain.",
            cost: new Decimal(1),
            effect() {
                return player.hz.points.add(1).pow(2)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        12: {
            title: "Ozone Layer",
            description: "Add 0.5 to the Atom base.",
            cost: new Decimal(3),
            unlocked() { return hasUpgrade("hz", 11) },
        },
        13: {
            title: "Deep Crust",
            description: "Starlight's energy effect is stronger.",
            cost: new Decimal(6),
            unlocked() { return hasUpgrade("hz", 12) },
        },
        14: {
            title: "Iron Core",
            description: "Rocky worlds in the Inner orbit are stronger.",
            cost: new Decimal(10),
            unlocked() { return hasUpgrade("hz", 13) },
        },
    },
    milestones: row3Milestones("resilience", {
        3: {
            requirementDescription: "10 resilience",
            effectDescription: "Gain 10% of your Resilience gain every second.",
            done() { return player.hz.best.gte(10) },
        },
    }),
    challenges: {
        11: {
            name: "Gamma-Ray Burst",
            challengeDescription: "Atoms do nothing.",
            goalDescription: "1e88 energy",
            canComplete() { return player.points.gte(1e88) },
            rewardDescription: "Add 1 to the Atom base.",
            rewardEffect() { return new Decimal(1) },
            unlocked() { return player.hz.unlocked },
        },
        12: {
            name: "Big Crunch",
            challengeDescription: "Energy gain is square-rooted.",
            goalDescription: "1e55 energy",
            canComplete() { return player.points.gte(1e55) },
            rewardDescription: "Stars boost energy gain.",
            rewardEffect() { return player.st.points.add(1).pow(5) },
            rewardDisplay() { return format(challengeEffect(this.layer, this.id)) + "x" },
            unlocked() { return hasChallenge("hz", 11) },
        },
        21: {
            name: "Heat Death",
            challengeDescription: "Starlight and Gravitational Force do nothing.",
            goalDescription: "1e128 energy",
            canComplete() { return player.points.gte(1e128) },
            rewardDescription: "Starlight's energy effect is stronger.",
            unlocked() { return hasChallenge("hz", 12) },
        },
        22: {
            name: "Vacuum Decay",
            challengeDescription: "Particle gain is square-rooted.",
            goalDescription: "1e210 energy",
            canComplete() { return player.points.gte(1e210) },
            rewardDescription: "Every orbit counts one extra planet.",
            unlocked() { return hasChallenge("hz", 21) },
        },
    },
})
