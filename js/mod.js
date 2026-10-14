let modInfo = {
	name: "The Evolution Tree",
	id: "evolutiontree",
	author: "OniDeity",
	pointsName: "energy",
	modFiles: ["layers/cosmos.js", "layers/cosmos-row3.js", "layers/life.js", "layers/achievements.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.6",
	name: "It's Alive",
}

let changelog = `<h1>Changelog:</h1><br>
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

let winText = `Single cells crowd the warm seas, swapping genes and copying themselves by the trillion.<br>
	Then, in what is barely a blink in the long life of the Earth, they begin to stick together.<br><br>
	<b>Act 2: Life</b> continues soon...`

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
	// Pacing: stretches the whole act evenly so something new unlocks about once a minute
	gain = gain.max(1).pow(ENERGY_PACING)
	if (inChallenge("hz", 12)) gain = gain.max(1).pow(0.5)
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	dna: new Decimal(0),
}}

// Display extra things at the top of the page
var displayThings = [
	function() { return cosmicEra() },
	function() { return lifeUnlocked() ? "<span style='color:#7ed957'>" + format(player.dna) + " DNA (+" + format(dnaGain()) + "/sec)</span>" : "" },
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
	return hasUpgrade("c", 34)
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
}
