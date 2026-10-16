// ============================================================
//  ACT 2 BRANCHES
//  Small layers further out on the Life tree. They are modest helpers with something to do
//  while you wait out a wall, and they never reset (they aren't in LIFE_LAYERS).
//
//  Photosynthesis (ph), off Cells:        vent Oxygen into Banded Iron before it overflows
//  Gene Transfer  (gt), off Mutations:    traits you passed on in the draft drift into a gene pool
//  Eggs           (eg), off Reproduction: bigger clutches hatch more, but take much longer
//  Ocean Currents (oc), off Habitats:     the current turns every 30 seconds; Drift makes colonists cheaper
// ============================================================

function branchBonus(kind) {
    let b = new Decimal(1)
    if (!player.ph) return b
    if (kind == "dna") {
        b = b.times(ironEffect())
        b = b.times(cosmicGift("dna"))
        if (hasMilestone("oc", 1)) b = b.times(player.oc.drift.add(10).log10().sqrt())
    }
    if (kind == "capacity" && hasMilestone("ph", 0)) b = b.times(1.25)
    if (kind == "division" && hasMilestone("ph", 3)) b = b.times(1.1)
    if (kind == "births") b = b.times(hatchlingEffect()).times(hasMilestone("eg", 0) ? 1.2 : 1)
    if (kind == "lifespan" && hasMilestone("eg", 2)) b = b.times(1.25)
    return b
}

// ------------------------------------------------------------
//  PHOTOSYNTHESIS. Oxygen builds up on its own. Vent it into Banded Iron before it hits 100%,
//  or the oceans can't hold it and it's lost. The fuller the meter, the more Iron you get.
// ------------------------------------------------------------
function oxygenFillTime() {
    return hasMilestone("ph", 1) ? 45 : 60
}

function ironFromVent() {
    return Math.pow(player.ph.oxygen / 100, 2) * (hasMilestone("eg", 3) ? 1.25 : 1)
}

function ironEffect() {
    return player.ph ? player.ph.iron.add(1).pow(0.15) : new Decimal(1)
}

function ventOxygen() {
    player.ph.iron = player.ph.iron.add(ironFromVent())
    player.ph.vents++
    player.ph.oxygen = 0
}

addLayer("ph", {
    name: "photosynthesis",
    symbol: "Ph",
    row: 10,
    position: 1,
    color: "#b7e34a",
    startData() { return { unlocked: true, points: new Decimal(0), oxygen: 0, iron: new Decimal(0), vents: 0, lost: 0 } },
    type: "none",
    branches: ["c"],
    layerShown() { return lifeUnlocked() && player.mu.best.gte(4) },
    tooltip() { return "Oxygen " + format(player.ph.oxygen, 0) + "%" },
    update(diff) {
        if (!tmp.ph.layerShown) return
        player.ph.oxygen += 100 * diff / oxygenFillTime()
        // A long tick (like offline time) can overshoot, so never vent more than the meter holds
        if (hasMilestone("ph", 2) && player.ph.oxygen >= 75) { player.ph.oxygen = 75; ventOxygen() }
        if (player.ph.oxygen >= 100) { player.ph.oxygen = 0; player.ph.lost++ }
    },
    bars: {
        oxygen: {
            direction: RIGHT,
            width: 300,
            height: 30,
            progress() { return player.ph.oxygen / 100 },
            display() { return "Oxygen: " + format(player.ph.oxygen, 0) + "%" },
            fillStyle() { return { "background-color": player.ph.oxygen > 85 ? "#e74c3c" : "#b7e34a" } },
            textStyle: { color: "white", "text-shadow": "0 0 4px black, 0 0 2px black" },
        },
    },
    clickables: {
        11: {
            title: "Rust the oceans",
            display() { return "Vent your Oxygen into iron for <b>+" + format(ironFromVent(), 3) + "</b> Banded Iron." },
            canClick() { return player.ph.oxygen > 0 },
            onClick() { ventOxygen() },
            style() { return { width: "220px", "min-height": "80px", height: "80px" } },
        },
    },
    milestones: {
        0: { requirementDescription: "5 Banded Iron earned", effectDescription: "Carrying capacity x1.25.", done() { return earned("ph").gte(5) } },
        1: { requirementDescription: "15 Banded Iron earned", effectDescription: "Oxygen fills in 45 seconds instead of 60.", done() { return earned("ph").gte(15) } },
        2: { requirementDescription: "40 Banded Iron earned", effectDescription: "Oxygen vents itself at 75%.", done() { return earned("ph").gte(40) } },
        3: { requirementDescription: "100 Banded Iron earned", effectDescription: "Cells divide 1.1x faster.", done() { return earned("ph").gte(100) } },
    },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#b7e34a'>Photosynthesis</h2><br>You have <h2 style='color:#c0703a'>" + format(player.ph.iron, 2) + "</h2> Banded Iron, multiplying DNA gain by <b>x" + format(ironEffect()) + "</b>."
        }],
        "blank",
        lore("Some cells learned to eat sunlight. They breathed out a poison, oxygen, which rusted the iron in the oceans into red stripes of rock."),
        "blank",
        ["display-text", function() {
            return "Oxygen builds up over " + oxygenFillTime() + " seconds. Vent it into Banded Iron whenever you like: the fuller the meter, the more Iron you get (it goes with the square).<br>" +
                "<b>The Great Oxygenation Event:</b> if Oxygen reaches 100%, it's lost and you get nothing."
        }],
        "blank",
        ["bar", "oxygen"],
        "blank",
        "clickables",
        "blank",
        "milestones",
    ],
})

// ------------------------------------------------------------
//  GENE TRANSFER. Every trait you pass on in the draft drifts into a gene pool.
//  Plasmids build up over time; spend one to pick a trait back up from the pool at half strength.
// ------------------------------------------------------------
const GENE_POOL_SIZE = 5
const BORROW_CAP = 2

function borrowedLevel(id) {
    if (!player.gt || !player.gt.genes) return 0
    return 0.25 * (player.gt.genes[id] || 0)
}

function plasmidTime() {
    let t = 45 * Math.pow(1.12, player.gt.absorbed)
    if (hasMilestone("gt", 1)) t /= 1.5
    return t
}

function passTrait(id) {
    if (!player.gt) return
    player.gt.pool.push(id)
    if (player.gt.pool.length > GENE_POOL_SIZE) player.gt.pool.shift()
}

function canAbsorb(i) {
    let id = player.gt.pool[i]
    return id !== undefined && player.gt.plasmids >= 1 && (player.gt.genes[id] || 0) < BORROW_CAP
}

addLayer("gt", {
    name: "gene transfer",
    symbol: "Gt",
    row: 11,
    position: 0,
    color: "#c38df2",
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        pool: [],
        genes: {},
        plasmids: 0,
        progress: 0,
        absorbed: 0,
    }},
    type: "none",
    branches: ["mu"],
    layerShown() { return lifeUnlocked() && player.mu.best.gte(8) },
    tooltip() { return player.gt.plasmids + " plasmids" },
    update(diff) {
        if (!tmp.gt.layerShown) return
        if (hasMilestone("gt", 2)) {
            let best = -1
            player.gt.pool.forEach((id, i) => { if (canAbsorb(i) && (best < 0 || (player.gt.genes[id] || 0) < (player.gt.genes[player.gt.pool[best]] || 0))) best = i })
            if (best >= 0) layers.gt.clickables[11 + best].onClick()
        }
        let cap = hasMilestone("gt", 3) ? 5 : 3
        if (player.gt.plasmids >= cap) return
        player.gt.progress += diff / plasmidTime()
        if (player.gt.progress >= 1) { player.gt.progress = 0; player.gt.plasmids++ }
    },
    bars: {
        plasmid: {
            direction: RIGHT,
            width: 300,
            height: 20,
            progress() { return player.gt.progress },
            display() { return "Next plasmid: " + formatTime((1 - player.gt.progress) * plasmidTime()) },
            fillStyle: { "background-color": "#c38df2" },
            textStyle: { color: "white", "text-shadow": "0 0 4px black, 0 0 2px black" },
        },
    },
    clickables: Object.fromEntries([0, 1, 2, 3, 4].map(i => [11 + i, {
        title() { let id = player.gt.pool[i]; return id ? TRAITS[id].name : "Empty" },
        display() {
            let id = player.gt.pool[i]
            if (!id) return "Pass on a trait in the draft to fill this slot."
            let have = player.gt.genes[id] || 0
            return TRAITS[id].text + "<br><br>Borrowed: " + have + " / " + BORROW_CAP
        },
        canClick() { return canAbsorb(i) },
        onClick() {
            let id = player.gt.pool[i]
            player.gt.genes[id] = (player.gt.genes[id] || 0) + 1
            player.gt.plasmids--
            player.gt.absorbed++
            player.gt.pool.splice(i, 1)
        },
        style() { return { width: "130px", "min-height": "120px", height: "120px", "font-size": "10px" } },
    }])),
    milestones: {
        0: { requirementDescription: "Absorb 3 traits", effectDescription: "Mutations are 1.25x cheaper.", done() { return player.gt.absorbed >= 3 } },
        1: { requirementDescription: "Absorb 8 traits", effectDescription: "Plasmids form 1.5x faster.", done() { return player.gt.absorbed >= 8 } },
        2: { requirementDescription: "Absorb 12 traits", effectDescription: "Plasmids are spent on their own, on whichever pooled trait you've borrowed least.", done() { return player.gt.absorbed >= 12 } },
        3: { requirementDescription: "Absorb 15 traits", effectDescription: "You can hold 5 plasmids instead of 3.", done() { return player.gt.absorbed >= 15 } },
    },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#c38df2'>Gene Transfer</h2><br>You have <h2 style='color:#c38df2'>" + player.gt.plasmids + "</h2> plasmids (holds " + (hasMilestone("gt", 3) ? 5 : 3) + ")."
        }],
        "blank",
        lore("Bacteria don't only inherit genes. They pass them around, swapping little loops of DNA called plasmids with total strangers."),
        "blank",
        ["display-text", "Every trait you pass on in the draft drifts into the gene pool (the last " + GENE_POOL_SIZE + " are kept).<br>" +
            "Spend a plasmid to pick one back up. A borrowed trait counts as a quarter of a copy, up to " + BORROW_CAP + " of each, on top of the traits you picked."],
        "blank",
        ["bar", "plasmid"],
        "blank",
        "clickables",
        "blank",
        ["display-text", function() {
            let owned = Object.keys(TRAITS).filter(id => player.gt.genes[id] > 0)
            return owned.length ? "<b>Borrowed:</b> " + owned.map(id => TRAITS[id].name + " x" + player.gt.genes[id]).join(", ") : ""
        }],
        "blank",
        "milestones",
    ],
})

// ------------------------------------------------------------
//  EGGS. Lay a clutch, wait for it to incubate, then hatch it. Small clutches are quick,
//  big ones take far longer, so tend small clutches while you play and lay a big one before you leave.
// ------------------------------------------------------------
function clutchSize() {
    return Number(player.eg.size)
}

function incubationTime(size) {
    return 10 * Math.pow(size, 1.5) / (hasMilestone("eg", 1) ? 1.5 : 1)
}

function hatchlingEffect() {
    return player.eg ? player.eg.hatchlings.add(1).pow(0.1) : new Decimal(1)
}

addLayer("eg", {
    name: "eggs",
    symbol: "Eg",
    row: 11,
    position: 3,
    color: "#f2a65a",
    startData() { return { unlocked: true, points: new Decimal(0), size: 1, laid: 0, timer: 0, hatchlings: new Decimal(0), clutches: 0 } },
    type: "none",
    branches: ["re"],
    layerShown() { return lifeUnlocked() && player.re.best.gte(8) },
    tooltip() {
        if (!player.eg.laid) return "No clutch"
        return player.eg.timer >= incubationTime(player.eg.laid) ? "Ready to hatch!" : "Incubating"
    },
    update(diff) {
        if (!tmp.eg.layerShown || !player.eg.laid) return
        player.eg.timer += diff
        if (hasMilestone("eg", 3) && player.eg.timer >= incubationTime(player.eg.laid)) { layers.eg.clickables[12].onClick(); layers.eg.clickables[11].onClick() }
    },
    bars: {
        incubation: {
            direction: RIGHT,
            width: 300,
            height: 30,
            progress() { return player.eg.laid ? player.eg.timer / incubationTime(player.eg.laid) : 0 },
            display() {
                if (!player.eg.laid) return "No clutch laid"
                let left = incubationTime(player.eg.laid) - player.eg.timer
                return left > 0 ? "Hatching in " + formatTime(left) : "Ready to hatch!"
            },
            fillStyle: { "background-color": "#f2a65a" },
            textStyle: { color: "white", "text-shadow": "0 0 4px black, 0 0 2px black" },
        },
    },
    clickables: {
        11: {
            title: "Lay a clutch",
            display() { return "Lay " + clutchSize() + " egg" + (clutchSize() > 1 ? "s" : "") + ". They take " + formatTime(incubationTime(clutchSize())) + " to hatch." },
            canClick() { return !player.eg.laid },
            onClick() { player.eg.laid = clutchSize(); player.eg.timer = 0 },
            style() { return { width: "160px", "min-height": "80px", height: "80px" } },
        },
        12: {
            title: "Hatch",
            display() { return player.eg.laid ? "+" + player.eg.laid + " hatchlings" : "Nothing to hatch" },
            canClick() { return player.eg.laid && player.eg.timer >= incubationTime(player.eg.laid) },
            onClick() {
                player.eg.hatchlings = player.eg.hatchlings.add(player.eg.laid)
                player.eg.clutches++
                player.eg.laid = 0
                player.eg.timer = 0
            },
            style() { return { width: "160px", "min-height": "80px", height: "80px" } },
        },
    },
    milestones: {
        0: { requirementDescription: "25 hatchlings earned", effectDescription: "Births x1.2.", done() { return earned("eg").gte(25) } },
        1: { requirementDescription: "100 hatchlings earned", effectDescription: "Eggs incubate 1.5x faster.", done() { return earned("eg").gte(100) } },
        2: { requirementDescription: "250 hatchlings earned", effectDescription: "Offspring live 1.25x longer.", done() { return earned("eg").gte(250) } },
        3: { requirementDescription: "600 hatchlings earned", effectDescription: "Clutches hatch and are laid again on their own, and Banded Iron vents give 25% more.", done() { return earned("eg").gte(600) } },
    },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#f2a65a'>Eggs</h2><br>You have <h2 style='color:#f2a65a'>" + formatWhole(player.eg.hatchlings) + "</h2> hatchlings, multiplying births by <b>x" + format(hatchlingEffect()) + "</b>."
        }],
        "blank",
        lore("A fish lays thousands of eggs and leaves them to the sea. Most won't make it. Enough will."),
        "blank",
        ["display-text", "<b>Clutch timing:</b> each egg becomes a hatchling, but bigger clutches take much longer (time grows faster than size).<br>Small clutches are best while you're playing; lay a big one before you step away."],
        "blank",
        ["display-text", function() { return "Clutch size: <b>" + clutchSize() + "</b>" }],
        ["slider", ["size", 1, 10]],
        "blank",
        ["bar", "incubation"],
        "blank",
        "clickables",
        "blank",
        "milestones",
    ],
})

// ------------------------------------------------------------
//  OCEAN CURRENTS. The current turns every 30 seconds (North, East, South, West). Your colonized
//  tiles on the side it flows toward gather Drift, which makes colonists cheaper.
//  Steer to hold the current where it is for a while.
// ------------------------------------------------------------
const CURRENT_DIRS = ["North", "East", "South", "West"]
const CURRENT_ARROWS = ["⬆", "➡", "⬇", "⬅"]

function currentDirection() {
    return player.oc.dir
}

function downstream(id, dir) {
    let r = Math.floor(id / 100), c = id % 100
    return [r <= 2, c >= 4, r >= 4, c <= 2][dir]
}

function driftGain() {
    if (!player.hb.unlocked) return new Decimal(0)
    let n = 0
    for (let id in player.hb.grid) if (player.hb.grid[id] && downstream(Number(id), currentDirection())) n++
    let g = new Decimal(0.25 * n)
    if (hasMilestone("oc", 2)) g = g.times(2)
    return g
}

function driftEffect() {
    return player.oc ? player.oc.drift.add(1).pow(0.75) : new Decimal(1)
}

function steerTime() {
    return hasMilestone("oc", 0) ? 90 : 60
}

addLayer("oc", {
    name: "ocean currents",
    symbol: "Oc",
    row: 12,
    position: 3,
    color: "#2fb5c9",
    startData() { return { unlocked: true, points: new Decimal(0), dir: 0, timer: 0, drift: new Decimal(0), held: 0, cooldown: 0 } },
    type: "none",
    branches: ["hb"],
    layerShown() { return lifeUnlocked() && lifeRow3Unlocked() && player.hb.best.gte(4) },
    tooltip() { return CURRENT_ARROWS[player.oc.dir] + " " + format(player.oc.drift) + " Drift" },
    update(diff) {
        if (!tmp.oc.layerShown) return
        player.oc.drift = player.oc.drift.add(driftGain().times(diff))
        player.oc.cooldown = Math.max(0, player.oc.cooldown - diff)
        if (hasMilestone("oc", 4) && layers.oc.clickables[11].canClick() && driftGain().gte(Object.values(player.hb.grid).filter(x => x).length * 0.25 / 2 * (hasMilestone("oc", 2) ? 2 : 1))) layers.oc.clickables[11].onClick()
        if (player.oc.held > 0) { player.oc.held = Math.max(0, player.oc.held - diff); return }
        player.oc.timer += diff
        while (player.oc.timer >= 30) { player.oc.timer -= 30; player.oc.dir = (player.oc.dir + 1) % 4 }
    },
    clickables: {
        11: {
            title: "Steer",
            display() {
                if (player.oc.held > 0) return "Holding " + CURRENT_DIRS[player.oc.dir] + " for " + formatTime(player.oc.held)
                if (player.oc.cooldown > 0) return "Ready in " + formatTime(player.oc.cooldown)
                return "Hold the current where it is for " + steerTime() + " seconds."
            },
            canClick() { return player.oc.cooldown <= 0 && player.oc.held <= 0 },
            onClick() { player.oc.held = steerTime(); player.oc.cooldown = steerTime() + (hasMilestone("oc", 3) ? 60 : 120) },
            style() { return { width: "200px", "min-height": "80px", height: "80px" } },
        },
    },
    milestones: {
        0: { requirementDescription: "100 Drift earned", effectDescription: "Steering holds the current for 90 seconds.", done() { return earned("oc").gte(100) } },
        1: { requirementDescription: "1,000 Drift earned", effectDescription: "Drift also boosts DNA gain a little.", done() { return earned("oc").gte(1000) } },
        2: { requirementDescription: "5,000 Drift earned", effectDescription: "Drift gain x2.", done() { return earned("oc").gte(5000) } },
        3: { requirementDescription: "20,000 Drift earned", effectDescription: "Steering is ready again a minute sooner.", done() { return earned("oc").gte(20000) } },
        4: { requirementDescription: "50,000 Drift earned", effectDescription: "Steer on your own whenever the current flows toward at least half of your tiles.", done() { return earned("oc").gte(50000) } },
    },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#2fb5c9'>Ocean Currents</h2><br>You have <h2 style='color:#2fb5c9'>" + format(player.oc.drift) + "</h2> Drift (+" + format(driftGain()) + "/sec), dividing the DNA colonists need by <b>" + format(driftEffect()) + "</b>."
        }],
        "blank",
        lore("Great rivers run through the sea, carrying warmth, food and drifting larvae thousands of miles from home."),
        "blank",
        ["display-text", function() {
            return "<b>Shifting currents:</b> the current turns every 30 seconds. Each of your colonized tiles on the side it flows toward gathers 0.25 Drift a second.<br><br>" +
                "<h2>" + CURRENT_ARROWS[player.oc.dir] + "</h2><br>Flowing <b>" + CURRENT_DIRS[player.oc.dir] + "</b>" +
                (player.oc.held > 0 ? " (held)" : ", turning in " + formatTime(30 - player.oc.timer))
        }],
        "blank",
        "clickables",
        "blank",
        "milestones",
    ],
})
