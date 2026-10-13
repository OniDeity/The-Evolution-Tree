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
            name: "Over the Moon",
            done() { return getBuyableAmount("pl", 11).gte(3) },
            tooltip: "Have 3 Moons.",
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
    },
})
