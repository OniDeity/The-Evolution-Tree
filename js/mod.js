let modInfo = {
	name: "The Evolution Tree",
	id: "evolutiontree",
	author: "OniDeity",
	pointsName: "energy",
	modFiles: ["layers/cosmos.js", "layers/cosmos-row3.js", "layers/achievements.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.3",
	name: "Every Minute Counts",
}

let changelog = `<h1>Changelog:</h1><br>
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

let winText = `A small, wet, rocky world settles into orbit around a quiet star.<br>
	Somewhere in its oceans, a molecule copies itself for the very first time.<br><br>
	<b>Act 2: Life</b> is coming soon...`

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
	if (player.pl.unlocked) gain = gain.times(buyableEffect("pl", 11))
	gain = gain.times(buyableEffect("p", 11))
	if (hasUpgrade("p", 24)) gain = gain.times(upgradeEffect("p", 24))
	if (hasUpgrade("fu", 22)) gain = gain.times(upgradeEffect("fu", 22))
	if (hasUpgrade("st", 25)) gain = gain.times(upgradeEffect("st", 25))
	if (hasUpgrade("hz", 11)) gain = gain.times(upgradeEffect("hz", 11))
	if (player.de.unlocked) gain = gain.times(tmp.de.expansionEffect)
	if (hasChallenge("hz", 12)) gain = gain.times(challengeEffect("hz", 12))
	if (inChallenge("hz", 12)) gain = gain.max(1).pow(0.5)
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	function() { return cosmicEra() },
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
	return hasUpgrade("pl", 23)
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
