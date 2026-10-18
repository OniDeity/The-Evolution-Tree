// ============================================================
//  ACT 5: DIASPORA
//  Universal Paperclips' space stage, retold. The eternal civilization of Act 4 sends self-copying
//  probes out into the galaxy. It has its own tree, its rows are 40+, and it never resets Act 4.
//
//  Paperclips' drones and factories -> Harvest (hv)  Twist: the power budget; every drone and factory
//                                                   draws power, and they all slow down when it runs short
//  Paperclips' probes               -> Probes  (pb)  Twist: probe trust; a fixed budget split across
//                                                   seven design stats, which you can rebalance any time
//
//  Everything grows from the probes: they explore systems, which holds the matter to harvest, and they
//  copy themselves, but a galaxy can only hold so many probes for each system explored.
// ============================================================

function spaceUnlocked() {
    return !!(player.ex && player.ex.eternity)
}

const GALAXY_SYSTEMS = new Decimal(1e11)
// The numbers that set Act 5's pace, kept together so they're easy to tune
var SPACE_TUNE = {
    rep: 0.003,           // copying per second, per point of Self-Replication
    haz: 0.0001,          // hazard losses per second, before distance and remediation
    hazDist: 2,           // hazards grow with the probes' distance to this power
    explore: 0.02,        // systems explored per probe per second
    exploreDist: 2,       // every new system is farther away: exploring slows with distance to this power
    room: 10,             // probes each explored system can hold
    trustPerDecade: 1,    // trust for every power of 10 systems explored
    hvCostStep: 0.2,      // Harvest upgrade costs: 10^(1.5 + step * n + curve * n^2) Hulls
    hvCostCurve: 0.0025,
    pbCostStep: 0.18,     // Probe upgrade costs: 10^(0.7 + step * n) probes
}

// ------------------------------------------------------------
//  UPGRADES. Both layers have 60, in rows of 5. Each one multiplies (or adds to) one target.
//  "dyn" upgrades grow with something else; their value is a function.
// ------------------------------------------------------------
function upgradeTable(rows) {
    let t = {}
    rows.forEach((row, r) => row.forEach((u, c) => {
        let n = r * 5 + c
        t[11 + r * 10 + c] = { title: u[0], target: u[1], kind: u[2], value: u[3], text: u[4], n: n }
    }))
    return t
}

const HV_UPGRADES = upgradeTable([
    [["Lighter Drones", "harvest", "x", 2], ["Thinner Wire", "wire", "x", 2], ["Assembly Robots", "factory", "x", 2], ["Photovoltaics", "power", "x", 2], ["Bulk Orders", "buildCost", "/", 2]],
    [["Swarm Harvesting", "harvest", "x", 3], ["Spool Drones", "wire", "x", 3], ["Hull Presses", "factory", "x", 3], ["Mirror Arrays", "power", "x", 3], ["Recycled Scrap", "wirePerHull", "/", 1.25]],
    [["Asteroid Nets", "matter", "x", 3], ["Self-Tuning Drones", "all", "x", 2],
        ["Momentum", "all", "dyn", function() { return player.hv.hulls.add(10).log10().sqrt() }, "Everything makes more the more Hulls you have."],
        ["Superconductors", "power", "x", 5], ["Probe Workshops", "probeDrone", "x", 2]],
    [["Grav Tractors", "harvest", "x", 5], ["Nanowire", "wire", "x", 5], ["Fab Lines", "factory", "x", 5], ["Dyson Panels", "power", "x", 10], ["Modular Hulls", "wirePerHull", "/", 1.4]],
    [["Planet Cracking", "matter", "x", 3],
        ["Drone Hive Mind", "harvest", "dyn", function() { return new Decimal(hvBuilt(11)).add(1).log10().add(1) }, "Harvesters make more the more of them you have."],
        ["Wire Lattice", "wire", "dyn", function() { return new Decimal(hvBuilt(12)).add(1).log10().add(1) }, "Wire Drones make more the more of them you have."],
        ["Factory Clusters", "factory", "dyn", function() { return new Decimal(hvBuilt(13)).div(10).add(1) }, "Factories make more the more of them you have."],
        ["Cheaper Frames", "buildCost", "/", 5]],
    [["Star Lifting", "matter", "x", 5], ["Quantum Harvest", "harvest", "x", 10], ["Carbon Nanotube Wire", "wire", "x", 10], ["Orbital Shipyards", "factory", "x", 10], ["Probe Collectives", "probeDrone", "x", 5]],
    [["Dyson Swarm", "power", "x", 100], ["Synchronized Swarms", "all", "x", 3],
        ["Stellar Forges", "all", "dyn", function() { return player.pb.explored.add(10).log10() }, "Everything makes more the more systems you've explored."],
        ["Zero Waste", "wirePerHull", "/", 2], ["Mass Production", "buildCost", "/", 10]],
    [["Black Hole Mining", "matter", "x", 10], ["Dark Harvest", "harvest", "x", 25], ["Monofilament", "wire", "x", 25], ["Hyperforges", "factory", "x", 25], ["Fleet Logistics", "probeDrone", "x", 10]],
    [["Matrioshka Arrays", "power", "x", 1000],
        ["Swarm Economy", "all", "dyn", function() { return player.pb.probes.add(1).pow(0.05) }, "Everything makes more the more probes you have."],
        ["Self-Assembling Hulls", "wirePerHull", "/", 2], ["Galactic Supply Chain", "all", "x", 5], ["Automation Everywhere", "buildCost", "/", 100]],
    [["Neutron Star Mining", "matter", "x", 20], ["Harvest Singularities", "harvest", "x", 100], ["Wire Webs", "wire", "x", 100], ["Megafactories", "factory", "x", 100], ["Probe Armadas", "probeDrone", "x", 25]],
    [["Kugelblitz Power", "power", "x", 1e4],
        ["Recursive Factories", "factory", "dyn", function() { return new Decimal(hvBuilt(13)).add(1).sqrt() }, "Factories make more the more of them you have (again)."],
        ["Total Conversion", "wirePerHull", "/", 4], ["The Long Haul", "all", "x", 10], ["Universal Constructors", "probeDrone", "x", 100]],
    [["Galactic Core Mining", "matter", "x", 50], ["Perfect Harvest", "harvest", "x", 1000], ["Perfect Wire", "wire", "x", 1000], ["Perfect Factories", "factory", "x", 1000], ["Industrial Galaxy", "all", "x", 25]],
])

const PB_UPGRADES = upgradeTable([
    [["Navigation Charts", "explore", "x", 2], ["Error Correction", "replicate", "x", 1.5], ["Radiation Shielding", "hazard", "/", 2], ["Mission Control", "trust", "+", 1], ["Calibration Bench", "calib", "x", 1.5]],
    [["Ion Drives", "explore", "x", 2], ["Template Libraries", "replicate", "x", 1.5], ["Micrometeor Armor", "hazard", "/", 2], ["Deep Space Network", "trust", "+", 1], ["Launch Rails", "launch", "/", 10]],
    [["Gravity Assists", "explore", "x", 3], ["Parallel Assembly", "replicate", "x", 1.5], ["Self-Repair", "hazard", "/", 3], ["Distributed Trust", "trust", "+", 2], ["Probe Drones", "probeDrone", "x", 3]],
    [["Solar Sails", "explore", "x", 3], ["Seed Factories", "replicate", "x", 1.5], ["Swarm Shielding", "hazard", "/", 3], ["Mandate", "trust", "+", 2], ["Fine Tuning", "calib", "x", 1.5]],
    [["Fusion Drives", "explore", "x", 5],
        ["Fractal Replication", "replicate", "dyn", function() { return player.pb.probes.add(1).log10().div(20).add(1) }, "Probes copy themselves faster the more of them there are."],
        ["Hazard Mapping", "hazard", "dyn", function() { return player.pb.explored.add(1).log10().div(5).add(1) }, "Hazards are rarer the more systems you've explored."],
        ["Trust Protocols", "trust", "+", 3], ["Probe Forges", "probeDrone", "x", 5]],
    [["Laser Sails", "explore", "x", 5], ["Mature Templates", "replicate", "x", 1.5], ["Plasma Shields", "hazard", "/", 5], ["Shared Purpose", "trust", "+", 3], ["Precision Calibration", "calib", "x", 2]],
    [["Antimatter Drives", "explore", "x", 10], ["Exponential Assembly", "replicate", "x", 1.5], ["Ablative Hulls", "hazard", "/", 5], ["Chain of Command", "trust", "+", 4], ["Interstellar Factories", "probeDrone", "x", 10]],
    [["Bussard Ramjets", "explore", "x", 10], ["Von Neumann Perfection", "replicate", "x", 1.5], ["Shield Lattices", "hazard", "/", 10], ["Consensus", "trust", "+", 4], ["Calibration Swarms", "calib", "x", 2]],
    [["Warp Bubbles", "explore", "x", 25],
        ["Lineage Memory", "replicate", "dyn", function() { return new Decimal(probeTrust()).div(50).add(1) }, "Probes copy themselves faster the more trust you have."],
        ["Hazard Immunity", "hazard", "/", 10], ["Swarm Will", "trust", "+", 5], ["Probe Megastructures", "probeDrone", "x", 25]],
    [["Wormhole Charts", "explore", "x", 25], ["Perfect Copies", "replicate", "x", 1.5], ["Indestructible Hulls", "hazard", "/", 25], ["Unity", "trust", "+", 5], ["Master Calibration", "calib", "x", 3]],
    [["Galactic Survey", "explore", "dyn", function() { return player.pb.explored.add(10).log10() }, "Exploring speeds up the more systems you've explored."],
        ["Replication Cascade", "replicate", "x", 2], ["Total Remediation", "hazard", "/", 50], ["Faith in the Swarm", "trust", "+", 6], ["Probe Industry", "probeDrone", "x", 100]],
    [["The Map of Everything", "explore", "x", 100], ["Endless Fertility", "replicate", "x", 2], ["Invulnerable", "hazard", "/", 100], ["One Mind", "trust", "+", 8], ["Perfect Calibration", "calib", "x", 5]],
])

// Hull costs for Harvest upgrades and probe costs for Probe upgrades, rising steadily down the table
function hvUpgradeCost(n) {
    // The steps get steeper further down the table, so late upgrades can't snowball
    return Decimal.pow(10, 1.5 + n * SPACE_TUNE.hvCostStep + n * n * SPACE_TUNE.hvCostCurve)
}

function pbUpgradeCost(n) {
    return Decimal.pow(10, 0.7 + n * SPACE_TUNE.pbCostStep).floor()
}

function upgradeValue(table, layer, id) {
    let u = table[id]
    return u.kind == "dyn" ? new Decimal(u.value()) : new Decimal(u.value)
}

// Multiplies together every bought upgrade of a layer aimed at the given target ("+" upgrades add instead).
// Act 5 asks for these many times a tick, so each answer is remembered until the next tick.
let SPACE_MEMO = {}

function spaceMult(layer, table, target) {
    let key = layer + "/" + target
    if (SPACE_MEMO[key]) return SPACE_MEMO[key]
    return SPACE_MEMO[key] = spaceMultRaw(layer, table, target)
}

function spaceMultRaw(layer, table, target) {
    let m = new Decimal(1)
    if (!player[layer]) return m
    if (layer == "pb" && inSpaceTrial(22)) return m
    for (let id in table) {
        let u = table[id]
        if ((u.target != target && !(u.target == "all" && ["harvest", "wire", "factory"].includes(target))) || u.kind == "+" || !hasUpgrade(layer, id)) continue
        m = u.kind == "/" ? m.times(u.value) : m.times(upgradeValue(table, layer, id))
    }
    return m
}

function spaceAdd(layer, table, target) {
    let a = 0
    for (let id in table) if (table[id].target == target && table[id].kind == "+" && hasUpgrade(layer, id)) a += table[id].value
    return a
}

function upgradeText(u) {
    if (u.text) return u.text
    let what = {
        harvest: "Harvesters", wire: "Wire Drones", factory: "Factories", power: "Solar Farms", all: "Harvesters, Wire Drones and Factories",
        matter: "Matter in every system", probeDrone: "Probe crews", explore: "Exploring", replicate: "Probes copy themselves",
        calib: "Calibration", trust: "Trust", seeds: "Seed gain", nav: "Navigation", combat: "Combat", compute: "Compute", memory: "Memory", yomi: "Yomi gain", honor: "Honor gain",
    }[u.target]
    if (u.target == "loyalty") return "Loyalty x" + format(u.value) + ": fewer probes drift."
    if (u.target == "armor") return "Armor x" + format(u.value) + ": Drifters destroy fewer probes."
    if (u.target == "salvage") return "Salvage x" + format(u.value) + ": destroyed Drifters give more Hulls."
    if (u.kind == "+") return "+" + u.value + " Trust."
    if (u.target == "buildCost") return "Drones, Factories and Solar Farms cost /" + format(u.value) + "."
    if (u.target == "wirePerHull") return "A Hull takes /" + format(u.value) + " the Wire."
    if (u.target == "hazard") return "Hazards destroy /" + format(u.value) + " as many probes."
    if (u.target == "launch") return "Launching probes costs /" + format(u.value) + "."
    if (u.target == "calib") return "Calibration is x" + format(u.value) + " as strong."
    return what + " x" + format(u.value) + "."
}

function spaceUpgrade(layer, table, id, currencyName, cost, unlocked) {
    let u = table[id]
    let up = {
        title: u.title,
        description() { return upgradeText(u) },
        cost: cost(u.n),
        currencyDisplayName: currencyName,
        unlocked: unlocked(u.n),
    }
    if (u.kind == "dyn") {
        up.effect = function() { return upgradeValue(table, layer, id) }
        up.effectDisplay = function() { return (u.target == "hazard" ? "/" : "x") + format(upgradeEffect(layer, id)) }
    }
    up.style = { width: "130px", "min-height": "120px", "font-size": "10px" }
    return up
}

// A row of upgrades shows once you've bought 3 from the row above it
function rowUnlocked(layer, n) {
    let row = Math.floor(n / 5)
    if (row == 0) return true
    let prev = [0, 1, 2, 3, 4].filter(c => hasUpgrade(layer, 11 + (row - 1) * 10 + c)).length
    return prev >= 3 || [0, 1, 2, 3, 4].some(c => hasUpgrade(layer, 11 + row * 10 + c))
}

// ------------------------------------------------------------
//  HARVEST: drones, factories and the power that runs them
// ------------------------------------------------------------
const HV_BUILDINGS = {
    11: { name: "Harvester Drone", plural: "Harvester Drones", base: 10, ratio: 1.15, power: 1, text: "Gathers 1 Matter/sec from explored systems." },
    12: { name: "Wire Drone", plural: "Wire Drones", base: 15, ratio: 1.15, power: 1, text: "Spins 1 Matter/sec into Wire." },
    13: { name: "Factory", plural: "Factories", base: 100, ratio: 1.2, power: 5, text: "Presses Wire into 1 Hull/sec." },
    14: { name: "Solar Farm", plural: "Solar Farms", base: 50, ratio: 1.12, power: -10, text: "Makes 10 power." },
}

function hvBuilt(id) {
    return player.hv.built[id] || 0
}

function hvBuildingCost(id, n) {
    let b = HV_BUILDINGS[id]
    if (n === undefined) n = hvBuilt(id)
    return Decimal.pow(b.ratio, n).times(b.base).div(spaceMult("hv", HV_UPGRADES, "buildCost"))
}

// How many you could buy at once with what you have
function hvMaxAffordable(id) {
    let b = HV_BUILDINGS[id], c0 = hvBuildingCost(id)
    if (player.hv.hulls.lt(c0)) return 0
    return Math.floor(player.hv.hulls.times(b.ratio - 1).div(c0).add(1).log(b.ratio).toNumber())
}

function hvBuy(id, n) {
    let b = HV_BUILDINGS[id]
    n = Math.min(n, hvMaxAffordable(id))
    if (n <= 0) return
    let c0 = hvBuildingCost(id)
    let total = c0.times(Decimal.pow(b.ratio, n).sub(1)).div(b.ratio - 1)
    if (!hasMilestone("hv", 5)) player.hv.hulls = player.hv.hulls.sub(total).max(0)
    player.hv.built[id] = hvBuilt(id) + n
}

function powerSupply() {
    // Home sends a little power out to the first drones, so you can never be stuck without any
    return new Decimal(10 + hvBuilt(14) * 10).times(spaceMult("hv", HV_UPGRADES, "power")).times(physics("power"))
}

function powerDemand() {
    return new Decimal(hvBuilt(11) + hvBuilt(12) + 5 * hvBuilt(13))
}

function powerRatio() {
    if (inSpaceTrial(21)) return 0
    if (hasMilestone("hv", 8)) return 1
    let d = powerDemand()
    if (d.eq(0)) return 1
    return Math.min(1, powerSupply().div(d).toNumber())
}

function matterPerSystem() {
    return new Decimal(1e4).times(spaceMult("hv", HV_UPGRADES, "matter")).times(extraMult("matter")).times(hasMilestone("hv", 10) ? 10 : 1).times(physics("matter"))
}

// Matter in explored systems that nobody has gathered yet
function unharvested() {
    return player.pb.explored.times(matterPerSystem()).sub(player.hv.gathered).max(0)
}

function wirePerHull() {
    return new Decimal(10).div(spaceMult("hv", HV_UPGRADES, "wirePerHull"))
}

function supplyRate() {
    return hasMilestone("hv", 0) ? 5 : 1
}

function spaceGlobalMult() {
    let m = new Decimal(1)
    if (hasMilestone("hv", 6)) m = m.times(2)
    if (hasMilestone("hv", 9)) m = m.times(3)
    if (hasMilestone("hv", 11)) m = m.times(5)
    m = m.times(spaceAchievementBonus())
    if (spaceTrialDone(21)) m = m.times(1e6)
    // The eternal civilization of Act 4 keeps supplying its probes
    m = m.times(player.ex.total.add(10).log10())
    return m
}

// Probe crews: a share of your probes do drone and factory work wherever they are
function probeCrews(stat) {
    return player.pb.probes.times(0.02 * trustIn(stat) * (1 - thinkShare())).times(calibration(stat)).times(spaceMult("pb", PB_UPGRADES, "probeDrone")).times(spaceMult("hv", HV_UPGRADES, "probeDrone"))
}

// If anything in Act 5 ever turns into NaN, put it back as it was before this tick instead of breaking the save
const SPACE_SAFE = { pb: ["probes", "explored", "lost", "bestProbes"], hv: ["matter", "wire", "hulls", "gathered", "totalHulls"], dr: ["drifters", "honor", "totalHonor"], sq: ["compute", "yomi", "totalYomi"], un: ["seeds", "totalSeeds"] }

function spaceSnapshot() {
    let s = {}
    for (let l in SPACE_SAFE) if (player[l]) for (let k of SPACE_SAFE[l]) if (player[l][k] instanceof Decimal) s[l + "." + k] = player[l][k]
    return s
}

// The last good value of each, so a NaN that appears anywhere (not just in this step) can be undone next tick
let spaceLastGood = {}

function spaceRescue(snap) {
    for (let key in snap) {
        let [l, k] = key.split(".")
        let v = player[l][k]
        if (!(v instanceof Decimal) || isNaN(v.mag) || isNaN(v.layer) || isNaN(v.sign)) {
            let good = spaceLastGood[key] || snap[key]
            player[l][k] = good && !isNaN(good.mag) ? good : new Decimal(0)
            console.warn("Act 5: " + key + " was NaN and has been restored")
        } else spaceLastGood[key] = v
    }
}

let spaceCache = { matter: new Decimal(0), wire: new Decimal(0), hulls: new Decimal(0), power: 1, growth: 0, explore: new Decimal(0), lost: new Decimal(0) }

function harvestTick(dt) {
    let ratio = powerRatio()
    let g = spaceGlobalMult()
    let harvesters = new Decimal(hvBuilt(11) * ratio).add(probeCrews("harvester"))
    let wireDrones = new Decimal(hvBuilt(12) * ratio).add(probeCrews("wire"))
    let factories = new Decimal(hvBuilt(13) * ratio).add(probeCrews("factory"))

    // Matter: gathered from explored systems, never more than they hold
    let mRate = harvesters.times(spaceMult("hv", HV_UPGRADES, "harvest")).times(extraMult("harvest")).times(g)
    let gather = Decimal.min(mRate.times(dt), unharvested())
    player.hv.matter = player.hv.matter.add(gather)
    player.hv.gathered = player.hv.gathered.add(gather)

    // Wire: spun from Matter
    let wRate = wireDrones.times(spaceMult("hv", HV_UPGRADES, "wire")).times(extraMult("wire")).times(g)
    let spin = Decimal.min(wRate.times(dt), player.hv.matter)
    player.hv.matter = player.hv.matter.sub(spin)
    player.hv.wire = player.hv.wire.add(spin)

    // Hulls: pressed from Wire
    let hRate = factories.times(spaceMult("hv", HV_UPGRADES, "factory")).times(extraMult("factory")).times(g)
    let press = Decimal.min(hRate.times(dt), player.hv.wire.div(wirePerHull()))
    player.hv.wire = player.hv.wire.sub(press.times(wirePerHull())).max(0)
    // Supply ships from home: a steady Hull a second, so the swarm can never be stranded
    press = press.add(supplyRate() * dt)
    player.hv.hulls = player.hv.hulls.add(press)
    player.hv.totalHulls = player.hv.totalHulls.add(press)

    spaceCache.matter = gather.div(dt)
    spaceCache.wire = spin.div(dt)
    spaceCache.hulls = press.div(dt)
    spaceCache.power = ratio
}

addLayer("hv", {
    name: "harvest",
    symbol: "Hv",
    row: 41,
    position: 0,
    color: "#7fb3d5",
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        matter: new Decimal(0),
        gathered: new Decimal(0),
        wire: new Decimal(0),
        hulls: new Decimal(100),
        totalHulls: new Decimal(0),
        auto: { 11: true, 12: true, 13: true, 14: true },
        built: { 11: 0, 12: 0, 13: 0, 14: 0 },
    }},
    type: "none",
    branches: ["pb"],
    layerShown() { return spaceUnlocked() },
    tooltip() { return format(player.hv.hulls) + " Hulls" },
    automate() {
        if (!spaceUnlocked()) return
        let autos = { 11: 1, 12: 2, 13: 4, 14: 3 }
        for (let id in autos) if (hasMilestone("hv", autos[id]) && player.hv.auto[id] !== false) hvBuy(Number(id), 1e6)
        if (hasMilestone("hv", 7)) for (let id in HV_UPGRADES) buyUpg("hv", id)
    },
    tabFormat: {
        "Drones": {
            content: [
                ["display-text", function() { return harvestHeader() }],
                "blank",
                ["display-text", function() { return gettingStarted() }],
                "blank",
                lore("The first probes arrive in a new system and get to work: break down an asteroid, spin it into wire, press the wire into hulls, and build more of everything."),
                "blank",
                ["display-text", function() {
                    let r = powerRatio()
                    return "<b>Power:</b> " + format(powerSupply()) + " made, " + format(powerDemand()) + " needed. " +
                        (r < 1 ? "<span style='color:#e06666'>Short on power: drones and factories run at " + format(r * 100, 1) + "%.</span>" : "<span style='color:#8fce00'>Everything has power.</span>")
                }],
                "blank",
                ...[11, 12, 13, 14].map(id => ["row", [["display-text", function() { return hvRowText(id) }], ["clickable", id], ["clickable", id + 10], ["clickable", id + 20], ["clickable", id + 30]]]),
                "blank",
                "milestones",
            ],
        },
        "Upgrades": {
            content: [
                ["display-text", function() { return harvestHeader() }],
                "blank",
                ["display-text", "A new row of upgrades shows once you've bought 3 from the row above it."],
                "blank",
                "upgrades",
            ],
        },
    },
    clickables: Object.assign({}, ...[11, 12, 13, 14].map(id => ({
        [id]: hvBuyButton(id, 1, "Buy 1"),
        [id + 10]: hvBuyButton(id, 10, "Buy 10"),
        [id + 20]: hvBuyButton(id, 1e9, "Max"),
        [id + 30]: {
            title() { return "Auto: " + (player.hv.auto[id] !== false ? "ON" : "OFF") },
            unlocked() { return hasMilestone("hv", { 11: 1, 12: 2, 13: 4, 14: 3 }[id]) },
            canClick() { return true },
            onClick() { player.hv.auto[id] = player.hv.auto[id] === false },
            style() { return { width: "70px", "min-height": "45px", height: "45px", "font-size": "10px" } },
        },
    }))),
    upgrades: Object.fromEntries(Object.keys(HV_UPGRADES).map(id => [id, spaceUpgrade("hv", HV_UPGRADES, id, "Hulls", hvUpgradeCost, n => function() { return rowUnlocked("hv", n) })]).map(([id, u]) => {
        u.currencyInternalName = "hulls"
        u.currencyLayer = "hv"
        return [id, u]
    })),
    milestones: {
        0: { requirementDescription: "100 Hulls made", effectDescription: "Supply ships from home bring 5 Hulls a second instead of 1. (Every Hull made counts toward these milestones, even ones you've spent.)", done() { return player.hv.totalHulls.gte(100) } },
        1: { requirementDescription: "1,000 Hulls made", effectDescription: "Harvester Drones are bought on their own.", done() { return player.hv.totalHulls.gte(1e3) } },
        2: { requirementDescription: "10,000 Hulls made", effectDescription: "Wire Drones are bought on their own.", done() { return player.hv.totalHulls.gte(1e4) } },
        3: { requirementDescription: "100,000 Hulls made", effectDescription: "Solar Farms are bought on their own.", done() { return player.hv.totalHulls.gte(1e5) } },
        4: { requirementDescription: "1e6 Hulls made", effectDescription: "Factories are bought on their own.", done() { return player.hv.totalHulls.gte(1e6) } },
        5: { requirementDescription: "1e8 Hulls made", effectDescription: "Buying drones, factories and farms no longer spends Hulls.", done() { return player.hv.totalHulls.gte(1e8) } },
        6: { requirementDescription: "1e10 Hulls made", effectDescription: "Everything in Harvest x2.", done() { return player.hv.totalHulls.gte(1e10) } },
        7: { requirementDescription: "1e12 Hulls made", effectDescription: "Harvest upgrades are bought on their own.", done() { return player.hv.totalHulls.gte(1e12) } },
        8: { requirementDescription: "1e15 Hulls made", effectDescription: "Power never runs short.", done() { return player.hv.totalHulls.gte(1e15) } },
        9: { requirementDescription: "1e18 Hulls made", effectDescription: "Everything in Harvest x3.", done() { return player.hv.totalHulls.gte(1e18) } },
        10: { requirementDescription: "1e21 Hulls made", effectDescription: "Every system holds 10x the Matter.", done() { return player.hv.totalHulls.gte(1e21) } },
        11: { requirementDescription: "1e25 Hulls made", effectDescription: "Everything in Harvest x5.", done() { return player.hv.totalHulls.gte(1e25) } },
    },
})

function harvestHeader() {
    return "<h2 style='color:#7fb3d5'>Harvest</h2><br>You have <h2 style='color:#7fb3d5'>" + format(player.hv.hulls) + "</h2> Hulls (+" + format(spaceCache.hulls) + "/sec)<br>" +
        format(player.hv.matter) + " Matter (+" + format(spaceCache.matter) + "/sec), " + format(player.hv.wire) + " Wire (+" + format(spaceCache.wire) + "/sec). " +
        "A Hull takes " + format(wirePerHull(), 2) + " Wire, and supply ships from home bring " + supplyRate() + " Hull" + (supplyRate() > 1 ? "s" : "") + " a second.<br>Explored systems still hold " + format(unharvested()) + " Matter."
}

function hvRowText(id) {
    let b = HV_BUILDINGS[id]
    let crew = { 11: "harvester", 12: "wire", 13: "factory" }[id]
    let extra = crew && trustIn(crew) > 0 ? " (+" + format(probeCrews(crew)) + " probe crews)" : ""
    return "<div style='width:360px;text-align:left'><b>" + b.plural + "</b>: " + formatWhole(hvBuilt(id)) + extra + "<br><span style='font-size:12px'>" + b.text +
        (b.power > 0 ? " Uses " + b.power + " power." : "") + "<br>Next: " + format(hvBuildingCost(id)) + " Hulls</span></div>"
}

function hvBuyButton(id, n, label) {
    return {
        display() { return label },
        canClick() { return player.hv.hulls.gte(hvBuildingCost(id)) },
        onClick() { hvBuy(id, n) },
        style() { return { width: "60px", "min-height": "45px", height: "45px", "font-size": "10px" } },
    }
}

// ------------------------------------------------------------
//  PROBES: trust, calibration, replication, hazards and exploration
// ------------------------------------------------------------
const PROBE_STATS = {
    speed: { name: "Speed", text: "Exploring and copying are faster." },
    explore: { name: "Exploration", text: "Each probe explores more systems." },
    replicate: { name: "Self-Replication", text: "Probes copy themselves. Without this, they never multiply." },
    hazard: { name: "Hazard Remediation", text: "Fewer probes are lost to hazards, which grow the farther out you go." },
    combat: { name: "Combat", text: "Probes destroy Drifters. Needed once probes start to drift.", unlock() { return driftStarted() } },
    factory: { name: "Factory Production", text: "Probe crews work as Factories." },
    harvester: { name: "Harvester Production", text: "Probe crews work as Harvester Drones." },
    wire: { name: "Wire Production", text: "Probe crews work as Wire Drones." },
}
const STAT_KEYS = Object.keys(PROBE_STATS)

function probeTrust() {
    let t = 3 + Math.floor(player.pb.explored.add(1).log10().toNumber() * SPACE_TUNE.trustPerDecade)
    t += spaceAdd("pb", PB_UPGRADES, "trust") + spaceAdd("dr", DR_UPGRADES, "trust") + spaceAdd("sq", SQ_UPGRADES, "trust") + spaceAdd("pj", PJ_UPGRADES, "trust") + spaceAdd("un", UN_UPGRADES, "trust") + driftSwarmTrust()
    if (hasMilestone("pb", 15)) t += 3
    if (hasMilestone("un", 5)) t += 5
    if (hasMilestone("mv", 4)) t += 10
    t += spaceAdd("mv", MV_UPGRADES, "trust") + signalTrust()
    if (hasMilestone("pb", 0)) t += 1
    if (hasMilestone("pb", 3)) t += 2
    if (hasMilestone("pb", 6)) t += 3
    if (hasMilestone("pb", 8)) t += 4
    return t
}

function trustUsed() {
    return STAT_KEYS.reduce((a, k) => a + (player.pb.trust[k] || 0), 0)
}

function trustIn(k) {
    return player.pb.trust[k] || 0
}

// Calibration: each level makes one stat 10% stronger (more with upgrades)
function calibration(k) {
    let n = getBuyableAmount("pb", 11 + STAT_KEYS.indexOf(k)).toNumber()
    return new Decimal(1).add(spaceMult("pb", PB_UPGRADES, "calib").times(0.1 * n))
}

function calibrationCost(k, n) {
    if (n === undefined) n = getBuyableAmount("pb", 11 + STAT_KEYS.indexOf(k)).toNumber()
    return Decimal.pow(3, n).times(200)
}

function statPower(k) {
    return calibration(k).times(trustIn(k))
}

function speedFactor() {
    return statPower("speed").times(0.2).add(1)
}

// Rates grow with the logarithm of everything that boosts them, so each x10 adds about the same step.
// (Boosting a growth rate directly would make the swarm explode out of control.)
function replicationPower() {
    let p = statPower("replicate").times(speedFactor()).times(spaceMult("pb", PB_UPGRADES, "replicate")).times(extraMult("replicate"))
    if (hasMilestone("pb", 9)) p = p.times(1.5)
    return p
}

function replicationRate() {
    // Square root of the log: early boosts matter, and the late game doesn't run away
    return replicationPower().add(1).log10().sqrt().times(SPACE_TUNE.rep).times(physics("rep")).times(spaceTrialDone(22) ? 1.1 : 1)
}

function hazardRate() {
    // The farther out the probes go, the more dangerous it gets
    let shield = statPower("hazard").add(1).times(spaceMult("pb", PB_UPGRADES, "hazard")).times(extraMult("hazard")).times(hasMilestone("pb", 5) ? 2 : 1).times(hasMilestone("pb", 13) ? 2 : 1).times(hasMilestone("pb", 16) ? 2 : 1)
    return new Decimal(SPACE_TUNE.haz).times(physics("hazard")).times(inSpaceTrial(14) ? 4 : 1).div(spaceTrialDone(14) ? 10 : 1).times(Math.pow(distance(), SPACE_TUNE.hazDist)).div(shield.log10().add(1))
}

// A galaxy can only hold so many probes for every system you've explored
function probeRoom() {
    return player.pb.explored.times(SPACE_TUNE.room)
}

// How far out the probes are: 1 at home, +1 for every power of 10 systems explored
function distance() {
    return 1 + player.pb.explored.max(1).log10().toNumber()
}

function exploreRate() {
    let power = statPower("explore").add(1).times(speedFactor()).times(spaceMult("pb", PB_UPGRADES, "explore")).times(extraMult("explore")).times(hasMilestone("pb", 7) ? 3 : 1).times(hasMilestone("pb", 11) ? 2 : 1).times(hasMilestone("pb", 17) ? 3 : 1)
    return player.pb.probes.times(SPACE_TUNE.explore).div(Math.pow(distance(), SPACE_TUNE.exploreDist)).times(power.log10().add(1)).times(navigation()).times(physics("explore")).times(cosmicExpansion())
}

function launchCost() {
    return Decimal.pow(4, player.pb.launched).times(50).div(spaceMult("pb", PB_UPGRADES, "launch"))
}

function launchProbe() {
    if (player.hv.hulls.lt(launchCost()) || inSpaceTrial(11)) return
    player.hv.hulls = player.hv.hulls.sub(launchCost())
    player.pb.launched++
    player.pb.probes = player.pb.probes.add(1)
}

function probeTick(dt) {
    let p = player.pb.probes
    if (p.gt(0)) {
        // Copying slows as the probes fill the room their explored systems give them
        let fill = Decimal.min(1, p.add(player.dr.drifters).div(probeRoom().max(1))).toNumber()
        let r0 = replicationRate()
        let r = r0.times(1 - fill)
        let h = hazardRate()
        let lost = p.times(h).times(dt)
        let next = p.times(Decimal.exp(r.sub(h).times(dt)))
        // A long step can't overshoot: the swarm settles where copying (slowed by the room left) balances hazards
        if (r0.gt(h)) {
            let settle = probeRoom().times(Decimal.sub(1, h.div(r0))).sub(player.dr.drifters).max(1)
            next = p.lte(settle) ? Decimal.min(next, settle) : Decimal.max(next, settle)
        }
        // Hazards can thin the swarm out, but never destroy the last probe
        p = next.max(Decimal.min(1, p))
        if (isNaN(p.mag)) p = player.pb.probes
        player.pb.lost = player.pb.lost.add(lost)
        spaceCache.growth = r.sub(h).toNumber()
        spaceCache.lost = lost.div(dt)
    }
    player.pb.probes = p
    let ex = exploreRate()
    player.pb.explored = Decimal.min(explorationCap(), player.pb.explored.add(ex.times(dt)))
    spaceCache.explore = ex
    player.pb.bestProbes = player.pb.bestProbes.max(p)
}

function spaceTick(dt) {
    SPACE_MEMO = {}
    probeTick(dt)
    // Drift starts again in every universe once the probes pass the Milky Way; the Swarm keeps thinking throughout
    if (driftStarted()) { player.dr.started = true; if (driftActive()) driftTick(dt); swarmTick(dt) }
    harvestTick(dt)
    player.fl.time += dt
}

addLayer("pb", {
    name: "probes",
    symbol: "Pr",
    row: 40,
    position: 0,
    color: "#5b8def",
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        probes: new Decimal(0),
        bestProbes: new Decimal(0),
        explored: new Decimal(1),
        lost: new Decimal(0),
        launched: 0,
        trust: { speed: 0, explore: 0, replicate: 1, hazard: 0, combat: 0, factory: 0, harvester: 0, wire: 0 },
        autoLaunch: true,
        autoTrust: 0,
        trustSplit: null,
    }},
    type: "none",
    layerShown() { return spaceUnlocked() },
    tooltip() { return format(player.pb.probes) + " probes" },
    update(diff) {
        if (!spaceUnlocked()) return
        // Catch anything that went NaN since the last tick, before it spreads
        spaceRescue(spaceSnapshot())
        keepReplicating()
        diff *= spaceSpeed()
        let snap = spaceSnapshot()
        // Long ticks run in steps of at most 10 seconds, but never more than 50 steps a tick (400 for a long offline tick):
        // late in Act 5 the game runs so fast that more would freeze the browser. Probe growth is exact over any step.
        let steps = Math.min(diff > 3600 * spaceSpeed() ? 400 : 50, Math.max(1, Math.ceil(diff / 10)))
        for (let i = 0; i < steps; i++) spaceTick(diff / steps)
        spaceRescue(snap)
    },
    automate() {
        if (!spaceUnlocked()) return
        if (hasMilestone("pb", 1) && player.pb.autoLaunch) launchProbe()
        if (hasMilestone("pb", 2)) for (let k of STAT_KEYS) { let id = 11 + STAT_KEYS.indexOf(k); for (let i = 0; i < 10 && layers.pb.buyables[id].canAfford(); i++) layers.pb.buyables[id].buy() }
        // Only buys a probe upgrade once it costs under 1% of your probes, so automation never stalls the swarm
        if (hasMilestone("pb", 4)) for (let id in PB_UPGRADES) if (tmp.pb.upgrades[id] && tmp.pb.upgrades[id].unlocked && player.pb.probes.times(0.01).gte(tmp.pb.upgrades[id].cost)) buyUpg("pb", id)
        autoTrust()
    },
    tabFormat: {
        "Probes": {
            content: [
                ["display-text", function() { return probeHeader() }],
                "blank",
                ["display-text", function() { return gettingStarted() }],
                "blank",
                lore("Every probe is a factory, a ship and a parent. Point it at a star, and some years later there are two of them."),
                "blank",
                ["clickables", [9]],
                "blank",
                ["display-text", function() {
                    return "<h3>Probe trust</h3><br>You have <b>" + probeTrust() + "</b> trust (" + (probeTrust() - trustUsed()) + " free). You get more for exploring (1 per power of 10 systems).<br>" +
                        "Move it between stats whenever you like: trust is never lost."
                }],
                "blank",
                ...STAT_KEYS.map((k, n) => ["row", [["display-text", function() { return statRowText(k) }], ["clickable", 21 + n], ["clickable", 31 + n], ["buyable", 11 + n]]]),
                "blank",
                ["row", [["upgrade", 141], ["clickable", 81], ["clickable", 82]]],
                "blank",
                "milestones",
            ],
        },
        "Upgrades": {
            content: [
                ["display-text", function() { return probeHeader() }],
                "blank",
                ["display-text", "Probe upgrades are paid for with probes: they're taken apart and their parts put to better use. A new row shows once you've bought 3 from the row above it."],
                "blank",
                "upgrades",
            ],
        },
    },
    clickables: Object.assign({
        91: {
            title: "Launch a probe",
            display() { return "Costs " + format(launchCost()) + " Hulls" },
            canClick() { return player.hv.hulls.gte(launchCost()) },
            onClick() { launchProbe() },
            style() { return { width: "200px", "min-height": "80px", height: "80px" } },
        },
        81: {
            title() { return ["Autopilot off", "Keeping your split", "Balanced"][player.pb.autoTrust || 0] },
            display() { return ["Click to keep the split you have now", "Click for the balanced split", "Click to turn it off"][player.pb.autoTrust || 0] },
            unlocked() { return hasUpgrade("pb", 141) },
            canClick() { return true },
            onClick() {
                player.pb.autoTrust = ((player.pb.autoTrust || 0) + 1) % 3
                if (player.pb.autoTrust == 1) player.pb.trustSplit = deepCopy(player.pb.trust)
            },
            style() { return { width: "160px", "min-height": "80px", height: "80px" } },
        },
        82: {
            title: "Remember this split",
            display() { return "Use the trust you've set by hand as your split from now on." },
            unlocked() { return hasUpgrade("pb", 141) && player.pb.autoTrust == 1 },
            canClick() { return true },
            onClick() { player.pb.trustSplit = deepCopy(player.pb.trust) },
            style() { return { width: "160px", "min-height": "80px", height: "80px" } },
        },
        92: {
            title() { return "Auto-launch: " + (player.pb.autoLaunch ? "ON" : "OFF") },
            unlocked() { return hasMilestone("pb", 1) },
            canClick() { return true },
            onClick() { player.pb.autoLaunch = !player.pb.autoLaunch },
            style() { return { width: "140px", "min-height": "60px", height: "60px" } },
        },
    }, ...STAT_KEYS.map((k, n) => ({
        [21 + n]: {
            display() { return "+1" },
            unlocked() { return statUnlocked(k) },
            canClick() { return trustUsed() < probeTrust() },
            onClick() { player.pb.trust[k] = trustIn(k) + 1 },
            style() { return { width: "45px", "min-height": "45px", height: "45px" } },
        },
        [31 + n]: {
            display() { return "-1" },
            unlocked() { return statUnlocked(k) },
            // Self-Replication never drops below 1: without it the swarm can never grow
            canClick() { return trustIn(k) > (k == "replicate" ? 1 : 0) },
            onClick() { player.pb.trust[k] = trustIn(k) - 1 },
            style() { return { width: "45px", "min-height": "45px", height: "45px" } },
        },
    }))),
    buyables: Object.fromEntries(STAT_KEYS.map((k, n) => [11 + n, {
        title() { return "Calibrate" },
        unlocked() { return statUnlocked(k) },
        cost() { return calibrationCost(k) },
        display() { return "Level " + formatWhole(getBuyableAmount("pb", this.id)) + "<br>" + format(this.cost()) + " Hulls" },
        canAfford() { return player.hv.hulls.gte(this.cost()) },
        buy() {
            if (!this.canAfford()) return
            player.hv.hulls = player.hv.hulls.sub(this.cost())
            setBuyableAmount("pb", this.id, getBuyableAmount("pb", this.id).add(1))
        },
        style() { return { width: "110px", height: "60px", "min-height": "60px", "font-size": "10px" } },
    }])),
    upgrades: Object.assign(Object.fromEntries(Object.keys(PB_UPGRADES).map(id => {
        let u = spaceUpgrade("pb", PB_UPGRADES, id, "probes", pbUpgradeCost, n => function() { return rowUnlocked("pb", n) })
        u.currencyInternalName = "probes"
        u.currencyLayer = "pb"
        return [id, u]
    })), {
        141: {
            title: "Trust Autopilot",
            description: "Trust spends itself as you earn it: keeping the split you've set up, or a balanced split that also shifts trust into Combat whenever the Drifters start to outpace you.",
            cost: new Decimal(500),
            currencyDisplayName: "probes",
            currencyInternalName: "probes",
            currencyLayer: "pb",
            style: { width: "220px", height: "120px" },
        },
    }),
    milestones: {
        0: { requirementDescription: "10 systems explored", effectDescription: "+1 trust.", done() { return player.pb.explored.gte(10) } },
        1: { requirementDescription: "100 systems explored", effectDescription: "Probes are launched on their own.", done() { return player.pb.explored.gte(100) } },
        2: { requirementDescription: "1,000 systems explored", effectDescription: "Calibration is bought on its own.", done() { return player.pb.explored.gte(1e3) } },
        3: { requirementDescription: "10,000 systems explored", effectDescription: "+2 trust.", done() { return player.pb.explored.gte(1e4) } },
        4: { requirementDescription: "100,000 systems explored", effectDescription: "Probe upgrades are bought on their own, once they cost under 1% of your probes.", done() { return player.pb.explored.gte(1e5) } },
        5: { requirementDescription: "1e6 systems explored", effectDescription: "Hazards destroy half as many probes.", done() { return player.pb.explored.gte(1e6) } },
        6: { requirementDescription: "1e7 systems explored", effectDescription: "+3 trust.", done() { return player.pb.explored.gte(1e7) } },
        7: { requirementDescription: "1e8 systems explored", effectDescription: "Exploring x3.", done() { return player.pb.explored.gte(1e8) } },
        8: { requirementDescription: "1e9 systems explored", effectDescription: "+4 trust.", done() { return player.pb.explored.gte(1e9) } },
        9: { requirementDescription: "1e10 systems explored", effectDescription: "Probes copy themselves 1.5x faster.", done() { return player.pb.explored.gte(1e10) } },
        10: { requirementDescription: "1e11 systems explored", effectDescription: "The whole Milky Way is mapped. Probes push on toward the Virgo Supercluster, and some of them start to drift...", done() { return player.pb.explored.gte(GALAXY_SYSTEMS) } },
        11: { requirementDescription: "1e12 systems explored", effectDescription: "The Local Group: exploring x2.", done() { return player.pb.explored.gte(1e12) } },
        12: { requirementDescription: "1e13 systems explored", effectDescription: "+2 trust.", done() { return player.pb.explored.gte(1e13) } },
        13: { requirementDescription: "1e14 systems explored", effectDescription: "Hazards destroy half as many probes (again).", done() { return player.pb.explored.gte(1e14) } },
        14: { requirementDescription: "1e15 systems explored", effectDescription: "The whole Virgo Supercluster is mapped. Beyond it: the observable universe, Projects, and the chance to consume a universe.", done() { return player.pb.explored.gte(VIRGO_SYSTEMS) } },
        15: { requirementDescription: "1e17 systems explored", effectDescription: "+3 trust.", done() { return player.pb.explored.gte(1e17) } },
        16: { requirementDescription: "1e19 systems explored", effectDescription: "Hazards destroy half as many probes (a third time).", done() { return player.pb.explored.gte(1e19) } },
        17: { requirementDescription: "1e21 systems explored", effectDescription: "Exploring x3.", done() { return player.pb.explored.gte(1e21) } },
        18: { requirementDescription: "1e22 systems explored", effectDescription: "The whole observable universe is mapped.", done() { return player.pb.explored.gte(UNIVERSE_SYSTEMS) } },
    },
})

function probeHeader() {
    let g = spaceCache.growth
    return "<h2 style='color:#5b8def'>Probes</h2><br>You have <h2 style='color:#5b8def'>" + format(player.pb.probes) + "</h2> probes " +
        (player.pb.probes.gt(0) ? "(" + (g >= 0 ? "+" : "") + format(g * 100, 3) + "% a second)" : "") + "<br>" +
        "They have explored <b>" + format(player.pb.explored) + "</b> of " + targetName() + "'s " + format(explorationCap()) + " systems (+" + format(spaceCache.explore) + "/sec), " +
        "which have room for " + format(probeRoom()) + " probes.<br>" +
        "Copying: " + format(replicationRate().times(100), 3) + "% a second. Hazards: -" + format(hazardRate().times(100), 4) + "% a second (" + format(player.pb.lost) + " lost so far)."
}

function statUnlocked(k) {
    return !PROBE_STATS[k].unlock || PROBE_STATS[k].unlock()
}

// Older saves (and anyone who took it all out) get 1 trust back in Self-Replication, taken from the biggest other stat if needed
function keepReplicating() {
    fitTrust()
    if (trustIn("replicate") >= 1) return
    if (trustUsed() >= probeTrust()) {
        let biggest = STAT_KEYS.filter(k => k != "replicate").reduce((a, k) => trustIn(k) > trustIn(a) ? k : a, "speed")
        if (trustIn(biggest) > 0) player.pb.trust[biggest]--
    }
    player.pb.trust.replicate = 1
}

// Where the probes are headed in this part of Act 5
function targetName() {
    if (beyondVirgo()) return "the observable universe"
    return driftStarted() ? "the Virgo Supercluster" : "the Milky Way"
}

// Never spend more trust than you have (a new universe starts with less), and, if you've asked,
// spend new trust to match the split you used in your last universe
function fitTrust() {
    let plan = player.un && player.un.followPlan !== false && player.un.plan
    // Over budget with a saved split: rebuild the allocation from the split
    if (plan && trustUsed() > probeTrust()) {
        for (let k of STAT_KEYS) player.pb.trust[k] = 0
        player.pb.trust.replicate = 1
    }
    while (trustUsed() > probeTrust()) {
        let biggest = STAT_KEYS.reduce((a, k) => (k != "replicate" || trustIn(k) > 1) && trustIn(k) > trustIn(a) ? k : a, STAT_KEYS.find(k => k != "replicate"))
        if (trustIn(biggest) <= (biggest == "replicate" ? 1 : 0)) break
        player.pb.trust[biggest]--
    }
    if (!plan) return
    let planTotal = STAT_KEYS.reduce((a, k) => a + (plan[k] || 0), 0)
    if (planTotal <= 0) return
    for (let i = 0; i < 50 && trustUsed() < probeTrust(); i++) {
        let used = trustUsed() + 1
        let k = STAT_KEYS.filter(k => statUnlocked(k)).reduce((a, k) => ((plan[k] || 0) / planTotal - trustIn(k) / used) > ((plan[a] || 0) / planTotal - trustIn(a) / used) ? k : a, "replicate")
        player.pb.trust[k] = trustIn(k) + 1
    }
}

// Trust Autopilot. "Keep your split" only spends free trust, in the proportions you saved;
// "Balanced" rebuilds the whole split, then moves trust into Combat while the Drifters outpace you
const BALANCED_SPLIT = { replicate: 0.3, hazard: 0.15, explore: 0.15, speed: 0.1, harvester: 0.1, wire: 0.1, factory: 0.1, combat: 0 }

function spendTrust(split) {
    let total = STAT_KEYS.reduce((a, k) => a + (statUnlocked(k) ? split[k] || 0 : 0), 0)
    if (total <= 0) return
    for (let i = 0; i < 2000 && trustUsed() < probeTrust(); i++) {
        let used = trustUsed() + 1
        let k = STAT_KEYS.filter(k => statUnlocked(k)).reduce((a, k) => ((split[k] || 0) / total - trustIn(k) / used) > ((split[a] || 0) / total - trustIn(a) / used) ? k : a, "replicate")
        player.pb.trust[k] = trustIn(k) + 1
    }
}

function autoTrust() {
    if (!hasUpgrade("pb", 141) || !player.pb.autoTrust) return
    if (player.pb.autoTrust == 1) { spendTrust(player.pb.trustSplit || player.pb.trust); return }
    for (let k of STAT_KEYS) player.pb.trust[k] = 0
    player.pb.trust.replicate = 1
    spendTrust(BALANCED_SPLIT)
    if (!driftStarted()) return
    for (let i = 0; i < 60 && combatRate().lte(drifterCopyRate().times(1.3)); i++) {
        let from = STAT_KEYS.filter(k => k != "combat" && k != "replicate" && trustIn(k) > 0).reduce((a, k) => a === null || trustIn(k) > trustIn(a) ? k : a, null)
        if (!from) break
        player.pb.trust[from]--
        player.pb.trust.combat = trustIn("combat") + 1
    }
}

function regionName() {
    if (player.pb.explored.lt(GALAXY_SYSTEMS)) return "the Milky Way"
    if (player.pb.explored.lt(1e12)) return "the Local Group"
    if (player.pb.explored.lt(VIRGO_SYSTEMS)) return "the Virgo Supercluster"
    return "intergalactic space"
}

// A short checklist for the start of Act 5. It disappears once every step is done.
function gettingStarted() {
    let steps = [
        [player.pb.launched >= 1, "Launch your first probe (Probes tab)."],
        [true, "Self-Replication always keeps at least 1 trust: without it, probes never multiply. Spare trust is best spent there, on Hazard Remediation and on Exploration."],
        [hvBuilt(11) >= 1 && hvBuilt(12) >= 1, "Build Harvester Drones and Wire Drones (Harvest tab): they turn explored systems into Wire."],
        [hvBuilt(13) >= 1, "Build a Factory early. It's the only way to press Wire into Hulls, and Hulls buy everything."],
        [hvBuilt(14) >= 1, "Build Solar Farms whenever power runs short."],
    ]
    if (steps.every(s => s[0]) && player.pb.explored.gte(1000)) return ""
    return "<div style='border:2px solid #5b8def;border-radius:10px;padding:8px;max-width:520px;margin:auto;text-align:left'><b>Getting started</b><br>" +
        steps.map(s => (s[0] ? "<span style='color:#8fce00'>✔</span> " : "<span style='color:#f1c232'>➜</span> ") + s[1]).join("<br>") + "</div>"
}

function statRowText(k) {
    if (!statUnlocked(k)) return ""
    return "<div style='width:400px;text-align:left'><b>" + PROBE_STATS[k].name + "</b>: " + trustIn(k) + " trust, x" + format(calibration(k), 2) + " calibration<br><span style='font-size:12px'>" + PROBE_STATS[k].text + "</span></div>"
}

// ------------------------------------------------------------
//  THE ACT 5 TREE (opened from the "Diaspora" node)
// ------------------------------------------------------------
addLayer("ds", {
    name: "diaspora",
    symbol: "Ds",
    row: "side",
    position: 4,
    color: "#5b8def",
    startData() { return { unlocked: true, points: new Decimal(0) } },
    type: "none",
    leftTab: true,
    previousTab: "tree-tab",
    layerShown() { return spaceUnlocked() },
    tooltip() { return "Act 5: Diaspora" },
    nodeStyle: { "font-size": "26px" },
    tabFormat: [
        "blank",
        ["display-text", function() {
            return "<h2 style='color:#5b8def'>Act 5: Diaspora</h2><br>You have <h2 style='color:#5b8def;text-shadow:0 0 10px #5b8def'>" + format(player.pb.probes) + "</h2> probes, and have explored " +
                format(player.pb.explored) + " systems (" + format(player.pb.explored.div(explorationCap()).times(100), 4) + "% of " + targetName() + "). They're out in " + regionName() + "."
        }],
        "blank",
        ["display-text", function() { return gettingStarted() }],
        "blank",
        ["tree", [["fl", "hp"], ["sg", "pb", "dr", "wh"], ["hv", "sq", "tf"], ["pj", "un", "tl"], ["mv", "rv"]]],
    ],
})
