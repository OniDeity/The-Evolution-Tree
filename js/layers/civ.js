// ============================================================
//  ACT 4: EXTINCTION
//  Kittens Game and Evolve, retold. The sentient apes of Act 3 build a civilization, and the
//  civilization slowly eats the living world that feeds it. Like the other acts it has its own
//  tree and resources, and its layers use rows 30+ so they never reset the earlier acts.
//
//  Bonfire   -> Settlement (sm)  Twist: footprint; every building takes room from the wild, and a
//                                worn-out biosphere grows less food
//  Village   -> Village    (vg)  Twist: the seasons; winter food is scarce, so store up before it comes
//  Science   -> Knowledge  (kn)  Twist: storage; every discovery needs somewhere to keep what you know
//  Workshop  -> Workshop   (wk)  Twist: crafting; raw resources are refined into Beams, Slabs, Plates and Books
//  Reset     -> Extinction (ex)  (in civ-extinction.js)
//
//  Most Act 4 numbers are plain JavaScript numbers: a civilization's stockpiles stay small enough.
// ============================================================

function civUnlocked() {
    return !!(player.ti && player.ti.sentient)
}

const CIV_RES = {
    food: { name: "Food", color: "#9acd32" },
    wood: { name: "Wood", color: "#c08040" },
    stone: { name: "Stone", color: "#a8a8a8" },
    metal: { name: "Metal", color: "#8fb3c9" },
    knowledge: { name: "Knowledge", color: "#6fa8dc" },
    culture: { name: "Culture", color: "#c27ba0" },
    fuel: { name: "Fuel", color: "#b07850" },
    beams: { name: "Beams", color: "#a0522d", crafted: true },
    slabs: { name: "Slabs", color: "#808080", crafted: true },
    plates: { name: "Plates", color: "#6a8fa8", crafted: true },
    books: { name: "Books", color: "#a64d79", crafted: true },
}
const RAW_RES = ["food", "wood", "stone", "metal", "knowledge", "culture", "fuel"]
const CRAFTED_RES = ["beams", "slabs", "plates", "books"]

function civRes(k) {
    return player.sm.res[k]
}

function civPay(costs) {
    for (let k in costs) player.sm.res[k] = Math.max(0, player.sm.res[k] - costs[k])
}

function civCanAfford(costs) {
    for (let k in costs) if (player.sm.res[k] < costs[k] - 1e-9) return false
    return true
}

function costText(costs) {
    return Object.keys(costs).map(k => {
        let ok = player.sm.res[k] >= costs[k]
        return "<span style='color:" + (ok ? "inherit" : "#e06666") + "'>" + formatCiv(costs[k]) + " " + CIV_RES[k].name + "</span>"
    }).join("<br>")
}

function formatCiv(x) {
    if (x < 1000) return format(x, x < 10 ? 2 : 1)
    return format(x)
}

// ------------------------------------------------------------
//  TECHS (Knowledge). Each one unlocks something. Ids follow the order you'll research them.
// ------------------------------------------------------------
const TECHS = [
    { key: "agriculture", name: "Agriculture", cost: { knowledge: 30 }, text: "Farmers, and Granaries to store food." },
    { key: "mining", name: "Mining", cost: { knowledge: 60 }, text: "Miners, Mines and Storehouses. Opens the Workshop." },
    { key: "writing", name: "Writing", cost: { knowledge: 120 }, text: "Storytellers and Amphitheatres make Culture." },
    { key: "metalworking", name: "Metalworking", cost: { knowledge: 250 }, text: "Smelters turn Wood and Stone into Metal." },
    { key: "construction", name: "Construction", cost: { knowledge: 450, culture: 30 }, text: "Log Houses, Lumber Mills and Workshops. Craft Beams and Slabs." },
    { key: "mathematics", name: "Mathematics", cost: { knowledge: 700 }, text: "Academies." },
    { key: "currency", name: "Currency", cost: { knowledge: 1000, culture: 100 }, text: "Markets, and the Trade branch." },
    { key: "philosophy", name: "Philosophy", cost: { knowledge: 1500, culture: 200 }, text: "Temples. Craft Books." },
    { key: "engineering", name: "Engineering", cost: { knowledge: 2200, books: 5 }, text: "Aqueducts and Warehouses." },
    { key: "metallurgy", name: "Metallurgy", cost: { knowledge: 3200, books: 8 }, text: "Craft Plates." },
    { key: "astronomy", name: "Astronomy", cost: { knowledge: 4500, books: 12 }, text: "Observatories." },
    { key: "navigation", name: "Navigation", cost: { knowledge: 6500, books: 18 }, text: "Harbors." },
    { key: "physics", name: "Physics", cost: { knowledge: 9000, books: 25 }, text: "The Steam Engine and the Assembly Line." },
    { key: "industrialization", name: "Industrialization", cost: { knowledge: 13000, books: 35 }, text: "Coal Mines, Factories and Engineers. <b>Extinction becomes possible.</b>" },
    { key: "electricity", name: "Electricity", cost: { knowledge: 20000, books: 50 }, text: "Apartments and Power Plants." },
    { key: "chemistry", name: "Chemistry", cost: { knowledge: 30000, books: 70 }, text: "Fertilizer: Fields make twice as much food, and leave twice the footprint." },
    { key: "medicine", name: "Medicine", cost: { knowledge: 45000, books: 90 }, text: "Hospitals." },
    { key: "electronics", name: "Electronics", cost: { knowledge: 65000, books: 120 }, text: "Universities." },
    { key: "fission", name: "Nuclear Fission", cost: { knowledge: 95000, books: 150 }, text: "Reactors." },
    { key: "ecology", name: "Ecology", cost: { knowledge: 130000, books: 180 }, text: "Nature Reserves. Footprint x0.8." },
    { key: "rocketry", name: "Rocketry", cost: { knowledge: 175000, books: 220 }, text: "See the whole Earth from orbit. Footprint x0.9." },
    { key: "fusion", name: "Fusion", cost: { knowledge: 230000, books: 260 }, text: "Fusion Plants." },
    { key: "rewilding", name: "Rewilding", cost: { knowledge: 300000, books: 300 }, text: "Give land back to the wild. Footprint x0.7." },
]
const TECH_IDS = {}
TECHS.forEach((t, n) => { t.id = 11 + Math.floor(n / 4) * 10 + n % 4; TECH_IDS[t.key] = t.id })

function hasTech(key) {
    return hasUpgrade("kn", TECH_IDS[key])
}

function techCount() {
    return player.kn.upgrades.length
}

// ------------------------------------------------------------
//  BUILDINGS (Settlement)
// ------------------------------------------------------------
const BUILDINGS = [
    { key: "field", name: "Field", cost: { food: 10 }, ratio: 1.12, fp: 0.4, text: "+0.5 Food/sec." },
    { key: "hut", name: "Hut", cost: { wood: 5 }, ratio: 1.5, fp: 0.2, text: "Room for 2 people." },
    { key: "library", name: "Library", cost: { wood: 25 }, ratio: 1.15, fp: 0.1, text: "+250 Knowledge storage, +8% Knowledge. Unlocks Scholars." },
    { key: "granary", name: "Granary", cost: { wood: 50 }, ratio: 1.3, fp: 0.2, unlock: "agriculture", text: "+5,000 Food storage." },
    { key: "storehouse", name: "Storehouse", cost: { wood: 50 }, ratio: 1.4, fp: 0.2, unlock: "mining", text: "+200 Wood, +250 Stone, +50 Metal and +50 Fuel storage." },
    { key: "mine", name: "Mine", cost: { wood: 100 }, ratio: 1.15, fp: 1, unlock: "mining", text: "+20% Stone." },
    { key: "amphitheatre", name: "Amphitheatre", cost: { wood: 200, stone: 120 }, ratio: 1.15, fp: 0.2, unlock: "writing", text: "+0.05 Culture/sec, +100 Culture storage." },
    { key: "smelter", name: "Smelter", cost: { stone: 200 }, ratio: 1.15, fp: 2, unlock: "metalworking", text: "Burns 0.25 Wood and 0.5 Stone a second into 0.1 Metal." },
    { key: "loghouse", name: "Log House", cost: { wood: 200, stone: 250 }, ratio: 1.15, fp: 0.4, unlock: "construction", text: "Room for 1 person." },
    { key: "lumbermill", name: "Lumber Mill", cost: { wood: 100, stone: 250, metal: 50 }, ratio: 1.15, fp: 1.5, unlock: "construction", text: "+10% Wood." },
    { key: "workshop", name: "Workshop", cost: { wood: 100, stone: 400 }, ratio: 1.15, fp: 0.4, unlock: "construction", text: "Crafting makes 6% more." },
    { key: "academy", name: "Academy", cost: { wood: 50, stone: 70, knowledge: 100 }, ratio: 1.15, fp: 0.2, unlock: "mathematics", text: "+500 Knowledge storage, +15% Knowledge." },
    { key: "market", name: "Market", cost: { stone: 500, metal: 100, culture: 50 }, ratio: 1.15, fp: 0.5, unlock: "currency", text: "+3% to everything your civilization makes." },
    { key: "temple", name: "Temple", cost: { slabs: 10, metal: 50, culture: 100 }, ratio: 1.15, fp: 0.2, unlock: "philosophy", text: "+0.15 Culture/sec, +200 Culture storage." },
    { key: "aqueduct", name: "Aqueduct", cost: { slabs: 25 }, ratio: 1.15, fp: 1, unlock: "engineering", text: "+5% Food." },
    { key: "warehouse", name: "Warehouse", cost: { beams: 15, slabs: 15 }, ratio: 1.15, fp: 0.5, unlock: "engineering", text: "+500 Wood, +500 Stone, +200 Metal and +200 Fuel storage." },
    { key: "observatory", name: "Observatory", cost: { slabs: 50, metal: 750, books: 3 }, ratio: 1.15, fp: 0.2, unlock: "astronomy", text: "+1,000 Knowledge storage, +5% Knowledge." },
    { key: "harbor", name: "Harbor", cost: { beams: 50, slabs: 50, plates: 15 }, ratio: 1.15, fp: 1, unlock: "navigation", text: "+5,000 Food, +1,000 Wood, Stone and Metal storage." },
    { key: "coalmine", name: "Coal Mine", cost: { wood: 500, beams: 50, plates: 25 }, ratio: 1.15, fp: 6, unlock: "industrialization", text: "+0.1 Fuel/sec, +100 Fuel storage." },
    { key: "factory", name: "Factory", cost: { slabs: 100, plates: 100 }, ratio: 1.15, fp: 8, unlock: "industrialization", text: "Burns 0.05 Fuel a second for +5% Wood, Stone and Metal and +10% crafting." },
    { key: "apartment", name: "Apartment", cost: { slabs: 100, plates: 50 }, ratio: 1.15, fp: 1, unlock: "electricity", text: "Room for 3 people." },
    { key: "powerplant", name: "Power Plant", cost: { slabs: 200, plates: 150 }, ratio: 1.15, fp: 10, unlock: "electricity", text: "Burns 0.15 Fuel a second. Every worker makes 8% more." },
    { key: "hospital", name: "Hospital", cost: { slabs: 300, plates: 100 }, ratio: 1.15, fp: 1, unlock: "medicine", text: "Room for 1 person, and newcomers arrive 10% faster." },
    { key: "university", name: "University", cost: { slabs: 250, plates: 150, books: 20 }, ratio: 1.15, fp: 0.5, unlock: "electronics", text: "+2,500 Knowledge storage, +10% Knowledge." },
    { key: "reactor", name: "Reactor", cost: { slabs: 800, plates: 800 }, ratio: 1.15, fp: 3, unlock: "fission", text: "+12% to everything your civilization makes." },
    { key: "reserve", name: "Nature Reserve", cost: { food: 5000, culture: 400 }, ratio: 1.12, fp: 0, unlock: "ecology", text: "The biosphere can take 40 more footprint." },
    { key: "fusionplant", name: "Fusion Plant", cost: { slabs: 2000, plates: 2500 }, ratio: 1.15, fp: 0.5, unlock: "fusion", text: "+20% to everything your civilization makes." },
]
const BUILDING_IDS = {}
BUILDINGS.forEach((b, n) => { b.id = 11 + Math.floor(n / 4) * 10 + n % 4; BUILDING_IDS[b.key] = b.id })

function bld(key) {
    return getBuyableAmount("sm", BUILDING_IDS[key]).toNumber()
}

function buildingUnlocked(b) {
    return !b.unlock || hasTech(b.unlock)
}

function buildingCost(b, owned) {
    if (owned === undefined) owned = bld(b.key)
    let m = Math.pow(b.ratio, owned) * buildingCostMult()
    let c = {}
    for (let k in b.cost) c[k] = b.cost[k] * m
    return c
}

function buildingCostMult() {
    let m = 1
    if (hasUpgrade("dt", 23)) m *= 0.85
    m /= wonderEffect("pyramid").cost
    return m
}

function buyBuilding(b) {
    let c = buildingCost(b)
    if (!buildingUnlocked(b) || !civCanAfford(c)) return false
    civPay(c)
    setBuyableAmount("sm", b.id, getBuyableAmount("sm", b.id).add(1))
    return true
}

// ------------------------------------------------------------
//  JOBS (Village)
// ------------------------------------------------------------
const JOBS = [
    { key: "farmer", name: "Farmer", text: "3 Food/sec", unlock() { return hasTech("agriculture") } },
    { key: "woodcutter", name: "Woodcutter", text: "0.5 Wood/sec", unlock() { return true } },
    { key: "miner", name: "Miner", text: "0.4 Stone/sec", unlock() { return hasTech("mining") } },
    { key: "scholar", name: "Scholar", text: "0.3 Knowledge/sec", unlock() { return bld("library") > 0 } },
    { key: "storyteller", name: "Storyteller", text: "0.1 Culture/sec", unlock() { return hasTech("writing") } },
    { key: "engineer", name: "Engineer", text: "Crafts on their own", unlock() { return hasTech("industrialization") } },
]

// Someone new arrives every 10 seconds, faster with Hospitals and with plenty of empty housing to move into
function arrivalTime() {
    return 10 / (1 + 0.1 * bld("hospital")) / (1 + 0.05 * Math.max(0, housing() - player.vg.people))
}

function eatRate() {
    return trialDone("band") ? 1.2 : 1.5
}

function jobCount(key) {
    return player.vg.jobs[key] || 0
}

function workers() {
    return JOBS.reduce((a, j) => a + jobCount(j.key), 0)
}

function idlePeople() {
    return player.vg.people - workers()
}

function housing() {
    let h = 2 * bld("hut") + bld("loghouse") + 3 * bld("apartment") + bld("hospital")
    return inTrial("band") ? Math.min(10, h) : h
}

function assignJob(key, n) {
    let j = JOBS.find(j => j.key == key)
    if (!j.unlock()) return
    n = Math.min(n, idlePeople())
    if (n > 0) player.vg.jobs[key] = jobCount(key) + n
}

function unassignJob(key, n) {
    player.vg.jobs[key] = Math.max(0, jobCount(key) - n)
}

// Division of Labor: a newcomer keeps food in surplus first, then joins whichever job has the fewest hands
function autoAssign() {
    let open = JOBS.filter(j => j.unlock())
    if (!open.length || idlePeople() <= 0) return
    let pick
    if (open.some(j => j.key == "farmer") && civCache.net.food < 1) pick = "farmer"
    else {
        let others = open.filter(j => j.key != "farmer")
        if (!others.length) others = open
        pick = others.reduce((a, j) => jobCount(j.key) < jobCount(a.key) ? j : a, others[0]).key
    }
    assignJob(pick, 1)
}

// ------------------------------------------------------------
//  SEASONS. A year is 4 seasons of 50 seconds. Spring grows 50% more food, winter only a quarter.
// ------------------------------------------------------------
const SEASON_LENGTH = 50
const SEASONS = ["Spring", "Summer", "Autumn", "Winter"]

function seasonIndex() {
    return Math.floor(player.vg.time / SEASON_LENGTH) % 4
}

function seasonFood() {
    let s = seasonIndex()
    if (s == 0) return 1.5
    if (s == 3) return inTrial("winter") ? 0.1 : hasUpgrade("dt", 14) ? 0.5 : 0.25
    return inTrial("winter") ? 0.25 : 1
}

// ------------------------------------------------------------
//  FOOTPRINT AND THE BIOSPHERE
//  Every building and person leaves a footprint. The biosphere can absorb some of it (its resilience,
//  which grows with Act 3's Biomass); the rest wears it down. A worn-down biosphere grows less food.
// ------------------------------------------------------------
function footprintMult() {
    let m = 1
    if (hasTech("ecology")) m *= 0.8
    if (hasTech("rocketry")) m *= 0.9
    if (hasTech("rewilding")) m *= 0.7
    if (hasUpgrade("wk", 52)) m *= 0.85
    if (hasUpgrade("dt", 31)) m *= 0.75
    if (hasUpgrade("dt", 43)) m *= 0.5
    if (inTrial("overshoot")) m *= 2
    return m
}

function footprint() {
    let f = player.vg.people * 0.1
    for (let b of BUILDINGS) {
        let fp = b.fp
        if (b.key == "field" && hasTech("chemistry")) fp *= 2
        f += bld(b.key) * fp
    }
    return f * footprintMult()
}

function resilience() {
    // Act 3's speciations keep resetting Biomass, so this uses the most there's been since the last extinction
    let r = 50 * (1 + Math.min(308, player.ex.peakBiomass.max(player.biomass).add(10).log10().toNumber()) / 308)
    r += 40 * bld("reserve")
    if (hasUpgrade("dt", 34)) r *= 2
    r *= breedEffect("bees")
    if (trialDone("overshoot")) r *= 1.5
    return r
}

// A light footprint barely matters; one bigger than the biosphere's resilience wears it down fast
function biosphereHealth() {
    let r = resilience(), f = footprint()
    return r * r / (r * r + f * f)
}

// ------------------------------------------------------------
//  PRODUCTION
// ------------------------------------------------------------
function civGlobalMult() {
    let m = strataBonus()
    m *= 1 + 0.03 * bld("market")
    m *= 1 + 0.12 * bld("reactor")
    m *= 1 + 0.2 * bld("fusionplant")
    if (hasUpgrade("dt", 41)) m *= 2
    m *= civAchievementBonus()
    m *= goodwillEffect()
    m *= lostSpeciesBonus().civ
    return m
}

function craftBonus() {
    return (1 + 0.06 * bld("workshop") + 0.1 * bld("factory") * civCache.fuelEff) * wonderEffect("colossus").craft
}

function storageMult() {
    let m = 1
    if (hasUpgrade("wk", 22)) m *= 1.3
    if (hasUpgrade("wk", 42)) m *= 1.5
    return m * wonderEffect("pyramid").storage
}

function civCap(k) {
    let s = storageMult()
    switch (k) {
        case "food": return (5000 + 5000 * bld("granary") + 5000 * bld("harbor")) * (hasUpgrade("wk", 12) ? 1.25 : 1) * s
        case "wood": return (200 + 200 * bld("storehouse") + 500 * bld("warehouse") + 1000 * bld("harbor")) * s
        case "stone": return (250 + 250 * bld("storehouse") + 500 * bld("warehouse") + 1000 * bld("harbor")) * s
        case "metal": return (50 + 50 * bld("storehouse") + 200 * bld("warehouse") + 1000 * bld("harbor")) * s
        case "fuel": return (200 + 50 * bld("storehouse") + 200 * bld("warehouse") + 100 * bld("coalmine")) * s
        case "culture": return (100 + 100 * bld("amphitheatre") + 200 * bld("temple")) * s
        case "knowledge": {
            let c = 250 + 250 * bld("library") + 500 * bld("academy") + 1000 * bld("observatory") + 2500 * bld("university")
            if (hasUpgrade("wk", 23)) c *= 1.25
            if (hasUpgrade("wk", 32)) c *= 1.5
            if (hasUpgrade("wk", 51)) c *= 1.5
            if (hasUpgrade("dt", 21)) c *= 1.5
            return c * wonderEffect("library").cap * (inTrial("dark") ? 0.5 : 1)
        }
    }
    return Infinity
}

// Everything the civilization makes and uses this tick. Converters (Smelters, and anything burning Fuel)
// slow down when what they burn runs out, so stockpiles never go below zero.
let civCache = { net: {}, gross: {}, use: {}, fuelEff: 1, smeltEff: 1, health: 1 }

function civRates(dt) {
    let g = civGlobalMult()
    let health = biosphereHealth()
    let gross = {}, use = {}
    for (let k of RAW_RES) { gross[k] = 0; use[k] = 0 }

    // Fuel first: Factories and Power Plants run only as far as the Fuel lasts
    let coal = bld("coalmine") * 0.1 * g
    let burn = bld("factory") * 0.05 + bld("powerplant") * 0.15
    let fuelEff = burn > 0 ? Math.min(1, (civRes("fuel") / Math.max(dt, 1e-3) + coal) / burn) : 1
    gross.fuel = coal
    use.fuel = burn * fuelEff

    let jobBoost = (1 + 0.08 * bld("powerplant") * fuelEff) * breedEffect("dogs")
    let industry = 1 + 0.05 * bld("factory") * fuelEff

    // Food
    let farmer = 3 * (1 + (hasUpgrade("wk", 13) ? 0.3 : 0) + (hasUpgrade("wk", 41) ? 0.75 : 0))
    let field = 0.5 * (1 + (hasUpgrade("wk", 24) ? 0.5 : 0) + (hasUpgrade("wk", 44) ? 1 : 0)) * (hasTech("chemistry") ? 2 : 1)
    let foodMult = (1 + 0.05 * bld("aqueduct")) * (hasUpgrade("dt", 14) ? 1.5 : 1) * breedEffect("wheat") * wonderEffect("gardens").food * (trialDone("winter") ? 1.5 : 1)
    gross.food = (jobCount("farmer") * farmer * jobBoost + bld("field") * field) * seasonFood() * (0.25 + 0.75 * health) * foodMult * g
    use.food = player.vg.people * eatRate()

    // Wood and Stone (Smelters burn some of both)
    let tools = hasUpgrade("wk", 11) ? 0.25 : 0
    gross.wood = jobCount("woodcutter") * 0.5 * (1 + tools + (hasUpgrade("wk", 14) ? 0.5 : 0)) * jobBoost * (1 + 0.1 * bld("lumbermill")) * industry * breedEffect("horses") * g
    gross.stone = jobCount("miner") * 0.4 * (1 + tools + (hasUpgrade("wk", 21) ? 0.5 : 0)) * jobBoost * (1 + 0.2 * bld("mine")) * industry * breedEffect("horses") * g
    let smelters = bld("smelter")
    let smeltEff = 1
    if (smelters > 0) {
        smeltEff = Math.min(1,
            (civRes("wood") / Math.max(dt, 1e-3) + gross.wood) / (smelters * 0.25),
            (civRes("stone") / Math.max(dt, 1e-3) + gross.stone) / (smelters * 0.5))
        use.wood = smelters * 0.25 * smeltEff
        use.stone = smelters * 0.5 * smeltEff
    }
    gross.metal = smelters * 0.1 * smeltEff * (hasUpgrade("wk", 33) ? 2 : 1) * industry * g

    // Knowledge and Culture
    let kMult = 1 + 0.08 * bld("library") + 0.15 * bld("academy") + 0.05 * bld("observatory") + 0.1 * bld("university")
    if (hasUpgrade("wk", 51)) kMult *= 1.5
    if (hasUpgrade("dt", 21)) kMult *= 1.5
    kMult *= wonderEffect("library").knowledge
    if (trialDone("dark")) kMult *= 1.5
    gross.knowledge = jobCount("scholar") * 0.3 * (1 + (hasUpgrade("wk", 31) ? 0.5 : 0) + (hasUpgrade("wk", 43) ? 0.5 : 0)) * jobBoost * kMult * g
    gross.culture = (jobCount("storyteller") * 0.1 * (1 + (hasUpgrade("wk", 31) ? 0.25 : 0) + (hasUpgrade("wk", 43) ? 0.5 : 0)) * jobBoost +
        0.05 * bld("amphitheatre") + 0.15 * bld("temple")) * breedEffect("sheep") * g

    let net = {}
    for (let k of RAW_RES) net[k] = gross[k] - use[k]
    return { net: net, gross: gross, use: use, fuelEff: fuelEff, smeltEff: smeltEff, health: health }
}

// ------------------------------------------------------------
//  CRAFTING (Workshop)
// ------------------------------------------------------------
const RECIPES = {
    beams: { from: { wood: 175 }, unlock() { return hasTech("construction") } },
    slabs: { from: { stone: 250 }, unlock() { return hasTech("construction") } },
    plates: { from: { metal: 125 }, unlock() { return hasTech("metallurgy") } },
    books: { from: { culture: 100 }, unlock() { return hasTech("philosophy") } },
}

function craftCost(key, n) {
    let c = {}
    for (let k in RECIPES[key].from) c[k] = RECIPES[key].from[k] * n
    return c
}

// How many of a thing you could craft right now
function craftable(key) {
    let n = Infinity
    for (let k in RECIPES[key].from) n = Math.min(n, Math.floor(civRes(k) / RECIPES[key].from[k] + 1e-9))
    return Math.max(0, n)
}

function craft(key, n) {
    if (!RECIPES[key].unlock()) return
    n = Math.min(n, RECIPES[key].from ? craftable(key) : 0)
    if (n <= 0) return
    civPay(craftCost(key, n))
    player.sm.res[key] += n * craftBonus()
    player.ch.crafted += n
}

// The Assembly Line: whatever is about to overflow its storage gets crafted instead of wasted
function assemblyLine() {
    for (let key in RECIPES) {
        if (!RECIPES[key].unlock()) continue
        let src = Object.keys(RECIPES[key].from)[0]
        let cap = civCap(src)
        if (civRes(src) >= cap * 0.95) craft(key, Math.floor((civRes(src) - cap * 0.85) / RECIPES[key].from[src]))
    }
}

function hasAssemblyLine() {
    return hasUpgrade("wk", 34) || hasUpgrade("dt", 32)
}

// ------------------------------------------------------------
//  THE TICK
// ------------------------------------------------------------
function civTick(dt) {
    let r = civRates(dt)
    civCache = r
    for (let k of RAW_RES) player.sm.res[k] = Math.max(0, Math.min(civCap(k), player.sm.res[k] + r.net[k] * dt))

    // Engineers craft on their own: each makes 0.02 of their chosen material a second
    let eng = jobCount("engineer")
    if (eng > 0) {
        let key = player.vg.engineerCraft
        if (hasUpgrade("wk", 53)) {
            let open = CRAFTED_RES.filter(k => RECIPES[k].unlock() && craftable(k) > 0)
            if (open.length) key = open.reduce((a, k) => civRes(k) < civRes(a) ? k : a, open[0])
        }
        if (RECIPES[key] && RECIPES[key].unlock()) {
            player.vg.engineerProgress += eng * 0.02 * dt * (1 + 0.08 * bld("powerplant") * r.fuelEff)
            let n = Math.floor(player.vg.engineerProgress)
            if (n > 0 && craftable(key) >= n) { player.vg.engineerProgress -= n; craft(key, n) }
            else if (n > 0 && craftable(key) == 0) player.vg.engineerProgress = Math.min(player.vg.engineerProgress, 1)
        }
    }

    // Newcomers arrive while there's room and food
    if (player.vg.people < housing() && civRes("food") > 0) {
        player.vg.growth += dt / arrivalTime()
        while (player.vg.growth >= 1 && player.vg.people < housing()) {
            player.vg.growth -= 1
            player.vg.people++
            if (hasUpgrade("dt", 13) && player.dt.autoJobs !== false) autoAssign()
        }
    } else player.vg.growth = 0

    // Starvation: with the stores empty and more eaten than grown, someone leaves every 5 seconds
    if (civRes("food") <= 0 && r.net.food < 0 && player.vg.people > 0) {
        player.vg.starve += dt
        while (player.vg.starve >= 5 && player.vg.people > 0) {
            player.vg.starve -= 5
            loseSomeone()
        }
    } else player.vg.starve = 0

    player.vg.time += dt
    if (hasAssemblyLine() && player.wk.assembly !== false) assemblyLine()

    // Records for the Extinction
    player.ex.peakPeople = Math.max(player.ex.peakPeople, player.vg.people)
    player.ex.peakFootprint = Math.max(player.ex.peakFootprint, footprint())
    player.ex.peakBiomass = player.ex.peakBiomass.max(player.biomass)
}

function loseSomeone() {
    player.vg.people--
    player.ch.starved++
    if (idlePeople() < 0) {
        let biggest = JOBS.reduce((a, j) => jobCount(j.key) > jobCount(a.key) ? j : a, JOBS[0])
        unassignJob(biggest.key, 1)
    }
}

function civEra() {
    if (!civUnlocked()) return ""
    if (hasTech("ecology")) return "Era: The Restoration"
    if (hasTech("fission")) return "Era: The Atomic Age"
    if (hasTech("industrialization")) return "Era: The Industrial Age"
    if (hasTech("philosophy")) return "Era: The Classical Age"
    if (hasTech("metalworking")) return "Era: The Bronze Age"
    return "Era: The Stone Age"
}

// ------------------------------------------------------------
//  THE ACT 4 TREE (opened from the "Extinction" node)
// ------------------------------------------------------------
addLayer("extinction", {
    name: "extinction",
    symbol: "Ex",
    row: "side",
    position: 3,
    color: "#d9774b",
    startData() { return { unlocked: true, points: new Decimal(0) } },
    type: "none",
    leftTab: true,
    previousTab: "tree-tab",
    layerShown() { return civUnlocked() },
    tooltip() { return "Act 4: Extinction" },
    nodeStyle: { "font-size": "28px" },
    tabFormat: [
        "blank",
        ["display-text", function() {
            return "<h2 style='color:#d9774b'>Act 4: Extinction</h2><br>" + civEra() + ", year " + formatWhole(Math.floor(player.vg.time / SEASON_LENGTH / 4) + 1) + ", " + SEASONS[seasonIndex()] + "<br>" +
                "You have <h2 style='color:#d9774b;text-shadow:0 0 10px #d9774b'>" + formatWhole(player.ex.points) + "</h2> Strata"
        }],
        "blank",
        ["tree", [["ls", "ch"], ["sm", "tr"], ["br", "vg", "kn", "wk"], ["wn", "ex", "dt"]]],
    ],
})

function resourceTable() {
    let rows = RAW_RES.filter(k => k == "food" || k == "wood" || civRes(k) > 0 || civCache.net[k] != 0 || resourceSeen(k)).map(k => {
        let net = civCache.net[k] || 0
        let cap = civCap(k)
        let full = civRes(k) >= cap * 0.999
        return "<tr><td style='color:" + CIV_RES[k].color + "'><b>" + CIV_RES[k].name + "</b></td><td>" + formatCiv(civRes(k)) + "</td><td style='opacity:0.7'>/ " + formatCiv(cap) + "</td>" +
            "<td style='color:" + (net < 0 ? "#e06666" : full ? "#888" : "#8fce00") + "'>" + (net >= 0 ? "+" : "") + formatCiv(net) + "/sec</td></tr>"
    })
    rows = rows.concat(CRAFTED_RES.filter(k => civRes(k) > 0 || RECIPES[k].unlock()).map(k =>
        "<tr><td style='color:" + CIV_RES[k].color + "'><b>" + CIV_RES[k].name + "</b></td><td>" + formatCiv(civRes(k)) + "</td><td></td><td></td></tr>"))
    return "<table style='margin:auto;text-align:left;border-spacing:14px 2px'>" + rows.join("") + "</table>"
}

function resourceSeen(k) {
    if (k == "stone") return hasTech("mining")
    if (k == "metal") return hasTech("metalworking")
    if (k == "knowledge") return bld("library") > 0
    if (k == "culture") return hasTech("writing")
    if (k == "fuel") return hasTech("industrialization")
    return false
}

function biosphereText() {
    let h = civCache.health
    let color = h > 0.75 ? "#8fce00" : h > 0.4 ? "#f1c232" : "#e06666"
    return "Footprint <b>" + format(footprint(), 1) + "</b> against a resilience of <b>" + format(resilience(), 1) + "</b>: the biosphere is at <b style='color:" + color + "'>" + format(h * 100, 1) + "%</b> health" +
        " (food x" + format(0.25 + 0.75 * h, 2) + ")."
}

// ------------------------------------------------------------
//  SETTLEMENT (Bonfire): gathering and buildings
// ------------------------------------------------------------
addLayer("sm", {
    name: "settlement",
    symbol: "Se",
    row: 30,
    position: 0,
    color: "#d9774b",
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        res: { food: 0, wood: 0, stone: 0, metal: 0, knowledge: 0, culture: 0, fuel: 0, beams: 0, slabs: 0, plates: 0, books: 0 },
    }},
    type: "none",
    layerShown() { return civUnlocked() },
    tooltip() { return formatWhole(player.vg.people) + " people" },
    update(diff) {
        if (!civUnlocked()) return
        // Long ticks (like offline time) run in 1 second steps, so stores and starvation behave
        let steps = Math.min(7200, Math.ceil(diff))
        for (let i = 0; i < steps; i++) civTick(diff / steps)
    },
    automate() {
        if (!civUnlocked()) return
        if (hasUpgrade("dt", 32) && player.dt.autoBuild !== false) autoBuild()
    },
    tabFormat: [
        ["display-text", function() { return "<h2 style='color:#d9774b'>Settlement</h2><br>" + SEASONS[seasonIndex()] + ", year " + formatWhole(Math.floor(player.vg.time / SEASON_LENGTH / 4) + 1) + " (food x" + format(seasonFood(), 2) + " this season)" }],
        "blank",
        ["display-text", function() { return resourceTable() }],
        "blank",
        ["display-text", function() { return biosphereText() }],
        "blank",
        lore("A few clever apes, a fire, and a patch of ground worth staying on. Everything else starts here."),
        "blank",
        ["clickables", [1]],
        "blank",
        "buyables",
    ],
    clickables: {
        11: {
            title: "Gather food",
            display() { return "+" + format(gatherAmount(), 0) + " Food" },
            canClick() { return true },
            onClick() { player.sm.res.food = Math.min(civCap("food"), player.sm.res.food + gatherAmount()) },
            style() { return { width: "150px", "min-height": "70px", height: "70px" } },
        },
        12: {
            title: "Refine",
            display() { return "50 Food into 1 Wood" },
            canClick() { return player.sm.res.food >= 50 },
            onClick() { player.sm.res.food -= 50; player.sm.res.wood = Math.min(civCap("wood"), player.sm.res.wood + 1) },
            style() { return { width: "150px", "min-height": "70px", height: "70px" } },
        },
    },
    buyables: Object.assign({}, ...BUILDINGS.map(b => ({
        [b.id]: {
            title: b.name,
            cost() { return new Decimal(0) },
            unlocked() { return civUnlocked() && buildingUnlocked(b) },
            display() {
                return b.text + "<br>Footprint " + format(b.fp * footprintMult() * (b.key == "field" && hasTech("chemistry") ? 2 : 1), 1) + "<br><br>" + costText(buildingCost(b)) + "<br><br>Built: " + formatWhole(bld(b.key))
            },
            canAfford() { return civCanAfford(buildingCost(b)) },
            buy() { if (buyBuilding(b)) player.ch.built++ },
            style() { return { width: "150px", height: "150px", "font-size": "10px" } },
        },
    }))),
})

function gatherAmount() {
    return 1 + 4 * Math.min(1, player.vg.people / 10)
}

// Builders' Instinct: buy anything that costs less than half of what you have, cheapest first.
// Fuel burners are left alone (they'd stall without Coal Mines to feed them).
function autoBuild() {
    for (let pass = 0; pass < 5; pass++) {
        let bought = false
        for (let b of BUILDINGS) {
            if (!buildingUnlocked(b) || b.key == "factory" || b.key == "powerplant") continue
            if (player.dt.skip && player.dt.skip[b.key]) continue
            let c = buildingCost(b)
            if (Object.keys(c).every(k => c[k] <= civRes(k) * 0.5) && buyBuilding(b)) { bought = true; player.ch.built++ }
        }
        if (!bought) return
    }
}

// ------------------------------------------------------------
//  VILLAGE: people and their jobs
// ------------------------------------------------------------
addLayer("vg", {
    name: "village",
    symbol: "Vi",
    row: 31,
    position: 1,
    color: "#e6a25e",
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        people: 0,
        growth: 0,
        starve: 0,
        time: 0,
        jobs: { farmer: 0, woodcutter: 0, miner: 0, scholar: 0, storyteller: 0, engineer: 0 },
        engineerCraft: "plates",
        engineerProgress: 0,
    }},
    type: "none",
    branches: ["sm"],
    layerShown() { return civUnlocked() && (player.vg.people > 0 || bld("hut") > 0) },
    tooltip() { return idlePeople() > 0 ? idlePeople() + " idle" : formatWhole(player.vg.people) + " people" },
    tabFormat: [
        ["display-text", function() {
            let food = civCache.net.food || 0
            return "<h2 style='color:#e6a25e'>Village</h2><br>You have <h2 style='color:#e6a25e'>" + formatWhole(player.vg.people) + "</h2> people, with room for " + formatWhole(housing()) + ".<br>" +
                "Each eats " + format(eatRate(), 1) + " Food a second. Food: <span style='color:" + (food < 0 ? "#e06666" : "#8fce00") + "'>" + (food >= 0 ? "+" : "") + format(food, 2) + "/sec</span><br>" +
                (player.vg.people < housing() ? (civRes("food") > 0 ? "Someone new arrives in " + formatTime((1 - player.vg.growth) * arrivalTime()) + "." : "Nobody will come while there's no food.") : "The village is full: build more housing.") +
                (seasonIndex() == 2 ? "<br><span style='color:#f1c232'>Winter comes in " + formatTime(SEASON_LENGTH - player.vg.time % SEASON_LENGTH) + ". Store up food!</span>" : "") +
                (player.vg.starve > 0 ? "<br><span style='color:#e06666'>Starving! Someone leaves in " + formatTime(5 - player.vg.starve) + ".</span>" : "")
        }],
        "blank",
        lore("They are clever, curious and always hungry. Point them at a job and they'll get on with it."),
        "blank",
        ["display-text", function() { return "<b>Idle: " + formatWhole(idlePeople()) + "</b>. Idle people still eat." }],
        "blank",
        ...[0, 1, 2, 3, 4, 5].map(n => ["row", [["display-text", function() { return jobRowText(n) }], ["clickable", 11 + n], ["clickable", 21 + n], ["clickable", 31 + n]]]),
        "blank",
        ["display-text", function() { return !hasTech("industrialization") ? "" : hasUpgrade("wk", 53) ? "<b>Engineers</b> craft whichever material you have least of (Production Planning)." : "<b>Engineers</b> are crafting: " + CIV_RES[player.vg.engineerCraft].name }],
        ["clickables", [5]],
    ],
    clickables: Object.assign({}, ...JOBS.map((j, n) => ({
        [11 + n]: {
            display() { return "+1" },
            unlocked() { return j.unlock() },
            canClick() { return idlePeople() > 0 },
            onClick() { assignJob(j.key, 1) },
            style() { return { width: "50px", "min-height": "40px", height: "40px" } },
        },
        [21 + n]: {
            display() { return "+5" },
            unlocked() { return j.unlock() },
            canClick() { return idlePeople() > 0 },
            onClick() { assignJob(j.key, 5) },
            style() { return { width: "50px", "min-height": "40px", height: "40px" } },
        },
        [31 + n]: {
            display() { return "-1" },
            unlocked() { return j.unlock() },
            canClick() { return jobCount(j.key) > 0 },
            onClick() { unassignJob(j.key, 1) },
            style() { return { width: "50px", "min-height": "40px", height: "40px" } },
        },
    })), Object.assign({}, ...CRAFTED_RES.map((k, n) => ({
        [51 + n]: {
            title: CIV_RES[k].name,
            unlocked() { return hasTech("industrialization") },
            canClick() { return true },
            onClick() { player.vg.engineerCraft = k },
            style() { return { width: "90px", "min-height": "40px", height: "40px", "background-color": player.vg.engineerCraft == k ? "#e6a25e" : "#6b4a2a" } },
        },
    })))),
})

function jobRowText(n) {
    let j = JOBS[n]
    if (!j.unlock()) return ""
    return "<div style='width:260px;text-align:left'><b>" + j.name + "s</b>: " + formatWhole(jobCount(j.key)) + "<br><span style='font-size:12px'>" + j.text + " each</span></div>"
}

// ------------------------------------------------------------
//  KNOWLEDGE (Science): the tech tree
// ------------------------------------------------------------
addLayer("kn", {
    name: "knowledge",
    symbol: "Kn",
    row: 31,
    position: 2,
    color: "#6fa8dc",
    startData() { return { unlocked: true, points: new Decimal(0) } },
    type: "none",
    branches: ["sm"],
    layerShown() { return civUnlocked() && bld("library") > 0 },
    tooltip() { return techCount() + " / " + TECHS.length + " techs" },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#6fa8dc'>Knowledge</h2><br>You have <h2 style='color:#6fa8dc'>" + formatCiv(civRes("knowledge")) + "</h2> / " + formatCiv(civCap("knowledge")) + " Knowledge (+" + formatCiv(civCache.net.knowledge || 0) + "/sec).<br>" +
                "Discoveries cost more Knowledge than you can store at first. Build Libraries (and later Academies and Observatories) to make room."
        }],
        "blank",
        lore("Somebody noticed that seeds grow where they're dropped, and told somebody else. That's how it starts."),
        "blank",
        "upgrades",
    ],
    upgrades: Object.fromEntries(TECHS.map((t, n) => [t.id, {
        fullDisplay() { return "<h3>" + t.name + "</h3><br>" + t.text + (hasUpgrade("kn", t.id) ? "" : "<br><br>" + costText(t.cost)) },
        unlocked() { return n == 0 || hasUpgrade("kn", TECHS[n - 1].id) },
        canAfford() { return civCanAfford(t.cost) },
        pay() { civPay(t.cost) },
        style() { return { width: "150px", height: "130px", "font-size": "10px" } },
    }])),
})

// ------------------------------------------------------------
//  WORKSHOP: crafting and improvements
// ------------------------------------------------------------
const WORKSHOP = {
    11: { title: "Stone Tools", text: "Woodcutters and Miners make 25% more.", cost: { wood: 100, stone: 50 }, unlock: "mining" },
    12: { title: "Clay Pots", text: "Food storage +25%.", cost: { wood: 150, stone: 150 }, unlock: "mining" },
    13: { title: "Bronze Sickles", text: "Farmers make 30% more.", cost: { metal: 25 }, unlock: "metalworking" },
    14: { title: "Bronze Axes", text: "Woodcutters make 50% more.", cost: { metal: 50 }, unlock: "metalworking" },
    21: { title: "Iron Picks", text: "Miners make 50% more.", cost: { metal: 100, wood: 300 }, unlock: "construction" },
    22: { title: "Reinforced Storage", text: "All storage +30% (except Knowledge).", cost: { beams: 20, slabs: 10 }, unlock: "construction" },
    23: { title: "Card Catalog", text: "Knowledge storage +25%.", cost: { beams: 25, metal: 100 }, unlock: "mathematics" },
    24: { title: "Irrigation", text: "Fields make 50% more.", cost: { slabs: 50 }, unlock: "engineering" },
    31: { title: "Printing Press", text: "Scholars make 50% more, Storytellers 25% more.", cost: { plates: 25, books: 10 }, unlock: "metallurgy" },
    32: { title: "Encyclopedias", text: "Knowledge storage x1.5.", cost: { books: 50 }, unlock: "astronomy" },
    33: { title: "Steam Engine", text: "Smelters make twice the Metal.", cost: { plates: 100, beams: 100 }, unlock: "physics" },
    34: { title: "Assembly Line", text: "Wood, Stone, Metal and Culture about to overflow are crafted instead (you can switch it off).", cost: { plates: 150, beams: 150 }, unlock: "physics" },
    41: { title: "Steel Plows", text: "Farmers make 75% more.", cost: { plates: 200 }, unlock: "industrialization" },
    42: { title: "Concrete", text: "All storage x1.5 (except Knowledge).", cost: { slabs: 400 }, unlock: "industrialization" },
    43: { title: "Electric Lights", text: "Scholars and Storytellers make 50% more.", cost: { plates: 400, books: 100 }, unlock: "electricity" },
    44: { title: "Mechanized Farming", text: "Fields make 100% more.", cost: { plates: 800, fuel: 150 }, unlock: "chemistry" },
    51: { title: "Computers", text: "Knowledge x1.5, Knowledge storage x1.5.", cost: { plates: 1500, books: 300 }, unlock: "electronics" },
    52: { title: "Scrubbers", text: "Footprint x0.85.", cost: { plates: 2000, slabs: 1000 }, unlock: "ecology" },
    53: { title: "Production Planning", text: "Engineers always craft whichever material you have least of, so they cover all four.", cost: { plates: 500, books: 150 }, unlock: "electricity" },
}

addLayer("wk", {
    name: "workshop",
    symbol: "Wk",
    row: 31,
    position: 3,
    color: "#a0522d",
    startData() { return { unlocked: true, points: new Decimal(0), assembly: true } },
    type: "none",
    branches: ["sm"],
    layerShown() { return civUnlocked() && hasTech("mining") },
    tooltip() { return "Workshop" },
    tabFormat: [
        ["display-text", function() { return "<h2 style='color:#a0522d'>Workshop</h2><br>Crafting makes <b>x" + format(craftBonus(), 2) + "</b> as much (Workshops and Factories)." }],
        "blank",
        lore("The first tools were rocks. Then sharper rocks. Then rocks on sticks."),
        "blank",
        ["display-text", function() { return CRAFTED_RES.some(k => RECIPES[k].unlock()) ? "<h3>Crafting</h3>" : "<i>Construction unlocks crafting.</i>" }],
        "blank",
        ...CRAFTED_RES.map((k, n) => ["row", [["display-text", function() { return craftRowText(k) }], ["clickable", 11 + n], ["clickable", 21 + n], ["clickable", 31 + n]]]),
        "blank",
        ["clickables", [9]],
        "blank",
        "upgrades",
    ],
    clickables: Object.assign({}, ...CRAFTED_RES.map((k, n) => ({
        [11 + n]: craftButton(k, 1, "x1"),
        [21 + n]: craftButton(k, 10, "x10"),
        [31 + n]: craftButton(k, Infinity, "All"),
    })), {
        91: {
            title() { return "Assembly Line: " + (player.wk.assembly !== false ? "ON" : "OFF") },
            unlocked() { return hasAssemblyLine() },
            canClick() { return true },
            onClick() { player.wk.assembly = player.wk.assembly === false },
            style() { return { width: "200px", "min-height": "50px", height: "50px" } },
        },
    }),
    upgrades: Object.fromEntries(Object.entries(WORKSHOP).map(([id, u]) => [id, {
        fullDisplay() { return "<h3>" + u.title + "</h3><br>" + u.text + (hasUpgrade("wk", id) ? "" : "<br><br>" + costText(u.cost)) },
        unlocked() { return hasTech(u.unlock) },
        canAfford() { return civCanAfford(u.cost) },
        pay() { civPay(u.cost) },
        style() { return { width: "150px", height: "130px", "font-size": "10px" } },
    }])),
})

function craftButton(k, n, label) {
    return {
        display() { return label },
        unlocked() { return RECIPES[k].unlock() },
        canClick() { return craftable(k) >= Math.min(n, 1) && (n == Infinity || craftable(k) >= n) },
        onClick() { craft(k, n) },
        style() { return { width: "50px", "min-height": "40px", height: "40px" } },
    }
}

function craftRowText(k) {
    if (!RECIPES[k].unlock()) return ""
    let from = RECIPES[k].from
    return "<div style='width:260px;text-align:left'><b>" + CIV_RES[k].name + "</b>: " + formatCiv(civRes(k)) + "<br><span style='font-size:12px'>" +
        Object.keys(from).map(r => formatCiv(from[r]) + " " + CIV_RES[r].name).join(", ") + " each</span></div>"
}
