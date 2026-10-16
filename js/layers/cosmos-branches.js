// ============================================================
//  ACT 1 BRANCHES
//  Small layers further out on the Cosmos tree: modest helpers with something to do while you
//  wait out a wall. Nothing ever resets them (each has an empty doReset).
//
//  Neutrinos      (nu), off Particles: catch bursts of ghost particles while they last
//  Pulsars        (ps), off Stars:     tap in time with the pulse to build a streak
//  Asteroid Belt  (as), off Planets:   pick 3 of 9 asteroids and hope for rich ore
// ============================================================

// ------------------------------------------------------------
//  NEUTRINOS. Every so often a burst of neutrinos passes through. Catch it before it's gone.
//  Going Supernova sends a big burst.
// ------------------------------------------------------------
function neutrinoEffect() {
    return player.nu ? player.nu.caught.add(1).pow(0.2) : new Decimal(1)
}

function burstLength() {
    return hasMilestone("nu", 1) ? 20 : 10
}

function startBurst(size) {
    player.nu.burst = size
    player.nu.burstLeft = burstLength()
}

function catchBurst() {
    player.nu.caught = player.nu.caught.add(player.nu.burst)
    player.nu.bursts++
    player.nu.burst = 0
    player.nu.burstLeft = 0
    player.nu.next = 20 + Math.random() * 40
}

addLayer("nu", {
    name: "neutrinos",
    symbol: "Nu",
    row: 0,
    position: 1,
    color: "#9fd8ff",
    startData() { return { unlocked: true, points: new Decimal(0), caught: new Decimal(0), burst: 0, burstLeft: 0, next: 30, bursts: 0 } },
    type: "none",
    branches: ["p"],
    layerShown() { return player.at.unlocked || player.gr.unlocked },
    doReset() {},
    tooltip() { return player.nu.burst > 0 ? "A burst is passing!" : formatWhole(player.nu.caught) + " neutrinos" },
    nodeStyle() { return player.nu.burst > 0 ? { "box-shadow": "0 0 20px #9fd8ff" } : {} },
    update(diff) {
        if (!tmp.nu.layerShown) return
        if (player.nu.burst > 0) {
            if (hasMilestone("nu", 2)) { catchBurst(); return }
            player.nu.burstLeft -= diff
            if (player.nu.burstLeft <= 0) { player.nu.burst = 0; player.nu.next = 20 + Math.random() * 40 }
            return
        }
        player.nu.next -= diff
        if (player.nu.next <= 0) startBurst(1 + Math.floor(Math.random() * 5))
    },
    clickables: {
        11: {
            title: "Detect",
            display() {
                if (player.nu.burst > 0) return "A burst of <b>" + player.nu.burst + "</b> neutrinos is passing through! Catch it in the next " + formatTime(player.nu.burstLeft) + "."
                return "The detector is quiet. Wait for a burst."
            },
            canClick() { return player.nu.burst > 0 },
            onClick() { catchBurst() },
            style() { return { width: "240px", "min-height": "100px", height: "100px" } },
        },
    },
    milestones: {
        0: { requirementDescription: "10 neutrinos earned", effectDescription: "Particle gain x1.25.", done() { return earned("nu").gte(10) } },
        1: { requirementDescription: "40 neutrinos earned", effectDescription: "Bursts last 20 seconds instead of 10.", done() { return earned("nu").gte(40) } },
        2: { requirementDescription: "150 neutrinos earned", effectDescription: "The detector catches every burst on its own.", done() { return earned("nu").gte(150) } },
    },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#9fd8ff'>Neutrinos</h2><br>You've caught <h2 style='color:#9fd8ff'>" + formatWhole(player.nu.caught) + "</h2> neutrinos, multiplying energy gain by <b>x" + format(neutrinoEffect()) + "</b>."
        }],
        "blank",
        lore("Trillions of neutrinos pass through you every second without touching a thing. Catching even one takes a huge tank of water and a lot of patience."),
        "blank",
        ["display-text", "<b>Ghost particles:</b> every 20 to 60 seconds a burst passes through. Catch it before it's gone. A Supernova sends a big one."],
        "blank",
        "clickables",
        "blank",
        "milestones",
    ],
})

// ------------------------------------------------------------
//  PULSARS. The pulsar beats every 2 seconds. Tap Sync on the beat to build a streak;
//  each beat you hit earns Radio Waves equal to your streak. Miss and the streak is gone.
// ------------------------------------------------------------
const PULSE_PERIOD = 2
const PULSE_WINDOW = 0.35

function pulsarEffect() {
    return player.ps ? player.ps.radio.add(1).pow(0.1) : new Decimal(1)
}

function maxStreak() {
    return hasMilestone("ps", 1) ? 30 : 15
}

function onBeat() {
    let p = player.ps.phase
    return p <= PULSE_WINDOW || p >= PULSE_PERIOD - PULSE_WINDOW
}

addLayer("ps", {
    name: "pulsars",
    symbol: "Ps",
    row: 1,
    position: 2,
    color: "#d68cff",
    startData() { return { unlocked: true, points: new Decimal(0), phase: 0, streak: 0, best: 0, radio: new Decimal(0), lastHit: -1, beats: 0 } },
    type: "none",
    branches: ["st"],
    layerShown() { return player.st.unlocked && player.st.heavy.gt(0) },
    doReset() {},
    tooltip() { return "Streak " + player.ps.streak },
    update(diff) {
        if (!tmp.ps.layerShown) return
        player.ps.phase += diff
        // A long tick (like offline time) can pass several beats at once
        let passed = Math.floor(player.ps.phase / PULSE_PERIOD)
        if (passed > 0) {
            player.ps.phase -= passed * PULSE_PERIOD
            player.ps.beats += passed
            // Missing two beats in a row breaks the streak
            if (player.ps.beats - player.ps.lastHit > 2) player.ps.streak = 0
            if (hasMilestone("ps", 2)) player.ps.radio = player.ps.radio.add(5 * passed)
        }
    },
    bars: {
        beat: {
            direction: RIGHT,
            width: 300,
            height: 30,
            progress() { return player.ps.phase / PULSE_PERIOD },
            display() { return onBeat() ? "★ PULSE ★" : "" },
            fillStyle() { return { "background-color": onBeat() ? "#ffffff" : "#d68cff" } },
            textStyle: { color: "white", "text-shadow": "0 0 4px black, 0 0 2px black" },
        },
    },
    clickables: {
        11: {
            title: "Sync",
            display() { return "Tap on the pulse. Streak: <b>" + player.ps.streak + "</b> / " + maxStreak() },
            canClick() { return true },
            onClick() {
                // Which beat is this tap closest to?
                let beat = player.ps.phase >= PULSE_PERIOD - PULSE_WINDOW ? player.ps.beats + 1 : player.ps.beats
                if (!onBeat() || beat == player.ps.lastHit) { player.ps.streak = 0; return }
                player.ps.lastHit = beat
                player.ps.streak = Math.min(maxStreak(), player.ps.streak + 1)
                player.ps.best = Math.max(player.ps.best, player.ps.streak)
                player.ps.radio = player.ps.radio.add(player.ps.streak)
            },
            style() { return { width: "200px", "min-height": "100px", height: "100px", "background-color": onBeat() ? "#ffffff" : "#d68cff" } },
        },
    },
    milestones: {
        0: { requirementDescription: "100 Radio Waves earned", effectDescription: "Stars are 1.5x cheaper.", done() { return earned("ps").gte(100) } },
        1: { requirementDescription: "A streak of 15", effectDescription: "Streaks can go up to 30.", done() { return player.ps.best >= 15 } },
        2: { requirementDescription: "2,000 Radio Waves earned", effectDescription: "Gain 5 Radio Waves every beat on your own.", done() { return earned("ps").gte(2000) } },
    },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#d68cff'>Pulsars</h2><br>You have <h2 style='color:#d68cff'>" + formatWhole(player.ps.radio) + "</h2> Radio Waves, multiplying Starlight gain by <b>x" + format(pulsarEffect()) + "</b>."
        }],
        "blank",
        lore("What's left of a supernova can be a ball of neutrons the size of a city, spinning so fast its beam sweeps past like a lighthouse."),
        "blank",
        ["display-text", "<b>Keep the beat:</b> the pulsar pulses every 2 seconds. Tap Sync on the pulse to build a streak. Each pulse you hit earns Radio Waves equal to your streak.<br>Tap off the beat, or miss two pulses in a row, and the streak is lost."],
        "blank",
        ["bar", "beat"],
        "blank",
        "clickables",
        "blank",
        "milestones",
    ],
})

// ------------------------------------------------------------
//  ASTEROID BELT. A field of 9 asteroids, each hiding some ore. Pick 3, then wait for a new field.
// ------------------------------------------------------------
const ORE_VALUES = [0, 0, 1, 1, 1, 2, 2, 3, 5]

function asteroidPicks() {
    return hasMilestone("as", 0) ? 4 : 3
}

function fieldTime() {
    return hasMilestone("as", 1) ? 40 : 60
}

function newField() {
    let ore = ORE_VALUES.slice()
    for (let i = ore.length - 1; i > 0; i--) { let j = Math.floor(Math.random() * (i + 1)); [ore[i], ore[j]] = [ore[j], ore[i]] }
    player.as.field = ore
    player.as.mined = [false, false, false, false, false, false, false, false, false]
    player.as.picks = asteroidPicks()
    player.as.timer = fieldTime()
}

function asteroidEffect() {
    return player.as ? player.as.ore.add(1).pow(0.75) : new Decimal(1)
}

addLayer("as", {
    name: "asteroid belt",
    symbol: "As",
    row: 2,
    position: 3,
    color: "#a08b74",
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        ore: new Decimal(0),
        field: [0, 0, 1, 1, 1, 2, 2, 3, 5],
        mined: [false, false, false, false, false, false, false, false, false],
        picks: 3,
        timer: 0,
        fields: 0,
    }},
    type: "none",
    branches: ["pl"],
    layerShown() { return player.pl.unlocked && player.pl.best.gte(2) },
    doReset() {},
    tooltip() { return player.as.picks > 0 ? player.as.picks + " picks left" : "New field in " + formatTime(player.as.timer) },
    update(diff) {
        if (!tmp.as.layerShown) return
        if (player.as.fields == 0) { newField(); player.as.fields = 1 }
        if (player.as.picks > 0 && hasMilestone("as", 3)) {
            let open = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(i => !player.as.mined[i])
            let i = open[Math.floor(Math.random() * open.length)]
            layers.as.clickables[11 + 10 * Math.floor(i / 3) + i % 3].onClick()
        }
        if (player.as.picks > 0) return
        player.as.timer -= diff
        if (player.as.timer <= 0) { newField(); player.as.fields++ }
    },
    clickables: Object.fromEntries([0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => [11 + 10 * Math.floor(i / 3) + i % 3, {
        title() { return player.as.mined[i] ? "+" + player.as.field[i] : "?" },
        display() { return player.as.mined[i] ? (player.as.field[i] >= 3 ? "Rich!" : player.as.field[i] ? "Ore" : "Just rock") : "" },
        canClick() { return !player.as.mined[i] && player.as.picks > 0 },
        onClick() {
            player.as.mined[i] = true
            player.as.ore = player.as.ore.add(player.as.field[i])
            player.as.picks--
            if (player.as.picks == 0) player.as.timer = fieldTime()
        },
        style() {
            let v = player.as.field[i], m = player.as.mined[i]
            return { width: "80px", height: "80px", "min-height": "80px", "border-radius": "45% 55% 40% 60%",
                "background-color": m ? (v >= 3 ? "#ffd700" : v ? "#c0a080" : "#555") : "#a08b74" }
        },
    }])),
    milestones: {
        0: { requirementDescription: "20 ore earned", effectDescription: "4 picks per field.", done() { return earned("as").gte(20) } },
        1: { requirementDescription: "80 ore earned", effectDescription: "A new field drifts in every 40 seconds.", done() { return earned("as").gte(80) } },
        2: { requirementDescription: "250 ore earned", effectDescription: "Energy gain x1.5.", done() { return earned("as").gte(250) } },
        3: { requirementDescription: "600 ore earned", effectDescription: "Prospect on your own: picks are made for you.", done() { return earned("as").gte(600) } },
    },
    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#a08b74'>Asteroid Belt</h2><br>You have <h2 style='color:#c0a080'>" + formatWhole(player.as.ore) + "</h2> ore, making planets <b>" + format(asteroidEffect()) + "x</b> cheaper."
        }],
        "blank",
        lore("Rubble left over from building the planets, tumbling between the rocky worlds and the giants."),
        "blank",
        ["display-text", function() {
            return "<b>Prospecting:</b> each field has 9 asteroids, and only a few are rich. Pick " + asteroidPicks() + ", then wait for the next field.<br>" +
                (player.as.picks > 0 ? "Picks left: <b>" + player.as.picks + "</b>" : "Next field in <b>" + formatTime(player.as.timer) + "</b>")
        }],
        "blank",
        "clickables",
        "blank",
        "milestones",
    ],
})
