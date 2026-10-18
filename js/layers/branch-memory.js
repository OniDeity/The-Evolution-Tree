// ============================================================
//  ACT 6: BRANCH MEMORY
//  Every side branch of Acts 1 to 5 gets two Light upgrades, bought here rather than in the branch:
//  keep its milestones through every Genesis, and make it run faster (up to 5 levels, 1.5x each).
//  Each act's branches open in the Loop that deepens that act.
// ============================================================

const BRANCHES = {
    1: ["nu", "ps", "as", "qf", "ma", "sw", "dm"],
    2: ["ph", "gt", "eg", "oc", "ho", "hs", "te", "se"],
    3: ["ix", "cf", "cv"],
    4: ["tr", "br", "wn"],
    5: ["sg", "wh", "tf"],
}
const BRANCH_LIST = [].concat(...Object.values(BRANCHES))
const BRANCH_ACT = {}
for (let a in BRANCHES) for (let l of BRANCHES[a]) BRANCH_ACT[l] = Number(a)
const BRANCH_SPEED_MAX = 5

function branchesOpen(act) {
    return !!(player.lt && player.lt.genesis >= act)
}

function keepId(l) { return 101 + BRANCH_LIST.indexOf(l) }
function speedId(l) { return 201 + BRANCH_LIST.indexOf(l) }

function branchKept(l) {
    return !!(player.bx && getBuyableAmount("bx", keepId(l)).gte(1))
}

function branchSpeed(l) {
    if (!player.bx || BRANCH_ACT[l] === undefined) return 1
    return Math.pow(1.5, getBuyableAmount("bx", speedId(l)).toNumber())
}

function branchName(l) {
    let n = layers[l].name
    return n.charAt(0).toUpperCase() + n.slice(1)
}

function branchBuyables() {
    let b = {}
    for (let l of BRANCH_LIST) {
        let act = BRANCH_ACT[l]
        b[keepId(l)] = {
            title() { return branchKept(l) ? "Milestones kept" : "Keep milestones" },
            cost() { return new Decimal(10 * act * act) },
            display() { return branchKept(l) ? "Every Genesis keeps them." : "Every Genesis keeps " + branchName(l) + "'s milestones.<br>Cost: " + formatWhole(this.cost()) + " Light" },
            unlocked() { return branchesOpen(act) },
            canAfford() { return !branchKept(l) && player.lt.points.gte(this.cost()) },
            buy() { player.lt.points = player.lt.points.sub(this.cost()); setBuyableAmount("bx", this.id, new Decimal(1)) },
            style() { return { width: "150px", height: "70px", "min-height": "70px", "font-size": "10px", "background-color": branchKept(l) ? "#77bf5f" : undefined } },
        }
        b[speedId(l)] = {
            title() { return "Speed x" + format(branchSpeed(l), 2) },
            cost(x) { return Decimal.pow(2, x).times(5 * act).ceil() },
            display() {
                let n = getBuyableAmount("bx", this.id).toNumber()
                return n >= BRANCH_SPEED_MAX ? "Level " + n + " (max)" : "x1.5 more. Level " + n + " / " + BRANCH_SPEED_MAX + "<br>Cost: " + formatWhole(this.cost()) + " Light"
            },
            unlocked() { return branchesOpen(act) },
            canAfford() { return getBuyableAmount("bx", this.id).lt(BRANCH_SPEED_MAX) && player.lt.points.gte(this.cost()) },
            buy() { player.lt.points = player.lt.points.sub(this.cost()); setBuyableAmount("bx", this.id, getBuyableAmount("bx", this.id).add(1)) },
            style() { return { width: "150px", height: "70px", "min-height": "70px", "font-size": "10px" } },
        }
    }
    return b
}

function branchRows() {
    let rows = []
    for (let a in BRANCHES) {
        rows.push(["display-text", function() { return branchesOpen(Number(a)) ? "<h3>Act " + a + "</h3>" : "<span style='opacity:0.6'>Act " + a + "'s branches open in Loop " + a + ".</span>" }])
        for (let l of BRANCHES[a]) rows.push(["row", [
            ["display-text", function() { return branchesOpen(Number(a)) ? "<div style='width:170px;text-align:right;padding-right:10px'>" + branchName(l) + "</div>" : "" }],
            ["buyable", keepId(l)], ["buyable", speedId(l)],
        ]])
        rows.push("blank")
    }
    return rows
}

// Before a Genesis wipes them, note which kept branches had which milestones
function saveBranchMilestones() {
    let kept = {}
    for (let l of BRANCH_LIST) if (branchKept(l) && player[l] && player[l].milestones) kept[l] = player[l].milestones.slice()
    return kept
}

function restoreBranchMilestones(kept) {
    for (let l in kept) {
        for (let id of kept[l]) if (!player[l].milestones.includes(id)) player[l].milestones.push(id)
        player[l].unlocked = true
    }
}

addLayer("bx", {
    name: "branches",
    symbol: "Br",
    row: 51,
    position: 2,
    color: "#9fd18b",
    startData() { return { unlocked: true, points: new Decimal(0) } },
    type: "none",
    branches: ["lt"],
    layerShown() { return genesisUnlocked() && player.lt.genesis >= 1 },
    tooltip() { return BRANCH_LIST.filter(branchKept).length + " / " + BRANCH_LIST.length + " branches kept" },
    tabFormat: [
        ["display-text", function() { return genesisHeader() }],
        "blank",
        lore("The little side roads remember too: the bursts you learned to catch, the rhythms, the knack."),
        "blank",
        ["display-text", "Every side branch of Acts 1 to 5 has two upgrades here, bought with Light: keep its milestones through every Genesis, and make it run faster (1.5x a level, up to 5 levels, on top of its act's speed). Each act's branches open in the Loop that deepens that act."],
        "blank",
    ].concat(branchRows()),
    buyables: branchBuyables(),
})
