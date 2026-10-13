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
            name: "Goldilocks",
            done() { return hasUpgrade("pl", 23) },
            tooltip: "Find the Habitable Zone.",
        },
    },
})
