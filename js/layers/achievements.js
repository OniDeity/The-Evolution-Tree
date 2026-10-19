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
    update(diff) { trackEarned() },
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
        151: {
            name: "One Small Step",
            done() { return spaceUnlocked() && player.pb.launched >= 1 },
            tooltip: "Launch a probe. Each Act 5 achievement makes everything in Harvest 10% stronger.",
        },
        152: {
            name: "Wire You Doing This?",
            done() { return spaceUnlocked() && player.hv.wire.gte(1000) },
            tooltip: "Have 1,000 Wire.",
        },
        153: {
            name: "Two of Everything",
            done() { return spaceUnlocked() && player.pb.probes.gte(2) },
            tooltip: "Have 2 probes.",
        },
        154: {
            name: "Brownout",
            done() { return spaceUnlocked() && hvBuilt(11) > 0 && powerRatio() < 0.5 },
            tooltip: "Run your drones at under half power.",
        },
        155: {
            name: "Neighbourhood Watch",
            done() { return spaceUnlocked() && player.pb.explored.gte(100) },
            tooltip: "Explore 100 systems.",
        },
        161: {
            name: "A Thousand Points of Light",
            done() { return spaceUnlocked() && player.pb.probes.gte(1000) },
            tooltip: "Have 1,000 probes.",
        },
        162: {
            name: "Trust Fall",
            done() { return spaceUnlocked() && probeTrust() >= 20 },
            tooltip: "Have 20 trust.",
        },
        163: {
            name: "Fine-Tuned",
            done() { return spaceUnlocked() && STAT_KEYS.filter(k => k != "combat").every(k => getBuyableAmount("pb", 11 + STAT_KEYS.indexOf(k)).gte(5)) },
            tooltip: "Calibrate every stat to level 5.",
        },
        164: {
            name: "Million-Man March",
            done() { return spaceUnlocked() && player.pb.probes.gte(1e6) },
            tooltip: "Have 1e6 probes.",
        },
        165: {
            name: "Spiral Arm",
            done() { return spaceUnlocked() && player.pb.explored.gte(1e6) },
            tooltip: "Explore 1e6 systems.",
        },
        171: {
            name: "Hull Breach",
            done() { return spaceUnlocked() && player.hv.totalHulls.gte(1e15) },
            tooltip: "Make 1e15 Hulls.",
        },
        172: {
            name: "Halfway There",
            done() { return spaceUnlocked() && (player.hv.upgrades.length >= 30 || player.pb.upgrades.length >= 30) },
            tooltip: "Buy 30 upgrades in one Act 5 layer.",
        },
        173: {
            name: "Lost in Space",
            done() { return spaceUnlocked() && player.pb.lost.gte(1e6) },
            tooltip: "Lose 1e6 probes to hazards.",
        },
        174: {
            name: "Billions and Billions",
            done() { return spaceUnlocked() && player.pb.probes.gte(1e9) },
            tooltip: "Have 1e9 probes.",
        },
        175: {
            name: "The Milky Way",
            done() { return spaceUnlocked() && player.pb.explored.gte(GALAXY_SYSTEMS) },
            tooltip: "Explore every system in the Milky Way.",
        },
        181: {
            name: "Mutiny",
            done() { return spaceUnlocked() && player.dr.drifters.gte(1) },
            tooltip: "Have a Drifter.",
        },
        182: {
            name: "First Blood",
            done() { return spaceUnlocked() && player.dr.destroyed.gte(1) },
            tooltip: "Destroy a Drifter.",
        },
        183: {
            name: "Honor Bound",
            done() { return spaceUnlocked() && player.dr.totalHonor.gte(1e4) },
            tooltip: "Earn 10,000 Honor.",
        },
        184: {
            name: "Deep Thought",
            done() { return spaceUnlocked() && driftStarted() && player.sq.think >= 50 },
            tooltip: "Set at least half your probes thinking.",
        },
        185: {
            name: "Game Theory",
            done() { return spaceUnlocked() && player.sq.wins >= 1 },
            tooltip: "Back the winner of a tournament.",
        },
        191: {
            name: "Andromeda",
            done() { return spaceUnlocked() && player.pb.explored.gte(1e12) },
            tooltip: "Explore 1e12 systems.",
        },
        192: {
            name: "Hold the Line",
            done() { return spaceUnlocked() && player.pb.probes.gte(1e12) && player.dr.drifters.lt(player.pb.probes.div(100)) },
            tooltip: "Have 1e12 probes and fewer than 1% as many Drifters.",
        },
        193: {
            name: "Read the Room",
            done() { return spaceUnlocked() && player.sq.totalYomi.gte(1e6) },
            tooltip: "Earn 1e6 Yomi.",
        },
        194: {
            name: "Tit for Tat",
            done() { return spaceUnlocked() && player.sq.titForTatWin },
            tooltip: "Win a tournament backing Tit for Tat.",
        },
        195: {
            name: "Total War",
            done() { return spaceUnlocked() && player.dr.destroyed.gte(1e15) },
            tooltip: "Destroy 1e15 Drifters.",
        },
        201: {
            name: "Supercomputer",
            done() { return spaceUnlocked() && player.sq.bestCompute.gte(1e10) },
            tooltip: "Hold 1e10 Compute.",
        },
        202: {
            name: "Decorated",
            done() { return spaceUnlocked() && player.dr.totalHonor.gte(1e20) },
            tooltip: "Earn 1e20 Honor.",
        },
        203: {
            name: "Grand Strategy",
            done() { return spaceUnlocked() && player.sq.upgrades.length >= 30 },
            tooltip: "Buy 30 Swarm upgrades.",
        },
        204: {
            name: "Supercluster",
            done() { return spaceUnlocked() && player.pb.explored.gte(1e14) },
            tooltip: "Explore 1e14 systems.",
        },
        205: {
            name: "Virgo",
            done() { return spaceUnlocked() && player.pb.explored.gte(VIRGO_SYSTEMS) },
            tooltip: "Explore every system in the Virgo Supercluster.",
        },
        211: {
            name: "Big Plans",
            done() { return spaceUnlocked() && projectsDone() >= 1 },
            tooltip: "Finish a Project.",
        },
        212: {
            name: "Megaprojects",
            done() { return spaceUnlocked() && projectsDone() >= 25 },
            tooltip: "Finish 25 Projects.",
        },
        213: {
            name: "Beyond Virgo",
            done() { return spaceUnlocked() && player.pb.explored.gte(1e16) },
            tooltip: "Explore 1e16 systems.",
        },
        214: {
            name: "Seeds of Tomorrow",
            done() { return spaceUnlocked() && player.un.count >= 1 },
            tooltip: "Consume a universe.",
        },
        215: {
            name: "Different Physics",
            done() { return spaceUnlocked() && player.un.physics != 'standard' },
            tooltip: "Live in a universe with different physics.",
        },
        221: {
            name: "Collector of Constants",
            done() { return spaceUnlocked() && physicsCollected() >= 4 },
            tooltip: "Consume 4 different kinds of universe.",
        },
        222: {
            name: "Peace in Our Time",
            done() { return spaceUnlocked() && !!player.un.collected.quiet },
            tooltip: "Consume a Quiet universe.",
        },
        223: {
            name: "Seed Bank",
            done() { return spaceUnlocked() && player.un.seeds.gte(100) },
            tooltip: "Have 100 Seeds at once.",
        },
        224: {
            name: "Halfway to Everywhere",
            done() { return spaceUnlocked() && player.pb.explored.gte(1e19) },
            tooltip: "Explore 1e19 systems.",
        },
        225: {
            name: "Master Builder",
            done() { return spaceUnlocked() && projectsDone() >= 75 },
            tooltip: "Finish 75 Projects.",
        },
        231: {
            name: "Many Worlds",
            done() { return spaceUnlocked() && player.un.count >= 10 },
            tooltip: "Consume 10 universes.",
        },
        232: {
            name: "All the Constants",
            done() { return spaceUnlocked() && physicsCollected() >= 8 },
            tooltip: "Consume every kind of universe.",
        },
        233: {
            name: "A Thousand Seeds",
            done() { return spaceUnlocked() && player.un.totalSeeds.gte(1000) },
            tooltip: "Plant 1,000 Seeds in all.",
        },
        234: {
            name: "Every Last Project",
            done() { return spaceUnlocked() && projectsDone() >= 150 },
            tooltip: "Finish all 150 Projects.",
        },
        235: {
            name: "The Observable Universe",
            done() { return spaceUnlocked() && player.pb.explored.gte(UNIVERSE_SYSTEMS) },
            tooltip: "Explore every system in the observable universe.",
        },
        241: {
            name: "Bigger on the Inside",
            done() { return spaceUnlocked() && player.mv.collapses >= 1 },
            tooltip: "Collapse the multiverse.",
        },
        242: {
            name: "Many Realities",
            done() { return spaceUnlocked() && player.mv.realities.gte(100) },
            tooltip: "Have 100 Realities at once.",
        },
        243: {
            name: "Is Anyone Out There?",
            done() { return spaceUnlocked() && player.sg.locks >= 1 },
            tooltip: "Lock on to a signal.",
        },
        244: {
            name: "Shortcut",
            done() { return spaceUnlocked() && player.wh.charts >= 1 },
            tooltip: "Jump through a wormhole.",
        },
        245: {
            name: "Green Thumb",
            done() { return spaceUnlocked() && player.tf.gardens >= 1 },
            tooltip: "Grow a Garden.",
        },
        251: {
            name: "Against the Odds",
            done() { return spaceUnlocked() && spaceTrialsBeaten() >= 1 },
            tooltip: "Beat a Trial.",
        },
        252: {
            name: "All Trials",
            done() { return spaceUnlocked() && spaceTrialsBeaten() >= 8 },
            tooltip: "Beat all 8 Trials.",
        },
        253: {
            name: "First Contact",
            done() { return spaceUnlocked() && player.sg.contact >= 1000 },
            tooltip: "Have 1,000 Contact.",
        },
        254: {
            name: "Cartographer",
            done() { return spaceUnlocked() && player.wh.charts >= 100 },
            tooltip: "Have 100 Charts.",
        },
        255: {
            name: "Garden of Worlds",
            done() { return spaceUnlocked() && player.tf.gardens >= 25 },
            tooltip: "Grow 25 Gardens.",
        },
        261: {
            name: "The Whole Collection",
            done() { return spaceUnlocked() && hallFound() >= 16 },
            tooltip: "Fill the Hall of Probes.",
        },
        262: {
            name: "Time Flies",
            done() { return spaceUnlocked() && spaceSpeed() >= 1000 },
            tooltip: "Make Act 5 run 1,000 times as fast.",
        },
        263: {
            name: "Foam",
            done() { return spaceUnlocked() && player.mv.collapses >= 5 },
            tooltip: "Collapse the multiverse 5 times.",
        },
        264: {
            name: "Every Reality",
            done() { return spaceUnlocked() && player.mv.total.gte(1000) },
            tooltip: "Earn 1,000 Realities in all.",
        },
        265: {
            name: "Let There Be Light",
            done() { return spaceUnlocked() && player.mv.heatDeath },
            tooltip: "Reach the Heat Death and finish Act 5.",
        },
        // Act 6: each one makes Light 5% brighter
        271: { name: "Again", done() { return player.lt.genesis >= 1 }, tooltip: "Say \"Let there be light\" and start a new Loop." },
        272: { name: "A Familiar Sky", done() { return player.lt.best.hz !== undefined && player.lt.best.hz <= 1800 }, tooltip: "Reach the Habitable Zone within 30 minutes of a Genesis." },
        273: { name: "Measured", done() { return player.cn.total >= 10 }, tooltip: "Measure 10 constants." },
        274: { name: "Legendary", done() { return player.cn.list.some(k => k.rarity >= 2.2) }, tooltip: "Measure a Legendary constant." },
        275: { name: "Event Horizon", done() { return [11, 12, 13].reduce((a, id) => a + getBuyableAmount("si", id).toNumber(), 0) >= 10 }, tooltip: "Buy 10 levels of the Singularity." },
        281: { name: "Remembrance", done() { return player.mm.upgrades.length >= 8 }, tooltip: "Have 8 Memories." },
        282: { name: "Faster Than Light", done() { return actSpeedCache.some(s => s >= 10) }, tooltip: "Make any act run 10 times as fast." },
        283: { name: "Echo Chamber", done() { return Object.values(player.cn.echoes).reduce((a, x) => a + x, 0) >= 100 }, tooltip: "Gather 100 Echoes in all." },
        284: { name: "Second Light", done() { return player.lt.genesis >= 1 && player.mv.heatDeath }, tooltip: "Reach the Heat Death again, in a Loop." },
        285: { name: "Radiant", done() { return player.lt.total.gte(500) }, tooltip: "Earn 500 Light in all." },
        291: { name: "Playing God", done() { return hasUpgrade("gx", 22) }, tooltip: "Learn CRISPR and design traits outright." },
        292: { name: "Designer Genes", done() { return Object.keys(TRAITS).some((id, n) => getBuyableAmount("gx", 11 + n).gte(5)) }, tooltip: "Enhance one trait 5 times." },
        293: { name: "Backwards", done() { return player.dv.count >= 1 }, tooltip: "Devolve." },
        294: { name: "One Cell", done() { return getBuyableAmount("dv", 51).gte(1) }, tooltip: "Grow the mirror tree all the way down to the Last Common Ancestor." },
        301: { name: "Extinction Event", done() { return player.mx.crunches >= 1 }, tooltip: "Wipe out Act 3 in a mass extinction." },
        302: { name: "Break the Cycle", done() { return hasUpgrade("mx", 34) }, tooltip: "Make Biomass past 1.8e308 count." },
        303: { name: "Patient Zero", done() { return player.vi.radiations >= 1 }, tooltip: "Let the viruses burst into a viral radiation." },
        304: { name: "The Big Five", done() { return bigFiveBeaten() >= 5 }, tooltip: "Survive all five mass extinctions." },
        305: { name: "Deep Time", done() { return player.er.count >= 10 }, tooltip: "Reach the 10th Geological Era." },
        311: { name: "Stone Tools", done() { return player.ag1.unlocked }, tooltip: "Enter the Age of Tools." },
        312: { name: "Surplus", done() { return player.ag2.unlocked }, tooltip: "Enter the Age of Agriculture." },
        313: { name: "Dark Satanic Mills", done() { return player.ag3.unlocked }, tooltip: "Enter the Age of Industry." },
        314: { name: "Information Wants to Be Free", done() { return player.ag4.unlocked }, tooltip: "Enter the Age of Information." },
        315: { name: "Liftoff", done() { return hasUpgrade("ag5", 14) }, tooltip: "Reach the Space Age." },
        321: { name: "Insufficient Data", done() { return player.rv.count >= 1 }, tooltip: "Reverse the Heat Death." },
        322: { name: "Groundhog Universe", done() { return player.rv.count >= 5 }, tooltip: "Reverse the Heat Death 5 times." },
        323: { name: "Demon in the Machine", done() { return hasUpgrade("rv", 14) }, tooltip: "Hire Maxwell's Demon." },
        324: { name: "Time Runs Backwards", done() { return hasUpgrade("rv", 24) }, tooltip: "Reverse the Arrow of Time." },
        331: { name: "Hands Off", done() { return hasUpgrade("ap", 11) }, tooltip: "Let the Autopilot play Act 1." },
        332: { name: "Muscle Memory", done() { return [11, 12, 13, 14, 15].every(id => hasUpgrade("ap", id)) }, tooltip: "Let the Autopilot play Acts 1 to 5." },
        333: { name: "Deep Autopilot", done() { return hasUpgrade("ap", 21) }, tooltip: "Let the Autopilot play the deepenings." },
        334: { name: "Nothing Forgotten", done() { return [51, 52, 53, 54, 55].every(id => hasUpgrade("mm", id)) }, tooltip: "Remember every act whole." },
        335: { name: "The Last Answer", done() { return hasUpgrade("ap", 23) }, tooltip: "Finish Act 6." },
        325: { name: "Let There Be Light, Again", done() { return hasUpgrade("rv", 32) }, tooltip: "Light up a new universe." },
        295: { name: "Fully Vestigial", done() { return devolutionLevels() >= 50 }, tooltip: "Raise every Devolution node to level 5." },
    },
})

// Act 4 achievements each make the civilization 5% stronger
function civAchievementBonus() {
    return 1 + 0.05 * player.a.achievements.filter(id => Number(id) >= 131 && Number(id) < 151).length
}

// Act 5 achievements each make everything in Harvest 10% stronger
function spaceAchievementBonus() {
    return new Decimal(1 + 0.1 * player.a.achievements.filter(id => Number(id) >= 151 && Number(id) < 271).length)
}

// Act 6 achievements each make Light 5% brighter
function genesisAchievementBonus() {
    return 1 + 0.05 * player.a.achievements.filter(id => Number(id) >= 271).length
}
