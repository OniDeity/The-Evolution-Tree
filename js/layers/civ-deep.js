// ============================================================
//  ACT 6 IN ACT 4: THE MARCH OF PROGRESS (v3.3)
//  Synergism, retold. From Loop 4 on, the civilization's Ingenuity climbs through five Ages, each a
//  prestige layer on top of the one before: Tools, Agriculture, Industry, Information and Space.
//
//  Coins           -> Ingenuity (ig)  made by your people and techs; buys Accelerators and Multipliers
//  Prestige        -> Tools       (ag1)
//  Transcend       -> Agriculture (ag2)
//  Reincarnate     -> Industry    (ag3)
//  Ascend          -> Information (ag4)
//  Singularity     -> Space       (ag5)
//  Each Age resets the Ages below it (their currency, never their upgrades), makes Ingenuity grow faster,
//  and has four upgrades, the last of which takes one more of Act 4's choices off your hands.
//  Everything here survives every Genesis.
// ============================================================

function progressUnlocked() {
    return !!(player.lt && player.lt.genesis >= 4 && civUnlocked())
}

const AGES = [
    { id: "ag1", name: "Tools", currency: "Tools", color: "#c9a26b", from: "ig", fromName: "Ingenuity", req: 1e5,
      lore: "A sharpened stone, a lever, a wheel. Every tool makes the next one easier to imagine.",
      upgrades: [["Better Tools", "Tools x3."], ["Apprentices", "Accelerators are bought on their own."], ["Craftsmanship", "Your civilization gets stronger with Tools."], ["Division of Labour", "Newcomers take up a job on their own, the one with the fewest hands (food first)."]] },
    { id: "ag2", name: "Agriculture", currency: "Harvests", color: "#8fbf5a", from: "ag1", fromName: "Tools", req: 1e3,
      lore: "Seeds saved from one year to the next. A surplus, and with it, time to think.",
      upgrades: [["Crop Rotation", "Harvests x3."], ["Smithies", "Gain 10% of your Tools gain every second."], ["Irrigation", "Your civilization gets stronger with Harvests."], ["Planning", "Buildings are bought on their own."]] },
    { id: "ag3", name: "Industry", currency: "Capital", color: "#a0a0a0", from: "ag2", fromName: "Harvests", req: 1e3,
      lore: "Steam, steel and smoke. The world speeds up, and the bill comes later.",
      upgrades: [["Factories", "Capital x3."], ["Mechanization", "Gain 10% of your Harvest gain every second, and Multipliers are bought on their own."], ["Mass Production", "Your civilization gets stronger with Capital."], ["Planned Obsolescence", "Before Eternity, extinctions happen on their own once research has stalled for 5 minutes."]] },
    { id: "ag4", name: "Information", currency: "Data", color: "#6fa8dc", from: "ag3", fromName: "Capital", req: 1e3,
      lore: "Everything anyone knows, everywhere at once. Ideas start to breed with other ideas.",
      upgrades: [["Compression", "Data x3."], ["Automation", "Gain 10% of your Capital gain every second."], ["The Network", "Your civilization gets stronger with Data."], ["Simulation", "Act 4's Trials are fought on their own, and Eternity is reached on its own once it's ready."]] },
    { id: "ag5", name: "Space", currency: "Launches", color: "#b4a7d6", from: "ag4", fromName: "Data", req: 1e3,
      lore: "The first footprints on another world. The cradle is finally too small.",
      upgrades: [["Reusable Rockets", "Launches x3."], ["Orbital Servers", "Gain 10% of your Data gain every second."], ["Space Elevators", "Act 5 runs faster with your Launches."], ["The Space Age", "Every Age's currency x10. One civilization, five Ages, and the sky."]] },
]
const AGE_IDS = AGES.map(a => a.id)

function ageOf(id) {
    return AGES.find(a => a.id == id)
}

function ageCurrency(id) {
    return id == "ig" ? player.ig.points : player[id].points
}

// Every Age's currency makes Ingenuity grow faster (the square root of what you have)
function ageIngenuityMult() {
    let m = new Decimal(1)
    for (let id of AGE_IDS) m = m.times(player[id].points.add(1).sqrt())
    return m
}

// The civilization gets stronger with the third upgrade of each Age
function ageCivBoost() {
    if (!player.ig || !progressUnlocked()) return 1
    let m = 1
    for (let [n, id] of AGE_IDS.slice(0, 4).entries()) if (hasUpgrade(id, 13)) m *= 1 + Math.log10(player[id].points.toNumber() + 1) / 2
    return m
}

function launchSpeed() {
    if (!player.ag5 || !progressUnlocked() || !hasUpgrade("ag5", 13)) return 1
    return 1 + Math.log10(player.ag5.points.toNumber() + 1)
}

function ingenuityGain() {
    if (!progressUnlocked()) return new Decimal(0)
    let g = new Decimal(player.vg.people / 10).times(techCount() + 1)
    g = g.times(1 + 0.1 * getBuyableAmount("ig", 11).toNumber())
    g = g.times(Decimal.pow(2, getBuyableAmount("ig", 12)))
    g = g.times(ageIngenuityMult())
    if (hasUpgrade("lt", 45)) g = g.times(3)
    return g
}

// An Age resets every Age below it: their currency only, never their upgrades
function ageReset(k) {
    player.ig.points = new Decimal(0)
    for (let i = 0; i < k; i++) {
        let id = AGE_IDS[i]
        if (i < k) resetKeeping(id, ["upgrades", "total", "best"])
    }
}

function ageGainMult(id) {
    let m = new Decimal(1)
    if (hasUpgrade(id, 11)) m = m.times(3)
    if (hasUpgrade("ag5", 14)) m = m.times(10)
    return m
}

for (let [k, a] of AGES.entries()) {
    addLayer(a.id, {
        name: a.name.toLowerCase(),
        symbol: a.name.slice(0, 2),
        row: 60 + k,
        position: 0,
        color: a.color,
        startData() { return { unlocked: false, points: new Decimal(0), total: new Decimal(0), best: new Decimal(0) } },
        type: "normal",
        requires: new Decimal(a.req),
        resource: a.currency,
        baseResource: a.fromName,
        baseAmount() { return ageCurrency(a.from) },
        exponent: 0.5,
        gainMult() { return ageGainMult(a.id) },
        gainExp() { return new Decimal(1) },
        resetsNothing: true,
        onPrestige() { ageReset(k) },
        passiveGeneration() { let next = AGES[k + 1]; return next && hasUpgrade(next.id, 12) ? 0.1 : 0 },
        branches: [a.from == "ig" ? "ig" : a.from],
        layerShown() { return progressUnlocked() && (k == 0 || player[AGE_IDS[k - 1]].unlocked) },
        tooltip() { return format(player[a.id].points) + " " + a.currency },
        tabFormat: [
            "main-display",
            "prestige-button",
            "resource-display",
            "blank",
            lore(a.lore),
            "blank",
            ["display-text", function() { return "The " + a.name + " Age resets " + (k == 0 ? "your Ingenuity" : "Ingenuity and every Age before it") + " (their currency, never their upgrades). Every " + a.currency.replace(/s$/, "") + " makes Ingenuity grow faster: x" + format(player[a.id].points.add(1).sqrt()) + " now." }],
            "blank",
            "upgrades",
        ],
        upgrades: Object.fromEntries(a.upgrades.map((u, n) => [11 + n, {
            title: u[0],
            description: u[1],
            cost: new Decimal(k == 4 ? [1, 3, 10, 25][n] : Math.pow(10, n)),
        }])),
    })
}

addLayer("ig", {
    name: "ingenuity",
    symbol: "Ig",
    row: 59,
    position: 0,
    color: "#e6b85c",
    startData() { return { unlocked: true, points: new Decimal(0), total: new Decimal(0), stall: 0, lastTechs: 0 } },
    type: "none",
    resource: "Ingenuity",
    layerShown() { return progressUnlocked() },
    tooltip() { return format(player.ig.points) + " Ingenuity" },
    update(diff) {
        if (!progressUnlocked()) return
        let g = ingenuityGain().times(diff * actSpeedCache[4])
        player.ig.points = player.ig.points.add(g)
        player.ig.total = player.ig.total.add(g)
        // How long research has stalled (in Act 4 time), for Planned Obsolescence
        if (techCount() != player.ig.lastTechs) { player.ig.lastTechs = techCount(); player.ig.stall = 0 } else player.ig.stall += diff * actSpeedCache[4]
    },
    automate() {
        if (!progressUnlocked()) return
        if (hasUpgrade("ag1", 12)) for (let i = 0; i < 20 && layers.ig.buyables[11].canAfford(); i++) layers.ig.buyables[11].buy()
        if (hasUpgrade("ag3", 12)) for (let i = 0; i < 20 && layers.ig.buyables[12].canAfford(); i++) layers.ig.buyables[12].buy()
        if (hasUpgrade("ag1", 14)) autoAssign()
        if (hasUpgrade("ag2", 14) && civUnlocked()) autoBuild()
        // Planned Obsolescence: extinct once research has stalled for 5 minutes (Act 4 time), until Eternity
        if (hasUpgrade("ag3", 14) && !player.ex.eternity && player.ig.stall > 300 && strataGain().gte(1)) { doExtinction(); player.ig.stall = 0 }
        if (hasUpgrade("ag4", 14)) {
            if (eternityReady() && !player.ex.eternity) player.ex.eternity = true
            let a = player.ex.activeChallenge
            if (a && hasTech("industrialization")) startChallenge("ex", a)
            else if (!a && !player.ex.eternity && player.ex.count >= 1) { let next = Object.keys(TRIALS).find(id => !hasChallenge("ex", id)); if (next && hasTech("industrialization") && player.ig.stall > 60) startChallenge("ex", Number(next)) }
        }
    },
    tabFormat: [
        ["display-text", function() { return "<h2 style='color:#e6b85c'>The March of Progress</h2><br>You have <h2 style='color:#e6b85c'>" + format(player.ig.points) + "</h2> Ingenuity (+" + format(ingenuityGain().times(actSpeedCache[4])) + "/sec)." }],
        "blank",
        lore("Every problem solved leaves a little Ingenuity behind. Saved up, it becomes an Age."),
        "blank",
        ["display-text", function() { return "Ingenuity comes from your people and your techs (" + player.vg.people + " people, " + techCount() + " techs), and every Age's currency multiplies it. Your civilization is <b>x" + format(ageCivBoost(), 2) + "</b> stronger from the Ages." }],
        "blank",
        "buyables",
    ],
    buyables: {
        11: {
            title: "Accelerator",
            cost(x) { return Decimal.pow(1.5, x).times(100) },
            display() { return "Ingenuity +10% (adds up).<br>Level " + formatWhole(getBuyableAmount("ig", 11)) + "<br>Cost: " + format(this.cost()) + " Ingenuity" },
            canAfford() { return player.ig.points.gte(this.cost()) },
            buy() { player.ig.points = player.ig.points.sub(this.cost()); setBuyableAmount("ig", 11, getBuyableAmount("ig", 11).add(1)) },
            style() { return { width: "170px", height: "110px" } },
        },
        12: {
            title: "Multiplier",
            cost(x) { return Decimal.pow(10, x).times(1000) },
            display() { return "Ingenuity x2.<br>Level " + formatWhole(getBuyableAmount("ig", 12)) + "<br>Cost: " + format(this.cost()) + " Ingenuity" },
            canAfford() { return player.ig.points.gte(this.cost()) },
            buy() { player.ig.points = player.ig.points.sub(this.cost()); setBuyableAmount("ig", 12, getBuyableAmount("ig", 12).add(1)) },
            style() { return { width: "170px", height: "110px" } },
        },
    },
})
