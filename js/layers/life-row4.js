// ============================================================
//  ACT 2: LIFE, ROW 4 (the last row of Act 2)
//
//  Super-Boosters   -> Multicellular (mc)  Twist: a body plan, one exclusive choice per tier
//  Super-Generators -> Symbiosis     (sy)  Twist: partners want different gifts, and their Bond fades
//  Quirks           -> Instincts     (in)  Twist: a daily routine of behaviors that cycles
//  Hindrances       -> Predators     (pr)  Twist: an arms race; each win makes the predator stronger
// ============================================================

function lifeRow4Unlocked() {
    return reachedLand()
}

function hasLifeRow4Milestone(id) {
    return hasMilestone("mc", id) || hasMilestone("sy", id) || hasMilestone("in", id) || hasMilestone("pr", id)
}

function lifeRow4Milestones(resource, extra) {
    let shared = [
        [1, "Keep Row 3 milestones, Heritage and its upgrades, adaptations and colonized tiles on all resets."],
        [2, "Automatically gain generations and colonists, and they reset nothing."],
        [3, "Gain 100% of your fitness gain every second."],
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

// All of Row 4's bonuses to the rest of Act 2, by what they boost
function lifeRow4Bonus(kind) {
    let b = new Decimal(1)
    if (!player.mc || !lifeRow4Unlocked()) return b
    b = b.times(bodyPlanBonus(kind))
    b = b.times(symbiontBonus(kind))
    b = b.times(instinctBonus(kind))
    b = b.times(predatorReward(kind))
    return b
}

// ------------------------------------------------------------
//  MULTICELLULAR (Super-Boosters). Each tier of the body plan is an exclusive choice.
// ------------------------------------------------------------
const BODY_PLAN = [
    { tier: "Symmetry", a: { name: "Radial", text: "Like a jellyfish. DNA gain x1e3.", kind: "dna", mult: 1e3 },
                        b: { name: "Bilateral", text: "A front and a back. Cell gain x1e3.", kind: "cells", mult: 1e3 } },
    { tier: "Skeleton", a: { name: "Exoskeleton", text: "Armor on the outside. Carrying capacity x1e4.", kind: "capacity", mult: 1e4 },
                        b: { name: "Endoskeleton", text: "Bones on the inside. Offspring live 100x longer.", kind: "lifespan", mult: 100 } },
    { tier: "Eyes", a: { name: "Compound Eyes", text: "Thousands of tiny lenses. Births x1e3.", kind: "births", mult: 1e3 },
                    b: { name: "Camera Eyes", text: "One lens, sharp focus. Heritage per generation x10.", kind: "heritage", mult: 10 } },
    { tier: "Movement", a: { name: "Fins", text: "Cells divide 3x faster.", kind: "division", mult: 3 },
                        b: { name: "Limbs", text: "Walk on land. Fitness gain x10.", kind: "fitness", mult: 10 } },
    { tier: "Temperature", a: { name: "Cold-Blooded", text: "Cheap to run. DNA gain x1e5.", kind: "dna", mult: 1e5 },
                           b: { name: "Warm-Blooded", text: "Steady inside, whatever the weather. Every adaptation works at full strength.", kind: "warm", mult: 1 } },
    { tier: "Nerves", a: { name: "Nerve Net", text: "Predator rewards are squared.", kind: "nervenet", mult: 1 },
                      b: { name: "Spinal Cord", text: "One more Instinct slot.", kind: "spine", mult: 1 } },
]

function bodyPart(kind) {
    if (!player.mc || !player.mc.plan) return null
    for (let t = 0; t < BODY_PLAN.length; t++) {
        let pick = player.mc.plan[t]
        if (pick && BODY_PLAN[t][pick].kind == kind) return BODY_PLAN[t][pick]
    }
    return null
}

function bodyPlanBonus(kind) {
    let b = new Decimal(1)
    for (let t = 0; t < BODY_PLAN.length; t++) {
        let pick = player.mc.plan[t]
        if (pick && BODY_PLAN[t][pick].kind == kind) b = b.times(BODY_PLAN[t][pick].mult)
    }
    return b
}

function bodyPlanDone() {
    return BODY_PLAN.every((_, t) => player.mc.plan[t])
}

addLayer("mc", {
    name: "multicellular",
    symbol: "Mc",
    position: 0,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        plan: [null, null, null, null, null, null],
    }},
    color: "#ff8a5c",
    requires: new Decimal(40),
    resource: "multicellular forms",
    baseResource: "mutations",
    baseAmount() { return player.mu.points },
    type: "static",
    base: 1.12,
    exponent: 1.3,
    gainMult() { return new Decimal(1) },
    gainExp() { return new Decimal(1) },
    canBuyMax() { return false },
    row: 13,
    branches: ["mu", "ge"],
    hotkeys: [
        {key: "u", description: "U: Reset for multicellular forms", onPress() { if (lifeRow4Unlocked() && canReset(this.layer)) doReset(this.layer) }},
    ],
    layerShown() { return lifeUnlocked() && lifeRow4Unlocked() },
    resetsNothing: true,
    autoPrestige() { return hasMilestone("mc", 3) },
    onPrestige() { if (!hasMilestone("mc", 3)) lifeReset(this.row) },
    effect() { return player.mc.points.times(0.05) },
    effectDescription() { return "which add " + format(tmp.mc.effect) + " to the Mutation base, and let you choose " + formatWhole(player.mc.points) + " tiers of your body plan" },
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        "blank",
        lore("Some cells stop going their own way. They stick together, split up the work, and become something new: a body."),
        "blank",
        ["display-text", function() {
            let chosen = player.mc.plan.filter(x => x).length
            return "<h3>Body Plan</h3><br>Each tier is a choice between two designs, and you can only have one. Each multicellular form unlocks the next tier.<br>" +
                "Tiers chosen: <b>" + chosen + " / " + Math.min(BODY_PLAN.length, player.mc.points.toNumber()) + "</b>"
        }],
        "blank",
        ["clickables", [1, 2, 3, 4, 5, 6]],
        "blank",
        ["clickables", [9]],
        "blank",
        "milestones",
        "upgrades",
    ],
    clickables: Object.assign({}, ...BODY_PLAN.flatMap((tier, t) => ["a", "b"].map((side, s) => ({
        [(t + 1) * 10 + s + 1]: {
            title() { return (s == 0 ? "" : "or ") + tier[side].name },
            display() {
                let pick = player.mc.plan[t]
                return "<i>" + tier.tier + "</i><br>" + tier[side].text + (pick == side ? "<br><b>Chosen</b>" : "")
            },
            unlocked() { return t < player.mc.points.toNumber() || player.mc.plan[t] },
            canClick() { return !player.mc.plan[t] && (t == 0 || player.mc.plan[t - 1]) },
            onClick() { player.mc.plan[t] = side },
            style() {
                let pick = player.mc.plan[t]
                if (pick == side) return { width: "200px", height: "110px", "background-color": "#ff8a5c" }
                if (pick) return { width: "200px", height: "110px", opacity: 0.35 }
                return { width: "200px", height: "110px" }
            },
        },
    }))), {
        91: {
            title: "Rethink the body plan",
            display() { return "Clear every choice. Also does a Multicellular reset." },
            canClick() { return player.mc.plan.some(x => x) },
            onClick() {
                if (!confirm("Clear your body plan? This also does a Multicellular reset.")) return
                player.mc.plan = [null, null, null, null, null, null]
                lifeReset(13)
            },
            style() { return { width: "200px", "min-height": "60px", height: "60px" } },
        },
    }),
    milestones: lifeRow4Milestones("multicellular forms", {
        3: {
            requirementDescription: "6 multicellular forms",
            effectDescription: "Gain multicellular forms on their own, and they reset nothing. (Body plan choices are still yours.)",
            done() { return player.mc.best.gte(6) },
        },
    }),
    upgrades: {
        11: {
            title: "The Tree of Life",
            description: "Every branch of life so far, from one cell to a body that walks on land. <b>Finish Act 2.</b><br>Requires a complete body plan and all 9 Predator wins.",
            cost: new Decimal(0),
            canAfford() { return bodyPlanDone() && predatorWins() >= 9 },
            fullDisplay() {
                return "<h3>The Tree of Life</h3><br>Every branch of life so far, from one cell to a body that walks on land. <b>Finish Act 2.</b><br><br>" +
                    "Body plan: " + player.mc.plan.filter(x => x).length + " / 6 tiers<br>Predator wins: " + predatorWins() + " / 9"
            },
            style() { return { width: "220px", height: "150px" } },
        },
    },
})

// ------------------------------------------------------------
//  SYMBIOSIS (Super-Generators). Each partner wants a different gift, and its Bond fades over time.
// ------------------------------------------------------------
const SYMBIONTS = {
    fungi: { name: "Mycorrhizal Fungi", wants: "cells", kind: "capacity", text: "Carrying capacity",
             get() { return player.c.points }, set(v) { player.c.points = v } },
    gut: { name: "Gut Bacteria", wants: "DNA", kind: "dna", text: "DNA gain",
           get() { return player.dna }, set(v) { player.dna = v } },
    cleaner: { name: "Cleaner Fish", wants: "offspring", kind: "births", text: "Births",
               get() { return player.re.offspring }, set(v) { player.re.offspring = v } },
    pollinator: { name: "Pollinators", wants: "fitness", kind: "fitness", text: "Fitness gain",
                  get() { return player.ad.points }, set(v) { player.ad.points = v } },
}
const SYMBIONT_IDS = Object.keys(SYMBIONTS)
const BOND_FADE = 0.999 // per second, so an untended Bond halves in about 12 minutes

function symbiontUnlocked(id) {
    return SYMBIONT_IDS.indexOf(id) < player.sy.points.toNumber()
}

function symbiontEffect(id) {
    return new Decimal(player.sy.bonds[id] + 1).pow(3)
}

function symbiontBonus(kind) {
    let b = new Decimal(1)
    for (let id of SYMBIONT_IDS) if (SYMBIONTS[id].kind == kind && symbiontUnlocked(id)) b = b.times(symbiontEffect(id))
    return b
}

// A gift is half of what you have of that resource. Bigger gifts strengthen the Bond more,
// but each gift only closes part of the gap, so a Bond levels off instead of running away.
function giftBond(id) {
    let have = SYMBIONTS[id].get()
    return have.div(2).add(1).log10().sqrt().div(5).toNumber()
}

// Auto-gifting (partner milestone) only gives when a gift would raise the Bond by at least 10%,
// so a strong Bond is tended every so often rather than constantly
function autoGiftThreshold(id) {
    return player.sy.bonds[id] * 0.1 + 0.05
}

function giveGift(id) {
    let s = SYMBIONTS[id]
    player.sy.bonds[id] += giftBond(id)
    s.set(s.get().div(2))
    player.fn.gifts++
}

addLayer("sy", {
    name: "symbiosis",
    symbol: "Sy",
    position: 3,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        bonds: { fungi: 0, gut: 0, cleaner: 0, pollinator: 0 },
    }},
    color: "#9ad35a",
    requires: new Decimal(40),
    resource: "partners",
    baseResource: "broods",
    baseAmount() { return player.re.points },
    type: "static",
    base: 1.12,
    exponent: 1.3,
    gainMult() { return new Decimal(1) },
    gainExp() { return new Decimal(1) },
    canBuyMax() { return false },
    row: 13,
    branches: ["re", "hb"],
    hotkeys: [
        {key: "y", description: "Y: Reset for partners", onPress() { if (lifeRow4Unlocked() && canReset(this.layer)) doReset(this.layer) }},
    ],
    layerShown() { return lifeUnlocked() && lifeRow4Unlocked() },
    resetsNothing: true,
    autoPrestige() { return hasMilestone("sy", 4) },
    onPrestige() { if (!hasMilestone("sy", 4)) lifeReset(this.row) },
    update(diff) {
        if (!player.sy.unlocked) return
        let fade = Math.pow(BOND_FADE, diff)
        for (let id of SYMBIONT_IDS) player.sy.bonds[id] *= fade
    },
    automate() {
        // Milestone: partners are tended automatically whenever their Bond would grow by at least 10%
        if (!hasMilestone("sy", 3)) return
        for (let id of SYMBIONT_IDS) if (symbiontUnlocked(id) && giftBond(id) > autoGiftThreshold(id)) giveGift(id)
    },
    effectDescription() { return "who live alongside you" },
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        "blank",
        lore("Living alone is hard. Fungi feed roots, bacteria digest food, small fish pick bigger fish clean. Everyone gets something, as long as everyone keeps giving."),
        "blank",
        ["display-text", "<h3>Partners</h3><br>Each partner wants a different gift: half of what you have of one resource.<br>Their Bond powers a bonus, and slowly fades unless you keep giving."],
        "blank",
        ["clickables", [1]],
        "blank",
        "milestones",
    ],
    clickables: Object.assign({}, ...SYMBIONT_IDS.map((id, n) => ({
        [11 + n]: {
            title() { return SYMBIONTS[id].name },
            display() {
                if (!symbiontUnlocked(id)) return "Get " + (n + 1) + " partners to meet them."
                return "Wants: half your " + SYMBIONTS[id].wants + "<br>Bond: <b>" + format(player.sy.bonds[id]) + "</b> (+" + format(giftBond(id)) + " per gift)<br>" +
                    SYMBIONTS[id].text + " x" + format(symbiontEffect(id)) + "<br><br>" +
                    (hasMilestone("sy", 3) ? "<i>Auto-gifts once a gift would add " + format(autoGiftThreshold(id)) + "</i><br>Click to give one now" : "Click to give a gift")
            },
            canClick() { return symbiontUnlocked(id) && SYMBIONTS[id].get().gt(1) },
            onClick() { giveGift(id) },
            style() { return { width: "160px", height: "190px" } },
        },
    }))),
    milestones: lifeRow4Milestones("partners", {
        3: {
            requirementDescription: "3 partners",
            effectDescription: "Your partners are given gifts automatically.",
            done() { return player.sy.best.gte(3) },
        },
        4: {
            requirementDescription: "7 partners",
            effectDescription: "Gain partners on their own, and they reset nothing.",
            done() { return player.sy.best.gte(7) },
        },
    }),
})

// ------------------------------------------------------------
//  INSTINCTS (Quirks). Arrange behaviors into a routine; it cycles, and only the active one applies.
// ------------------------------------------------------------
const BEHAVIORS = {
    forage: { name: "Forage", text: "DNA gain x100", kind: "dna", mult: 100 },
    hide: { name: "Hide", text: "Carrying capacity x100", kind: "capacity", mult: 100 },
    hunt: { name: "Hunt", text: "Births x100", kind: "births", mult: 100 },
    court: { name: "Court", text: "Fitness gain x10", kind: "fitness", mult: 10 },
    migrate: { name: "Migrate", text: "Heritage per generation x10", kind: "heritage", mult: 10 },
    rest: { name: "Rest", text: "Does nothing itself, but the behavior after it is boosted ^2", kind: "rest", mult: 1 },
}
const BEHAVIOR_IDS = Object.keys(BEHAVIORS)
const BEHAVIOR_TIME = 10
// Behaviors that work well one after the other (the second one gets the boost)
const COMBOS = [["forage", "hunt"], ["hide", "forage"], ["court", "migrate"]]

function behaviorUnlocked(id) {
    return id == "forage" || hasUpgrade("in", 11 + BEHAVIOR_IDS.indexOf(id) - 1)
}

function routineSlots() {
    return 3 + (bodyPart("spine") ? 1 : 0)
}

function routineSteps() {
    return player.in.routine.slice(0, routineSlots()).filter(x => x)
}

function activeBehaviorIndex() {
    let steps = routineSteps()
    if (!steps.length) return -1
    return Math.floor(player.in.clock / BEHAVIOR_TIME) % steps.length
}

function instinctStrength() {
    return player.in.points.add(1).log10().add(1)
}

// The active behavior's bonus. After Rest, it's ^2; after its combo partner, it's ^1.5.
function instinctBonus(kind) {
    let steps = routineSteps(), i = activeBehaviorIndex()
    if (i < 0) return new Decimal(1)
    let now = steps[i], before = steps[(i - 1 + steps.length) % steps.length]
    if (BEHAVIORS[now].kind != kind) return new Decimal(1)
    let power = instinctStrength()
    if (before == "rest" && steps.length > 1) power = power.times(2)
    if (COMBOS.some(([a, b]) => a == before && b == now) && steps.length > 1) power = power.times(1.5)
    return Decimal.pow(BEHAVIORS[now].mult, power.min(5))
}

addLayer("in", {
    name: "instincts",
    symbol: "In",
    position: 1,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        routine: [null, null, null, null],
        clock: 0,
    }},
    color: "#f2c94c",
    requires: new Decimal(1e6),
    resource: "instincts",
    baseResource: "Heritage",
    baseAmount() { return player.ge.heritage },
    type: "normal",
    exponent: 0.3,
    gainMult() { return new Decimal(1) },
    gainExp() { return new Decimal(1) },
    passiveGeneration() { return hasMilestone("in", 3) ? 0.1 : 0 },
    row: 13,
    branches: ["ad"],
    hotkeys: [
        {key: "i", description: "I: Reset for instincts", onPress() { if (lifeRow4Unlocked() && canReset(this.layer)) doReset(this.layer) }},
    ],
    layerShown() { return lifeUnlocked() && lifeRow4Unlocked() },
    resetsNothing: true,
    onPrestige() { lifeReset(this.row) },
    update(diff) { if (player.in.unlocked) player.in.clock += diff },
    effectDescription() { return "which make every behavior ^" + format(instinctStrength()) + " stronger" },
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        "blank",
        lore("Nobody teaches a turtle to head for the sea. Some things are simply known, carved into the brain by every ancestor that got it right."),
        "blank",
        ["display-text", function() {
            let steps = routineSteps(), i = activeBehaviorIndex()
            let line = steps.map((id, n) => n == i ? "<b style='color:#f2c94c'>[" + BEHAVIORS[id].name + "]</b>" : BEHAVIORS[id].name).join(" → ")
            return "<h3>Daily Routine</h3><br>Your routine repeats, " + BEHAVIOR_TIME + " seconds per behavior. Only the active behavior's bonus counts.<br>" +
                "After <b>Rest</b>, a behavior is boosted ^2. Combos are boosted ^1.5: <b>Forage → Hunt</b>, <b>Hide → Forage</b>, <b>Court → Migrate</b>.<br><br>" +
                (steps.length ? line : "Your routine is empty. Click a slot to fill it.")
        }],
        "blank",
        ["clickables", [1]],
        "blank",
        "upgrades",
        "blank",
        "milestones",
    ],
    clickables: Object.assign({}, ...[0, 1, 2, 3].map(n => ({
        [11 + n]: {
            title() { return "Slot " + (n + 1) },
            display() {
                let id = player.in.routine[n]
                return (id ? "<b>" + BEHAVIORS[id].name + "</b><br>" + BEHAVIORS[id].text : "Empty") + "<br><br>Click to change"
            },
            unlocked() { return n < routineSlots() },
            canClick() { return true },
            // Cycle through: empty, then every behavior you've unlocked
            onClick() {
                let options = [null].concat(BEHAVIOR_IDS.filter(behaviorUnlocked))
                let at = options.indexOf(player.in.routine[n])
                player.in.routine[n] = options[(at + 1) % options.length]
            },
            style() {
                let active = routineSteps()[activeBehaviorIndex()] == player.in.routine[n] && player.in.routine[n]
                return { width: "150px", height: "120px", "background-color": active ? "#f2c94c" : "#8a7a3a" }
            },
        },
    }))),
    upgrades: Object.assign({}, ...BEHAVIOR_IDS.slice(1).map((id, n) => ({
        [11 + n]: {
            title: "Learn to " + BEHAVIORS[id].name,
            description: BEHAVIORS[id].text + ".",
            cost: new Decimal([1, 2, 4, 8, 16][n]),
            unlocked() { return n == 0 || hasUpgrade("in", 10 + n) },
        },
    }))),
    milestones: lifeRow4Milestones("instincts", {
        3: {
            requirementDescription: "50 instincts",
            effectDescription: "Gain 10% of your instinct gain every second.",
            done() { return player.in.best.gte(50) },
        },
    }),
})

// ------------------------------------------------------------
//  PREDATORS (Hindrances). Each challenge can be won 3 times; every win makes the predator stronger.
// ------------------------------------------------------------
function predatorWins() {
    let n = 0
    for (let id of [11, 12, 21]) n += player.pr.challenges[id] || 0
    return n
}

function predatorLevel(id) {
    return (player.pr.challenges[id] || 0) + 1
}

function predatorReward(kind) {
    if (!player.pr) return new Decimal(1)
    let b = new Decimal(1)
    let square = bodyPart("nervenet") ? 2 : 1
    if (kind == "cells") b = b.times(Decimal.pow(1e3, (player.pr.challenges[11] || 0) * square))
    if (kind == "dna") b = b.times(Decimal.pow(1e4, (player.pr.challenges[12] || 0) * square))
    if (kind == "capacity") b = b.times(Decimal.pow(1e3, (player.pr.challenges[21] || 0) * square))
    return b
}

function predatorGoal(id) {
    let wins = player.pr.challenges[id] || 0
    return Decimal.pow(10, PREDATOR_GOALS[id][wins] || 1e9)
}

// log10 of the DNA goal for each win (first, second, third)
const PREDATOR_GOALS = { 11: [60, 85, 110], 12: [66, 95, 115], 21: [88, 112, 120] }

addLayer("pr", {
    name: "predators",
    symbol: "Pr",
    position: 2,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        runTime: 0,
    }},
    color: "#c0392b",
    requires: new Decimal(1e30),
    resource: "survival instinct",
    baseResource: "offspring",
    baseAmount() { return player.re.offspring },
    type: "normal",
    exponent: 0.1,
    gainMult() { return new Decimal(1) },
    gainExp() { return new Decimal(1) },
    row: 13,
    branches: ["hb"],
    hotkeys: [
        {key: "k", description: "K: Reset for survival instinct", onPress() { if (lifeRow4Unlocked() && canReset(this.layer)) doReset(this.layer) }},
    ],
    layerShown() { return lifeUnlocked() && lifeRow4Unlocked() },
    resetsNothing: true,
    onPrestige() { lifeReset(this.row) },
    update(diff) { if (player.pr.activeChallenge) player.pr.runTime += diff },
    effectDescription() { return "and have beaten predators " + formatWhole(predatorWins()) + " of 9 times" },
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        "blank",
        lore("Once something figured out how to eat other living things, nothing was ever safe again. Every defense breeds a better attack, and every attack a better defense."),
        "blank",
        ["display-text", "<h3>Arms Race</h3><br>Each predator can be beaten 3 times. Every win makes the predator stronger, the goal higher, and the reward bigger.<br>Starting a challenge does a Row 4 reset."],
        "blank",
        "challenges",
        "blank",
        "milestones",
    ],
    challenges: {
        11: {
            name: "Hunted",
            challengeDescription() { return "Predators eat " + formatWhole(predatorLevel(11) * 5) + "% of your cells every second." },
            goalDescription() { return format(predatorGoal(11)) + " DNA" },
            canComplete() { return player.dna.gte(predatorGoal(11)) },
            rewardDescription: "Cell gain x1000 per win.",
            rewardDisplay() { return format(predatorReward("cells")) + "x" },
            completionLimit: 3,
            onEnter() { player.pr.runTime = 0; lifeReset(13) },
        },
        12: {
            name: "Famine",
            challengeDescription() { return "DNA gain shrinks the longer you survive: divided by (1 + seconds / 30)^" + predatorLevel(12) + "." },
            goalDescription() { return format(predatorGoal(12)) + " DNA" },
            canComplete() { return player.dna.gte(predatorGoal(12)) },
            rewardDescription: "DNA gain x10000 per win.",
            rewardDisplay() { return format(predatorReward("dna")) + "x" },
            completionLimit: 3,
            onEnter() { player.pr.runTime = 0; lifeReset(13) },
        },
        21: {
            name: "Parasites",
            challengeDescription() { return "Births and carrying capacity are divided by " + format(Decimal.pow(100, predatorLevel(21))) + "." },
            goalDescription() { return format(predatorGoal(21)) + " DNA" },
            canComplete() { return player.dna.gte(predatorGoal(21)) },
            rewardDescription: "Carrying capacity x1000 per win.",
            rewardDisplay() { return format(predatorReward("capacity")) + "x" },
            completionLimit: 3,
            onEnter() { player.pr.runTime = 0; lifeReset(13) },
        },
    },
    milestones: lifeRow4Milestones("survival instinct", {}),
})

// The predators' penalties, applied in the layers they hit
function predatorPenalty(kind) {
    if (!player.pr || !player.pr.activeChallenge) return new Decimal(1)
    if (kind == "dna" && inChallenge("pr", 12)) return new Decimal(1 + player.pr.runTime / 30).pow(predatorLevel(12)).recip()
    if ((kind == "births" || kind == "capacity") && inChallenge("pr", 21)) return Decimal.pow(100, predatorLevel(21)).recip()
    return new Decimal(1)
}
