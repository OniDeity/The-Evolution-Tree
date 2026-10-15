let modInfo = {
	name: "The Evolution Tree",
	id: "evolutiontree",
	author: "OniDeity",
	pointsName: "energy",
	modFiles: ["layers/cosmos.js", "layers/cosmos-row3.js", "layers/cosmos-branches.js", "layers/cosmos-row4.js", "layers/life.js", "layers/life-row3.js", "layers/life-row4.js", "layers/life-side.js", "layers/life-branches.js", "layers/life-row5.js", "layers/species.js", "layers/species-branches.js", "layers/species-extra.js", "layers/civ.js", "layers/civ-extinction.js", "layers/civ-branches.js", "layers/civ-side.js", "layers/space.js", "layers/space-drift.js", "layers/space-universe.js", "layers/space-multiverse.js", "layers/space-side.js", "layers/achievements.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "2.4",
	name: "The Last Question",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v2.4 - The Last Question</h3><br>
		- Act 5 is complete! Its final part adds the Multiverse and the end of everything.<br>
		- Multiverse: once you've mapped the observable universe, collapse the multiverse for Realities. It starts all of Act 5 over, Universes included, and every Reality makes Seeds worth more and Act 5 faster. 30 Multiverse upgrades and 8 milestones, including universes consumed on their own.<br>
		- New ending: the Heat Death. Buy the last Multiverse upgrade, Let There Be Light.<br>
		- Trials: 8 universes with harder rules (Lone Probe, Hostile Universe, Silent Swarm, Heavy Universe, Starless, No Templates, Fog and Entropy). Reach 1e18 systems for a permanent reward.<br>
		- Three branches: Signals (tune in before the transmission fades), Wormholes (pick one of three and see where it leads) and Terraforming (find a world's ideal climate from hot-and-cold feedback). Each fully automates itself late on.<br>
		- Hall of Probes: a museum of 16 real and imagined probes, from Sputnik to the Von Neumann probe.<br>
		- 15 achievements and more Flight Log statistics.<br><br>
	<h3>v2.3 - Many Worlds</h3><br>
		- Act 5, part 3. Past the Virgo Supercluster lies the whole observable universe (1e22 systems).<br>
		- Projects: 150 one-off projects appear as your probes push farther out, each costing a mix of Hulls, Honor, Yomi, Compute and probes.<br>
		- Universes: from 1e16 systems on, consume the universe for Seeds and start over in a new one. Every Seed makes Act 5 run faster, and you will need it: past 1e16 systems, cosmic expansion makes each power of 10 three times as slow to explore. Choose its physics from three on offer (Dense, Sparse, Turbulent, Quiet, Bright, Strange, Fertile or Cold). Every kind you've consumed makes Seeds worth 25% more.<br>
		- A new universe keeps every Harvest, Probe, Drift and Swarm upgrade and milestone, and starts where your seeds have already spread. 40 Seed upgrades and 8 Universe milestones. Acts 1 to 4 are never touched.<br>
		- 4 more Probe milestones, 15 achievements and more Flight Log statistics.<br>
		- In a new universe, trust you earn is spent to match your last universe's split (you can switch this off).<br>
		- Breeding's Stud Book now also switches to whichever line has the lowest quality, so the branch runs itself completely.<br>
		- Performance: the game only refreshes text for the tab you're looking at, which roughly halves the work done every tick.<br>
		- New ending (for now): explore the whole observable universe.<br><br>
	<h3>v2.2 - Value Drift</h3><br>
		- Act 5, part 2. Once the Milky Way is mapped, your probes push on toward the Virgo Supercluster (1e15 systems).<br>
		- Drift: some probes drift from your values and become Drifters, a rival machine species that copies itself as fast as your probes and crowds them out. Your new eighth stat, Combat, destroys them for Honor and salvaged Hulls.<br>
		- Swarm: set probes thinking instead of working to make Compute, then back a strategy in game-theory tournaments for Yomi.<br>
		- 120 more upgrades, 6 buyables, 24 milestones (including 4 new Probe milestones) and 15 achievements.<br>
		- Act 5 now shows a Getting Started checklist, and Self-Replication can never drop below 1 trust, so the swarm can't stall.<br>
		- The Speciation Instinct now spreads keystones across your tiers instead of stacking them on one.<br>
		- Act 3 now always shows its goal: how close you are to 1.8e308 Biomass, and the Spark of Sentience button that opens Act 4.<br>
		- New ending (for now): explore every system in the Virgo Supercluster.<br><br>
	<h3>v2.1 - Diaspora</h3><br>
		- Act 5: Diaspora has begun! Reach Eternity, then open the new Diaspora node. It retells Universal Paperclips' journey into space, and it's being built in four parts. This is the first: the Milky Way.<br>
		- Probes: launch probes and split your trust between seven design stats. Probes copy themselves, explore new systems and are lost to hazards. Calibrate each stat with Hulls.<br>
		- Harvest: Harvester Drones gather Matter from explored systems, Wire Drones spin it into Wire, and Factories press Wire into Hulls. Solar Farms power it all; run short and everything slows down.<br>
		- 120 upgrades (Probe upgrades are paid for with probes), 23 milestones and 15 achievements. Flight Log: statistics for Act 5.<br>
		- New ending (for now): explore every system in the Milky Way.<br><br>
	<h3>v2.0 - The Sixth Extinction</h3><br>
		- Act 4: Extinction has begun! Spark sentience, then open the new Extinction node. It retells Kittens Game and Evolve.<br>
		- Settlement: gather food, then build Fields, Huts, Libraries and 24 more buildings. Every building leaves a footprint on the biosphere, and a worn-down biosphere grows less food.<br>
		- Village: people arrive while there's room and food. Give them jobs. Watch the seasons: winter grows a quarter of the food.<br>
		- Knowledge: 23 techs from Agriculture to Rewilding. Workshop: craft Beams, Slabs, Plates and Books, and buy 18 improvements.<br>
		- Extinction: once you reach Industrialization, end your civilization (and Act 3's living world) for Strata. Bigger civilizations leave more. Strata make your next civilization stronger and Act 3's tiers grow back faster.<br>
		- Deep Time: 16 permanent upgrades bought with Strata, plus extinction milestones that automate research and the Workshop.<br>
		- Trials: 4 optional runs under harder rules.<br>
		- Branches: Trade (wandering prices), Breeding (keep the best of each litter) and Wonders (built 1% at a time, never lost).<br>
		- Lost Species: a museum of 12 animals that are gone for good. Chronicle: statistics for Act 4.<br>
		- New ending: Eternity. Added 10 Act 4 achievements. Each makes your civilization 5% stronger.<br><br>
	<h3>v1.6.1</h3><br>
		- Stellar Winds is easier: sails are cheaper (cost x1.3 each instead of x1.5), flares are rarer and tear a tenth of your sails instead of a quarter, and sails are bought automatically at 15 sails instead of 1e6 Wind.<br><br>
	<h3>v1.6 - Balancing Act</h3><br>
		- Act 1 rebalance: energy no longer runs away once Galaxies arrive. Galaxies now add to the Atom base instead of multiplying it, and Atoms, Inflation and Gravitational Force have stronger softcaps.<br>
		- Row 3's last shared milestone (Stars and Planets reset nothing) needs a few more galaxies, black holes, dark energy or resilience.<br>
		- Galaxies and Black Holes are a little cheaper. Cosmic Winter and Doomsday have higher goals.<br>
		- Max All moved to the Q key (M is Mutations again), and it no longer buys a tier past the one below it. The tier Instincts work the same way.<br>
		- Competition no longer makes your food demand spike.<br>
		- Radiation founders are limited to the first 4 tiers, the only ones still around after radiating.<br>
		- The Hunt → Rest combo did nothing; it's now Forage → Hunt.<br>
		- Fixed offline time breaking Photosynthesis, Pulsars and Ocean Currents.<br>
		- Fixed Habitats automation stalling when the Shoreline wasn't next to a colony.<br>
		- A Supernova's neutrinos add to a burst that's already passing.<br>
		- Gene Transfer milestones are in order. Act 3 autobuyers keep running after Sentience.<br><br>
	<h3>v1.5 - Second Nature</h3><br>
		- Everything you'd otherwise repeat forever can now be automated by a milestone:<br>
		- Act 1: Galaxies and Black Holes form on their own; Asteroid prospecting, Quantum spells and Dark Matter weighing.<br>
		- Act 2: the trait draft (picks the trait you have fewer of), Adaptations, settling colonists, Multicellular forms, partners, Gene Transfer, steering Ocean Currents and chasing off rivals in Territory.<br>
		- Act 3: Evolutionary milestones and Metabolism upgrades (beat 4 Selection Pressures), burying Coal before a reset and balancing Coevolution.<br>
		- Hormones now shows your right answers, accuracy and best streak.<br><br>
	<h3>v1.4 - Life on Land</h3><br>
		- Act 2 bonus content (optional): a new Row 5, unlocked by the Tree of Life. Each layer sends a small gift to Act 3.<br>
		- Hormones: something happens, and you answer with the right hormone before the moment passes. Streaks pay more.<br>
		- Homeostasis: keep Temperature, Water and Energy in the healthy band. Too much counts as out of balance too.<br>
		- Territory: chase rivals off your range before they take a patch.<br>
		- Seasons: forage all year (autumn's harvest pays 3x). Whatever food lasts the winter becomes permanent Fat.<br><br>
	<h3>v1.3 - The Wider Universe</h3><br>
		- Act 1 bonus content (optional): a new Row 4, unlocked by the Habitable Zone. It keeps the universe evolving alongside life, and sends small gifts to the later acts.<br>
		- Quantum Fluctuations: cast spells for energy, DNA or Biomass. Uncertainty: they're either strong and brief or weak and long.<br>
		- Matter vs. Antimatter: set the balance. Where they meet they annihilate into Light; the surplus boosts DNA (matter) or Biomass (antimatter).<br>
		- Stellar Winds: sails catch the solar wind, but flares near solar maximum tear any left out.<br>
		- Dark Matter Halos: weigh invisible halos in as few guesses as you can. Dark Matter strengthens Act 3's species tiers.<br>
		- Observatory: 16 discoveries, each boosting energy. Star Log: statistics for Act 1.<br><br>
	<h3>v1.2 - Survival of the Fittest</h3><br>
		- Act 3 bonus content (optional, Sentience doesn't need it), unlocked by your first Adaptive Radiation.<br>
		- Selection Pressures: 8 challenges that change the rules of a run, like Island, Drought, Ice Age and Famine. Hitting the goal wins straight away.<br>
		- Each pressure teaches an Instinct: an autobuyer for tiers, Metabolism, Speciation, Competition or Radiation, which you can switch on and off.<br>
		- Specimen Collection: a museum of 12 famous creatures. Each boosts Biomass.<br>
		- Field Notes for Act 3.<br>
		- Updates now show up as soon as you refresh.<br><br>
	<h3>v1.1 - Branching Out</h3><br>
		- New branches on every tree: small helper layers with something to do while you wait out a wall. They never reset.<br>
		- Act 1: Neutrinos (catch bursts), Pulsars (tap on the beat) and the Asteroid Belt (prospect for rich ore).<br>
		- Act 2: Photosynthesis (vent Oxygen before it overflows), Gene Transfer (pick up traits you passed on), Eggs (clutch timing) and Ocean Currents (Drift makes colonists cheaper).<br>
		- Act 3: Insects (harvest the swarm at its peak), Coal (bury Biomass before you reset) and Coevolution (keep the arms race balanced).<br>
		- Symbiosis: each partner now shows when it will next be gifted automatically.<br><br>
	<h3>v1.0.2</h3><br>
		- Fixed offspring barely growing (or sitting at 0) once they live a long time.<br><br>
	<h3>v1.0.1</h3><br>
		- Habitats: Abandon mode. Free up colonists from tiles you've settled and place them somewhere else.<br>
		- Habitats now reminds you that the Shoreline needs 3 free colonists.<br><br>
	<h3>v1.0 - Origin of Species</h3><br>
		- Act 3: Species has begun! Finish the Tree of Life, then open the new Species node.<br>
		- Species tiers: 8 tiers from Bacteria to Humans, each making the one below it. The food pyramid: a tier starves if the tier below it has fewer purchases.<br>
		- Metabolism: speeds up every tier, but eats a growing share of your Biomass.<br>
		- Speciation: unlocks new tiers and doubles everything. Pick a keystone tier to double again.<br>
		- Adaptive Radiation: a stronger, cheaper-to-feed Metabolism. Pick a founder tier that keeps 10% of its population.<br>
		- Competition: pick a winner, and every tier below it is wiped out to boost it.<br>
		- Evolutionary milestones: 16 permanent upgrades bought with Biomass.<br>
		- New ending: the Spark of Sentience, at 1.8e308 Biomass.<br>
		- Added 10 Act 3 achievements. Each makes every species tier 5% stronger.<br><br>
	<h3>v0.9 - Natural History</h3><br>
		- Added three side layers to the Life tree. They never reset.<br>
		- Fossil Record: a museum of 16 fossils found by reaching milestones, each with a little history. Every fossil boosts DNA.<br>
		- Biodiversity: rewards variety, counting the different kinds of things you've collected.<br>
		- Field Notes: statistics for Act 2.<br>
		- Rebalanced Act 2 to about one new thing a minute: slower DNA overall, retuned predator goals.<br><br>
	<h3>v0.8 - The Tree of Life</h3><br>
		- Act 2 is complete! Its final row unlocks once you reach land.<br>
		- Multicellular: build a body plan, one exclusive choice per tier.<br>
		- Symbiosis: partners each want a different gift, and their Bond fades unless you keep giving.<br>
		- Instincts: arrange behaviors into a daily routine that cycles, with combos.<br>
		- Predators: an arms race of 3 challenges, each winnable 3 times.<br>
		- New ending: the Tree of Life.<br>
		- Fixed traits being wiped by Generations, Adaptation and Habitats resets.<br>
		- Fixed your first reset in a new row not getting the protection its milestone promises.<br>
		- Fixed buying an upgrade several times in one tick overspending.<br>
		- After 5 copies of the same trait, extra copies count for less.<br>
		- Added "Let nature decide" to pick many waiting traits at once.<br>
		- Added 5 achievements.<br><br>
	<h3>v0.7 - Out of the Water</h3><br>
		- Act 2's second row: Generations, Adaptation and Habitats, unlocked by the Cambrian Explosion.<br>
		- Generations: a generation clock hands down Heritage based on your cells and offspring when it fills.<br>
		- Adaptation: the climate cycles, and each adaptation is strongest in its own climate.<br>
		- Habitats: colonize a map of the sea, tile by tile, all the way to the Shoreline.<br>
		- New ending: crawl onto land.<br>
		- Added 5 achievements.<br><br>
	<h3>v0.6 - It's Alive</h3><br>
		- Act 2: Life has begun! Buy the Habitable Zone, then open the new Life node next to Achievements.<br>
		- Added DNA and Cells: cells divide on their own up to a carrying capacity.<br>
		- Added Mutations: every mutation offers a choice of two random traits.<br>
		- Added Reproduction: offspring are born and die, settling where births balance deaths.<br>
		- Added 10 Act 2 achievements.<br>
		- The end of Act 1 is harder: tougher Cosmic Hazards, 5 Habitable planets, pricier Row 3 upgrades.<br>
		- The tree fits on phone screens.<br><br>
	<h3>v0.5.1</h3><br>
		- Game files now always refresh after an update, so old cached files can't mix with new ones.<br><br>
	<h3>v0.5 - Every Layer Its Own</h3><br>
		- Particles: choose to make Fermions (boost particles) or Bosons (boost energy).<br>
		- Fusion: a Plasma Temperature slider. Hotter reactors are stronger but burn more fuel.<br>
		- Galaxies: pick each galaxy's shape (Spiral, Elliptical, Irregular) before it forms.<br>
		- Black Holes: they spin up the longer you leave them alone.<br>
		- Dark Energy: the Fate of the Universe meter. Keep it flat for the strongest Expansion.<br>
		- Cosmic Hazards: two Combined Hazards, Cosmic Winter and Doomsday.<br>
		- Galaxy and Black Hole upgrades no longer spend galaxies or black holes.<br>
		- Fixed unplaced planets jumping into the Outer orbit on their own.<br>
		- Rebalanced all of Act 1 around the new mechanics.<br><br>
	<h3>v0.4 - Signature Twists</h3><br>
		- Atoms: the Periodic Table. Fuse elements you own into heavier ones.<br>
		- Gravity: merge 3 wells into a Massive Well for Gravitational Force.<br>
		- Stars: go Supernova to trade your stars for permanent Heavy Elements.<br>
		- Planets: place each planet in an orbit. Land and buildings are gone.<br>
		- Habitable Zone now also needs 3 planets in the Habitable orbit.<br>
		- Choosing Atoms or Gravity first now only makes the other 20x more expensive (was 5000x).<br><br>
	<h3>v0.3.1</h3><br>
		- Fixed an "Invalid value: unlockOrder" error when buying your first atom or gravity well.<br><br>
	<h3>v0.3 - Every Minute Counts</h3><br>
		- Pacing pass: something new to buy roughly every minute.<br>
		- Added Quark Flavors (Up, Down, Strange, Charm, Bottom, Top).<br>
		- Added Stellar Population upgrades, bought with Starlight.<br>
		- Added 30+ upgrades across every layer, including Cosmic Hazard upgrades.<br>
		- Habitable Zone now also requires every Row 3 upgrade.<br>
		- Rebalanced challenge goals, Galaxies and Black Holes.<br><br>
	<h3>v0.2 - The Cosmic Web</h3><br>
		- Act 1 is complete!<br>
		- Added Row 3: Galaxies, Black Holes, Dark Energy and Cosmic Hazards.<br>
		- Added 4 Cosmic Hazards (challenges). Habitable Zone now requires surviving all of them.<br>
		- Added 11 achievements.<br>
		- Fixed game files sometimes loading in the wrong order.<br><br>
	<h3>v0.1 - Let There Be Light</h3><br>
		- Act 1: The Cosmos.<br>
		- Added Particles, Atoms, Gravity, Stars, Fusion and Planets.<br>
		- Added achievements.<br>
		- Endgame: a habitable world.`

let winText = `Bacteria fed fish, fish fed amphibians, and so on up the pyramid, until one strange ape looked up at the stars and wondered where it all came from.<br><br>
	<b>Act 3: Species is complete.</b><br><br>
	Then that ape built fires, and fields, and cities, and very nearly ate the world. It took a few extinctions to learn how to stop.<br><br>
	<b>Act 4: Extinction is complete.</b><br><br>
	Then it sent its children to the stars. They copied themselves, system after system, until every star in the Milky Way had one.<br><br>
	<b>You've mapped the Milky Way.</b><br><br>
	Some of them stopped listening. It took a war, and a great deal of thinking, but the swarm held together all the way to the Virgo Supercluster.<br><br>
	<b>You've mapped the Virgo Supercluster.</b><br><br>
	And when one universe wasn't enough, the swarm learned to plant the next, each with its own strange physics, until a single swarm had mapped everything there is to see.<br><br>
	<b>You've mapped the observable universe.</b><br><br>
	Universe after universe, until the last stars burned out and only the swarm was left, thinking in the dark. It had been asked, long ago, whether entropy could ever be reversed. Now, at last, it knew how.<br><br>
	"Let there be light."<br><br>
	<b>Act 5: Diaspora is complete.</b> Act 6, the first New Game+, is coming soon...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = []

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return hasUpgrade("p", 11)
}

const ENERGY_PACING = 0.92

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
	if (hasUpgrade("p", 12)) gain = gain.times(upgradeEffect("p", 12))
	if (hasUpgrade("p", 13)) gain = gain.times(upgradeEffect("p", 13))
	if (hasUpgrade("p", 22)) gain = gain.times(upgradeEffect("p", 22))
	if (hasUpgrade("p", 33)) gain = gain.times(upgradeEffect("p", 33))
	if (player.at.unlocked) gain = gain.times(tmp.at.effect)
	if (player.gr.unlocked) gain = gain.times(tmp.gr.forceEffect)
	if (player.st.unlocked) gain = gain.times(tmp.st.starlightEffect)
	if (player.fu.unlocked) gain = gain.times(buyableEffect("fu", 11).energy)
	gain = gain.times(orbitEffect("inner"))
	gain = gain.times(buyableEffect("p", 11))
	gain = gain.times(tmp.p.bosonEffect)
	if (hasUpgrade("p", 24)) gain = gain.times(upgradeEffect("p", 24))
	if (hasUpgrade("fu", 22)) gain = gain.times(upgradeEffect("fu", 22))
	if (hasUpgrade("st", 25)) gain = gain.times(upgradeEffect("st", 25))
	if (hasUpgrade("hz", 11)) gain = gain.times(upgradeEffect("hz", 11))
	if (player.de.unlocked) gain = gain.times(tmp.de.expansionEffect)
	if (hasChallenge("hz", 12)) gain = gain.times(challengeEffect("hz", 12))
	gain = gain.times(neutrinoEffect())
	gain = gain.times(cosmicGift("energy"))
	gain = gain.times(observatoryBonus())
	if (hasMilestone("as", 2)) gain = gain.times(1.5)
	// Pacing: stretches the whole act evenly so something new unlocks about once a minute
	gain = gain.max(1).pow(ENERGY_PACING)
	if (inChallenge("hz", 12)) gain = gain.max(1).pow(0.5)
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	dna: new Decimal(0),
	biomass: new Decimal(0),
}}

// Display extra things at the top of the page
var displayThings = [
	function() { return cosmicEra() },
	function() { return lifeUnlocked() ? "<span style='color:#7ed957'>" + format(player.dna) + " DNA (+" + format(dnaGain()) + "/sec)</span>" : "" },
	function() { return speciesUnlocked() ? "<span style='color:#e0c068'>" + format(player.biomass) + " Biomass (+" + format(biomassGain()) + "/sec)</span>" : "" },
	function() { return spaceUnlocked() ? "<span style='color:#5b8def'>" + format(player.pb.probes) + " probes, " + format(player.pb.explored) + " systems explored</span>" : "" },
	function() { return civUnlocked() ? "<span style='color:#d9774b'>" + formatWhole(player.ex.points) + " Strata, " + formatWhole(player.vg.people) + " people (" + civEra().replace("Era: ", "") + ")</span>" : "" },
]

function cosmicEra() {
	let e = player.points
	if (player.ga.unlocked || player.bh.unlocked || player.de.unlocked || player.hz.unlocked) return "Era: The Cosmic Web"
	if (player.pl.unlocked) return "Era: Planetary Formation"
	if (player.st.unlocked || player.fu.unlocked) return "Era: The First Stars"
	if (player.at.unlocked || player.gr.unlocked) return "Era: Recombination"
	if (player.p.unlocked) return "Era: The Quark Epoch"
	if (e.gt(0)) return "Era: Planck Epoch"
	return ""
}

// Determines when the game "ends"
function isEndgame() {
	return player.mv.heatDeath
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
	// Act 4 moved the ending. If you'd chosen to keep playing after Sentience, the Eternity screen should still show
	if (parseFloat(oldVersion) < 2 && !player.ex.eternity) player.keepGoing = false
	// Act 5 moved the ending again: if you'd kept playing after Eternity, the Milky Way's win screen should still show
	if (oldVersion != "2.1" && parseFloat(oldVersion) < 2.1 && player.pb.explored.lt(GALAXY_SYSTEMS)) player.keepGoing = false
	if (parseFloat(oldVersion) < 2.2 && player.pb.explored.lt(VIRGO_SYSTEMS)) player.keepGoing = false
	if (parseFloat(oldVersion) < 2.3 && player.pb.explored.lt(UNIVERSE_SYSTEMS)) player.keepGoing = false
	if (parseFloat(oldVersion) < 2.4 && !player.mv.heatDeath) player.keepGoing = false
	// Seeds planted before the Multiverse existed still count toward your first collapse
	if (parseFloat(oldVersion) < 2.4 && player.mv.collapses == 0) player.mv.cycleSeeds = player.mv.cycleSeeds.max(player.un.totalSeeds)
	// The Observatory arrived in v1.3. Record discoveries you'd already made quietly, instead of a pile of popups.
	try {
		DISCOVERIES.forEach((d, n) => {
			let id = String(11 + Math.floor(n / 4) * 10 + n % 4)
			if (d.done() && !player.ob.achievements.includes(id)) player.ob.achievements.push(id)
		})
	} catch (e) {}
}
