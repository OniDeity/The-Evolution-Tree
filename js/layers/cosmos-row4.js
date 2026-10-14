// ============================================================
//  ACT 1 ROW 4 (optional bonus content, unlocked by the Habitable Zone)
//  The Prestige Tree's next row, retold. Act 1 is over by now, so these layers don't use row resets
//  (a reset could take away the Habitable Zone). They keep the universe evolving alongside life,
//  and each one sends a small gift to the later acts.
//
//  Quantum Fluctuations (qf)  <- Magic:          Twist: uncertainty; a spell is strong and brief, or weak and long
//  Matter vs. Antimatter (ma) <- Balance:        Twist: what's left after they annihilate decides your reward
//  Stellar Winds        (sw)  <- Solarity:       Twist: the solar cycle; flares tear sails left out at solar maximum
//  Dark Matter Halos    (dm)  <- Phantom Souls:  Twist: invisible mass; weigh each halo in as few guesses as you can
//
//  Plus two side layers: the Observatory (ob), a museum of discoveries, and the Star Log (sl), statistics.
// ============================================================

function row4Unlocked() {
    return hasUpgrade("pl", 23)
}

// How much the universe has to work with: grows slowly with energy
function cosmicScale() {
    return player.points.add(10).log10().div(100)
}

// Row 4's own resources all grow faster with Light and Wind
function row4Speed() {
    return lightEffect().quanta.times(windEffect().row4)
}

// Gifts to the later acts (and to energy)
function cosmicGift(kind) {
    let b = new Decimal(1)
    if (!player.qf || !row4Unlocked()) return b
    if (kind == "energy") b = b.times(spellEffect("vacuum")).times(lightEffect().energy).times(windEffect().energy)
    if (kind == "dna") b = b.times(spellEffect("tunneling")).times(matterEffect())
    if (kind == "biomass") b = b.times(spellEffect("pairs")).times(antimatterEffect())
    if (kind == "tiers") b = b.times(darkMatterEffect())
    return b
}

// ------------------------------------------------------------
//  QUANTUM FLUCTUATIONS. Quanta build up on their own. Spend them on spells.
//  Uncertainty: before you cast, choose to pin down the strength (x1.5 for 45 seconds)
//  or the duration (x1.15 for 10 minutes). You can't have both.
// ------------------------------------------------------------
const SPELLS = {
    vacuum: { name: "Vacuum Energy", text: "Energy gain", id: 11 },
    tunneling: { name: "Quantum Tunneling", text: "DNA gain", id: 12 },
    pairs: { name: "Virtual Pairs", text: "Biomass gain", id: 13 },
}

function spellCost() {
    return new Decimal(250).div(hasMilestone("qf", 1) ? 1.5 : 1)
}

function spellPower(mode) {
    let p = mode == "strength" ? 1.5 : 1.15
    if (hasMilestone("qf", 2)) p = 1 + (p - 1) * 1.5
    return p
}

function spellLength(mode) {
    return mode == "strength" ? 45 : 600
}

function spellEffect(id) {
    if (!player.qf) return new Decimal(1)
    let s = player.qf.spells[id]
    return s && s.time > 0 ? new Decimal(s.power) : new Decimal(1)
}

function quantaGain() {
    return cosmicScale().times(0.5).times(row4Speed())
}

addLayer("qf", {
    name: "quantum fluctuations",
    symbol: "QF",
    row: 4,
    position: 0,
    color: "#7fffd4",
    startData() { return { unlocked: true, points: new Decimal(0), mode: "strength", spells: {}, casts: 0 } },
    type: "none",
    branches: ["de"],
    doReset() {},
    layerShown() { return row4Unlocked() },
    tooltip() { return format(player.qf.points) + " Quanta" },
    update(diff) {
        if (!row4Unlocked()) return
        let cap = hasMilestone("qf", 0) ? 2500 : 1000
        player.qf.points = player.qf.points.add(quantaGain().times(diff)).min(cap)
        for (let id in player.qf.spells) player.qf.spells[id].time = Math.max(0, player.qf.spells[id].time - diff)
        if (hasMilestone("qf", 3)) for (let key in SPELLS) {
            let s = player.qf.spells[key]
            if ((!s || s.time <= 0) && layers.qf.clickables[SPELLS[key].id].canClick()) layers.qf.clickables[SPELLS[key].id].onClick()
        }
    },
    clickables: Object.assign({
        91: {
            title() { return "Measuring: " + (player.qf.mode == "strength" ? "Strength" : "Duration") },
            display() { return player.qf.mode == "strength" ? "Spells are strong and brief: x" + format(spellPower("strength"), 2) + " for 45 seconds." : "Spells are weak and long: x" + format(spellPower("duration"), 2) + " for 10 minutes." },
            canClick() { return true },
            onClick() { player.qf.mode = player.qf.mode == "strength" ? "duration" : "strength" },
            style() { return { width: "260px", "min-height": "70px", height: "70px" } },
        },
    }, ...Object.entries(SPELLS).map(([key, sp]) => ({
        [sp.id]: {
            title: sp.name,
            display() {
                let s = player.qf.spells[key]
                let now = s && s.time > 0 ? "<br>Active: x" + format(s.power, 2) + " for " + formatTime(s.time) : ""
                return sp.text + " x" + format(spellPower(player.qf.mode), 2) + " for " + formatTime(spellLength(player.qf.mode)) + "<br>Cost: " + format(spellCost()) + " Quanta" + now
            },
            canClick() { return player.qf.points.gte(spellCost()) },
            onClick() {
                player.qf.points = player.qf.points.sub(spellCost())
                player.qf.spells[key] = { power: spellPower(player.qf.mode), time: spellLength(player.qf.mode) }
                player.qf.casts++
            },
            style() { return { width: "150px", "min-height": "120px", height: "120px" } },
        },
    }))),
    milestones: {
        0: { requirementDescription: "Cast 10 spells", effectDescription: "You can hold 2,500 Quanta instead of 1,000.", done() { return player.qf.casts >= 10 } },
        1: { requirementDescription: "Cast 30 spells", effectDescription: "Spells cost 1.5x less.", done() { return player.qf.casts >= 30 } },
        2: { requirementDescription: "Cast 100 spells", effectDescription: "Spells are 50% stronger.", done() { return player.qf.casts >= 100 } },
        3: { requirementDescription: "Cast 200 spells", effectDescription: "Spells recast themselves when they run out (if you have the Quanta), measured the way you've chosen.", done() { return player.qf.casts >= 200 } },
    },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#7fffd4'>Quantum Fluctuations</h2><br>You have <h2 style='color:#7fffd4'>" + format(player.qf.points) + "</h2> Quanta (+" + format(quantaGain()) + "/sec, holds " + (hasMilestone("qf", 0) ? "2,500" : "1,000") + ")."
        }],
        "blank",
        lore("Empty space isn't empty. Particles flicker in and out of existence, borrowing energy they have to pay back almost at once."),
        "blank",
        ["display-text", "<b>Uncertainty:</b> you can know a spell's strength or its duration, never both. Choose which to measure before you cast."],
        "blank",
        ["clickables", [9]],
        "blank",
        ["clickables", [1]],
        "blank",
        "milestones",
    ],
})

// ------------------------------------------------------------
//  MATTER VS. ANTIMATTER. Pairs of particles are made all the time. The slider sets how many are
//  matter and how many antimatter. Where they meet they annihilate into Light; what's left over stays.
// ------------------------------------------------------------
function pairGain() {
    return cosmicScale().times(row4Speed())
}

function matterEffect() {
    return player.ma ? player.ma.matter.add(1).pow(0.04) : new Decimal(1)
}

function antimatterEffect() {
    return player.ma ? player.ma.antimatter.add(1).pow(0.06) : new Decimal(1)
}

function lightEffect() {
    if (!player.ma) return { energy: new Decimal(1), quanta: new Decimal(1) }
    let l = player.ma.light.add(1)
    return { energy: l.pow(0.5), quanta: l.pow(0.1) }
}

addLayer("ma", {
    name: "matter vs antimatter",
    symbol: "MA",
    row: 4,
    position: 1,
    color: "#f7f7f7",
    startData() { return { unlocked: true, points: new Decimal(0), asym: 50, matter: new Decimal(0), antimatter: new Decimal(0), light: new Decimal(0) } },
    type: "none",
    branches: ["hz"],
    doReset() {},
    layerShown() { return row4Unlocked() },
    tooltip() { return format(player.ma.light) + " Light" },
    update(diff) {
        if (!row4Unlocked()) return
        let share = Number(player.ma.asym) / 100
        let made = pairGain().times(diff)
        let m = made.times(share), a = made.times(1 - share)
        // Each new particle first meets its opposite from whatever is left over
        let hitA = m.min(player.ma.antimatter); player.ma.antimatter = player.ma.antimatter.sub(hitA); m = m.sub(hitA)
        let hitM = a.min(player.ma.matter); player.ma.matter = player.ma.matter.sub(hitM); a = a.sub(hitM)
        let pairs = m.min(a)
        player.ma.light = player.ma.light.add(pairs.add(hitA).add(hitM))
        player.ma.matter = player.ma.matter.add(m.sub(pairs))
        player.ma.antimatter = player.ma.antimatter.add(a.sub(pairs))
    },
    tabFormat: [
        ["display-text", function() {
            return "<h2>Matter vs. Antimatter</h2><br>" +
                "<span style='color:#ffd27f'><b>" + format(player.ma.matter) + "</b> Matter</span>: DNA gain x" + format(matterEffect()) + "<br>" +
                "<span style='color:#ff7fd4'><b>" + format(player.ma.antimatter) + "</b> Antimatter</span>: Biomass gain x" + format(antimatterEffect()) + "<br>" +
                "<span style='color:#ffffff'><b>" + format(player.ma.light) + "</b> Light</span>: energy x" + format(lightEffect().energy) + ", Quanta and pairs x" + format(lightEffect().quanta)
        }],
        "blank",
        lore("The Big Bang made matter and antimatter in almost equal amounts. Almost. For every billion pairs that annihilated, one particle of matter was left over, and that's what everything is made of."),
        "blank",
        ["display-text", function() {
            let s = Number(player.ma.asym)
            return "<b>Asymmetry:</b> " + s + "% matter, " + (100 - s) + "% antimatter (" + format(pairGain()) + " particles/sec).<br>" +
                "Matter and antimatter annihilate into Light. Only the surplus of one side survives."
        }],
        ["slider", ["asym", 0, 100]],
    ],
})

// ------------------------------------------------------------
//  STELLAR WINDS. Sails catch the solar wind, which rises and falls over a 2 minute solar cycle.
//  Near solar maximum, flares tear a quarter of your sails unless you furl them.
// ------------------------------------------------------------
const SOLAR_CYCLE = 120

function solarActivity() {
    return 0.5 - 0.5 * Math.cos(2 * Math.PI * player.sw.cycle / SOLAR_CYCLE)
}

function solarMax() {
    return solarActivity() > 0.85
}

function windGain() {
    if (player.sw.furled) return new Decimal(0)
    return getBuyableAmount("sw", 11).add(1).times(solarActivity() + 0.1).times(cosmicScale()).times(hasMilestone("sw", 0) ? 2 : 1)
}

function windEffect() {
    if (!player.sw) return { energy: new Decimal(1), row4: new Decimal(1) }
    let w = player.sw.wind.add(1)
    return { energy: w.pow(0.5), row4: w.log10().div(4).add(1) }
}

addLayer("sw", {
    name: "stellar winds",
    symbol: "SW",
    row: 4,
    position: 2,
    color: "#ffcc66",
    startData() { return { unlocked: true, points: new Decimal(0), wind: new Decimal(0), cycle: 0, furled: false, flare: 0, torn: 0 } },
    type: "none",
    branches: ["ga"],
    doReset() {},
    layerShown() { return row4Unlocked() },
    tooltip() { return solarMax() ? "Solar maximum!" : format(player.sw.wind) + " Wind" },
    update(diff) {
        if (!row4Unlocked()) return
        player.sw.cycle = (player.sw.cycle + diff) % SOLAR_CYCLE
        player.sw.wind = player.sw.wind.add(windGain().times(diff))
        player.sw.flare = Math.max(0, player.sw.flare - diff)
        // Flares: about one every 8 seconds near solar maximum
        if (solarMax() && Math.random() < diff / 8) {
            player.sw.flare = 3
            if (!player.sw.furled && getBuyableAmount("sw", 11).gte(1) && !hasMilestone("sw", 2)) {
                let lost = getBuyableAmount("sw", 11).div(4).ceil()
                setBuyableAmount("sw", 11, getBuyableAmount("sw", 11).sub(lost))
                player.sw.torn += lost.toNumber()
            }
        }
    },
    bars: {
        cycle: {
            direction: RIGHT,
            width: 300,
            height: 30,
            progress() { return solarActivity() },
            display() { return player.sw.flare > 0 ? "☀ FLARE ☀" : solarMax() ? "Solar maximum" : "Solar activity " + format(solarActivity() * 100, 0) + "%" },
            fillStyle() { return { "background-color": solarMax() ? "#ff5533" : "#ffcc66" } },
            textStyle: { color: "white", "text-shadow": "0 0 4px black, 0 0 2px black" },
        },
    },
    buyables: {
        11: {
            title: "Solar Sail",
            cost() { return Decimal.pow(1.5, getBuyableAmount(this.layer, this.id)).times(10) },
            display() { return "Catch more wind.<br><br>Sails: " + formatWhole(getBuyableAmount(this.layer, this.id)) + "<br>Cost: " + format(this.cost()) + " Wind" },
            canAfford() { return player.sw.wind.gte(this.cost()) },
            buy() {
                if (!this.canAfford()) return
                player.sw.wind = player.sw.wind.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
    clickables: {
        11: {
            title() { return player.sw.furled ? "Unfurl the sails" : "Furl the sails" },
            display() { return player.sw.furled ? "Sails are furled: safe from flares, but catching nothing." : "Sails are out, catching wind. Flares near solar maximum will tear them." },
            canClick() { return true },
            onClick() { player.sw.furled = !player.sw.furled },
            style() { return { width: "200px", "min-height": "90px", height: "90px", "background-color": player.sw.furled ? "#8a6d2f" : "#ffcc66" } },
        },
    },
    milestones: {
        0: { requirementDescription: "10 sails", effectDescription: "Wind gain x2.", done() { return getBuyableAmount("sw", 11).gte(10) } },
        1: { requirementDescription: "1e6 Wind", effectDescription: "Sails are bought automatically.", done() { return player.sw.wind.gte(1e6) } },
        2: { requirementDescription: "25 sails", effectDescription: "Your sails are tough enough to ride out flares.", done() { return getBuyableAmount("sw", 11).gte(25) } },
    },
    automate() {
        if (hasMilestone("sw", 1)) for (let i = 0; i < 10 && layers.sw.buyables[11].canAfford(); i++) layers.sw.buyables[11].buy()
    },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#ffcc66'>Stellar Winds</h2><br>You have <h2 style='color:#ffcc66'>" + format(player.sw.wind) + "</h2> Wind (+" + format(windGain()) + "/sec), multiplying energy by x" + format(windEffect().energy) + " and Quanta and pairs by x" + format(windEffect().row4) + "."
        }],
        "blank",
        lore("Stars blow a wind of charged particles out into space. Ride it, and you can sail between worlds."),
        "blank",
        ["display-text", "<b>The solar cycle:</b> the wind rises and falls every 2 minutes. Near solar maximum, flares tear a quarter of any sails left out. Furl them to stay safe, or gamble on the extra wind."],
        "blank",
        ["bar", "cycle"],
        "blank",
        "clickables",
        "blank",
        "buyables",
        "blank",
        "milestones",
    ],
})

// ------------------------------------------------------------
//  DARK MATTER HALOS. Every halo hides its mass (1 to 100). Guess it: lensing tells you heavier or lighter.
//  Find it in fewer guesses for more Dark Matter. A new halo drifts into view every minute.
// ------------------------------------------------------------
function darkMatterEffect() {
    return player.dm ? player.dm.dark.add(1).pow(0.02) : new Decimal(1)
}

function newHalo() {
    player.dm.mass = 1 + Math.floor(Math.random() * 100)
    player.dm.lo = 1
    player.dm.hi = 100
    player.dm.guesses = 0
    player.dm.found = false
    player.dm.guess = 50
    player.dm.hint = ""
}

function haloReward() {
    return Math.max(1, 10 - player.dm.guesses) * (hasMilestone("dm", 1) ? 2 : 1)
}

addLayer("dm", {
    name: "dark matter halos",
    symbol: "DM",
    row: 4,
    position: 3,
    color: "#6c5b9e",
    startData() { return { unlocked: true, points: new Decimal(0), dark: new Decimal(0), mass: 0, lo: 1, hi: 100, guess: 50, guesses: 0, found: true, hint: "", timer: 0, weighed: 0 } },
    type: "none",
    branches: ["bh"],
    doReset() {},
    layerShown() { return row4Unlocked() },
    tooltip() { return player.dm.found ? "Next halo soon" : "A halo to weigh!" },
    update(diff) {
        if (!row4Unlocked()) return
        if (!player.dm.found) {
            if (!hasMilestone("dm", 2)) return
            player.dm.auto = (player.dm.auto || 0) + diff
            if (player.dm.auto >= 1) { player.dm.auto = 0; layers.dm.clickables[21].onClick() }
            return
        }
        player.dm.timer -= diff
        if (player.dm.timer <= 0) newHalo()
    },
    clickables: {
        11: { title: "-10", canClick() { return !player.dm.found }, onClick() { player.dm.guess = Math.max(1, Number(player.dm.guess) - 10) }, style: { width: "60px", "min-height": "50px", height: "50px" } },
        12: { title: "-1", canClick() { return !player.dm.found }, onClick() { player.dm.guess = Math.max(1, Number(player.dm.guess) - 1) }, style: { width: "60px", "min-height": "50px", height: "50px" } },
        13: { title: "+1", canClick() { return !player.dm.found }, onClick() { player.dm.guess = Math.min(100, Number(player.dm.guess) + 1) }, style: { width: "60px", "min-height": "50px", height: "50px" } },
        14: { title: "+10", canClick() { return !player.dm.found }, onClick() { player.dm.guess = Math.min(100, Number(player.dm.guess) + 10) }, style: { width: "60px", "min-height": "50px", height: "50px" } },
        21: {
            title() { return "Weigh it: " + player.dm.guess },
            display() { return player.dm.found ? "Waiting for the next halo (" + formatTime(Math.max(0, player.dm.timer)) + ")" : "Guess " + (player.dm.guesses + 1) + ". Find it now for " + haloReward() + " Dark Matter." },
            canClick() { return !player.dm.found },
            onClick() {
                let g = Number(player.dm.guess)
                player.dm.guesses++
                if (g == player.dm.mass) {
                    player.dm.dark = player.dm.dark.add(haloReward())
                    player.dm.hint = "Found it! The halo weighs " + g + "."
                    player.dm.found = true
                    player.dm.weighed++
                    player.dm.timer = hasMilestone("dm", 0) ? 30 : 60
                    return
                }
                if (g < player.dm.mass) { player.dm.lo = Math.max(player.dm.lo, g + 1); player.dm.hint = g + " is too light. Heavier!" }
                else { player.dm.hi = Math.min(player.dm.hi, g - 1); player.dm.hint = g + " is too heavy. Lighter!" }
                player.dm.guess = Math.floor((player.dm.lo + player.dm.hi) / 2)
            },
            style() { return { width: "220px", "min-height": "80px", height: "80px" } },
        },
    },
    milestones: {
        0: { requirementDescription: "Weigh 5 halos", effectDescription: "A new halo arrives every 30 seconds.", done() { return player.dm.weighed >= 5 } },
        1: { requirementDescription: "Weigh 20 halos", effectDescription: "Halos give twice as much Dark Matter.", done() { return player.dm.weighed >= 20 } },
        2: { requirementDescription: "Weigh 50 halos", effectDescription: "Halos are weighed on their own, one guess a second.", done() { return player.dm.weighed >= 50 } },
    },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#9d8cd6'>Dark Matter Halos</h2><br>You have <h2 style='color:#9d8cd6'>" + formatWhole(player.dm.dark) + "</h2> Dark Matter, making every Act 3 species tier x" + format(darkMatterEffect(), 3) + " stronger."
        }],
        "blank",
        lore("Galaxies spin too fast for what we can see in them. Something invisible, five times heavier than everything else, holds them together."),
        "blank",
        ["display-text", function() {
            if (player.dm.found && player.dm.mass == 0) return "<b>Invisible mass:</b> each halo hides a mass from 1 to 100. Weigh it by guessing; lensing tells you heavier or lighter. Fewer guesses give more Dark Matter.<br><i>The first halo is on its way.</i>"
            return "<b>Invisible mass:</b> each halo hides a mass from 1 to 100. Weigh it by guessing; lensing tells you heavier or lighter. Fewer guesses give more Dark Matter.<br><br>" +
                (player.dm.found ? player.dm.hint : "It's somewhere from <b>" + player.dm.lo + "</b> to <b>" + player.dm.hi + "</b>. " + player.dm.hint)
        }],
        "blank",
        ["slider", ["guess", 1, 100]],
        ["clickables", [1]],
        ["clickables", [2]],
        "blank",
        "milestones",
    ],
})

// ------------------------------------------------------------
//  THE OBSERVATORY. A museum of discoveries from Act 1.
// ------------------------------------------------------------
const DISCOVERIES = [
    { name: "Cosmic Microwave Background", year: "1964", lore: "The afterglow of the Big Bang, still everywhere, found by accident as static in a radio antenna.", hint: "Unlock Atoms or Gravity.",
      done() { return player.at.unlocked || player.gr.unlocked } },
    { name: "Pillars of Creation", year: "1995", lore: "Towers of gas and dust light-years tall, with new stars being born inside.", hint: "Have 10 stars.",
      done() { return player.st.points.gte(10) } },
    { name: "Crab Nebula", year: "1054", lore: "The wreck of a supernova that was bright enough to see by day, nearly a thousand years ago.", hint: "Go Supernova.",
      done() { return player.st.heavy.gt(0) } },
    { name: "Proxima Centauri", year: "1915", lore: "The nearest star to the Sun. Its light takes four years to get here.", hint: "Unlock Fusion.",
      done() { return player.fu.unlocked } },
    { name: "The Great Red Spot", year: "1831", lore: "A storm on Jupiter bigger than the Earth, raging for centuries.", hint: "Have 5 planets.",
      done() { return player.pl.points.gte(5) } },
    { name: "Pale Blue Dot", year: "1990", lore: "Earth from six billion kilometres away: one pixel, and everyone who ever lived.", hint: "Buy the Habitable Zone.",
      done() { return hasUpgrade("pl", 23) } },
    { name: "Andromeda", year: "964", lore: "The nearest big galaxy, a smudge in the sky that turned out to be a trillion stars.", hint: "Form a galaxy.",
      done() { return player.ga.points.gte(1) } },
    { name: "Sagittarius A*", year: "1974", lore: "The black hole at the centre of our galaxy, four million times the mass of the Sun.", hint: "Have 3 black holes.",
      done() { return player.bh.points.gte(3) } },
    { name: "SN 1987A", year: "1987", lore: "A supernova next door. Two dozen of its neutrinos were caught in tanks of water under the ground.", hint: "Catch 100 neutrinos.",
      done() { return player.nu.caught.gte(100) } },
    { name: "LGM-1", year: "1967", lore: "The first pulsar. Its signal was so regular it was jokingly named Little Green Men 1.", hint: "Reach a pulsar streak of 15.",
      done() { return player.ps.best >= 15 } },
    { name: "Ceres", year: "1801", lore: "The biggest thing in the asteroid belt. It was called a planet for 50 years.", hint: "Have 100 ore.",
      done() { return player.as.ore.gte(100) } },
    { name: "Hubble Deep Field", year: "1995", lore: "A tiny patch of empty sky, stared at for ten days. It was full of galaxies.", hint: "Survive every Cosmic Hazard.",
      done() { return [11, 12, 21, 22, 31, 32].every(id => hasChallenge("hz", id)) } },
    { name: "Quasar 3C 273", year: "1963", lore: "A galaxy's core shining brighter than a trillion suns.", hint: "Cast 10 spells.",
      done() { return player.qf.casts >= 10 } },
    { name: "The Positron", year: "1932", lore: "The first antimatter ever seen: a particle like an electron, curving the wrong way.", hint: "Make 1,000 Light.",
      done() { return player.ma.light.gte(1000) } },
    { name: "Voyager 1", year: "2012", lore: "The first thing we built to leave the Sun's wind behind and drift into the space between the stars.", hint: "Have 10 sails.",
      done() { return getBuyableAmount("sw", 11).gte(10) } },
    { name: "The Bullet Cluster", year: "2006", lore: "Two galaxy clusters colliding, with their invisible mass caught passing straight through.", hint: "Weigh 5 dark matter halos.",
      done() { return player.dm.weighed >= 5 } },
]

function discoveriesMade() {
    return player.ob ? player.ob.achievements.length : 0
}

function observatoryBonus() {
    let b = new Decimal(1 + 0.05 * discoveriesMade())
    if (discoveriesMade() >= DISCOVERIES.length) b = b.times(2)
    return b
}

addLayer("ob", {
    name: "observatory",
    symbol: "Ob",
    row: 19,
    position: 5,
    color: "#5d8ac9",
    startData() { return { unlocked: true, points: new Decimal(0) } },
    type: "none",
    doReset() {},
    layerShown() { return player.at.unlocked || player.gr.unlocked },
    nodeStyle: { width: "70px", height: "70px", "font-size": "22px" },
    tooltip() { return discoveriesMade() + " / " + DISCOVERIES.length + " discoveries" },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#5d8ac9'>Observatory</h2><br>You've made <h2 style='color:#5d8ac9'>" + discoveriesMade() + "</h2> of " + DISCOVERIES.length + " discoveries, multiplying energy by <b>" + format(observatoryBonus()) + "x</b>.<br>" +
                "Each discovery adds 5% to energy gain, and all of them double it."
        }],
        "blank",
        "achievements",
        "blank",
        ["display-text", function() {
            let found = DISCOVERIES.filter((f, n) => hasAchievement("ob", 11 + Math.floor(n / 4) * 10 + n % 4))
            if (!found.length) return "<i>Nothing in the logbook yet.</i>"
            return "<h3>The Logbook</h3><br>" + found.map(f => "<b>" + f.name + "</b> <i>(" + f.year + ")</i>: " + f.lore).join("<br>")
        }],
    ],
    achievements: Object.assign({}, ...DISCOVERIES.map((f, n) => ({
        [11 + Math.floor(n / 4) * 10 + n % 4]: {
            name: f.name,
            done() { return f.done() },
            tooltip() { return hasAchievement("ob", this.id) ? f.year + ". " + f.lore : f.hint },
            style() { return hasAchievement("ob", this.id) ? { "background-color": "#5d8ac9" } : {} },
        },
    }))),
})

// ------------------------------------------------------------
//  STAR LOG. Statistics for Act 1.
// ------------------------------------------------------------
addLayer("sl", {
    name: "star log",
    symbol: "Log",
    row: 19,
    position: 6,
    color: "#9fb4c7",
    startData() { return { unlocked: true, points: new Decimal(0), time: 0, bestEnergy: new Decimal(0) } },
    type: "none",
    doReset() {},
    layerShown() { return player.at.unlocked || player.gr.unlocked },
    nodeStyle: { width: "70px", height: "70px", "font-size": "18px" },
    tooltip() { return "Star Log" },
    update(diff) {
        player.sl.time += diff
        player.sl.bestEnergy = player.sl.bestEnergy.max(player.points)
    },
    tabFormat: [
        ["display-text", function() {
            let rows = [
                ["Time since the Big Bang", formatTime(player.sl.time)],
                ["Most energy at once", format(player.sl.bestEnergy)],
                ["Most particles", format(player.p.best)],
                ["Most atoms", formatWhole(player.at.best)],
                ["Most stars", formatWhole(player.st.best)],
                ["Heavy Elements", format(player.st.heavy)],
                ["Most planets", formatWhole(player.pl.best)],
                ["Most galaxies", formatWhole(player.ga.best)],
                ["Most black holes", formatWhole(player.bh.best)],
                ["Cosmic Hazards survived", [11, 12, 21, 22, 31, 32].filter(id => hasChallenge("hz", id)).length + " / 6"],
                ["Neutrinos caught", formatWhole(player.nu.caught)],
                ["Best pulsar streak", formatWhole(player.ps.best)],
                ["Spells cast", formatWhole(player.qf.casts)],
                ["Halos weighed", formatWhole(player.dm.weighed)],
                ["Discoveries", discoveriesMade() + " / " + DISCOVERIES.length],
            ]
            return "<h2 style='color:#9fb4c7'>Star Log</h2><br><br><table style='margin:auto;text-align:left;border-spacing:12px 4px'>" +
                rows.map(r => "<tr><td>" + r[0] + "</td><td><b>" + r[1] + "</b></td></tr>").join("") + "</table>"
        }],
    ],
})
