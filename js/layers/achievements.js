addLayer("a", {
    name: "achievements",
    symbol: "A",
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    color: "#f5e663",
    resource: "achievements",
    row: "side",
    type: "none",
    layerShown() { return true },
    tooltip() { return formatWhole(player.a.achievements.length) + " achievements" },
    tabFormat: [
        ["display-text", function() { return "You have <h2 style='color:#f5e663'>" + formatWhole(player.a.achievements.length) + "</h2> achievements" }],
        "blank",
        "achievements",
    ],
    achievements: {
        11: {
            name: "Let There Be Light",
            done() { return hasUpgrade("p", 11) },
            tooltip: "Start the Big Bang.",
        },
        12: {
            name: "Hot Soup",
            done() { return player.p.points.gte(100) },
            tooltip: "Have 100 particles.",
        },
        13: {
            name: "Some Assembly Required",
            done() { return player.at.unlocked },
            tooltip: "Make an atom.",
        },
        14: {
            name: "What Goes Up...",
            done() { return player.gr.unlocked },
            tooltip: "Form a gravity well.",
        },
        15: {
            name: "Periodic Table, Row One",
            done() { return hasUpgrade("at", 12) },
            tooltip: "Buy Helium.",
        },
        21: {
            name: "Heavy",
            done() { return player.gr.force.gte(1e6) },
            tooltip: "Have 1,000,000 Gravitational Force.",
        },
        22: {
            name: "Opposites Attract",
            done() { return player.at.points.gte(8) && player.gr.points.gte(8) },
            tooltip: "Have 8 atoms and 8 gravity wells at the same time.",
        },
        23: {
            name: "Cosmic Microwave Background",
            done() { return player.points.gte(1e20) },
            tooltip: "Have 1e20 energy.",
        },
        24: {
            name: "Twinkle Twinkle",
            done() { return player.st.unlocked },
            tooltip: "Ignite a star.",
        },
        25: {
            name: "It's Getting Hot In Here",
            done() { return player.fu.unlocked },
            tooltip: "Start fusing elements.",
        },
        31: {
            name: "Rock On",
            done() { return player.pl.unlocked },
            tooltip: "Form a planet.",
        },
        32: {
            name: "Ten Billion Suns",
            done() { return player.st.starlight.gte(1e10) },
            tooltip: "Have 1e10 Starlight.",
        },
        33: {
            name: "Crowded Orbit",
            done() { return Object.values(player.pl.orbits).some(n => n >= 3) },
            tooltip: "Have 3 planets in the same orbit.",
        },
        34: {
            name: "Pass the Iron",
            done() { return hasUpgrade("at", 23) },
            tooltip: "Buy Iron.",
        },
        35: {
            name: "A Googol of Everything",
            done() { return player.points.gte(1e100) },
            tooltip: "Have 1e100 energy.",
        },
        41: {
            name: "Constellation",
            done() { return player.st.points.gte(10) },
            tooltip: "Have 10 stars.",
        },
        42: {
            name: "Kardashev Who?",
            done() { return player.fu.points.gte(1e6) },
            tooltip: "Have 1,000,000 fusion power.",
        },
        43: {
            name: "Solar System",
            done() { return player.pl.points.gte(8) },
            tooltip: "Have 8 planets. (Sorry, Pluto.)",
        },
        44: {
            name: "Star Stuff",
            done() { return player.st.points.gte(10) && player.pl.points.gte(10) },
            tooltip: "Have 10 stars and 10 planets at the same time.",
        },
        45: {
            name: "Pale Blue Dot",
            done() { return player.points.gte(1e120) },
            tooltip: "Have 1e120 energy.",
        },
        51: {
            name: "Milky Way",
            done() { return player.ga.unlocked },
            tooltip: "Form a galaxy.",
        },
        52: {
            name: "Point of No Return",
            done() { return player.bh.unlocked },
            tooltip: "Collapse a black hole.",
        },
        53: {
            name: "Nobody Knows What It Is",
            done() { return player.de.unlocked },
            tooltip: "Gain dark energy.",
        },
        54: {
            name: "Survivor",
            done() { return hasChallenge("hz", 11) },
            tooltip: "Survive a Gamma-Ray Burst.",
        },
        55: {
            name: "Crunch Time",
            done() { return hasChallenge("hz", 12) },
            tooltip: "Survive the Big Crunch.",
        },
        61: {
            name: "Island Universe",
            done() { return player.ga.points.gte(5) },
            tooltip: "Have 5 galaxies.",
        },
        62: {
            name: "Evaporating",
            done() { return player.bh.radiation.gte(1e10) },
            tooltip: "Have 1e10 Hawking Radiation.",
        },
        63: {
            name: "Big Rip",
            done() { return player.de.expansion.gte(1e9) },
            tooltip: "Have 1e9 Expansion.",
        },
        64: {
            name: "Still Here",
            done() { return hasChallenge("hz", 22) },
            tooltip: "Survive Vacuum Decay.",
        },
        65: {
            name: "Goldilocks",
            done() { return hasUpgrade("pl", 23) },
            tooltip: "Find the Habitable Zone.",
        },
        71: {
            name: "It's Alive!",
            done() { return player.c.unlocked },
            tooltip: "Make your first cell.",
        },
        72: {
            name: "Full House",
            done() { return player.c.points.gte(tmp.c.capacity.times(0.99)) && player.c.points.gte(100) },
            tooltip: "Fill your carrying capacity.",
        },
        73: {
            name: "Survival of the Fittest",
            done() { return traitsPicked() >= 1 },
            tooltip: "Pick your first trait.",
        },
        74: {
            name: "Family Tree",
            done() { return player.re.unlocked },
            tooltip: "Raise your first brood.",
        },
        75: {
            name: "Green Fingers",
            done() { return hasUpgrade("c", 32) },
            tooltip: "Buy Chloroplasts.",
        },
        81: {
            name: "Specialist",
            done() { return Object.values(player.mu.traits).some(n => n >= 3) },
            tooltip: "Have 3 of the same trait.",
        },
        82: {
            name: "Baby Boom",
            done() { return player.re.offspring.gte(1e6) },
            tooltip: "Have 1,000,000 offspring.",
        },
        83: {
            name: "A Billion Cells",
            done() { return player.c.points.gte(1e9) },
            tooltip: "Have 1e9 cells.",
        },
        84: {
            name: "Methuselah",
            done() { return getBuyableAmount("re", 12).gte(5) },
            tooltip: "Buy 5 Longevity.",
        },
        85: {
            name: "Cambrian Explosion",
            done() { return hasUpgrade("c", 34) },
            tooltip: "Buy the Cambrian Explosion.",
        },
        91: {
            name: "Ancestors",
            done() { return player.ge.heritage.gt(0) },
            tooltip: "Hand down your first Heritage.",
        },
        92: {
            name: "Weathering the Storm",
            done() { return [11, 12, 13, 14].every(id => getBuyableAmount("ad", id).gte(1)) },
            tooltip: "Own an adaptation for every climate.",
        },
        93: {
            name: "Black Smoker",
            done() { return habitatCount("vent") > 0 },
            tooltip: "Colonize a Hydrothermal Vent.",
        },
        94: {
            name: "Great Barrier",
            done() { return habitatCount("reef") >= 4 },
            tooltip: "Colonize every Reef.",
        },
        95: {
            name: "Land Ho!",
            done() { return reachedLand() },
            tooltip: "Crawl onto the Shoreline.",
        },
        101: {
            name: "Strength in Numbers",
            done() { return player.mc.unlocked },
            tooltip: "Become multicellular.",
        },
        102: {
            name: "Mutualism",
            done() { return SYMBIONT_IDS.every(id => player.sy.bonds[id] >= 1) },
            tooltip: "Have a Bond of at least 1 with all four partners.",
        },
        103: {
            name: "Creature of Habit",
            done() { return routineSteps().length >= 3 },
            tooltip: "Fill 3 slots of your routine.",
        },
        104: {
            name: "Red in Tooth and Claw",
            done() { return predatorWins() >= 1 },
            tooltip: "Beat a predator.",
        },
        105: {
            name: "The Tree of Life",
            done() { return hasUpgrade("mc", 11) },
            tooltip: "Finish Act 2.",
        },
        111: {
            name: "Primordial Soup",
            done() { return tierBought(1).gte(1) },
            tooltip: "Buy your first Bacteria. Each Act 3 achievement makes every species tier 5% stronger.",
        },
        112: {
            name: "Food Chain",
            done() { return tierBought(4).gte(1) },
            tooltip: "Buy a Reptile.",
        },
        113: {
            name: "Origin of Species",
            done() { return player.sn.points.gte(1) },
            tooltip: "Speciate.",
        },
        114: {
            name: "Fast Living",
            done() { return metabolismLevel().gte(25) },
            tooltip: "Reach Metabolism level 25.",
        },
        115: {
            name: "Winner Takes All",
            done() { return player.cu.mults.some(m => m && m.gte(2)) },
            tooltip: "Get a Competition boost of x2 or more on one tier.",
        },
        121: {
            name: "Hello, Humans",
            done() { return tierBought(8).gte(1) },
            tooltip: "Buy a Human.",
        },
        122: {
            name: "Darwin's Finches",
            done() { return player.ar.points.gte(1) },
            tooltip: "Radiate.",
        },
        123: {
            name: "No Vacancies",
            done() { return [1, 2, 3, 4, 5, 6, 7, 8].every(t => tierBought(t).gte(100)) },
            tooltip: "Have 100 of every tier bought at once.",
        },
        124: {
            name: "Planet of the Apes",
            done() { return player.biomass.gte("1e200") },
            tooltip: "Reach 1e200 Biomass.",
        },
        125: {
            name: "I Think, Therefore I Am",
            done() { return player.ti.sentient },
            tooltip: "Spark sentience and finish Act 3.",
        },
        131: {
            name: "Settling Down",
            done() { return civUnlocked() && bld("field") >= 1 },
            tooltip: "Plant your first Field. Each Act 4 achievement makes your civilization 5% stronger.",
        },
        132: {
            name: "It Takes a Village",
            done() { return civUnlocked() && player.vg.people >= 10 },
            tooltip: "Have 10 people.",
        },
        133: {
            name: "The Bronze Age",
            done() { return civUnlocked() && hasTech("metalworking") },
            tooltip: "Research Metalworking.",
        },
        134: {
            name: "Know Thyself",
            done() { return civUnlocked() && hasTech("philosophy") },
            tooltip: "Research Philosophy.",
        },
        135: {
            name: "Dark Satanic Mills",
            done() { return civUnlocked() && hasTech("industrialization") },
            tooltip: "Research Industrialization.",
        },
        141: {
            name: "The Sixth Extinction",
            done() { return civUnlocked() && player.ex.count >= 1 },
            tooltip: "Bring on an extinction.",
        },
        142: {
            name: "Written in Stone",
            done() { return civUnlocked() && player.ex.total.gte(100) },
            tooltip: "Lay down 100 Strata in all.",
        },
        143: {
            name: "Seven Wonders",
            done() { return civUnlocked() && wonderLevels() >= 7 },
            tooltip: "Reach 7 wonder levels.",
        },
        144: {
            name: "Trial by Fire",
            done() { return civUnlocked() && trialsBeaten() >= 1 },
            tooltip: "Beat a Trial.",
        },
        145: {
            name: "Eternity",
            done() { return civUnlocked() && player.ex.eternity },
            tooltip: "Finish Act 4.",
        },
    },
})

// Act 4 achievements each make the civilization 5% stronger
function civAchievementBonus() {
    return 1 + 0.05 * player.a.achievements.filter(id => Number(id) >= 131).length
}
