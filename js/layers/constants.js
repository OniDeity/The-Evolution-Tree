// ============================================================
//  ACT 6 IN ACT 1: CONSTANTS (v3.0)
//  Antimatter Dimensions' Glyphs, retold. From the first Loop on, Act 1 lets you measure the
//  physical constants of the new universe as its energy grows. Equip a few; dissolve the rest
//  into Echoes that make every constant of their kind stronger. Constants survive every Genesis.
// ============================================================

const CONSTANT_TYPES = {
    alpha: { name: "Fine-structure", symbol: "α", color: "#ff9d5c", effects: ["particles", "atoms", "energy"] },
    G: { name: "Gravitational", symbol: "G", color: "#7fb2ff", effects: ["wells", "galaxies", "planets"] },
    c: { name: "Speed of light", symbol: "c", color: "#fff17a", effects: ["stars", "fusion", "tick"] },
    lambda: { name: "Cosmological", symbol: "Λ", color: "#c48bff", effects: ["dark", "resilience", "glow"] },
}
const CONSTANT_KEYS = Object.keys(CONSTANT_TYPES)

// What each effect does with a constant's strength s
const CONSTANT_EFFECTS = {
    particles: { text: "Particle gain", f: s => Math.pow(1 + s, 2) },
    atoms: { text: "Atoms are cheaper", f: s => Math.pow(1 + s, 2) },
    energy: { text: "Energy", f: s => Math.pow(1 + s, 3) },
    wells: { text: "Gravity wells are cheaper", f: s => Math.pow(1 + s, 2) },
    galaxies: { text: "Galaxies and Black Holes are cheaper", f: s => 1 + s / 25 },
    planets: { text: "Planets are cheaper", f: s => Math.pow(1 + s, 2) },
    stars: { text: "Stars are cheaper", f: s => Math.pow(1 + s, 2) },
    fusion: { text: "Fusion power gain", f: s => 1 + s },
    tick: { text: "Act 1 runs faster", f: s => 1 + s / 40 },
    dark: { text: "Dark energy gain", f: s => Math.pow(1 + s, 2) },
    resilience: { text: "Resilience gain", f: s => 1 + s },
    glow: { text: "Light", f: s => 1 + s / 200 },
}

const RARITIES = [[2.2, "Legendary", "#ffb347"], [1.9, "Epic", "#c48bff"], [1.6, "Rare", "#7fb2ff"], [1.3, "Uncommon", "#9be27a"], [0, "Common", "#cccccc"]]

// Measurements come every CONSTANT_TUNE.every orders of magnitude of energy in a Loop; level is digits / levelPer
var CONSTANT_TUNE = { every: 10, levelPer: 10, inventory: 12 }

function constantsUnlocked() {
    return !!(player.lt && player.lt.genesis > 0)
}

function rarityOf(r) {
    return RARITIES.find(x => r >= x[0])
}

function constantSlots() {
    let n = 2
    if (hasUpgrade("mm", 31)) n++
    if (hasUpgrade("lt", 32)) n++
    return n
}

function echoBoost(type) {
    return 1 + Math.sqrt(player.cn.echoes[type] || 0) / 20
}

function constantStrength(k) {
    let s = k.level * k.rarity * echoBoost(k.type)
    if (hasUpgrade("lt", 23)) s *= 1.25
    return s
}

// The combined effect of every equipped constant on one thing
function constantEffect(key) {
    if (!player.cn || !constantsUnlocked()) return 1
    let m = 1
    for (let id of player.cn.equipped) {
        let k = player.cn.list.find(x => x.id == id)
        if (k && k.effects.includes(key)) m *= CONSTANT_EFFECTS[key].f(constantStrength(k))
    }
    return m
}

function measureEvery() {
    return CONSTANT_TUNE.every / (hasMilestone("lt", 0) ? 2 : 1)
}

function nextMeasurement() {
    return Decimal.pow(10, measureEvery() * (player.cn.measured + 1))
}

function canMeasure() {
    return constantsUnlocked() && player.cn.loopBest.gte(nextMeasurement()) && player.cn.list.length < CONSTANT_TUNE.inventory
}

function measureConstant() {
    if (!canMeasure()) return
    player.cn.measured++
    player.cn.total++
    let type = CONSTANT_KEYS[Math.floor(Math.random() * CONSTANT_KEYS.length)]
    let rarity = 1 + 1.5 * Math.pow(Math.random(), 2.5)
    let count = rarity >= 2.1 ? 3 : rarity >= 1.5 ? 2 : 1
    let pool = CONSTANT_TYPES[type].effects.slice()
    let effects = []
    while (effects.length < count) effects.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0])
    let level = Math.max(1, Math.floor(player.cn.loopBest.max(1).log10().toNumber() / CONSTANT_TUNE.levelPer))
    let k = { id: player.cn.nextId++, type: type, level: level, rarity: Math.round(rarity * 1000) / 1000, effects: effects }
    player.cn.list.push(k)
    // Fill an empty slot straight away
    if (player.cn.equipped.length < constantSlots()) player.cn.equipped.push(k.id)
    return k
}

function dissolveConstant(id) {
    let k = player.cn.list.find(x => x.id == id)
    if (!k) return
    player.cn.echoes[k.type] = (player.cn.echoes[k.type] || 0) + k.level * k.rarity
    player.cn.list = player.cn.list.filter(x => x.id != id)
    player.cn.equipped = player.cn.equipped.filter(x => x != id)
}

function toggleEquip(id) {
    if (player.cn.equipped.includes(id)) player.cn.equipped = player.cn.equipped.filter(x => x != id)
    else if (player.cn.equipped.length < constantSlots()) player.cn.equipped.push(id)
}

// How good a constant is, for automatic choices: its strength times how many things it boosts
function constantScore(k) {
    return constantStrength(k) * k.effects.length
}

// Constant Watch: measure on its own; keep the best ones equipped and dissolve the weakest when full
function autoConstants() {
    if (!hasUpgrade("mm", 31) || !player.cn.auto) return
    for (let i = 0; i < 5; i++) {
        if (player.cn.list.length >= CONSTANT_TUNE.inventory) {
            let spare = player.cn.list.filter(k => !player.cn.equipped.includes(k.id))
            if (!spare.length) break
            dissolveConstant(spare.reduce((a, k) => constantScore(k) < constantScore(a) ? k : a, spare[0]).id)
        }
        if (!canMeasure()) break
        measureConstant()
    }
    let best = player.cn.list.slice().sort((a, b) => constantScore(b) - constantScore(a)).slice(0, constantSlots()).map(k => k.id)
    player.cn.equipped = best
}

function constantCard(k) {
    let t = CONSTANT_TYPES[k.type], r = rarityOf(k.rarity)
    let on = player.cn.equipped.includes(k.id)
    let fx = k.effects.map(e => CONSTANT_EFFECTS[e].text + " x" + format(CONSTANT_EFFECTS[e].f(constantStrength(k)), 2)).join("<br>")
    return "<span style='font-size:22px;color:" + t.color + "'>" + t.symbol + "</span><br><b>" + t.name + "</b><br><span style='color:" + r[2] + "'>" + r[1] + " x" + format(k.rarity, 2) + "</span>, level " + k.level +
        "<br><span style='font-size:10px'>" + fx + "</span>" + (on ? "<br><b>Equipped</b>" : "")
}

addLayer("cn", {
    name: "constants",
    symbol: "Cn",
    row: 52,
    position: 0,
    color: "#fff17a",
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        list: [],
        equipped: [],
        echoes: {},
        nextId: 1,
        measured: 0,
        total: 0,
        loopBest: new Decimal(0),
        auto: true,
        selected: null,
    }},
    type: "none",
    layerShown() { return constantsUnlocked() },
    tooltip() { return player.cn.list.length + " Constants" + (canMeasure() ? " (one to measure)" : "") },
    update(diff) {
        if (!constantsUnlocked()) return
        player.cn.loopBest = player.cn.loopBest.max(player.points)
    },
    automate() {
        if (constantsUnlocked()) autoConstants()
    },
    tabFormat: [
        ["display-text", function() { return "<h2 style='color:#fff17a'>Constants</h2><br>" + player.cn.list.length + " of " + CONSTANT_TUNE.inventory + " measured, " + player.cn.equipped.length + " of " + constantSlots() + " slots used." }],
        "blank",
        lore("Every universe is born with its own constants. Measure them, and the new universe bends a little more your way."),
        "blank",
        ["display-text", function() {
            return "Every " + format(measureEvery(), 0) + " orders of magnitude of energy in a Loop, you can measure a new constant (next at " + format(nextMeasurement()) + " energy; best this Loop: " + format(player.cn.loopBest) + "). " +
                "Its level comes from your energy, its rarity is luck, and rarer ones boost more things. Equipped constants work on Act 1. Dissolving one leaves an Echo that makes every constant of its kind stronger."
        }],
        "blank",
        ["clickables", [9]],
        "blank",
        ["display-text", function() { return CONSTANT_KEYS.map(t => CONSTANT_TYPES[t].symbol + " Echo: " + format(player.cn.echoes[t] || 0, 1) + " (x" + format(echoBoost(t), 2) + ")").join(" &nbsp; ") }],
        "blank",
        "grid",
        "blank",
        ["clickables", [1]],
    ],
    grid: {
        rows: 3,
        cols: 4,
        getStartData(id) { return 0 },
        getUnlocked(id) { return true },
        getCanClick(id) { return !!constantAt(id) },
        onClick(data, id) { let k = constantAt(id); if (k) player.cn.selected = player.cn.selected == k.id ? null : k.id },
        getDisplay(data, id) { let k = constantAt(id); return k ? constantCard(k) : "<span style='opacity:0.4'>empty</span>" },
        getStyle(data, id) {
            let k = constantAt(id)
            if (!k) return { width: "150px", height: "150px", "background-color": "#333" }
            let on = player.cn.equipped.includes(k.id), sel = player.cn.selected == k.id
            return { width: "150px", height: "150px", "background-color": on ? "#3d3a1e" : "#222", color: "#eee", "border-color": sel ? "#fff" : rarityOf(k.rarity)[2], "border-width": sel ? "4px" : "2px" }
        },
    },
    clickables: {
        91: {
            title: "Measure",
            display() { return player.cn.list.length >= CONSTANT_TUNE.inventory ? "No room: dissolve one first." : canMeasure() ? "Measure a new constant." : "Reach " + format(nextMeasurement()) + " energy this Loop." },
            canClick() { return canMeasure() },
            onClick() { measureConstant() },
            style() { return { width: "200px", height: "80px", "min-height": "80px" } },
        },
        11: {
            title() { let k = selectedConstant(); return k && player.cn.equipped.includes(k.id) ? "Unequip" : "Equip" },
            display() { return selectedConstant() ? "" : "Select a constant first." },
            canClick() { let k = selectedConstant(); return !!k && (player.cn.equipped.includes(k.id) || player.cn.equipped.length < constantSlots()) },
            onClick() { toggleEquip(selectedConstant().id) },
            style() { return { width: "140px", "min-height": "60px", height: "60px" } },
        },
        12: {
            title: "Dissolve",
            display() { let k = selectedConstant(); return k ? "+" + format(k.level * k.rarity, 1) + " " + CONSTANT_TYPES[k.type].symbol + " Echo" : "Select a constant first." },
            canClick() { return !!selectedConstant() },
            onClick() { dissolveConstant(player.cn.selected); player.cn.selected = null },
            style() { return { width: "140px", "min-height": "60px", height: "60px" } },
        },
        13: {
            title: "Constant Watch",
            display() { return player.cn.auto ? "On: measuring, equipping the best and dissolving the weakest on its own" : "Off" },
            unlocked() { return hasUpgrade("mm", 31) },
            canClick() { return true },
            onClick() { player.cn.auto = !player.cn.auto },
            style() { return { width: "200px", "min-height": "60px", height: "60px" } },
        },
    },
})

// Grid cells are numbered 101-104, 201-204, 301-304; constants fill them in order
function constantAt(id) {
    let n = (Math.floor(id / 100) - 1) * 4 + (id % 100) - 1
    return player.cn.list[n]
}

function selectedConstant() {
    return player.cn.list.find(k => k.id == player.cn.selected)
}
