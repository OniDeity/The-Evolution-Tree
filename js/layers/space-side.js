// ============================================================
//  ACT 5 SIDE LAYERS. They never reset.
//
//  Flight Log (fl): statistics for Act 5
// ============================================================

addLayer("fl", {
    name: "flight log",
    symbol: "FL",
    row: 39,
    position: 0,
    color: "#9fb4c7",
    startData() { return { unlocked: true, points: new Decimal(0), time: 0 } },
    type: "none",
    layerShown() { return spaceUnlocked() },
    nodeStyle: SIDE_NODE_STYLE,
    tooltip() { return "Flight Log" },
    tabFormat: [
        ["display-text", function() {
            let rows = [
                ["Time since Act 5 began", formatTime(player.fl.time)],
                ["Probes", format(player.pb.probes)],
                ["Most probes at once", format(player.pb.bestProbes)],
                ["Probes launched by hand or by Hulls", formatWhole(player.pb.launched)],
                ["Probes lost to hazards", format(player.pb.lost)],
                ["Systems explored", format(player.pb.explored)],
                ["Share of " + targetName() + " explored", format(player.pb.explored.div(explorationCap()).times(100), 4) + "%"],
                ["Matter gathered", format(player.hv.gathered)],
                ["Hulls made", format(player.hv.totalHulls)],
                ["Harvest upgrades", player.hv.upgrades.length + " / 60"],
                ["Probe upgrades", player.pb.upgrades.length + " / 60"],
                ["Trust", probeTrust()],
                ["Drifters", format(player.dr.drifters)],
                ["Drifters destroyed", format(player.dr.destroyed)],
                ["Probes lost to Drifters", format(player.dr.lost)],
                ["Honor earned", format(player.dr.totalHonor)],
                ["Tournaments run (won)", formatWhole(player.sq.tournaments) + " (" + formatWhole(player.sq.wins) + ")"],
                ["Yomi earned", format(player.sq.totalYomi)],
                ["Drift and Swarm upgrades", player.dr.upgrades.length + " / 60, " + player.sq.upgrades.length + " / 60"],
                ["Projects finished", projectsDone() + " / " + PROJECTS.length],
                ["Universes consumed", formatWhole(player.un.count)],
                ["This universe's physics", PHYSICS[player.un.physics].name],
                ["Kinds of universe consumed", physicsCollected() + " / " + PHYSICS_KEYS.length],
                ["Seeds planted", formatWhole(player.un.totalSeeds)],
                ["This universe has lasted", formatTime(player.un.runTime)],
                ["Most systems explored in one universe", format(player.un.bestExplored)],
            ]
            return "<h2 style='color:#9fb4c7'>Flight Log</h2><br><br><table style='margin:auto;text-align:left;border-spacing:12px 4px'>" +
                rows.map(r => "<tr><td>" + r[0] + "</td><td><b>" + r[1] + "</b></td></tr>").join("") + "</table>"
        }],
    ],
})
