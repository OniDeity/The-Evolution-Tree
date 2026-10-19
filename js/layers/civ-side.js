// ============================================================
//  ACT 4 SIDE LAYERS. They never reset.
//
//  Lost Species (ls): a museum of animals that are gone for good, found by reaching milestones
//  Chronicle    (ch): statistics for Act 4
// ============================================================

const LOST_SPECIES = [
    { name: "Haast's Eagle", year: "c. 1400", lore: "The biggest eagle that ever lived. It hunted moa, and when the moa were gone, so was it.", hint: "Have 20 Fields.",
      done() { return bld("field") >= 20 } },
    { name: "Moa", year: "c. 1445", lore: "Flightless birds three metres tall. New Zealand's first settlers hunted them out within two centuries.", hint: "Have 20 people.",
      done() { return player.vg.people >= 20 } },
    { name: "Aurochs", year: "1627", lore: "The wild ancestor of every cow. The last one died in a Polish forest.", hint: "Raise a breeding line to quality 5.",
      done() { return LINE_KEYS.some(k => player.br.lines[k] >= 5) } },
    { name: "Steller's Sea Cow", year: "1768", lore: "A gentle giant of the Bering Sea, eaten to extinction 27 years after Europeans found it.", hint: "Build a Harbor.",
      done() { return bld("harbor") >= 1 } },
    { name: "Great Auk", year: "1844", lore: "A penguin-like bird of the North Atlantic. The last pair was killed for a collector.", hint: "Leave a footprint of 100.",
      done() { return footprint() >= 100 } },
    { name: "Quagga", year: "1883", lore: "A zebra striped only at the front, as if someone ran out of paint.", hint: "Finish a Wonder.",
      done() { return wonderLevels() >= 1 } },
    { name: "Passenger Pigeon", year: "1914", lore: "Once billions strong, in flocks that darkened the sky for days. Martha, the last one, died in a zoo.", hint: "Bring on your first extinction.",
      done() { return player.ex.count >= 1 } },
    { name: "Carolina Parakeet", year: "1918", lore: "North America's only native parrot, green and yellow and loud.", hint: "Have 75 people.",
      done() { return player.vg.people >= 75 } },
    { name: "Thylacine", year: "1936", lore: "The Tasmanian tiger: a striped, pouched hunter. The last one died of cold, locked out of its shelter.", hint: "Beat a Trial.",
      done() { return trialsBeaten() >= 1 } },
    { name: "Golden Toad", year: "1989", lore: "A bright orange toad from one Costa Rican cloud forest. It vanished as the forest dried.", hint: "Let the biosphere fall below 25% health.",
      done() { return civCache.health < 0.25 } },
    { name: "Baiji", year: "2006", lore: "The Yangtze river dolphin, nearly blind, which found its way by sound. The river got too loud.", hint: "Leave a footprint of 400.",
      done() { return footprint() >= 400 } },
    { name: "Western Black Rhino", year: "2011", lore: "Poached for its horn until none were left.", hint: "Lay down 500 Strata in all.",
      done() { return strataLaid().gte(500) } },
]

function lostSpeciesFound() {
    return player.ls ? player.ls.achievements.length : 0
}

function lostSpeciesBonus() {
    let n = lostSpeciesFound()
    return { strata: (1 + 0.05 * n) * (n >= LOST_SPECIES.length ? 1.5 : 1), civ: 1 + 0.03 * n }
}

addLayer("ls", {
    name: "lost species",
    symbol: "LS",
    row: 29,
    position: 0,
    color: "#7d7d7d",
    startData() { return { unlocked: true, points: new Decimal(0) } },
    type: "none",
    layerShown() { return civUnlocked() },
    nodeStyle: SIDE_NODE_STYLE,
    tooltip() { return lostSpeciesFound() + " / " + LOST_SPECIES.length + " remembered" },
    tabFormat: [
        ["display-text", function() {
            let b = lostSpeciesBonus()
            return "<h2 style='color:#a0a0a0'>Lost Species</h2><br>You remember <h2 style='color:#a0a0a0'>" + lostSpeciesFound() + "</h2> of " + LOST_SPECIES.length + " lost species.<br>" +
                "Each adds 5% to Strata gain and 3% to everything your civilization makes (now x" + format(b.strata, 2) + " and x" + format(b.civ, 2) + "). Remembering them all multiplies Strata gain by 1.5 more."
        }],
        "blank",
        "achievements",
        "blank",
        ["display-text", function() {
            let found = LOST_SPECIES.filter((f, n) => hasAchievement("ls", 11 + Math.floor(n / 4) * 10 + n % 4))
            if (!found.length) return "<i>No one has been lost yet.</i>"
            return "<h3>In Memoriam</h3><br>" + found.map(f => "<b>" + f.name + "</b> <i>(" + f.year + ")</i>: " + f.lore).join("<br>")
        }],
    ],
    achievements: Object.assign({}, ...LOST_SPECIES.map((f, n) => ({
        [11 + Math.floor(n / 4) * 10 + n % 4]: {
            name: f.name,
            done() { return civUnlocked() && f.done() },
            tooltip() { return hasAchievement("ls", this.id) ? "Last seen " + f.year + ". " + f.lore : f.hint },
            style() { return hasAchievement("ls", this.id) ? { "background-color": "#7d7d7d" } : {} },
        },
    }))),
})

addLayer("ch", {
    name: "chronicle",
    symbol: "Ch",
    row: 29,
    position: 1,
    color: "#9fb4c7",
    startData() { return { unlocked: true, points: new Decimal(0), time: 0, runTime: 0, lastRun: 0, fastest: 0, crafted: 0, built: 0, starved: 0, mostPeople: 0 } },
    type: "none",
    layerShown() { return civUnlocked() },
    nodeStyle: SIDE_NODE_STYLE,
    tooltip() { return "Chronicle" },
    update(diff) {
        if (!civUnlocked()) return
        player.ch.time += diff
        player.ch.runTime += diff
        player.ch.mostPeople = Math.max(player.ch.mostPeople, player.vg.people)
    },
    tabFormat: [
        ["display-text", function() {
            let rows = [
                ["Time since Act 4 began", formatTime(player.ch.time)],
                ["This civilization has lasted", formatTime(player.ch.runTime)],
                ["The last one lasted", player.ex.count ? formatTime(player.ch.lastRun) : "-"],
                ["The shortest one lasted", player.ex.count ? formatTime(player.ch.fastest) : "-"],
                ["Extinctions", formatWhole(player.ex.count)],
                ["Strata laid down", formatWhole(strataLaid())],
                ["Most Strata from one extinction", formatWhole(player.ex.best)],
                ["Most people at once", formatWhole(player.ch.mostPeople)],
                ["People lost to hunger", formatWhole(player.ch.starved)],
                ["Buildings built", formatWhole(player.ch.built)],
                ["Things crafted", formatWhole(player.ch.crafted)],
                ["Caravans sent", formatWhole(player.tr.trades)],
                ["Young kept", formatWhole(player.br.kept)],
                ["Wonder levels", formatWhole(wonderLevels())],
                ["Trials beaten", trialsBeaten() + " / 4"],
                ["Lost species remembered", lostSpeciesFound() + " / " + LOST_SPECIES.length],
                ["Eternal", player.ex.eternity ? "Yes" : "Not yet"],
            ]
            return "<h2 style='color:#9fb4c7'>Chronicle</h2><br><br><table style='margin:auto;text-align:left;border-spacing:12px 4px'>" +
                rows.map(r => "<tr><td>" + r[0] + "</td><td><b>" + r[1] + "</b></td></tr>").join("") + "</table>"
        }],
    ],
})
