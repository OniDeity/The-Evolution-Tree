let modInfo = {
	name: "The Evolution Tree",
	id: "evolutiontree",
	author: "OniDeity",
	pointsName: "energy",
	modFiles: ["layers/cosmos.js", "layers/cosmos-row3.js", "layers/cosmos-branches.js", "layers/cosmos-row4.js", "layers/life.js", "layers/life-row3.js", "layers/life-row4.js", "layers/life-side.js", "layers/life-branches.js", "layers/life-row5.js", "layers/species.js", "layers/species-branches.js", "layers/species-extra.js", "layers/achievements.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "1.6",
	name: "Balancing Act",
}

let changelog = `<h1>Changelog:</h1><br>
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
	<b>Act 3: Species is complete.</b> Act 4: Extinction is coming soon...`

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
	return player.ti.sentient
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
	// The Observatory arrived in v1.3. Record discoveries you'd already made quietly, instead of a pile of popups.
	try {
		DISCOVERIES.forEach((d, n) => {
			let id = String(11 + Math.floor(n / 4) * 10 + n % 4)
			if (d.done() && !player.ob.achievements.includes(id)) player.ob.achievements.push(id)
		})
	} catch (e) {}
}
