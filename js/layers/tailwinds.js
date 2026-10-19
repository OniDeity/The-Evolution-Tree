// ============================================================
//  ACT 6: TAILWINDS (v3.5)
//  Every finished act leaves its currency behind with nothing left to buy. In a Loop, spend it on the
//  next act instead: Energy speeds up Life, DNA speeds up Species, Biomass speeds up Extinction and
//  Strata speed up Diaspora. Costs grow in digits, so even a vast pile only buys so much,
//  and a Tailwind never takes more than a tenth of what you have.
//  Tailwinds are bought with this Loop's currencies, so they start over with every Genesis.
// ============================================================

const TAILWINDS = {
    2: { from: "Energy", get() { return player.points }, set(v) { player.points = v }, digits: 40, growth: 1.35 },
    3: { from: "DNA", get() { return player.dna }, set(v) { player.dna = v }, digits: 30, growth: 1.35 },
    4: { from: "Biomass", get() { return player.biomass }, set(v) { player.biomass = v }, digits: 60, growth: 1.3 },
    5: { from: "Strata", get() { return player.ex.points }, set(v) { player.ex.points = v }, base: 5, step: 1.5 },
}
const TAILWIND_MULT = 1.25

function tailwindsUnlocked() {
    return !!(player.lt && player.lt.genesis >= 1)
}

// Energy, DNA and Biomass grow without end, so their costs grow in digits; Strata grow slowly, so theirs just multiply
function tailwindCost(act, n) {
    let t = TAILWINDS[act]
    if (t.digits) return Decimal.pow(10, t.digits * Math.pow(t.growth, n))
    return Decimal.pow(t.step, n).times(t.base)
}

function tailwind(act) {
    if (!player.tw || !TAILWINDS[act]) return 1
    return Math.pow(TAILWIND_MULT, getBuyableAmount("tw", 10 + Number(act)).toNumber())
}

addLayer("tw", {
    name: "tailwinds",
    symbol: "Tw",
    row: 51,
    position: 4,
    color: "#b6e3c6",
    startData() { return { unlocked: true, points: new Decimal(0) } },
    type: "none",
    branches: ["lt"],
    layerShown() { return genesisUnlocked() && tailwindsUnlocked() },
    tooltip() { return "Tailwinds: x" + [2, 3, 4, 5].map(a => format(tailwind(a), 2)).join(" / ") },
    tabFormat: [
        ["display-text", function() { return genesisHeader() }],
        "blank",
        lore("Nothing is wasted. What one age leaves lying around, the next one runs on."),
        "blank",
        ["display-text", "Spend what a finished act leaves behind to make the next act run faster: x" + TAILWIND_MULT + " a level, on top of its Light speed. A Tailwind never takes more than a tenth of what you have. Tailwinds start over with every Genesis."],
        "blank",
        ["display-text", function() {
            let next = [2, 3, 4, 5].find(a => !tmp.tw.buyables[10 + a].unlocked)
            return next ? "<span style='opacity:0.7'>Reach " + ENDINGS.find(e => e.act == next - 1).name + " in this Loop to open the Act " + next + " Tailwind.</span>" : ""
        }],
        "blank",
        "buyables",
    ],
    buyables: Object.fromEntries(Object.keys(TAILWINDS).map(a => [10 + Number(a), {
        title() { return "Act " + a + " Tailwind" },
        cost(x) { return tailwindCost(a, new Decimal(x === undefined ? getBuyableAmount("tw", 10 + Number(a)) : x).toNumber()) },
        display() {
            let t = TAILWINDS[a]
            return "Act " + a + " runs x" + format(tailwind(a), 2) + " as fast.<br>Level " + formatWhole(getBuyableAmount("tw", this.id)) + "<br>Cost: " + format(this.cost()) + " " + t.from + "<br>(needs 10x that on hand; you have " + format(t.get()) + ")"
        },
        unlocked() { return player.lt.endings.includes(ENDINGS.find(e => e.act == a - 1).key) },
        // Never more than a tenth of what you have, so the act it comes from barely notices
        canAfford() { return TAILWINDS[a].get().gte(this.cost().times(10)) },
        buy() {
            let t = TAILWINDS[a]
            t.set(t.get().sub(this.cost()).max(0))
            setBuyableAmount("tw", this.id, getBuyableAmount("tw", this.id).add(1))
        },
        buyMax() { for (let i = 0; i < 100 && this.canAfford(); i++) this.buy() },
        style() { return { width: "180px", height: "130px" } },
    }])),
})
