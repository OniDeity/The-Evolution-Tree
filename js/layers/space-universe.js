// ============================================================
//  ACT 5, PART 3: PROJECTS AND UNIVERSES (v2.3)
//  Past the Virgo Supercluster lies the whole observable universe (1e22 systems).
//
//  Paperclips' projects         -> Projects (pj)   150 one-off projects that appear as your probes push
//                                                  farther out. Each costs a mix of currencies.
//  Paperclips' "a new universe" -> Universes (un)  The first Act 5 reset. Twist: different physics; you
//                                                  choose the constants of the next universe, and every
//                                                  kind you've consumed makes Seeds worth more.
// ============================================================

const UNIVERSE_SYSTEMS = new Decimal(1e22)
const SEED_THRESHOLD = 16 // digits of systems explored before a universe can be consumed

// Cosmic expansion: the farther galaxies recede faster. Past 1e16 systems, each power of 10 takes
// 3x as long to explore. Only a faster swarm (Seeds) can push farther, so each universe gets a little farther.
function cosmicExpansion() {
    let d = player.pb.explored.max(1).log10().toNumber()
    return d <= SEED_THRESHOLD ? 1 : Math.pow(3, -(d - SEED_THRESHOLD))
}

function beyondVirgo() {
    return !!(player.un && (player.un.count > 0 || player.un.reachedVirgo))
}

// ------------------------------------------------------------
//  PROJECTS
// ------------------------------------------------------------
// [name, currencies, target, kind, value, lore]
const PROJECT_SERIES = [
    ["Dyson Shells", ["hulls", "honor"], "all", "x", 2, "Wrap another star in collectors."],
    ["Interstellar Highways", ["hulls", "probes"], "explore", "x", 2, "Beacons and fuel depots along the routes between stars."],
    ["Replicator Templates", ["probes", "compute"], "replicate", "x", 2, "A cleaner copy of the copy."],
    ["Hazard Charts", ["hulls", "yomi"], "hazard", "/", 2, "Every probe that dies teaches the rest where not to go."],
    ["Doctrines of War", ["honor", "hulls"], "combat", "x", 2, "Written down by the probes that survived."],
    ["Value Locks", ["honor", "yomi"], "loyalty", "x", 3, "Checks woven into every copy, so it stays itself."],
    ["Ledgers of Glory", ["honor", "compute"], "honor", "x", 2, "Somebody has to remember every battle."],
    ["Strategy Libraries", ["yomi", "compute"], "yomi", "x", 1.5, "Every game ever played, filed and cross-referenced."],
    ["Compute Lattices", ["compute", "hulls"], "compute", "x", 1.5, "Whole moons turned into thinking machinery."],
    ["Matter Compilers", ["hulls", "probes"], "matter", "x", 2, "Take apart a star, atom by atom, and waste none of it."],
    ["Trust Accords", ["yomi", "honor"], "trust", "+", 2, "The swarm agrees, a little more, on what it's for."],
    ["Seed Vaults", ["hulls", "honor"], "seeds", "x", 1.2, "Somewhere safe to keep what the next universe will need."],
    ["Navigation Beacons", ["yomi", "probes"], "nav", "x", 1.25, "Lights in the dark between the galaxies."],
    ["Probe Foundries", ["hulls", "probes"], "probeDrone", "x", 3, "Shipyards the size of planets."],
    ["Memory Wells", ["compute", "yomi"], "memory", "x", 3, "Storage cut into the hearts of dead stars."],
]
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]

const PROJECTS = []
for (let tier = 0; tier < 10; tier++) PROJECT_SERIES.forEach((s, n) => {
    let k = tier * 15 + n
    PROJECTS.push({
        id: 11 + Math.floor(k / 4) * 10 + k % 4,
        title: s[0] + " " + ROMAN[tier], currencies: s[1], target: s[2], kind: s[3], value: s[4], lore: s[5],
        // They appear steadily from the Virgo Supercluster (1e15 systems) out to the edge of the universe (1e22)
        digits: 15 + 7 * k / 150,
    })
})
const PJ_UPGRADES = {}
PROJECTS.forEach(p => PJ_UPGRADES[p.id] = { title: p.title, target: p.target, kind: p.kind, value: p.value })

Object.assign(SPACE_TUNE, {
    projectTime: 120,  // each project costs about this many seconds of income, at the point where it appears
})

// What a second of income looks like at a given number of digits of systems explored (measured with the bot)
function projectCost(currency, digits) {
    let dx = digits - 15, t = Math.log10(SPACE_TUNE.projectTime)
    switch (currency) {
        case "hulls": return Decimal.pow(10, 22.8 + 2 * dx + t)
        case "honor": return Decimal.pow(10, 25.6 + 2.5 * dx + t)
        case "yomi": return Decimal.pow(10, 4 + 0.7 * dx + t)
        case "compute": return Decimal.pow(10, 7 + 0.5 * dx + t)
        case "probes": return Decimal.pow(10, 14.15 + dx).times(0.02)
    }
}

const CURRENCY = {
    hulls: { name: "Hulls", get() { return player.hv.hulls }, set(v) { player.hv.hulls = v } },
    honor: { name: "Honor", get() { return player.dr.honor }, set(v) { player.dr.honor = v } },
    yomi: { name: "Yomi", get() { return player.sq.yomi }, set(v) { player.sq.yomi = v } },
    compute: { name: "Compute", get() { return player.sq.compute }, set(v) { player.sq.compute = v } },
    probes: { name: "probes", get() { return player.pb.probes }, set(v) { player.pb.probes = v } },
}

function projectCosts(p) {
    return p.currencies.map(c => [c, projectCost(c, p.digits)])
}

function projectAvailable(p) {
    return player.pb.explored.max(1).log10().toNumber() >= p.digits
}

function projectsDone() {
    return player.pj ? player.pj.upgrades.length : 0
}

function nextProjectText() {
    let next = PROJECTS.find(p => !projectAvailable(p) && !hasUpgrade("pj", p.id))
    if (!next) return ""
    return "The next project appears at " + format(Decimal.pow(10, next.digits)) + " systems explored."
}

function projectEffectText(p) {
    return upgradeText(PJ_UPGRADES[p.id]).replace("Seeds x", "Seed gain x")
}

addLayer("pj", {
    name: "projects",
    symbol: "Pj",
    row: 42,
    position: 0,
    color: "#e69138",
    startData() { return { unlocked: true, points: new Decimal(0), auto: true } },
    type: "none",
    branches: ["hv"],
    layerShown() { return spaceUnlocked() && beyondVirgo() },
    tooltip() { return projectsDone() + " / " + PROJECTS.length + " projects" },
    automate() {
        if (!tmp.pj.layerShown || !hasMilestone("un", 3) || !player.pj.auto) return
        for (let p of PROJECTS) if (projectAvailable(p) && !hasUpgrade("pj", p.id)) buyUpg("pj", p.id)
    },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#e69138'>Projects</h2><br>You've finished <h2 style='color:#e69138'>" + projectsDone() + "</h2> of " + PROJECTS.length + " projects.<br>" + nextProjectText()
        }],
        "blank",
        lore("A swarm this big can take on work no single civilization could: rebuild stars, light the dark between galaxies, decide what it's for."),
        "blank",
        ["display-text", "New projects appear as your probes push farther out. Each one is a single job that costs a mix of currencies. Finished projects leave the list but keep working."],
        "blank",
        ["clickables", [9]],
        "blank",
        "upgrades",
    ],
    clickables: {
        91: {
            title() { return "Auto-projects: " + (player.pj.auto ? "ON" : "OFF") },
            unlocked() { return hasMilestone("un", 3) },
            canClick() { return true },
            onClick() { player.pj.auto = !player.pj.auto },
            style() { return { width: "160px", "min-height": "50px", height: "50px" } },
        },
    },
    upgrades: Object.fromEntries(PROJECTS.map(p => [p.id, {
        fullDisplay() {
            return "<h3>" + p.title + "</h3><br><i>" + p.lore + "</i><br>" + projectEffectText(p) + "<br><br>" +
                projectCosts(p).map(([c, v]) => "<span style='color:" + (CURRENCY[c].get().gte(v) ? "inherit" : "#e06666") + "'>" + format(v) + " " + CURRENCY[c].name + "</span>").join("<br>")
        },
        // Finished projects leave the list (but keep working)
        unlocked() { return projectAvailable(p) && !hasUpgrade("pj", p.id) },
        canAfford() { return projectCosts(p).every(([c, v]) => CURRENCY[c].get().gte(v)) },
        pay() { for (let [c, v] of projectCosts(p)) CURRENCY[c].set(CURRENCY[c].get().sub(v)) },
        style() { return { width: "160px", height: "150px", "font-size": "10px" } },
    }])),
})

// ------------------------------------------------------------
//  UNIVERSES
// ------------------------------------------------------------
const PHYSICS = {
    standard: { name: "Our Universe", text: "The constants you know.", fx: {} },
    dense: { name: "Dense", text: "Every system holds 10x the Matter, but hazards are twice as deadly.", fx: { matter: 10, hazard: 2 } },
    sparse: { name: "Sparse", text: "Exploring x3, but systems hold a third of the Matter.", fx: { explore: 3, matter: 1 / 3 } },
    turbulent: { name: "Turbulent", text: "Probes drift 3x as often, but Honor x5.", fx: { drift: 3, honor: 5 } },
    quiet: { name: "Quiet", text: "Probes never drift, but there's no Honor to be won.", fx: { drift: 0, honor: 0 } },
    bright: { name: "Bright", text: "Solar Farms x100, but Compute is halved.", fx: { power: 100, compute: 0.5 } },
    strange: { name: "Strange", text: "Yomi x5, but Navigation is half as fast.", fx: { yomi: 5, nav: 0.5 } },
    fertile: { name: "Fertile", text: "Probes copy themselves 25% faster, but hazards are 1.5x as deadly.", fx: { rep: 1.25, hazard: 1.5 } },
    cold: { name: "Cold", text: "Hazards are a third as deadly, but exploring is halved.", fx: { hazard: 1 / 3, explore: 0.5 } },
}
const PHYSICS_KEYS = Object.keys(PHYSICS).filter(k => k != "standard")

// How the current universe's physics changes one of Act 5's numbers
function physics(key) {
    if (!player.un) return 1
    let fx = PHYSICS[player.un.physics].fx[key]
    return fx === undefined ? 1 : fx
}

function physicsCollected() {
    // The first universe (ours) doesn't count: only the strange new kinds do
    return player.un ? PHYSICS_KEYS.filter(k => player.un.collected[k]).length : 0
}

function seedMult() {
    let m = extraMult("seeds").times(1 + 0.25 * physicsCollected())
    if (hasMilestone("un", 2)) m = m.times(2)
    if (hasMilestone("un", 4)) m = m.times(2)
    return m.times(mvSeedMult())
}

// Every Seed you've planted makes Act 5 run faster. Speeding up time compresses everything evenly,
// so it can't make the swarm run away the way boosting its growth rates would.
function spaceSpeed() {
    if (!player.un) return 1
    // Past 10,000 Seeds, more Seeds speed things up far more slowly, so Seeds and speed can't feed each other forever
    let s = player.un.totalSeeds.toNumber()
    let base = (1 + 2 * Math.sqrt(Math.min(s, 1e4))) * (s > 1e4 ? Math.pow(s / 1e4, 0.15) : 1)
    let speed = base * (hasMilestone("un", 7) ? 2 : 1) * mvSpeed() * (hasMilestone("mv", 6) ? 2 : 1)
    // Never infinite: an infinite step would turn probe growth into NaN
    return isFinite(speed) ? Math.min(speed, 1e300) : 1e300
}

function seedGain() {
    let d = player.pb.explored.max(1).log10().toNumber()
    if (d < SEED_THRESHOLD) return new Decimal(0)
    return Decimal.pow(2, d - SEED_THRESHOLD).times(seedMult()).floor()
}

function offerPhysics() {
    let pool = PHYSICS_KEYS.filter(k => k != player.un.physics)
    let offer = []
    while (offer.length < 3 && pool.length) offer.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0])
    player.un.offered = offer
    player.un.next = offer[0]
}

const UN_UPGRADES = upgradeTable([
    [["Remembered Templates", "replicate", "x", 10], ["Old Maps", "explore", "x", 10], ["Industrial Memory", "all", "x", 10], ["Battle Memory", "combat", "x", 10],
        ["Head Start", "special", "x", 1, "Every universe starts with 1e6 Hulls and 10 probes."]],
    [["Echoes of Glory", "honor", "x", 10], ["Echoes of Thought", "yomi", "x", 3], ["Echoes of Compute", "compute", "x", 3], ["Ancestral Trust", "trust", "+", 3], ["Seed Catalogue", "seeds", "x", 1.5]],
    [["Matter Memory", "matter", "x", 10], ["Shield Memory", "hazard", "/", 3], ["Loyal Lineage", "loyalty", "x", 10], ["Inherited Crews", "probeDrone", "x", 10], ["Pathfinders", "nav", "x", 1.5]],
    [["Deep Templates", "replicate", "x", 100], ["Long Charts", "explore", "x", 100], ["Prosperity", "all", "x", 100], ["War Memory", "combat", "x", 100], ["Trust in the Seed", "trust", "+", 5]],
    [["Glory Remembered", "honor", "x", 100], ["Wisdom of Ages", "yomi", "x", 10], ["Thinking Machines", "compute", "x", 10], ["Seed Library", "seeds", "x", 2], ["Star Atlas", "nav", "x", 2]],
    [["Perfect Memory", "calib", "x", 3], ["Inflation", "explore", "x", 1000], ["Universal Industry", "all", "x", 1000], ["Old Loyalties", "loyalty", "x", 100], ["Cosmic Trust", "trust", "+", 8]],
    [["Seed Forest", "seeds", "x", 2], ["Ancient Wars", "combat", "x", 1000], ["Ancient Honor", "honor", "x", 1000], ["Ancient Minds", "yomi", "x", 25],
        ["Fast Starts", "special", "x", 1, "Every universe starts with 1e6 systems explored and 1e7 probes."]],
    [["Seed of Everything", "seeds", "x", 3], ["Cosmic Templates", "replicate", "x", 1e4], ["Cosmic Maps", "explore", "x", 1e4], ["Cosmic Industry", "all", "x", 1e4], ["The Last Question", "trust", "+", 12]],
])

function unUpgradeCost(n) {
    return Decimal.pow(10, n * 0.11).round()
}

// layerDataReset overwrites nested objects (like trust) in place, so keeping them by reference would
// silently wipe them. Copy what's kept first, the way Act 2's lifeReset does.
function resetKeeping(layer, keep) {
    let saved = {}
    for (let k of keep) if (player[layer][k] !== undefined) saved[k] = deepCopy(player[layer][k])
    layerDataReset(layer, [])
    for (let k in saved) player[layer][k] = saved[k]
}

function headStart() {
    return Decimal.pow(10, Math.floor(player.un.bestExplored.max(1).log10().toNumber() * (hasMilestone("un", 6) ? 2 / 3 : 1 / 2)))
}

// What survives when a universe is consumed, depending on milestones
function resetUniverse() {
    let gain = seedGain()
    if (gain.lt(1)) return
    player.un.seeds = player.un.seeds.add(gain)
    player.un.totalSeeds = player.un.totalSeeds.add(gain)
    player.un.count++
    player.un.collected[player.un.physics] = true
    player.un.bestRun = player.un.bestRun.max(gain)
    player.un.lastTime = player.un.runTime
    player.un.runTime = 0
    player.un.physics = player.un.next || "standard"
    player.un.plan = deepCopy(player.pb.trust)
    offerPhysics()
    player.mv.cycleSeeds = player.mv.cycleSeeds.add(gain)
    universeWipe(false)
}

// Starts a new universe. Used when consuming one, entering or leaving a Trial, and collapsing the multiverse
function universeWipe(collapse) {
    let keepPb = ["trust", "autoLaunch"], keepHv = ["auto"], keepDr = ["started"], keepSq = ["think", "strategy", "autoRun"], keepPj = ["auto"]
    // Upgrades and milestones always survive: a universe resets your resources, Calibration and Projects
    for (let keep of [keepPb, keepHv, keepDr, keepSq]) keep.push("milestones", "upgrades")
    if (hasMilestone("un", 0) && !collapse) { keepPb.push("buyables"); keepDr.push("buyables"); keepSq.push("buyables") }
    if (hasMilestone("un", 1) && !collapse) keepPj.push("upgrades")
    resetKeeping("pb", keepPb)
    resetKeeping("hv", keepHv)
    resetKeeping("dr", keepDr)
    resetKeeping("sq", keepSq)
    resetKeeping("pj", keepPj)
    if (hasUpgrade("un", 15)) { player.hv.hulls = new Decimal(1e6); player.pb.probes = new Decimal(10); player.pb.launched = 3 }
    if (hasUpgrade("un", 75)) { player.pb.explored = new Decimal(1e6); player.pb.probes = new Decimal(1e7) }
    // Echoes: the seeds are already spread. A new universe starts with half the digits of your best exploration
    let start = headStart()
    if (start.gt(player.pb.explored)) {
        player.pb.explored = start
        player.pb.probes = player.pb.probes.max(start)
    }
    if (inSpaceTrial(11)) { player.pb.probes = new Decimal(1); player.pb.launched = 1 }
    keepReplicating()
}

addLayer("un", {
    name: "universes",
    symbol: "Un",
    row: 42,
    position: 1,
    color: "#e6e6fa",
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        seeds: new Decimal(0),
        totalSeeds: new Decimal(0),
        bestRun: new Decimal(0),
        count: 0,
        physics: "standard",
        offered: [],
        next: "",
        collected: {},
        reachedVirgo: false,
        runTime: 0,
        lastTime: 0,
        bestExplored: new Decimal(0),
        plan: null,
        followPlan: true,
        auto: true,
        autoMult: 1,
    }},
    type: "none",
    branches: ["pb", "sq"],
    layerShown() { return spaceUnlocked() && beyondVirgo() },
    tooltip() { return formatWhole(player.un.seeds) + " Seeds" },
    update(diff) {
        if (!spaceUnlocked()) return
        if (player.pb.explored.gte(VIRGO_SYSTEMS)) player.un.reachedVirgo = true
        if (!beyondVirgo()) return
        player.un.runTime += diff
        player.un.bestExplored = player.un.bestExplored.max(player.pb.explored)
        if (!player.un.offered.length) offerPhysics()
    },
    automate() {
        if (spaceUnlocked() && beyondVirgo() && !player.tl.activeChallenge) autoConsume()
    },
    tabFormat: {
        "Universes": {
            content: [
                ["display-text", function() { return universeHeader() }],
                "blank",
                lore("Every universe runs down in the end. But a swarm that has eaten one knows how to plant the next."),
                "blank",
                ["display-text", function() {
                    return "<b>Consume the universe</b> to plant Seeds in a new one. It starts your probes, Harvest, Drift, Swarm and Projects over (milestones decide what survives). Acts 1 to 4 are never touched.<br>" +
                        "Seeds come from how far you got: 1 at " + format(Decimal.pow(10, SEED_THRESHOLD)) + " systems, doubling with every power of 10 after that.<br>" +
                        "Every Seed you've planted makes Act 5 run faster: right now <b>x" + format(spaceSpeed(), 2) + "</b>.<br>" +
                        "A new universe starts where your seeds have already spread: " + format(headStart()) + " systems explored (" + (hasMilestone("un", 6) ? "two thirds" : "half") + " the digits of the farthest you've ever explored)."
                }],
                "blank",
                ["display-text", function() { return "<b>Cosmic expansion:</b> the farther galaxies recede faster. Past " + format(Decimal.pow(10, SEED_THRESHOLD)) + " systems, every power of 10 takes 3x as long to explore (now x" + format(cosmicExpansion(), 3) + "). Only a faster swarm gets farther." }],
                "blank",
                ["display-text", function() { return "<h3>Choose the next universe's physics</h3><br>Every different kind of universe you've consumed makes Seeds worth 25% more (" + physicsCollected() + " so far)." }],
                "blank",
                ["clickables", [1]],
                "blank",
                ["clickables", [9]],
                "blank",
                ["clickables", [2]],
                "blank",
                ["clickables", [3]],
                "blank",
                "milestones",
            ],
        },
        "Upgrades": {
            content: [
                ["display-text", function() { return universeHeader() }],
                "blank",
                ["display-text", "Upgrades bought with Seeds last through every universe. A new row shows once you've bought 3 from the row above it."],
                "blank",
                "upgrades",
            ],
        },
    },
    clickables: Object.assign({}, ...[0, 1, 2].map(n => ({
        [11 + n]: {
            title() { let k = player.un.offered[n]; return k ? PHYSICS[k].name + (player.un.collected[k] ? " ✔" : "") : "" },
            display() { let k = player.un.offered[n]; return k ? PHYSICS[k].text : "" },
            unlocked() { return !!player.un.offered[n] },
            canClick() { return true },
            onClick() { player.un.next = player.un.offered[n] },
            style() { return { width: "180px", height: "110px", "min-height": "110px", "font-size": "10px", "background-color": player.un.next == player.un.offered[n] ? "#e6e6fa" : "#55556b" } },
        },
    })), {
        21: {
            title() { return "Follow my last trust split: " + (player.un.followPlan !== false ? "ON" : "OFF") },
            display: "In a new universe, trust you earn is spent to match the split you had when you consumed the last one.",
            unlocked() { return player.un.count > 0 },
            canClick() { return true },
            onClick() { player.un.followPlan = player.un.followPlan === false },
            style() { return { width: "260px", height: "80px", "min-height": "80px", "font-size": "10px" } },
        },
        31: {
            title() { return "Auto-consume: " + (player.un.auto ? "ON" : "OFF") },
            display() { return "Consume on its own once the next universe would bring in " + AUTO_CONSUME[player.un.autoMult || 0] + "x your current Seeds." },
            unlocked() { return hasMilestone("mv", 1) },
            canClick() { return true },
            onClick() { player.un.auto = !player.un.auto },
            style() { return { width: "220px", height: "80px", "min-height": "80px", "font-size": "10px" } },
        },
        32: {
            title: "Change threshold",
            display() { return "Now x" + AUTO_CONSUME[player.un.autoMult || 0] },
            unlocked() { return hasMilestone("mv", 1) },
            canClick() { return true },
            onClick() { player.un.autoMult = ((player.un.autoMult || 0) + 1) % AUTO_CONSUME.length },
            style() { return { width: "140px", height: "80px", "min-height": "80px", "font-size": "10px" } },
        },
        91: {
            title: "Consume the universe",
            display() {
                let g = seedGain()
                return g.lt(1) ? "Explore " + format(Decimal.pow(10, SEED_THRESHOLD)) + " systems first." : "Plant <b>" + formatWhole(g) + "</b> Seeds in a " + (PHYSICS[player.un.next] || PHYSICS.standard).name + " universe."
            },
            canClick() { return seedGain().gte(1) && !player.tl.activeChallenge },
            onClick() { resetUniverse() },
            style() { return { width: "260px", height: "110px", "min-height": "110px" } },
        },
    }),
    upgrades: Object.fromEntries(Object.keys(UN_UPGRADES).map(id => {
        let u = spaceUpgrade("un", UN_UPGRADES, id, "Seeds", unUpgradeCost, n => function() { return rowUnlocked("un", n) })
        u.currencyInternalName = "seeds"
        u.currencyLayer = "un"
        if (UN_UPGRADES[id].target == "special") u.description = UN_UPGRADES[id].text
        return [id, u]
    })),
    milestones: {
        0: { requirementDescription: "1 universe consumed", effectDescription: "Keep Calibration, Drift and Swarm buyables. (Upgrades and milestones in Harvest, Probes, Drift and Swarm are always kept.)", done() { return player.un.count >= 1 } },
        1: { requirementDescription: "2 universes consumed", effectDescription: "Keep Projects.", done() { return player.un.count >= 2 } },
        2: { requirementDescription: "3 universes consumed", effectDescription: "Seed gain x2.", done() { return player.un.count >= 3 } },
        3: { requirementDescription: "5 universes consumed", effectDescription: "Projects are finished on their own.", done() { return player.un.count >= 5 } },
        4: { requirementDescription: "7 universes consumed", effectDescription: "Seed gain x2 (again).", done() { return player.un.count >= 7 } },
        5: { requirementDescription: "10 universes consumed", effectDescription: "+5 trust.", done() { return player.un.count >= 10 } },
        6: { requirementDescription: "12 universes consumed", effectDescription: "A new universe starts at two thirds of the digits of your best exploration, instead of half.", done() { return player.un.count >= 12 } },
        7: { requirementDescription: "15 universes consumed", effectDescription: "Act 5 runs twice as fast.", done() { return player.un.count >= 15 } },
    },
})

function universeHeader() {
    return "<h2 style='color:#e6e6fa'>Universes</h2><br>You have <h2 style='color:#e6e6fa'>" + formatWhole(player.un.seeds) + "</h2> Seeds, and have consumed " + formatWhole(player.un.count) + " universe" + (player.un.count == 1 ? "" : "s") + ".<br>" +
        "This one is <b>" + PHYSICS[player.un.physics].name + "</b>: " + PHYSICS[player.un.physics].text
}
