// ============================================================
//  ACT 6: THE AUTOPILOT (v3.5)
//  Antimatter Dimensions' Automator, retold. From Loop 6 on, the universe learns to run itself.
//  The Autopilot writes Routines in real time (faster the more endings this Loop has reached and the
//  more modules it already has). Each module plays one part of the game for you, every choice and
//  challenge included: Acts 1 to 5, the deepenings, and finally the Loops themselves.
//  Its last upgrade, the Last Answer, is Loop 6's goal and the end of Act 6.
// ============================================================

function autopilotUnlocked() {
    return !!(player.lt && player.lt.genesis >= 6)
}

const AP_MODULES = {
    11: { title: "Act 1: The Cosmos", text: "Plays Act 1: resets, upgrades, orbits, Cosmic Hazards, the branches and the Habitable Zone.", cost: 100 },
    12: { title: "Act 2: Life", text: "Plays Act 2: cells, traits, habitats, the body plan, instincts, predators and the Tree of Life.", cost: 280 },
    13: { title: "Act 3: Species", text: "Plays Act 3: tiers, speciations, radiations, Selection Pressures, the branches and the Spark of Sentience.", cost: 600 },
    14: { title: "Act 4: Extinction", text: "Plays Act 4: jobs, techs, buildings, crafting, the branches, extinctions and Eternity.", cost: 1050 },
    15: { title: "Act 5: Diaspora", text: "Plays Act 5: trust, harvest, the Drift, the Swarm, projects, universes, the multiverse and the Heat Death.", cost: 1700 },
    21: { title: "The Deepenings", text: "Plays Act 6 inside the acts: Constants, Genetic Engineering, Devolution, Mass Extinctions, Viruses, Eras, the Ages and Reversals.", cost: 2400 },
    22: { title: "The Loops", text: "Spends Light and Memories for you, and says \"Let there be light\" as soon as a Loop is done.", cost: 3000 },
    23: { title: "The Last Answer", text: "\"Let there be light.\" And there was light, and it ran itself. <b>Finish Act 6.</b>", cost: 3600 },
}
const AP_PLAYS = [11, 12, 13, 14, 15, 21, 22]

function apOn(id) {
    return autopilotUnlocked() && hasUpgrade("ap", id) && !player.ap.off.includes(String(id))
}

function apModules() {
    return AP_PLAYS.filter(id => hasUpgrade("ap", id)).length
}

// Upgrades that make the Autopilot write faster, bought with Routines
const AP_BOOSTS = {
    31: { title: "Macros", text: "Routines x2.", cost: 50 },
    32: { title: "Recursion", text: "Routines grow with all the Negentropy you've ever made.", cost: 1000 },
    33: { title: "Compiler", text: "Subroutines are stronger: x1.4 a level instead of x1.3.", cost: 3000 },
}

function subroutineMult() {
    return Math.pow(hasUpgrade("ap", 33) ? 1.4 : 1.3, getBuyableAmount("ap", 11).toNumber())
}

function routineGain() {
    if (!autopilotUnlocked()) return 0
    let g = (1 + player.lt.endings.length) * (1 + 0.5 * apModules()) / 60 * subroutineMult()
    if (hasUpgrade("ap", 31)) g *= 2
    if (hasUpgrade("ap", 32)) g *= 1 + Math.log10(player.rv.total.toNumber() + 1) / 2
    return g
}

// A new Loop starts the Autopilot's notes over (they're about the Loop, not the Autopilot)
function autopilotNewLoop() {
    if (player.ap) player.ap.s = {}
}

// ------------------------------------------------------------
//  The modules. Each plays like an attentive player, using only what a player could click,
//  and leaves alone anything a milestone already does.
// ------------------------------------------------------------
const AUTOPILOT = (function() {
    const lg = x => new Decimal(x).max(1).log10().toNumber()
    const num = x => new Decimal(x).toNumber()
    function S(k) { if (!player.ap.s[k]) player.ap.s[k] = {}; return player.ap.s[k] }

    // ---------- Act 1 ----------
    const L1 = ["p", "at", "gr", "st", "fu", "pl", "ga", "bh", "de", "hz"]
    const HZ = [11, 12, 21, 22, 31, 32]
    const HZ_GOAL = { 11: 82, 12: 50, 21: 96, 22: 165, 31: 55, 32: 110 }

    function a1Upgrades(prePass) {
        for (const l of L1) {
            if (!player[l].unlocked || !tmp[l].upgrades) continue
            for (const id in layers[l].upgrades) {
                if (isNaN(id)) continue
                const u = tmp[l].upgrades[id]
                if (!u || !u.unlocked || hasUpgrade(l, id)) continue
                if (l == "pl" && id == "23") continue
                if (!canAffordUpgrade(l, id)) continue
                // Paid in atoms or wells: buy right before a buy-max reset, which buys them straight back
                const staticPay = (l == "at" || l == "gr") && !u.currencyInternalName && new Decimal(u.cost).gt(0)
                const auto = l == "at" ? hasMilestone("st", 3) : l == "gr" ? hasMilestone("pl", 3) : true
                if (staticPay && !auto) {
                    if (tmp[l].canBuyMax && (!prePass || !canReset(l))) continue
                    buyUpg(l, id)
                    if (hasUpgrade(l, id) && tmp[l].canBuyMax) { updateLayerTemp(l); if (canReset(l)) doReset(l) }
                    continue
                }
                buyUpg(l, id)
            }
        }
    }

    function a1Branches() {
        if (tmp.nu.layerShown && player.nu.burst > 0 && !hasMilestone("nu", 2)) layers.nu.clickables[11].onClick()
        if (tmp.ps.layerShown && !hasMilestone("ps", 2)) {
            const beat = player.ps.phase >= PULSE_PERIOD - PULSE_WINDOW ? player.ps.beats + 1 : player.ps.beats
            if (onBeat() && beat != player.ps.lastHit) layers.ps.clickables[11].onClick()
        }
        if (tmp.as.layerShown && !hasMilestone("as", 3)) {
            while (player.as.picks > 0) {
                const open = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(i => !player.as.mined[i])
                if (!open.length) break
                const i = open[Math.floor(Math.random() * open.length)]
                layers.as.clickables[11 + 10 * Math.floor(i / 3) + i % 3].onClick()
            }
        }
    }

    function orbitWeights() {
        const w = { inner: 1, hab: 0, frost: 0, outer: 0.1 }
        if (player.gr.unlocked && !inChallenge("hz", 21)) w.frost = num(tmp.gr.forceExp) * (player.gr.force.gte(1e20) ? 0.5 : 1)
        if (player.st.unlocked && !inChallenge("hz", 21)) {
            let exp = hasUpgrade("st", 12) ? 0.4 : 0.3
            if (hasUpgrade("pl", 21)) exp += player.pl.points.toNumber() * 0.01
            if (hasChallenge("hz", 21)) exp += 0.05
            if (hasUpgrade("hz", 13)) exp += 0.03
            w.hab = exp
        }
        if (inChallenge("hz", 22)) w.outer *= 0.5
        return w
    }

    function arrangeOrbits() {
        const N = player.pl.points.toNumber()
        if (N <= 0) return
        const w = orbitWeights()
        const os = ["inner", "hab", "frost", "outer"]
        const cnt = { inner: 0, hab: 0, frost: 0, outer: 0 }
        // Near the end, keep 5 in the Habitable orbit
        cnt.hab = Math.min(N >= 10 && hasUpgrade("pl", 22) && a1EndingReady() ? 5 : 0, N)
        const val = (o, n) => {
            if (n <= 0 && !hasUpgrade("pl", 12) && !hasChallenge("hz", 22)) return 0
            let bonus = (hasUpgrade("pl", 12) && n > 0 ? 1 : 0) + (hasChallenge("hz", 22) ? 1 : 0)
            return Math.pow(n + bonus, 0.75) * lg(orbitBase(o)) * w[o]
        }
        for (let k = cnt.hab; k < N; k++) {
            let best = null, bv = -1
            for (const o of os) { const d = val(o, cnt[o] + 1) - val(o, cnt[o]); if (d > bv) { bv = d; best = o } }
            cnt[best]++
        }
        if (os.some(o => player.pl.orbits[o] != cnt[o])) for (const o of os) player.pl.orbits[o] = cnt[o]
    }

    function a1Resets() {
        // Particles
        if (!hasRow2Milestone(2) && canReset("p")) {
            const g = tmp.p.resetGain, after = player.p.points.add(g)
            const wants = Object.keys(layers.p.upgrades).filter(id => !isNaN(id) && tmp.p.upgrades[id].unlocked && !hasUpgrade("p", id))
            const pays = wants.some(id => after.gte(tmp.p.upgrades[id].cost) && player.p.points.lt(tmp.p.upgrades[id].cost))
            if (pays || g.gte(player.p.points.times(5).max(1))) doReset("p")
        }
        // Atoms and gravity wells: the smaller one first
        const cands = ["at", "gr"].filter(l => canReset(l) && !hasMilestone(l == "at" ? "st" : "pl", 3))
        if (cands.length) { cands.sort((a, b) => num(player[a].points) - num(player[b].points)); doReset(cands[0]) }
        if (player.gr.unlocked && !hasMilestone("pl", 3)) {
            const c = layers.gr.clickables[11]
            if (c.canClick() && player.gr.force.gte(tmp.gr.mergeCost.times(2))) c.onClick()
        }
        // Stars and planets
        if (!hasRow3Milestone(2)) for (const l of ["st", "pl"]) if (canReset(l) && (!tmp[l].canBuyMax || tmp[l].resetGain.gte(3) || player[l].resetTime > 60)) doReset(l)
        // Fusion: turn the plasma down for the reset, then back up
        if (player.at.unlocked && player.gr.unlocked && canReset("fu") && !(player.hz.activeChallenge && player.fu.unlocked)) {
            const p = player.fu.points, k = hasMilestone("fu", 4) ? Infinity : 1.5
            player.fu.temp = 1; updateLayerTemp("fu")
            if (!player.fu.unlocked || tmp.fu.resetGain.gte(p.max(1).times(k))) doReset("fu")
            player.fu.temp = 10
        }
        // Supernovae, when they at least double Heavy Elements
        if (!hasRow3Milestone(2) && player.st.points.gte(3) && hasMilestone("st", 4) && tmp.st.supernovaGain.gte(player.st.heavy.max(1).times(2))) {
            layers.st.clickables[11].onClick()
            if (canReset("st")) doReset("st")
        }
    }

    function a1Row3() {
        if (player.hz.activeChallenge) return
        if (canReset("ga") && !hasMilestone("ga", 4)) { player.ga.next = "spiral"; doReset("ga") }
        if (canReset("bh") && !hasMilestone("bh", 4) && hasRow3Milestone(2)) {
            if (!player.bh.unlocked || player.bh.points.lt(5) || tmp.bh.spin > 0.5 || tmp.bh.resetGain.gte(2)) doReset("bh")
        }
        for (const l of ["de", "hz"]) {
            if (!tmp[l].layerShown || !canReset(l)) continue
            if (l == "de" && !player[l].unlocked && !hasRow3Milestone(2)) continue
            if (l == "hz" && !hasRow3Milestone(1) && !hasRow3Milestone(2)) continue
            const g = tmp[l].resetGain, p = player[l].points
            const k = tmp[l].passiveGeneration > 0 ? 5 : (l == "hz" && !hasRow3Milestone(2) ? 3 : 1)
            if (!player[l].unlocked || g.gte(p.max(1).times(k))) doReset(l)
        }
    }

    // A rough guess at the energy a run inside each hazard reaches (digits)
    function hzEstimate(id) {
        const L = lg(player.points), at = lg(tmp.at.effect), sl = lg(tmp.st.starlightEffect), fo = lg(tmp.gr.forceEffect)
        return { 11: L - at, 12: L / 2, 21: L - (sl + fo), 22: L * 0.9, 31: (L - (sl + fo)) / 2, 32: (L - at) * 0.9 }[id]
    }

    function a1Hazards(t) {
        if (!player.hz.unlocked) return
        const s = S(1), a = player.hz.activeChallenge
        s.fail = s.fail || {}
        if (a) {
            if (canCompleteChallenge("hz", a)) { startChallenge("hz", a); s.run = null; return }
            if (!s.run) s.run = { best: 0, bestT: t }
            const L = lg(player.points)
            if (L > s.run.best + 0.5) { s.run.best = L; s.run.bestT = t }
            // Give up once energy has stalled for two minutes
            if (t - s.run.bestT > 120) { s.fail[a] = { t: t, n: num(player.ga.points.add(player.bh.points)) }; startChallenge("hz", a); s.run = null }
            return
        }
        if (!hasRow3Milestone(2)) return
        for (const id of HZ) {
            if (hasChallenge("hz", id) || !tmp.hz.challenges[id].unlocked) continue
            if (id == 31 && num(player.ga.points.add(player.bh.points)) < 24) return
            const f = s.fail[id]
            if (f && (t < f.t + 240 || (num(player.ga.points.add(player.bh.points)) < f.n + 2 && t < f.t + 600))) return
            if (hzEstimate(id) >= HZ_GOAL[id]) { startChallenge("hz", id); s.run = { best: 0, bestT: t } }
            return
        }
    }

    function a1EndingReady() {
        return HZ.every(id => hasChallenge("hz", id)) && row3UpgradesDone()
    }

    function a1Row4() {
        if (!row4Unlocked()) return
        if (!hasMilestone("qf", 3)) {
            player.qf.mode = "strength"
            for (const key of ["vacuum", "pairs", "tunneling"]) {
                const sp = player.qf.spells[key]
                if ((!sp || sp.time <= 0) && layers.qf.clickables[SPELLS[key].id].canClick()) layers.qf.clickables[SPELLS[key].id].onClick()
            }
        }
        player.ma.asym = 50
        if (!hasMilestone("sw", 2)) { if (player.sw.furled != solarActivity() > 0.8) layers.sw.clickables[11].onClick() }
        else if (player.sw.furled) layers.sw.clickables[11].onClick()
        if (!hasMilestone("sw", 1)) for (let i = 0; i < 50 && layers.sw.buyables[11].canAfford(); i++) layers.sw.buyables[11].buy()
        if (!player.dm.found && !hasMilestone("dm", 2)) layers.dm.clickables[21].onClick()
    }

    function act1(t) {
        const s = S(1)
        a1Upgrades(true)
        a1Branches()
        a1Hazards(t)
        a1Resets()
        a1Row3()
        a1Upgrades(false)
        if (player.fu.unlocked && !hasMilestone("fu", 3)) for (let i = 0; i < 50 && layers.fu.buyables[11].canAfford(); i++) layers.fu.buyables[11].buy()
        if (player.de.unlocked && (!hasMilestone("de", 4) || tmp.de.fate >= 0)) for (let i = 0; i < 50 && layers.de.buyables[11].canAfford(); i++) layers.de.buyables[11].buy()
        if (player.pl.unlocked && (t - (s.orbit || -99) >= 10 || player.hz.activeChallenge)) { s.orbit = t; arrangeOrbits() }
        if (player.at.unlocked && !s.spin) { s.spin = 1; player.p.spin = "boson" }
        // The Habitable Zone
        if (hasUpgrade("pl", 22) && !hasUpgrade("pl", 23) && player.pl.points.gte(10) && a1EndingReady()) {
            if (player.pl.orbits.hab < 5) { arrangeOrbits(); updateLayerTemp("pl") }
            if (tmp.pl.upgrades[23].unlocked && layers.pl.upgrades[23].canAfford()) buyUpg("pl", 23)
        }
        a1Row4()
    }

    // ---------- Act 2 ----------
    const L10 = x => new Decimal(x).max(1e-300).log10().toNumber()
    const TRAIT_W = { flagellum: 1, photo: 1, chemo: 1, membrane: 0.5, repair: 0.8, cilia: 0.3, fission: 0.25, toxin: 0.15 }
    function traitValue(id) {
        let n = player.mu.traits[id] || 0
        let cur = effectiveTraitLevel(n) + borrowedLevel(id), next = effectiveTraitLevel(n + 1) + borrowedLevel(id)
        let w = TRAIT_W[id]
        if (id == "fission" && tmp.c && tmp.c.divisionRate > 0.3) w = 0.05
        return (L10(TRAITS[id].per(next)) - L10(TRAITS[id].per(cur))) * w
    }
    function borrowValue(id) { return L10(TRAITS[id].per(1.25)) * (id == "fission" ? 0.2 : TRAIT_W[id]) }
    function buyAll(l) {
        if (!tmp[l].upgrades) return
        for (let id in layers[l].upgrades) {
            if (isNaN(id)) continue
            if (hasUpgrade(l, id) || !tmp[l].upgrades[id] || !tmp[l].upgrades[id].unlocked) continue
            if (canAffordUpgrade(l, id)) buyUpg(l, id)
        }
    }
    const inPr = () => !!player.pr.activeChallenge

    function a2Rows12() {
        buyAll("c")
        if (!hasLifeRow3Milestone(1) && canReset("c") && tmp.c.resetGain.gte(1)) {
            let gain = tmp.c.resetGain, n = player.c.points
            if (!player.c.unlocked || n.lt(1)) doReset("c")
            else {
                let next = new Decimal(Infinity)
                for (let l of ["mu", "re"]) if (tmp[l].layerShown) next = next.min(tmp[l].nextAt)
                if (n.add(gain).lte(tmp.c.capacity) && gain.gte(n.times(0.5)) && player.dna.lt(next.times(0.3))) doReset("c")
            }
        }
        for (let l of ["mu", "re"]) {
            if (!tmp[l].layerShown || tmp[l].autoPrestige || !canReset(l)) continue
            let other = l == "mu" ? "re" : "mu"
            if (player[l].points.gt(player[other].points.add(2)) && canReset(other)) continue
            doReset(l)
        }
        if (!hasMilestone("mu", 2)) for (let i = 0; i < 50 && pendingTraits() > 0; i++) {
            let o = traitOffers()
            pickTrait(traitValue(o[1]) > traitValue(o[0]) ? 1 : 0)
        }
        if (player.re.unlocked && !hasLifeRow3Milestone(2)) for (let i = 0; i < 5; i++) {
            let longer = tmp.re.lifespan.times(2).lt(240) || getBuyableAmount("re", 12).lt(getBuyableAmount("re", 11).sub(2))
            let id = longer ? 12 : 11
            if (!layers.re.buyables[id].canAfford()) break
            layers.re.buyables[id].buy()
            updateLayerTemp("re")
        }
    }

    function a2Branches() {
        if (tmp.ph.layerShown && !hasMilestone("ph", 2) && player.ph.oxygen + 100 / oxygenFillTime() * 1.01 >= 100) ventOxygen()
        if (tmp.gt.layerShown && !hasMilestone("gt", 2)) while (player.gt.plasmids >= 1) {
            let best = -1, bv = -1
            player.gt.pool.forEach((id, i) => { if (canAbsorb(i)) { let v = borrowValue(id); if (v > bv) { bv = v; best = i } } })
            if (best < 0) break
            layers.gt.clickables[11 + best].onClick()
        }
        if (tmp.eg.layerShown && !hasMilestone("eg", 3)) {
            player.eg.size = 1
            if (player.eg.laid && player.eg.timer >= incubationTime(player.eg.laid)) layers.eg.clickables[12].onClick()
            if (!player.eg.laid) layers.eg.clickables[11].onClick()
        }
        if (tmp.oc.layerShown && !hasMilestone("oc", 4) && layers.oc.clickables[11].canClick()) {
            let counts = [0, 1, 2, 3].map(d => { let n = 0; for (let id in player.hb.grid) if (player.hb.grid[id] && downstream(Number(id), d)) n++; return n })
            if (counts[player.oc.dir] >= Math.max(...counts) && counts[player.oc.dir] > 0) layers.oc.clickables[11].onClick()
        }
    }

    function a2Row3() {
        if (!lifeRow3Unlocked()) return
        buyAll("ge"); buyAll("ad")
        if (!inPr() && canReset("ad") && !hasMilestone("ad", 3)) {
            let g = tmp.ad.resetGain
            if (!player.ad.unlocked ? g.gte(3) : g.gte(new Decimal(25).sub(player.ad.points).max(3))) doReset("ad")
        }
        if (player.ad.unlocked && !hasMilestone("ad", 4)) {
            let wantUpg = [11, 12, 13].find(id => !hasUpgrade("ad", id))
            if (wantUpg === undefined || player.ad.points.gte(tmp.ad.upgrades[wantUpg].cost)) for (let k = 0; k < 20; k++) {
                let w = { 11: 1, 12: 0.7, 13: 0.25, 14: 0.2 }, best = null, bs = Infinity
                for (let id of [11, 12, 13, 14]) {
                    let c = tmp.ad.buyables[id].cost
                    let sc = getBuyableAmount("ad", id).eq(0) ? L10(c) - 5 : L10(c) / w[id] * 0.4
                    if (sc < bs) { bs = sc; best = id }
                }
                if (wantUpg !== undefined && player.ad.points.sub(tmp.ad.buyables[best].cost).lt(tmp.ad.upgrades[wantUpg].cost)) break
                if (!layers.ad.buyables[best].canAfford()) break
                layers.ad.buyables[best].buy(); updateBuyableTemp("ad")
            }
        }
        if (!inPr()) for (let l of ["ge", "hb"]) if (!tmp[l].autoPrestige && canReset(l)) doReset(l)
        a2Habitats()
    }

    const HB_ORDER = ["shore", "reef", "open", "vent", "tide", "deep"]
    function a2Habitats() {
        if (!player.hb.unlocked || (hasMilestone("hb", 5) && !player.hb.abandon)) return
        if (!reachedLand()) {
            // The way to land: the reef, then the shoreline
            if (!player.hb.grid[403] && canColonize(403)) { player.hb.grid[403] = true; return }
            if (hasUpgrade("ad", 13) && player.ge.best.gte(8) && player.hb.grid[403]) {
                if (canColonize(503)) { player.hb.grid[503] = true; return }
                if (player.hb.points.gte(4)) {
                    let tiles = Object.keys(player.hb.grid).map(Number).filter(id => player.hb.grid[id] && id != 303 && id != 403)
                    for (let k = 0; k < 30 && freeColonists() < 3; k++) {
                        let id = tiles.find(x => player.hb.grid[x] && abandonBlocker(x) == "")
                        if (id === undefined) break
                        player.hb.grid[id] = false
                    }
                    if (canColonize(503)) player.hb.grid[503] = true
                }
                return
            }
        }
        for (let type of HB_ORDER) for (let r = 1; r <= 5; r++) for (let c = 1; c <= 5; c++) {
            let id = r * 100 + c
            if (habitatType(id) == type && canColonize(id)) { player.hb.grid[id] = true; return }
        }
    }

    function bodyChoice(tier) {
        if (tier == 2 || tier == 3) return "b"
        if (tier == 4) {
            let s = hasUpgrade("ad", 11) ? 0.5 : 0.25
            let gainLog = (1 - s) * 0.75 * (getBuyableAmount("ad", 11).toNumber() * Math.log10(3) + 0.5 * getBuyableAmount("ad", 12).toNumber() * Math.log10(4))
            return gainLog > 5 ? "b" : "a"
        }
        return "a"
    }

    function bestInstincts() {
        let opts = BEHAVIOR_IDS.filter(behaviorUnlocked), slots = routineSlots(), str = instinctStrength().toNumber()
        let best = null, bs = -Infinity
        function score(steps) {
            let dna = 0, cap = 0, births = 0, her = 0
            for (let i = 0; i < steps.length; i++) {
                let now = steps[i], before = steps[(i - 1 + steps.length) % steps.length], p = str
                if (before == "rest" && steps.length > 1) p *= 2
                if (COMBOS.some(([a, b]) => a == before && b == now) && steps.length > 1) p *= 1.5
                let m = Math.pow(BEHAVIORS[now].mult, Math.min(5, p)), k = BEHAVIORS[now].kind
                dna += k == "dna" ? m : 1; cap += k == "capacity" ? m : 1; births += k == "births" ? m : 1; her += k == "heritage" ? m : 1
            }
            let n = steps.length
            return Math.log10(dna / n) + 0.35 * Math.log10(cap / n) + 0.1 * Math.log10(births / n) + 0.25 * Math.log10(her / n)
        }
        function rec(arr, len) {
            if (arr.length == len) { let sc = score(arr); if (sc > bs + 1e-9) { bs = sc; best = arr.slice() } return }
            for (let o of opts) { arr.push(o); rec(arr, len); arr.pop() }
        }
        for (let len = 1; len <= slots; len++) rec([], len)
        return best
    }

    function a2Row4(t) {
        if (!lifeRow4Unlocked()) return
        const s = S(2)
        s.failed = s.failed || {}
        buyAll("in")
        for (let tier = 0; tier < 6; tier++) {
            if (player.mc.plan[tier]) continue
            if (tier >= player.mc.points.toNumber()) break
            let id = (tier + 1) * 10 + (bodyChoice(tier) == "a" ? 1 : 2)
            if (layers.mc.clickables[id].canClick()) layers.mc.clickables[id].onClick()
            break
        }
        if (player.in.unlocked && t - (s.routine || -99) >= 30 && !devolved("in")) {
            s.routine = t
            let r = bestInstincts()
            if (r) { let full = [0, 1, 2, 3].map(i => r[i] || null); if (JSON.stringify(full) != JSON.stringify(player.in.routine)) player.in.routine = full }
        }
        if (player.sy.unlocked && !hasMilestone("sy", 3)) for (let id of SYMBIONT_IDS)
            if (symbiontUnlocked(id) && giftBond(id) > autoGiftThreshold(id) && SYMBIONTS[id].get().gt(1) && !(id == "gut" && inPr())) giveGift(id)
        if (!hasUpgrade("mc", 11) && bodyPlanDone() && predatorWins() >= 9 && canAffordUpgrade("mc", 11)) buyUpg("mc", 11)
        let gameFights = devolved("pr")
        if (inPr()) {
            if (gameFights) return
            let id = player.pr.activeChallenge
            if (canCompleteChallenge("pr", id)) { startChallenge("pr", id); return }
            let d = L10(player.dna)
            if (d > (s.chalBest || 0) + 0.5) { s.chalBest = d; s.chalGain = t }
            // Give up if DNA hasn't grown in 8 minutes
            if (t - (s.chalGain || t) > 480) { let key = id + "_" + (player.pr.challenges[id] || 0); s.failed[key] = (s.failed[key] || 0) + 1; startChallenge("pr", id) }
            return
        }
        if (!tmp.mc.autoPrestige && canReset("mc")) doReset("mc")
        if (!tmp.sy.autoPrestige && canReset("sy")) doReset("sy")
        if (canReset("in") && !hasMilestone("in", 3)) {
            let g = tmp.in.resetGain
            if (!player.in.unlocked || g.gte(player.in.points.max(1)) && player.in.resetTime > 30) doReset("in")
        }
        if (canReset("pr") && tmp.pr.resetGain.gte(3) && (!player.pr.unlocked || player.pr.total.lt(3))) doReset("pr")
        if (player.pr.unlocked && !gameFights) {
            // Hunt the predator whose goal this run passes most comfortably
            let ids = [11, 12, 21].filter(id => (player.pr.challenges[id] || 0) < 3)
            if (!ids.length || (player.mc.resetTime < 60 && player.ge.resetTime < 60)) return
            let dna = L10(player.dna), best = null, margin = -Infinity
            for (let id of ids) {
                let need = L10(predatorGoal(id)) + (id == 12 ? 8 : 2) + (s.failed[id + "_" + player.pr.challenges[id]] || 0) * 5
                if (dna - need > margin) { margin = dna - need; best = id }
            }
            if (margin >= 0) { startChallenge("pr", best); s.chalBest = 1; s.chalGain = t }
        }
    }

    function act2(t) {
        a2Rows12()
        a2Branches()
        a2Row3()
        a2Row4(t)
    }

    // ---------- Act 3 ----------
    function lastRadiation() {
        return tierCost(8, new Decimal(radiationReq() - 1)).gte(SENTIENCE)
    }
    function buryAll() {
        if (!tmp.cf.layerShown || hasMilestone("cf", 3)) return
        while (layers.cf.clickables[11].canClick()) layers.cf.clickables[11].onClick()
    }
    function founder() {
        let best = 1
        for (let f = 2; f <= 4; f++) if (player.ti.amounts[f].gte(player.ti.amounts[best])) best = f
        return best
    }

    function act3(t) {
        if (player.ti.sentient) return
        const s = S(3)
        s.tried = s.tried || {}
        if (layers.ti.clickables[101].canClick()) { layers.ti.clickables[101].onClick(); return }
        // Branches
        if (tmp.ix.layerShown && !hasMilestone("ix", 2) && layers.ix.clickables[11].canClick() && swarmSize() >= (hasMilestone("ix", 1) ? 6.8 : 9.8)) layers.ix.clickables[11].onClick()
        if (tmp.cf.layerShown) {
            if (layers.cf.clickables[12].canClick()) layers.cf.clickables[12].onClick()
            if (t - (s.bury || -1e9) >= 60 && layers.cf.clickables[11].canClick() && player.biomass.gte(1e10)) { layers.cf.clickables[11].onClick(); s.bury = t }
        }
        if (tmp.cv.layerShown && !hasMilestone("cv", 3)) {
            let b = player.cv.balance, n = nudgeSize()
            if (b > n / 2) layers.cv.clickables[11].onClick()
            else if (b < -n / 2) layers.cv.clickables[12].onClick()
        }
        // Near the Spark, autobuyers would spend Biomass past 1.8e308 before it can be clicked
        INSTINCTS.forEach(([key], n) => {
            let near = !player.pz.activeChallenge && lastRadiation() && player.biomass.gte(1e290) && key != "sn" && key != "cu"
            if (near && instinctOn(key)) layers.pz.clickables[11 + 10 * Math.floor(n / 4) + n % 4].onClick()
        })
        for (let l of ["ti", "me"]) for (let id in layers[l].upgrades) {
            if (isNaN(id) || hasUpgrade(l, id) || !tmp[l].upgrades[id].unlocked || !canAffordUpgrade(l, id)) continue
            buyUpg(l, id)
        }
        maxAllSpecies()
        if (tmp.cu.layerShown && !instinctOn("cu")) {
            let w = tiersUnlocked()
            player.cu.winner = w
            if (layers.cu.clickables[91].canClick() && competitionGain(w).gte(3)) layers.cu.clickables[91].onClick()
        }
        // Selection Pressures, tried at the very end of the run (one at a time, easiest goal first)
        let a = player.pz.activeChallenge
        if (a && t - (s.pzStart || t) > 600) { s.tried[a] = 1; startChallenge("pz", a) }
        let radiated = false
        if (instinctOn("ar")) player.ar.founder = founder()
        else if (layers.ar.clickables[91].canClick()) { player.ar.founder = founder(); buryAll(); layers.ar.clickables[91].onClick(); radiated = true }
        if (tmp.pz.layerShown && !player.pz.activeChallenge && lastRadiation()) {
            let c = PRESSURE_IDS.filter(id => !hasChallenge("pz", id) && !s.tried[id])
            if (c.length) {
                c.sort((x, y) => new Decimal(PRESSURES[x].goal).cmp(PRESSURES[y].goal))
                startChallenge("pz", c[0]); s.pzStart = t
            }
        }
        if (!radiated && !instinctOn("sn") && layers.sn.clickables[91].canClick()) {
            player.sn.keystone = Math.min(1, tiersUnlocked())
            buryAll()
            layers.sn.clickables[91].onClick()
        }
    }

    // ---------- Act 4 ----------
    const RATIO = { woodcutter: 0.28, miner: 0.2, scholar: 0.3, storyteller: 0.15, engineer: 0.07 }
    function act4(t) {
        if (!civUnlocked() || player.ex.eternity) return
        const s = S(4)
        if ((civCache.gross.food || 0) < 3) for (let i = 0; i < 3; i++) layers.sm.clickables[11].onClick()
        if (bld("hut") == 0 && civRes("wood") < 5 && civRes("food") >= 50) layers.sm.clickables[12].onClick()
        while (idlePeople() > 0) {
            if (hasTech("agriculture") && (civCache.net.food < 1 || (seasonIndex() >= 2 && civCache.net.food < 4))) { assignJob("farmer", 1); continue }
            let open = JOBS.filter(j => j.unlock() && j.key != "farmer")
            let tot = open.reduce((a, j) => a + jobCount(j.key), 0) + 1
            let pick = open.reduce((a, j) => (RATIO[j.key] - jobCount(j.key) / tot) > (RATIO[a.key] - jobCount(a.key) / tot) ? j : a, open[0])
            assignJob(pick.key, 1)
        }
        if (civRes("food") >= civCap("food") * 0.99 && jobCount("farmer") > 0 && civCache.net.food > 10) unassignJob("farmer", 1)
        for (let tt of TECHS) if (!hasTech(tt.key) && tmp.kn.upgrades[tt.id] && tmp.kn.upgrades[tt.id].unlocked && civCanAfford(tt.cost)) buyUpg("kn", tt.id)
        for (let id in WORKSHOP) if (!hasUpgrade("wk", id) && hasTech(WORKSHOP[id].unlock) && civCanAfford(WORKSHOP[id].cost)) buyUpg("wk", id)
        for (let k of CRAFTED_RES) {
            if (!RECIPES[k].unlock()) continue
            let src = Object.keys(RECIPES[k].from)[0]
            if (civRes(src) >= civCap(src) * 0.9) craft(k, Math.floor(civRes(src) * 0.4 / RECIPES[k].from[src]))
        }
        for (let pass = 0; pass < 3; pass++) for (let bb of BUILDINGS) {
            if (!buildingUnlocked(bb)) continue
            if ((bb.key == "factory" || bb.key == "powerplant") && (civCache.net.fuel || 0) < (bb.key == "factory" ? 0.05 : 0.15)) continue
            if (bb.key == "field" && civRes("food") < civCap("food") * 0.3 && bld("field") > 40) continue
            let c = buildingCost(bb)
            if (c.knowledge) { let next = TECHS.find(x => !hasTech(x.key)); if (next && civRes("knowledge") - c.knowledge < next.cost.knowledge * 0.5) continue }
            if (civCanAfford(c)) buyBuilding(bb)
        }
        if (tmp.tr.layerShown) for (let n = 0; n < 3; n++) if (ROUTES[n].unlock() && tradeRate(n) >= 1.3) sendCaravan(n)
        if (tmp.br.layerShown) {
            if (player.br.litter.length) { let best = Math.max(...player.br.litter); if (best > player.br.lines[player.br.line]) keepYoung(player.br.litter.indexOf(best)) }
            let open = LINE_KEYS.filter(k => LINES[k].unlock()), low = open.reduce((a, k) => player.br.lines[k] < player.br.lines[a] ? k : a, open[0])
            if (player.br.kept % 3 == 0 && player.br.line != low && !player.br.litter.length) player.br.line = low
        }
        if (tmp.wn.layerShown) for (let k of WONDER_KEYS) if (hasTech(WONDERS[k].unlock)) { let c = wonderStepCost(k, 1); if (Object.keys(c).every(r => c[r] <= civRes(r) * 0.2)) buildWonder(k, 1) }
        if (tmp.dt.layerShown) for (let id of [11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33, 34, 41, 42, 43, 44]) if (!hasUpgrade("dt", id) && player.ex.points.gte(layers.dt.upgrades[id].cost)) buyUpg("dt", id)
        // Extinction once research and the population have both stalled for 5 minutes (Act 4 time)
        // (never more than 60x real time, so a very fast Act 4 still gives a new civilization a few real seconds)
        let sp = Math.min(actSpeedCache[4], 60)
        if (s.run === undefined) { s.run = t; s.tech = t; s.people = t; s.techs = 0; s.peak = 0 }
        if (techCount() > s.techs) { s.techs = techCount(); s.tech = t }
        if (player.vg.people > s.peak) { s.peak = player.vg.people; s.people = t }
        let stalled = (t - s.tech) * sp > 300 && (t - s.people) * sp > 300
        let hold = hasUpgrade("dt", 44) && (t - s.run) * sp < 5400
        if (strataGain().gte(1) && stalled && !hold) { doExtinction(); s.run = s.tech = s.people = t; s.techs = techCount(); s.peak = 0 }
        if (eternityReady()) layers.ex.clickables[91].onClick()
        // Act 4's Trials, once Industrialization is in reach
        if (player.ex.count >= 1 && hasTech("industrialization")) {
            let a = player.ex.activeChallenge
            if (a && canCompleteChallenge("ex", a)) startChallenge("ex", a)
        }
    }

    // ---------- Act 5 ----------
    const SHARE = { combat: 0, replicate: 0.3, hazard: 0.15, explore: 0.15, speed: 0.1, harvester: 0.1, wire: 0.1, factory: 0.1 }
    function act5(t, diff) {
        if (!spaceUnlocked() || player.mv.heatDeath) return
        const s = S(5)
        s.gt = (s.gt || 0) + diff * actSpeedCache[5]
        if (s.mvStart === undefined) { s.mvStart = s.gt; s.bestRate = 0 }
        if (!player.pb.autoTrust) {
            let T = probeTrust()
            for (let k of STAT_KEYS) player.pb.trust[k] = 0
            player.pb.trust.replicate = 1
            while (trustUsed() < T) { let k = STAT_KEYS.reduce((a, k) => (SHARE[k] - trustIn(k) / (trustUsed() + 1)) > (SHARE[a] - trustIn(a) / (trustUsed() + 1)) ? k : a, STAT_KEYS[0]); player.pb.trust[k]++ }
            if (driftStarted()) for (let i = 0; i < 40 && combatRate().lte(drifterCopyRate().times(1.3)); i++) {
                let from = STAT_KEYS.filter(k => k != "combat" && k != "replicate" && trustIn(k) > 0).reduce((a, k) => a === null || trustIn(k) > trustIn(a) ? k : a, null)
                if (!from) break
                player.pb.trust[from]--; player.pb.trust.combat++
            }
        }
        if (driftStarted()) {
            player.sq.think = 20
            for (let id of [11, 12]) if (layers.sq.buyables[id].cost().lt(player.hv.hulls.times(0.1))) layers.sq.buyables[id].buy()
            for (let id of [11, 12, 13]) layers.dr.buyables[id].buy()
            for (let id in DR_UPGRADES) buyUpg("dr", id)
            for (let id in SQ_UPGRADES) buyUpg("sq", id)
            for (let i = 0; i < 5 && player.sq.compute.gte(tournamentCost()); i++) runTournament(predictedBest())
        }
        if (beyondVirgo()) {
            for (let p of PROJECTS) if (projectAvailable(p) && !hasUpgrade("pj", p.id)) buyUpg("pj", p.id)
            for (let id in UN_UPGRADES) buyUpg("un", id)
            let fresh = player.un.offered.find(k => !player.un.collected[k] && k != "quiet")
            if (fresh) player.un.next = fresh
        }
        if (multiverseUnlocked()) {
            for (let pass = 0; pass < 2; pass++) for (let id in MV_UPGRADES) buyUpg("mv", id)
            let g = realityGain(), since = s.gt - s.mvStart
            if (!hasMilestone("rv", 3) && g.gte(1) && (g.gte(player.mv.total.max(1).times(0.5)) || since > 2700) && since > 900) { collapseMultiverse(); s.mvStart = s.gt }
        }
        if (player.sg.target !== null && tmp.sg.layerShown) { player.sg.freq = player.sg.target; lockOn() }
        if (player.wh.holes.length) { let best = ["hulls", "honor", "compute", "yomi"].map(o => player.wh.holes.indexOf(o)).find(i => i >= 0); jump(best === undefined ? 0 : best) }
        if (tmp.tf.layerShown && player.tf.started && player.tf.cooldown <= 0) { for (let d = 0; d < 3; d++) player.tf.dials[d] = Math.floor((player.tf.low[d] + player.tf.high[d]) / 2); seedWorld() }
        if (player.pb.launched < 6 || !hasMilestone("pb", 1)) launchProbe()
        for (let i = 0; i < 50; i++) {
            let need = powerRatio() < 1 && player.hv.hulls.gte(hvBuildingCost(14)) ? 14 : player.hv.matter.gt(spaceCache.wire.times(20).add(100)) ? 12 : player.hv.wire.gt(spaceCache.hulls.times(wirePerHull()).times(20).add(100)) ? 13 : unharvested().gt(0) ? 11 : 13
            if (player.hv.hulls.gte(hvBuildingCost(need))) hvBuy(need, 1); else break
        }
        for (let k of STAT_KEYS) { let id = 11 + STAT_KEYS.indexOf(k); if (layers.pb.buyables[id].cost().lt(player.hv.hulls.times(0.1))) layers.pb.buyables[id].buy() }
        for (let id in HV_UPGRADES) buyUpg("hv", id)
        for (let id in PB_UPGRADES) if (tmp.pb.upgrades[id] && tmp.pb.upgrades[id].unlocked && player.pb.probes.times(0.2).gte(tmp.pb.upgrades[id].cost)) buyUpg("pb", id)
        // A new universe once the next power of 10 would take longer than half this one has
        let g = seedGain().toNumber(), run = player.un.runTime
        if (!player.tl.activeChallenge && g >= 1 && run >= 600) {
            let rate = g / run
            s.bestRate = Math.max(s.bestRate, rate)
            let perSec = spaceCache.explore.div(player.pb.explored.max(1)).toNumber() / Math.LN10 * spaceSpeed()
            if (rate < 0.85 * s.bestRate || (perSec > 0 ? 1 / perSec : Infinity) > 0.5 * run) { resetUniverse(); s.bestRate = 0 }
        }
        // Trials not yet won: one at a time, given up after an hour
        if (tmp.tl.layerShown && !hasMilestone("rv", 5)) {
            let a = player.tl.activeChallenge
            if (!a) { let next = Object.keys(SPACE_TRIALS).find(id => !hasChallenge("tl", id)); if (next && player.un.runTime > 120 && !s.trialsTried) { s.trial = t; startChallenge("tl", Number(next)) } }
            else if (t - (s.trial || t) > 3600) { startChallenge("tl", a); s.trialsTried = 1 }
        }
    }

    // ---------- The Deepenings ----------
    const DV_ORDER = [11, 21, 22, 23, 31, 32, 33, 41, 42, 51]
    function deep(t) {
        // Constants, measured and equipped by strength
        if (constantsUnlocked() && !hasUpgrade("mm", 31)) {
            for (let i = 0; i < 5; i++) {
                if (player.cn.list.length >= CONSTANT_TUNE.inventory) { let spare = player.cn.list.filter(k => !player.cn.equipped.includes(k.id)); if (!spare.length) break; dissolveConstant(spare.reduce((a, k) => constantScore(k) < constantScore(a) ? k : a, spare[0]).id) }
                if (!canMeasure()) break
                measureConstant()
            }
            player.cn.equipped = player.cn.list.slice().sort((a, b) => constantScore(b) - constantScore(a)).slice(0, constantSlots()).map(k => k.id)
        }
        if (geneticsUnlocked()) {
            for (let id of [11, 12, 13, 14, 23, 21, 24, 22]) if (!hasUpgrade("gx", id) && tmp.gx.upgrades[id] && tmp.gx.upgrades[id].unlocked) buyUpg("gx", id)
            for (let i = 0; i < 10; i++) {
                let best = [11, 15, 16, 12].reduce((a, id) => layers.gx.buyables[id].cost().lt(layers.gx.buyables[a].cost()) ? id : a, 11)
                if (!layers.gx.buyables[best].canAfford()) break
                layers.gx.buyables[best].buy()
            }
        }
        if (devolutionUnlocked()) {
            for (let i = 0; i < 20; i++) {
                let next = DV_ORDER.find(id => getBuyableAmount("dv", id).eq(0) && dvNodeUnlocked(id))
                let pick = next || DV_ORDER.filter(id => getBuyableAmount("dv", id).lt(DEVOLUTION_MAX)).reduce((a, id) => a === null || layers.dv.buyables[id].cost().lt(layers.dv.buyables[a].cost()) ? id : a, null)
                if (pick === null || !layers.dv.buyables[pick].canAfford()) break
                layers.dv.buyables[pick].buy()
            }
            if (canDevolve() && player.lt.endings.includes("tol") && !hasMilestone("dv", 0)) devolve()
            regressionAutomation()
        }
        if (speciesDeepUnlocked()) {
            for (let id of Object.keys(MX_UPGRADES)) if (!hasUpgrade("mx", id) && tmp.mx.upgrades[id] && tmp.mx.upgrades[id].unlocked) buyUpg("mx", id)
            if (!player.mx.activeChallenge && !(mxAutoUnlocked() && player.mx.auto) && lineageGain().gte(1) && (!hasUpgrade("mx", 34) || player.mx.stall >= 30)) massExtinction()
            const s = S(6)
            if (hasUpgrade("mx", 43) && !hasMilestone("er", 6) && !player.mx.activeChallenge && player.mx.runTime > 30) {
                let next = Object.keys(BIG_FIVE).find(id => !hasChallenge("mx", id))
                if (next) { startChallenge("mx", Number(next)); s.big = t }
            }
            if (player.mx.activeChallenge && s.big && t - s.big > 1800) { startChallenge("mx", player.mx.activeChallenge); s.big = 0 }
            if (virusesUnlocked()) for (let i = 0; i < 10; i++) {
                let best = [11, 12, 13].filter(id => layers.vi.buyables[id].canAfford()).reduce((a, id) => a === null || layers.vi.buyables[id].cost().lt(layers.vi.buyables[a].cost()) ? id : a, null)
                if (best === null) break
                layers.vi.buyables[best].buy()
            }
            if (erasUnlocked()) {
                for (let id of [11, 12, 13, 14, 21, 22, 23, 24]) if (!hasUpgrade("er", id)) buyUpg("er", id)
                let g = eonGain()
                if (g.gte(1) && g.gte(player.er.total.times(0.5)) && !player.mx.activeChallenge) closeEra()
            }
        }
        if (progressUnlocked()) {
            for (let i = 0; i < 30; i++) {
                let id = [11, 12].filter(b => layers.ig.buyables[b].canAfford()).reduce((a, b) => a === null || layers.ig.buyables[b].cost().lt(layers.ig.buyables[a].cost()) ? b : a, null)
                if (id === null) break
                layers.ig.buyables[id].buy()
            }
            for (let k = AGE_IDS.length - 1; k >= 0; k--) {
                let id = AGE_IDS[k]
                for (let u of [11, 12, 13, 14]) if (!hasUpgrade(id, u) && player[id].unlocked) buyUpg(id, u)
                if (!tmp[id].layerShown || !canReset(id)) continue
                if (!player[id].unlocked || tmp[id].resetGain.gte(player[id].points.max(1)) && player[id].resetTime > 20) doReset(id)
            }
        }
        if (reversalUnlocked()) {
            for (let id of [11, 12, 13, 14, 21, 22, 23, 24, 31, 32]) if (!hasUpgrade("rv", id) && tmp.rv.upgrades[id].unlocked) buyUpg("rv", id)
            if (player.mv.heatDeath && !hasUpgrade("rv", 32) && negentropyGain().gte(1) && !rewinding()) reverseNext()
        }
    }

    // ---------- The Loops ----------
    const LIGHT_UPS = [11, 13, 14, 12, 15, 23, 25, 41, 21, 22, 24, 42, 43, 44, 45, 46, 32, 31, 33, 35, 34]
    const WEIGHT = { 1: 1, 2: 1.5, 3: 0.8, 4: 3, 5: 6 }
    function loops() {
        for (let id in MEMORIES) if (!hasUpgrade("mm", id) && tmp.mm.upgrades[id] && tmp.mm.upgrades[id].unlocked && canAffordUpgrade("mm", id)) buyUpg("mm", id)
        for (let id of LIGHT_UPS) if (!hasUpgrade("lt", id) && tmp.lt.upgrades[id] && tmp.lt.upgrades[id].unlocked) buyUpg("lt", id)
        for (let l of BRANCH_LIST) if (branchesOpen(BRANCH_ACT[l])) { let b = layers.bx.buyables[keepId(l)]; if (b.canAfford()) b.buy() }
        for (let a in TAILWINDS) { let b = layers.tw.buyables[10 + Number(a)]; if (tmp.tw.buyables[10 + Number(a)].unlocked) b.buyMax() }
        // Speeds, the Singularity and Radiance: best value for Light, favouring the acts that take longest
        for (let i = 0; i < 20; i++) {
            let opts = []
            for (let a = 1; a <= 5; a++) opts.push({ k: "lt", id: 10 + a, v: WEIGHT[a] / layers.lt.buyables[10 + a].cost().toNumber() })
            if (hasUpgrade("lt", 11)) for (let id of [11, 12, 13]) opts.push({ k: "si", id: id, v: 4 / layers.si.buyables[id].cost().toNumber() })
            if (tmp.lt.buyables[16] && tmp.lt.buyables[16].unlocked) opts.push({ k: "lt", id: 16, v: 8 / layers.lt.buyables[16].cost().toNumber() })
            for (let l of BRANCH_LIST) if (branchesOpen(BRANCH_ACT[l]) && layers.bx.buyables[speedId(l)].canAfford()) opts.push({ k: "bx", id: speedId(l), v: 0.5 / layers.bx.buyables[speedId(l)].cost().toNumber() })
            let best = opts.reduce((a, o) => o.v > a.v ? o : a)
            if (!layers[best.k].buyables[best.id].canAfford()) break
            layers[best.k].buyables[best.id].buy()
        }
        // The Last Answer's Loop ends on its own screen; after that, every Loop starts the next
        if (canGenesis() && (player.lt.genesis != 6 || player.keepGoing)) doGenesis()
    }

    return { act1, act2, act3, act4, act5, deep, loops }
})()

function autopilotTick(diff) {
    if (!autopilotUnlocked()) return
    player.ap.time += diff
    let t = player.ap.time
    if (apOn(11)) AUTOPILOT.act1(t)
    if (apOn(12) && lifeUnlocked()) AUTOPILOT.act2(t)
    if (apOn(13) && speciesUnlocked()) AUTOPILOT.act3(t)
    if (apOn(14)) AUTOPILOT.act4(t)
    if (apOn(15)) AUTOPILOT.act5(t, diff)
    if (apOn(21)) AUTOPILOT.deep(t)
    if (apOn(22)) AUTOPILOT.loops()
}

addLayer("ap", {
    name: "autopilot",
    symbol: "Ap",
    row: 51,
    position: 3,
    color: "#8fd3ff",
    startData() { return { unlocked: true, points: new Decimal(0), total: new Decimal(0), time: 0, off: [], s: {} } },
    type: "none",
    resource: "Routines",
    branches: ["lt"],
    layerShown() { return autopilotUnlocked() },
    tooltip() { return formatWhole(player.ap.points) + " Routines" },
    update(diff) {
        if (!autopilotUnlocked()) return
        let g = routineGain() * diff
        player.ap.points = player.ap.points.add(g)
        player.ap.total = player.ap.total.add(g)
        autopilotTick(diff)
    },
    tabFormat: [
        ["display-text", function() { return genesisHeader() }],
        "blank",
        ["display-text", function() { return "You have <h2 style='color:#8fd3ff'>" + formatWhole(player.ap.points) + "</h2> Routines (+" + format(routineGain() * 60, 1) + " a minute)." }],
        "blank",
        lore("Somewhere around the sixth time through, the universe stops needing you to remind it what comes next."),
        "blank",
        ["display-text", "The Autopilot writes Routines on its own: faster for every ending this Loop has reached, for every module it already has, and for every Subroutine. Each module plays its part of the game for you, every choice and challenge included, and can be switched off below. The Autopilot survives every Genesis."],
        "blank",
        "buyables",
        "blank",
        "upgrades",
        "blank",
        ["clickables", [1, 2]],
    ],
    upgrades: Object.fromEntries(Object.entries(AP_MODULES).concat(Object.entries(AP_BOOSTS)).map(([id, m]) => [id, {
        title: m.title,
        description: m.text,
        cost: new Decimal(m.cost),
        unlocked() { return id != 23 || AP_PLAYS.every(x => hasUpgrade("ap", x)) },
        style() { return id == 23 ? { width: "260px", height: "130px" } : { width: "170px", height: id > 30 ? "100px" : "130px" } },
    }])),
    buyables: {
        11: {
            title: "Subroutines",
            cost(x) { return Decimal.pow(2, x === undefined ? getBuyableAmount("ap", 11) : x).times(40) },
            display() { return "Routines x" + (hasUpgrade("ap", 33) ? 1.4 : 1.3) + " a level (now x" + format(subroutineMult(), 2) + ").<br>Level " + formatWhole(getBuyableAmount("ap", 11)) + "<br>Cost: " + format(this.cost()) + " Routines" },
            canAfford() { return player.ap.points.gte(this.cost()) },
            buy() { player.ap.points = player.ap.points.sub(this.cost()); setBuyableAmount("ap", 11, getBuyableAmount("ap", 11).add(1)) },
            style() { return { width: "200px", height: "110px" } },
        },
    },
    clickables: Object.fromEntries(AP_PLAYS.map(id => [id < 20 ? id : id - 10 + 5, {
        title() { return AP_MODULES[id].title },
        display() { return player.ap.off.includes(String(id)) ? "Off" : "On" },
        unlocked() { return hasUpgrade("ap", id) },
        canClick() { return true },
        onClick() { let k = String(id); player.ap.off = player.ap.off.includes(k) ? player.ap.off.filter(x => x != k) : player.ap.off.concat([k]) },
        style() { return { width: "120px", "min-height": "50px", height: "50px", "font-size": "10px", "background-color": player.ap.off.includes(String(id)) ? "#777" : "#8fd3ff" } },
    }])),
})
