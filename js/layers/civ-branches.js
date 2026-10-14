// ============================================================
//  ACT 4 BRANCHES
//  Small layers further out on the Extinction tree. Like every branch, they never reset,
//  not even in an extinction.
//
//  Trade    (tr), off the Settlement: prices wander; trade when the deal is good
//  Breeding (br), off the Village:    pick the best of each litter, and a line gets better generation by generation
//  Wonders  (wn), off the Workshop:   build them 1% at a time; they outlast every civilization that builds them
// ============================================================

// ------------------------------------------------------------
//  TRADE. Three caravan routes, each trading one resource for another. The price on each route
//  wanders up and down; a caravan gets whatever the price is when it sets out.
// ------------------------------------------------------------
const TRADE_VALUE = { food: 1, wood: 25, stone: 20, metal: 80, culture: 60 }
const ROUTES = [
    { from: "food", to: "wood", unlock() { return true } },
    { from: "stone", to: "metal", unlock() { return hasTech("metalworking") } },
    { from: "wood", to: "culture", unlock() { return hasTech("writing") } },
]

function tradeRate(n) {
    return Math.exp(player.tr.drift[n])
}

function tradeShare() {
    return hasMilestone("tr", 0) ? 0.25 : 0.1
}

function caravanTime() {
    return hasMilestone("tr", 1) ? 8 : 15
}

function goodwillEffect() {
    return player.tr ? Math.pow(1 + player.tr.goodwill, 0.04) : 1
}

function sendCaravan(n) {
    let r = ROUTES[n]
    let give = civRes(r.from) * tradeShare()
    if (give <= 0 || player.tr.cooldown[n] > 0) return
    let get = give * TRADE_VALUE[r.from] / TRADE_VALUE[r.to] * tradeRate(n)
    player.sm.res[r.from] -= give
    player.sm.res[r.to] = Math.min(civCap(r.to), player.sm.res[r.to] + get)
    player.tr.goodwill += Math.pow(tradeRate(n), 2)
    player.tr.cooldown[n] = caravanTime()
    player.tr.trades++
}

addLayer("tr", {
    name: "trade",
    symbol: "Tr",
    row: 30,
    position: 1,
    color: "#e0b030",
    startData() { return { unlocked: true, points: new Decimal(0), drift: [0, 0, 0], cooldown: [0, 0, 0], goodwill: 0, trades: 0 } },
    type: "none",
    branches: ["sm"],
    layerShown() { return civUnlocked() && (hasTech("currency") || player.tr.trades > 0) },
    tooltip() { return format(player.tr.goodwill) + " Goodwill" },
    update(diff) {
        if (!civUnlocked()) return
        // Each price drifts at random but is always pulled back toward a fair deal
        let steps = Math.min(100, Math.ceil(diff))
        for (let i = 0; i < steps; i++) {
            let d = diff / steps
            for (let n = 0; n < 3; n++) {
                player.tr.drift[n] += -0.08 * player.tr.drift[n] * d + (Math.random() * 2 - 1) * 0.25 * Math.sqrt(d)
                player.tr.drift[n] = Math.max(-0.9, Math.min(0.9, player.tr.drift[n]))
                player.tr.cooldown[n] = Math.max(0, player.tr.cooldown[n] - d)
            }
        }
        if (hasMilestone("tr", 2) && tmp.tr.layerShown) for (let n = 0; n < 3; n++) if (ROUTES[n].unlock() && tradeRate(n) >= 1.5) sendCaravan(n)
    },
    clickables: Object.fromEntries(ROUTES.map((r, n) => [11 + n, {
        title() { return CIV_RES[r.from].name + " → " + CIV_RES[r.to].name },
        display() {
            let rate = tradeRate(n)
            let color = rate >= 1.3 ? "#2e7d32" : rate <= 0.77 ? "#b71c1c" : "inherit"
            return "Price: <b style='color:" + color + "'>x" + format(rate, 2) + "</b><br>" +
                (player.tr.cooldown[n] > 0 ? "Caravan back in " + formatTime(player.tr.cooldown[n]) : "Send " + formatCiv(civRes(r.from) * tradeShare()) + " " + CIV_RES[r.from].name)
        },
        unlocked() { return r.unlock() },
        canClick() { return player.tr.cooldown[n] <= 0 && civRes(r.from) > 0 },
        onClick() { sendCaravan(n) },
        style() { return { width: "170px", height: "110px", "min-height": "110px" } },
    }])),
    milestones: {
        0: { requirementDescription: "25 Goodwill", effectDescription: "Caravans carry 25% of what you have instead of 10%.", done() { return player.tr.goodwill >= 25 } },
        1: { requirementDescription: "100 Goodwill", effectDescription: "Caravans come back in 8 seconds instead of 15.", done() { return player.tr.goodwill >= 100 } },
        2: { requirementDescription: "400 Goodwill", effectDescription: "A caravan sets out on its own whenever a price is x1.5 or better.", done() { return player.tr.goodwill >= 400 } },
    },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#e0b030'>Trade</h2><br>You have <h2 style='color:#e0b030'>" + format(player.tr.goodwill) + "</h2> Goodwill, making everything your civilization makes <b>x" + format(goodwillEffect(), 3) + "</b>."
        }],
        "blank",
        lore("Long before money, there were people who had more salt than they needed, and people who had more fish."),
        "blank",
        ["display-text", "<b>Wandering prices:</b> each caravan trades a share of one resource for another at today's price, which drifts up and down. " +
            "A fair deal is x1. Good deals earn far more Goodwill (the price squared)."],
        "blank",
        "clickables",
        "blank",
        "milestones",
    ],
})

// ------------------------------------------------------------
//  BREEDING. Every few seconds the line you're working on has a litter. Each young one is a little
//  better or a little worse than its parent; keep the one you like, and it becomes the next parent.
// ------------------------------------------------------------
const LINES = {
    wheat: { name: "Wheat", text: "Food", unlock() { return hasTech("agriculture") } },
    dogs: { name: "Dogs", text: "every worker", unlock() { return hasTech("agriculture") } },
    horses: { name: "Horses", text: "Wood and Stone", unlock() { return hasTech("metalworking") } },
    sheep: { name: "Sheep", text: "Culture", unlock() { return hasTech("writing") } },
    bees: { name: "Bees", text: "the biosphere's resilience", unlock() { return hasTech("currency") } },
}
const LINE_KEYS = Object.keys(LINES)

function breedEffect(key) {
    if (!player.br) return 1
    let v = player.br.lines[key]
    // Each step up in quality counts for a little less than the last
    return 1 + 0.1 * Math.pow(v - 1, 0.6)
}

function litterTime() {
    return hasMilestone("br", 0) ? 12 : 20
}

function litterSize() {
    return hasMilestone("br", 1) ? 4 : 3
}

function breedingTotal() {
    return LINE_KEYS.reduce((a, k) => a + player.br.lines[k], 0)
}

function newLitter() {
    let v = player.br.lines[player.br.line]
    let spread = 0.5
    player.br.litter = Array(litterSize()).fill(0).map(() => Math.max(1, v + (Math.random() * 2 - 1) * spread))
    player.br.timer = litterTime()
}

function keepYoung(n) {
    let v = player.br.litter[n]
    if (v === undefined) return
    player.br.lines[player.br.line] = v
    player.br.litter = []
    player.br.kept++
}

addLayer("br", {
    name: "breeding",
    symbol: "Br",
    row: 31,
    position: 0,
    color: "#b5a642",
    startData() { return { unlocked: true, points: new Decimal(0), lines: { wheat: 1, dogs: 1, horses: 1, sheep: 1, bees: 1 }, line: "wheat", litter: [], timer: 20, kept: 0 } },
    type: "none",
    branches: ["vg"],
    layerShown() { return civUnlocked() && hasTech("agriculture") },
    tooltip() { return player.br.litter.length ? "A litter is waiting!" : "Breeding" },
    update(diff) {
        if (!tmp.br.layerShown) return
        player.br.timer -= diff
        if (player.br.timer <= 0) {
            // An unclaimed litter goes to the best of it when Stud Book is reached, otherwise it's gone
            if (player.br.litter.length && hasMilestone("br", 2)) keepYoung(player.br.litter.indexOf(Math.max(...player.br.litter)))
            newLitter()
        }
        if (hasMilestone("br", 2) && player.br.litter.length) {
            let best = Math.max(...player.br.litter)
            if (best > player.br.lines[player.br.line]) keepYoung(player.br.litter.indexOf(best))
        }
    },
    clickables: Object.assign({}, ...LINE_KEYS.map((k, n) => ({
        [11 + n]: {
            title: LINES[k].name,
            display() { return "Quality " + format(player.br.lines[k], 2) + "<br>x" + format(breedEffect(k), 3) + " " + LINES[k].text },
            unlocked() { return LINES[k].unlock() },
            canClick() { return true },
            onClick() { if (player.br.line != k) { player.br.line = k; player.br.litter = [] } },
            style() { return { width: "120px", height: "90px", "min-height": "90px", "background-color": player.br.line == k ? "#b5a642" : "#5a5221" } },
        },
    })), Object.assign({}, ...[0, 1, 2, 3].map(n => ({
        [21 + n]: {
            title() { return "Keep" },
            display() {
                let v = player.br.litter[n], p = player.br.lines[player.br.line]
                return "Quality <b style='color:" + (v > p ? "#2e7d32" : "#b71c1c") + "'>" + format(v, 2) + "</b>"
            },
            unlocked() { return player.br.litter[n] !== undefined },
            canClick() { return true },
            onClick() { keepYoung(n) },
            style() { return { width: "110px", height: "70px", "min-height": "70px" } },
        },
    })))),
    milestones: {
        0: { requirementDescription: "Total quality 20", effectDescription: "A litter every 12 seconds instead of 20.", done() { return breedingTotal() >= 20 } },
        1: { requirementDescription: "Total quality 60", effectDescription: "Litters have 4 young instead of 3.", done() { return breedingTotal() >= 60 } },
        2: { requirementDescription: "Total quality 150", effectDescription: "Stud book: the best of each litter is kept on its own, if it beats its parent.", done() { return breedingTotal() >= 150 } },
    },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#b5a642'>Breeding</h2><br>Working on <b>" + LINES[player.br.line].name + "</b>. " +
                (player.br.litter.length ? "A litter is here! Keep one, or it's gone in " + formatTime(player.br.timer) + "." : "Next litter in " + formatTime(player.br.timer) + ".")
        }],
        "blank",
        lore("Nobody set out to invent the dog. People just kept the friendliest wolves around, and their pups, and their pups' pups."),
        "blank",
        ["display-text", "<b>Selective breeding:</b> each young one is a little better or worse than its parent. The one you keep becomes the next parent. Pick a line to work on:"],
        "blank",
        ["clickables", [1]],
        "blank",
        ["clickables", [2]],
        "blank",
        "milestones",
    ],
})

// ------------------------------------------------------------
//  WONDERS. Built 1% at a time. When one is finished it goes up a level and you can build it again,
//  bigger. They never fall: every civilization after you inherits them.
// ------------------------------------------------------------
const WONDERS = {
    pyramid: { name: "The Great Pyramid", step: { stone: 300, slabs: 5 }, text: "+10% storage and 3% cheaper buildings per level", unlock: "construction" },
    gardens: { name: "The Hanging Gardens", step: { food: 1500, wood: 150 }, text: "+10% Food per level", unlock: "engineering" },
    colossus: { name: "The Colossus", step: { metal: 150, plates: 3 }, text: "+10% crafting per level", unlock: "metallurgy" },
    library: { name: "The Great Library", step: { knowledge: 400, books: 3 }, text: "+15% Knowledge storage and +10% Knowledge per level", unlock: "philosophy" },
}
const WONDER_KEYS = Object.keys(WONDERS)

function wonderLevel(key) {
    return player.wn ? player.wn.levels[key] : 0
}

function wonderEffect(key) {
    let l = wonderLevel(key)
    return {
        storage: 1 + 0.1 * l, cost: 1 + 0.03 * l,
        food: 1 + 0.1 * l,
        craft: 1 + 0.1 * l,
        cap: 1 + 0.15 * l, knowledge: 1 + 0.1 * l,
    }
}

function wonderStepCost(key, steps) {
    let m = Math.pow(2, wonderLevel(key)) * steps * (hasMilestone("wn", 1) ? 0.8 : 1)
    let c = {}
    for (let k in WONDERS[key].step) c[k] = WONDERS[key].step[k] * m
    return c
}

function buildWonder(key, steps) {
    steps = Math.min(steps, 100 - player.wn.progress[key])
    let c = wonderStepCost(key, steps)
    if (!civCanAfford(c)) return false
    civPay(c)
    player.wn.progress[key] += steps
    if (player.wn.progress[key] >= 100) {
        player.wn.progress[key] = 0
        player.wn.levels[key]++
    }
    return true
}

function wonderLevels() {
    return WONDER_KEYS.reduce((a, k) => a + wonderLevel(k), 0)
}

addLayer("wn", {
    name: "wonders",
    symbol: "Wo",
    row: 32,
    position: 0,
    color: "#d4af37",
    startData() { return { unlocked: true, points: new Decimal(0), levels: { pyramid: 0, gardens: 0, colossus: 0, library: 0 }, progress: { pyramid: 0, gardens: 0, colossus: 0, library: 0 } } },
    type: "none",
    branches: ["wk"],
    layerShown() { return civUnlocked() && (hasTech("construction") || wonderLevels() > 0) },
    tooltip() { return wonderLevels() + " wonder levels" },
    automate() {
        if (!tmp.wn.layerShown || !hasMilestone("wn", 2)) return
        // Only spends what's piling up: a step is built when it costs under a tenth of what you have
        for (let k of WONDER_KEYS) {
            if (!hasTech(WONDERS[k].unlock)) continue
            let c = wonderStepCost(k, 1)
            if (Object.keys(c).every(r => c[r] <= civRes(r) * 0.1)) buildWonder(k, 1)
        }
    },
    bars: Object.fromEntries(WONDER_KEYS.map(k => [k, {
        direction: RIGHT,
        width: 300,
        height: 24,
        unlocked() { return hasTech(WONDERS[k].unlock) || wonderLevel(k) > 0 },
        progress() { return player.wn.progress[k] / 100 },
        display() { return WONDERS[k].name + ", level " + wonderLevel(k) + ": " + player.wn.progress[k] + "%" },
        fillStyle: { "background-color": "#d4af37" },
        textStyle: { color: "white", "text-shadow": "0 0 4px black, 0 0 2px black" },
    }])),
    clickables: Object.assign({}, ...WONDER_KEYS.map((k, n) => ({
        [11 + n]: {
            title: "Build 1%",
            display() { return costText(wonderStepCost(k, 1)) },
            unlocked() { return hasTech(WONDERS[k].unlock) },
            canClick() { return civCanAfford(wonderStepCost(k, 1)) },
            onClick() { buildWonder(k, 1) },
            style() { return { width: "130px", height: "80px", "min-height": "80px", "font-size": "10px" } },
        },
        [21 + n]: {
            title: "Build 5%",
            display() { return costText(wonderStepCost(k, Math.min(5, 100 - player.wn.progress[k]))) },
            unlocked() { return hasTech(WONDERS[k].unlock) && hasMilestone("wn", 0) },
            canClick() { return civCanAfford(wonderStepCost(k, Math.min(5, 100 - player.wn.progress[k]))) },
            onClick() { buildWonder(k, 5) },
            style() { return { width: "130px", height: "80px", "min-height": "80px", "font-size": "10px" } },
        },
    }))),
    milestones: {
        0: { requirementDescription: "3 wonder levels", effectDescription: "Build 5% at a time.", done() { return wonderLevels() >= 3 } },
        1: { requirementDescription: "8 wonder levels", effectDescription: "Wonders cost 20% less.", done() { return wonderLevels() >= 8 } },
        2: { requirementDescription: "15 wonder levels", effectDescription: "Wonders are built on their own, 1% at a time, from whatever is piling up.", done() { return wonderLevels() >= 15 } },
    },
    tabFormat: [
        ["display-text", function() { return "<h2 style='color:#d4af37'>Wonders</h2><br>You've built <h2 style='color:#d4af37'>" + wonderLevels() + "</h2> wonder levels." }],
        "blank",
        lore("Long after a civilization is gone, its biggest buildings are still standing in the sand."),
        "blank",
        ["display-text", "<b>They outlast you:</b> wonders are built 1% at a time, and each one finished raises its level. Extinctions never touch them. Each level costs twice as much as the last."],
        "blank",
        ...WONDER_KEYS.map((k, n) => ["column", [
            ["display-text", function() { return hasTech(WONDERS[k].unlock) || wonderLevel(k) > 0 ? "<b>" + WONDERS[k].name + "</b>: " + WONDERS[k].text : "" }],
            ["bar", k],
            ["row", [["clickable", 11 + n], ["clickable", 21 + n]]],
            "blank",
        ]]),
        "milestones",
    ],
})
