// ============================================================
//  ACT 2 ROW 5 (optional bonus content, unlocked by the Tree of Life)
//  The Prestige Tree's next row again, at biological scale, on land. Like Act 1's Row 4 it uses no
//  resets (these layers aren't in LIFE_LAYERS), and each one sends a small gift to Act 3.
//
//  Hormones    (ho) <- Magic:     Twist: fight or flight; answer each situation with the right hormone
//  Homeostasis (hs) <- Balance:   Twist: plate-spinning; keep three needs in the healthy band at once
//  Territory   (te) <- Subspace:  Twist: border defense; chase rivals off your range before they take it
//  Seasons     (se) <- Solarity:  Twist: storing for winter; only food that lasts the winter becomes Fat
// ============================================================

function row5Unlocked() {
    return hasUpgrade("mc", 11)
}

// How much life has to work with: grows slowly with DNA
function lifeScale() {
    return player.dna.add(10).log10().div(100).max(1)
}

function landGift(kind) {
    let b = new Decimal(1)
    if (!player.ho || !row5Unlocked()) return b
    if (kind == "biomass") b = b.times(player.ho.response.add(1).pow(0.1))
    if (kind == "tiers") b = b.times(player.se.fat.add(1).pow(0.01))
    if (kind == "competition") b = b.times(player.te.range.add(1).pow(0.05))
    return b
}

function homeostasisDemandDivider() {
    return player.hs && row5Unlocked() ? player.hs.stability.add(1).pow(0.02).toNumber() : 1
}

// ------------------------------------------------------------
//  HORMONES. A situation comes up every so often. Answer it with the right hormone before it passes.
//  Right answers build a streak; each answer earns Response equal to your streak.
// ------------------------------------------------------------
const HORMONES = {
    adrenaline: { name: "Adrenaline", text: "Fight or flight" },
    insulin: { name: "Insulin", text: "Store the sugar" },
    melatonin: { name: "Melatonin", text: "Time to sleep" },
    oxytocin: { name: "Oxytocin", text: "Bond and care" },
}
const STIMULI = [
    ["A predator leaps out of the grass!", "adrenaline"],
    ["A rival charges at you!", "adrenaline"],
    ["You've just eaten a huge meal.", "insulin"],
    ["The fruit trees are full this year.", "insulin"],
    ["The sun goes down.", "melatonin"],
    ["The long winter night begins.", "melatonin"],
    ["Your young are hatching.", "oxytocin"],
    ["Your mate comes home.", "oxytocin"],
]

function stimulusWindow() {
    return hasMilestone("ho", 0) ? 9 : 6
}

function nextStimulus() {
    player.ho.stimulus = Math.floor(Math.random() * STIMULI.length)
    player.ho.left = stimulusWindow()
}

function answerStimulus(h) {
    if (player.ho.stimulus < 0) return
    if (STIMULI[player.ho.stimulus][1] == h) {
        player.ho.streak = Math.min(10, player.ho.streak + 1)
        player.ho.response = player.ho.response.add(lifeScale().times(player.ho.streak).times(hasMilestone("ho", 1) ? 2 : 1))
        player.ho.correct++
        player.ho.last = "Right! Streak " + player.ho.streak + "."
    } else {
        player.ho.streak = 0
        player.ho.last = "Wrong hormone. That called for " + HORMONES[STIMULI[player.ho.stimulus][1]].name + "."
    }
    player.ho.stimulus = -1
    player.ho.wait = 3 + Math.random() * 5
}

addLayer("ho", {
    name: "hormones",
    symbol: "Ho",
    row: 14,
    position: 1,
    color: "#ff6f91",
    startData() { return { unlocked: true, points: new Decimal(0), response: new Decimal(0), stimulus: -1, left: 0, wait: 5, streak: 0, correct: 0, last: "" } },
    type: "none",
    branches: ["in"],
    layerShown() { return lifeUnlocked() && row5Unlocked() },
    tooltip() { return player.ho.stimulus >= 0 ? "Something's happening!" : format(player.ho.response) + " Response" },
    nodeStyle() { return player.ho.stimulus >= 0 ? { "box-shadow": "0 0 20px #ff6f91" } : {} },
    update(diff) {
        if (!row5Unlocked()) return
        if (player.ho.stimulus >= 0) {
            if (hasMilestone("ho", 2)) { answerStimulus(STIMULI[player.ho.stimulus][1]); return }
            player.ho.left -= diff
            if (player.ho.left <= 0) { player.ho.stimulus = -1; player.ho.streak = 0; player.ho.last = "Too slow! The moment passed."; player.ho.wait = 3 + Math.random() * 5 }
            return
        }
        player.ho.wait -= diff
        if (player.ho.wait <= 0) nextStimulus()
    },
    bars: {
        window: {
            direction: RIGHT,
            width: 300,
            height: 20,
            progress() { return player.ho.stimulus >= 0 ? player.ho.left / stimulusWindow() : 0 },
            display() { return player.ho.stimulus >= 0 ? formatTime(player.ho.left) + " left" : "" },
            fillStyle: { "background-color": "#ff6f91" },
            textStyle: { color: "white", "text-shadow": "0 0 4px black, 0 0 2px black" },
        },
    },
    clickables: Object.fromEntries(Object.keys(HORMONES).map((h, n) => [11 + 10 * Math.floor(n / 2) + n % 2, {
        title: HORMONES[h].name,
        display() { return HORMONES[h].text },
        canClick() { return player.ho.stimulus >= 0 },
        onClick() { answerStimulus(h) },
        style() { return { width: "140px", "min-height": "70px", height: "70px" } },
    }])),
    milestones: {
        0: { requirementDescription: "25 right answers", effectDescription: "You have 9 seconds to answer instead of 6.", done() { return player.ho.correct >= 25 } },
        1: { requirementDescription: "A streak of 10", effectDescription: "Response gain x2.", done() { return player.ho.streak >= 10 } },
        2: { requirementDescription: "150 right answers", effectDescription: "Your body answers on its own.", done() { return player.ho.correct >= 150 } },
    },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#ff6f91'>Hormones</h2><br>You have <h2 style='color:#ff6f91'>" + format(player.ho.response) + "</h2> Response, multiplying Act 3 Biomass gain by <b>x" + format(landGift("biomass")) + "</b>."
        }],
        "blank",
        lore("Tiny amounts of chemical messengers, sent through the blood, telling the whole body what to do next."),
        "blank",
        ["display-text", "<b>Fight or flight:</b> every so often something happens. Answer it with the right hormone before the moment passes. Right answers build a streak (up to 10), and each one earns Response equal to your streak."],
        "blank",
        ["display-text", function() {
            return player.ho.stimulus >= 0 ? "<h3>" + STIMULI[player.ho.stimulus][0] + "</h3>" : "<i>All quiet for now.</i>" + (player.ho.last ? "<br>" + player.ho.last : "")
        }],
        "blank",
        ["bar", "window"],
        "blank",
        "clickables",
        "blank",
        "milestones",
    ],
})

// ------------------------------------------------------------
//  HOMEOSTASIS. Temperature, Water and Energy all drain, each at its own speed.
//  Topping one up adds 25. Stability builds for every need inside the healthy band (30 to 90).
// ------------------------------------------------------------
const NEEDS = {
    temp: { name: "Temperature", action: "Bask in the sun", drain: 1.5, color: "#ff8c42" },
    water: { name: "Water", action: "Drink", drain: 1, color: "#42a5ff" },
    energy: { name: "Energy", action: "Eat", drain: 0.7, color: "#8bc34a" },
}

function needInBand(k) {
    let v = player.hs.needs[k]
    return v >= 30 && v <= 90
}

function stabilityGain() {
    let n = Object.keys(NEEDS).filter(needInBand).length
    return lifeScale().times(n / 3).times(n == 3 ? 2 : 1).times(hasMilestone("hs", 1) ? 2 : 1)
}

addLayer("hs", {
    name: "homeostasis",
    symbol: "Hs",
    row: 14,
    position: 0,
    color: "#4dd0e1",
    startData() { return { unlocked: true, points: new Decimal(0), needs: { temp: 60, water: 60, energy: 60 }, stability: new Decimal(0) } },
    type: "none",
    branches: ["mc"],
    layerShown() { return lifeUnlocked() && row5Unlocked() },
    tooltip() { return format(player.hs.stability) + " Stability" },
    update(diff) {
        if (!row5Unlocked()) return
        let slow = hasMilestone("hs", 0) ? 0.7 : 1
        for (let k in NEEDS) {
            player.hs.needs[k] = Math.max(0, player.hs.needs[k] - NEEDS[k].drain * slow * diff)
            if (hasMilestone("hs", 2) && player.hs.needs[k] < 35) player.hs.needs[k] += 25
        }
        player.hs.stability = player.hs.stability.add(stabilityGain().times(diff))
    },
    bars: Object.fromEntries(Object.keys(NEEDS).map(k => [k, {
        direction: RIGHT,
        width: 300,
        height: 25,
        progress() { return player.hs.needs[k] / 100 },
        display() { return NEEDS[k].name + ": " + format(player.hs.needs[k], 0) + (needInBand(k) ? "" : player.hs.needs[k] > 90 ? " (too much!)" : " (too low!)") },
        fillStyle() { return { "background-color": needInBand(k) ? NEEDS[k].color : "#e74c3c" } },
        textStyle: { color: "white", "text-shadow": "0 0 4px black, 0 0 2px black" },
    }])),
    clickables: Object.fromEntries(Object.keys(NEEDS).map((k, n) => [11 + n, {
        title: NEEDS[k].action,
        display() { return NEEDS[k].name + " +25" },
        canClick() { return player.hs.needs[k] < 100 },
        onClick() { player.hs.needs[k] = Math.min(100, player.hs.needs[k] + 25) },
        style() { return { width: "110px", "min-height": "70px", height: "70px", "background-color": NEEDS[k].color } },
    }])),
    milestones: {
        0: { requirementDescription: "100 Stability", effectDescription: "Your needs drain 30% slower.", done() { return player.hs.stability.gte(100) } },
        1: { requirementDescription: "1,000 Stability", effectDescription: "Stability gain x2.", done() { return player.hs.stability.gte(1000) } },
        2: { requirementDescription: "5,000 Stability", effectDescription: "Your body tops up any need that drops below 35 on its own.", done() { return player.hs.stability.gte(5000) } },
    },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#4dd0e1'>Homeostasis</h2><br>You have <h2 style='color:#4dd0e1'>" + format(player.hs.stability) + "</h2> Stability (+" + format(stabilityGain()) + "/sec), dividing Act 3 food demand by <b>" + format(homeostasisDemandDivider(), 3) + "</b>."
        }],
        "blank",
        lore("On land, everything swings: hot days, cold nights, no water for weeks. A body has to keep its insides the same whatever happens outside."),
        "blank",
        ["display-text", "<b>Keep everything steady:</b> each need drains at its own speed. Stability builds for every need between 30 and 90, and doubles when all three are. Don't overdo it: above 90 counts as out of balance too."],
        "blank",
        ["bar", "temp"], ["bar", "water"], ["bar", "energy"],
        "blank",
        "clickables",
        "blank",
        "milestones",
    ],
})

// ------------------------------------------------------------
//  TERRITORY. Your range is a 4x4 patch of land. Rivals keep showing up on it; chase each one off
//  before its timer runs out, or you lose that patch until you win it back.
// ------------------------------------------------------------
const TERRITORY_IDS = [11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33, 34, 41, 42, 43, 44]

function tilesHeld() {
    return TERRITORY_IDS.filter(id => player.te.tiles[id] != "lost").length
}

function rangeGain() {
    return lifeScale().times(tilesHeld()).div(16).times(hasMilestone("te", 1) ? 2 : 1)
}

function reclaimCost() {
    return new Decimal(25).times(16 - tilesHeld() + 1)
}

addLayer("te", {
    name: "territory",
    symbol: "Te",
    row: 14,
    position: 2,
    color: "#a1887f",
    startData() { return { unlocked: true, points: new Decimal(0), range: new Decimal(0), tiles: {}, timers: {}, wait: 5, chased: 0 } },
    type: "none",
    branches: ["pr"],
    layerShown() { return lifeUnlocked() && row5Unlocked() },
    tooltip() { return TERRITORY_IDS.some(id => player.te.tiles[id] == "rival") ? "Rivals on your land!" : tilesHeld() + " / 16 held" },
    nodeStyle() { return TERRITORY_IDS.some(id => player.te.tiles[id] == "rival") ? { "box-shadow": "0 0 20px #e74c3c" } : {} },
    update(diff) {
        if (!row5Unlocked()) return
        player.te.range = player.te.range.add(rangeGain().times(diff))
        for (let id of TERRITORY_IDS) {
            let s = player.te.tiles[id]
            if (s != "rival" && s != "lost") continue
            if (isNaN(Number(player.te.timers[id]))) player.te.timers[id] = 5
            player.te.timers[id] -= diff
            if (player.te.timers[id] > 0) continue
            // A rival that isn't chased off takes the patch; after a minute it moves on by itself
            if (s == "rival") { player.te.tiles[id] = "lost"; player.te.timers[id] = 60 }
            else delete player.te.tiles[id]
        }
        player.te.wait -= diff
        if (player.te.wait <= 0) {
            player.te.wait = (hasMilestone("te", 0) ? 6 : 3) + Math.random() * 4
            let open = TERRITORY_IDS.filter(id => !player.te.tiles[id])
            if (open.length) {
                let id = open[Math.floor(Math.random() * open.length)]
                player.te.tiles[id] = "rival"
                player.te.timers[id] = 5
            }
        }
    },
    clickables: Object.fromEntries(TERRITORY_IDS.map(id => [id, {
        title() { let s = player.te.tiles[id]; return s == "rival" ? "!" : s == "lost" ? "Lost" : "" },
        display() { let s = player.te.tiles[id]; return s == "rival" ? formatTime(player.te.timers[id]) : s == "lost" ? "Back in " + formatTime(player.te.timers[id]) + "<br>or " + format(reclaimCost()) + " Range" : "" },
        canClick() { let s = player.te.tiles[id]; return s == "rival" || (s == "lost" && player.te.range.gte(reclaimCost())) },
        onClick() {
            let s = player.te.tiles[id]
            if (s == "rival") { delete player.te.tiles[id]; player.te.chased++; player.te.range = player.te.range.add(lifeScale()) }
            else if (s == "lost") { player.te.range = player.te.range.sub(reclaimCost()); delete player.te.tiles[id] }
        },
        style() {
            let s = player.te.tiles[id]
            return { width: "70px", height: "70px", "min-height": "70px", "border-radius": "6px", "font-size": "9px",
                "background-color": s == "rival" ? "#e74c3c" : s == "lost" ? "#555" : "#6d9f4b" }
        },
    }])),
    milestones: {
        0: { requirementDescription: "Chase off 25 rivals", effectDescription: "Rivals show up half as often.", done() { return player.te.chased >= 25 } },
        1: { requirementDescription: "500 Range", effectDescription: "Range gain x2.", done() { return player.te.range.gte(500) } },
    },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#a1887f'>Territory</h2><br>You have <h2 style='color:#a1887f'>" + format(player.te.range) + "</h2> Range (+" + format(rangeGain()) + "/sec), making Act 3 Competition boosts <b>x" + format(landGift("competition")) + "</b> stronger."
        }],
        "blank",
        lore("Land is worth fighting for: a stream, a hunting ground, a good place to nest. Everyone wants the same patch."),
        "blank",
        ["display-text", function() {
            return "<b>Hold your ground:</b> rivals keep turning up on your range. Tap one to chase it off before its timer runs out, or it takes that patch for a minute (or spend Range to win it back sooner). Each patch you hold gathers Range.<br>Held: <b>" + tilesHeld() + " / 16</b>"
        }],
        "blank",
        ["clickables", [1, 2, 3, 4]],
        "blank",
        "milestones",
    ],
})

// ------------------------------------------------------------
//  SEASONS. A year is 2 minutes: spring, summer, autumn, winter. Forage all year (autumn's harvest
//  gives 3x), and winter eats your food. Whatever is left when spring comes becomes permanent Fat.
// ------------------------------------------------------------
const SEASON_NAMES = ["Spring", "Summer", "Autumn", "Winter"]

function season() {
    return Math.floor(player.se.time / 30)
}

function forageAmount() {
    return lifeScale().times(season() == 2 ? 3 : season() == 3 ? 0.5 : 1).times(hasMilestone("se", 0) ? 2 : 1)
}

function winterDrain() {
    return lifeScale().times(hasMilestone("se", 1) ? 1 : 2)
}

addLayer("se", {
    name: "seasons",
    symbol: "Yr",
    row: 14,
    position: 3,
    color: "#e6a23c",
    startData() { return { unlocked: true, points: new Decimal(0), time: 0, food: new Decimal(0), fat: new Decimal(0), winters: 0, spared: 0, last: "" } },
    type: "none",
    branches: ["sy"],
    layerShown() { return lifeUnlocked() && row5Unlocked() },
    tooltip() { return SEASON_NAMES[season()] + ": " + format(player.se.food) + " food" },
    update(diff) {
        if (!row5Unlocked()) return
        let before = season()
        player.se.time = (player.se.time + diff) % 120
        // Some food turns up on its own
        if (season() != 3) player.se.food = player.se.food.add(lifeScale().times(0.2).times(diff).times(hasMilestone("se", 2) ? 5 : 1))
        else player.se.food = player.se.food.sub(winterDrain().times(diff)).max(0)
        if (before == 3 && season() == 0) {
            player.se.last = player.se.food.gt(0) ? "You made it through the winter with " + format(player.se.food) + " food to spare. It's Fat now." : "A hard winter. Nothing left over."
            if (player.se.food.gt(0)) player.se.spared++
            player.se.fat = player.se.fat.add(player.se.food)
            player.se.food = new Decimal(0)
            player.se.winters++
        }
    },
    bars: {
        year: {
            direction: RIGHT,
            width: 300,
            height: 25,
            progress() { return player.se.time / 120 },
            display() { return SEASON_NAMES[season()] + " (" + formatTime(30 - player.se.time % 30) + " left)" },
            fillStyle() { return { "background-color": ["#8bc34a", "#ffd54f", "#e67e22", "#90caf9"][season()] } },
            textStyle: { color: "white", "text-shadow": "0 0 4px black, 0 0 2px black" },
        },
    },
    clickables: {
        11: {
            title: "Forage",
            display() { return "+" + format(forageAmount()) + " food" + (season() == 2 ? " (the harvest!)" : season() == 3 ? " (slim pickings)" : "") },
            canClick() { return true },
            onClick() { player.se.food = player.se.food.add(forageAmount()) },
            style() { return { width: "200px", "min-height": "90px", height: "90px" } },
        },
    },
    milestones: {
        0: { requirementDescription: "Survive 3 winters with food to spare", effectDescription: "Foraging finds twice as much.", done() { return player.se.spared >= 3 } },
        1: { requirementDescription: "100 Fat", effectDescription: "Winter eats half as much.", done() { return player.se.fat.gte(100) } },
        2: { requirementDescription: "1,000 Fat", effectDescription: "Food turns up 5x faster on its own.", done() { return player.se.fat.gte(1000) } },
    },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#e6a23c'>Seasons</h2><br>You have <h2 style='color:#e6a23c'>" + format(player.se.fat) + "</h2> Fat, making every Act 3 tier <b>x" + format(landGift("tiers"), 3) + "</b> stronger.<br>" +
                "Food in store: <b>" + format(player.se.food) + "</b>"
        }],
        "blank",
        lore("On land the year turns. There's plenty in autumn and nothing in winter, so you eat while you can and carry it with you."),
        "blank",
        ["display-text", function() {
            return "<b>Storing for winter:</b> forage all year; autumn's harvest gives 3x. Winter eats " + format(winterDrain()) + " food a second. Whatever is left when spring comes becomes permanent Fat." + (player.se.last ? "<br><i>" + player.se.last + "</i>" : "")
        }],
        "blank",
        ["bar", "year"],
        "blank",
        "clickables",
        "blank",
        "milestones",
    ],
})
