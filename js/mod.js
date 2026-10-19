let modInfo = {
	name: "The Evolution Tree",
	id: "evolutiontree",
	author: "OniDeity",
	pointsName: "energy",
	modFiles: ["layers/cosmos.js", "layers/cosmos-row3.js", "layers/cosmos-branches.js", "layers/cosmos-row4.js", "layers/life.js", "layers/life-row3.js", "layers/life-row4.js", "layers/life-side.js", "layers/life-branches.js", "layers/life-row5.js", "layers/life-deep.js", "layers/species.js", "layers/species-branches.js", "layers/species-extra.js", "layers/species-deep.js", "layers/civ.js", "layers/civ-extinction.js", "layers/civ-branches.js", "layers/civ-side.js", "layers/civ-deep.js", "layers/space.js", "layers/space-drift.js", "layers/space-universe.js", "layers/space-multiverse.js", "layers/space-reversal.js", "layers/space-side.js", "layers/genesis.js", "layers/branch-memory.js", "layers/tailwinds.js", "layers/constants.js", "layers/autopilot.js", "layers/achievements.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "3.5.4",
	name: "The Last Answer",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v3.5.4</h3><br>
		- Fixed: Directed Evolution poured every Mutation into your chosen trait, far past where extra copies count, which could leave Act 2 stuck below the 1e100 DNA devolving needs. It now stops at the soft cap and spreads the rest. Saves already caught by it have the extra copies spread out on load.<br>
	<h3>v3.5.3</h3><br>
		- Devolution's 10-minute cooldown now runs in Act 2's time, so Act 2's speed (Light, Tailwinds, the Singularity) shortens it.<br>
	<h3>v3.5.2</h3><br>
		- Fixed: with Deep Memory, a Loop kept your Deep Time upgrades but lost the bonus from every Stratum laid down (your civilization's strength, Act 3's tier regrowth and Act 5's bonus), since it barely needs any extinctions. Now Deep Memory also counts the most Strata any Loop has laid down, and never fewer than your kept Deep Time upgrades cost.<br>
	<h3>v3.5.1</h3><br>
		- Fixed a softlock in Act 5: the Drifters could take your last probe (the rule that kept one safe never worked), and once they outnumbered the swarm it could never grow back. Now the last probe is always safe (home rebuilds it if it's ever lost), Drifters never crowd out more than 90% of the room your probes copy into, and being outnumbered doesn't make them hit any harder. A wiped-out swarm recovers on its own.<br>
	<h3>v3.5 - The Last Answer</h3><br>
		- The end of Act 6, from Loop 6 on (Antimatter Dimensions' Automator, retold). The Autopilot writes Routines on its own, faster for every ending this Loop has reached and every module it has.<br>
		- Eight modules: one each for Acts 1 to 5 (every reset, upgrade, choice, branch and challenge), one for the deepenings, one that runs the Loops themselves (spending Light and Memories and starting the next Loop), and the Last Answer. Every module can be switched off.<br>
		- A fifth row of Memories: every Loop starts with every milestone and challenge of an act you had when the last one ended.<br>
		- Loop 6's goal, and the end of Act 6: The Last Answer.<br>
		- 5 achievements.<br>
		- New Light upgrade, Trade Winds (from Loop 2 on): Tailwinds are bought on their own.<br>
		- Endgame: reach the Heat Death in Loop 6, having bought The Last Answer. You can keep going after that: the Autopilot keeps Looping on its own.<br>
	<h3>v3.4.2</h3><br>
		- Fixed: the Tailwinds tab showed nothing once a Tailwind opened.<br>
	<h3>v3.4.1</h3><br>
		- New Act 6 layer, Tailwinds (in the Genesis tree, from Loop 1 on): spend what a finished act leaves behind to make the next one run faster. Energy speeds up Act 2, DNA Act 3, Biomass Act 4 and Strata Act 5 (x1.25 a level). A Tailwind never takes more than a tenth of what you have, and they start over with every Genesis.<br>
		- Fixed: the Reversal milestone that collapses the multiverse on its own could stall for good, waiting on a record rate from an earlier cycle.<br>
	<h3>v3.4 - Reversal</h3><br>
		- Act 6 deepens Act 5, from Loop 5 on ("The Last Question", turned around). After the Heat Death, Reverse it: all of Act 5 rewinds, the multiverse too, for Negentropy.<br>
		- Entropy: a Reversal's Negentropy only arrives once the universe has finished rewinding (in real time), and every Reversal makes the next rewind take longer. Negentropy upgrades speed rewinds up.<br>
		- 10 Negentropy upgrades and 7 milestones: the last of Act 5 is automated (Multiverse and Seed upgrades, collapsing the multiverse, Trials and the Heat Death itself).<br>
		- Loop 5's goal: Let There Be Light, Again.<br>
		- 1 Light upgrade and 5 achievements.<br>
		- Fixed the cause of NaN in Act 5 (Matter, Seeds and the rest): auto-bought Projects could spend more Hulls and probes than you had when several finished at once.<br>
		- Endgame: reach the Heat Death in Loop 5, having bought Let There Be Light, Again.<br>
	<h3>v3.3.3</h3><br>
		- New Act 6 layer, Branch Memory (in the Genesis tree): every side branch of Acts 1 to 5 gets two Light upgrades. One keeps the branch's milestones through every Genesis; the other makes it run faster (1.5x a level, up to 5 levels), even the ones you play against the clock. Each act's branches open in the Loop that deepens that act.<br>
	<h3>v3.3.2</h3><br>
		- Fixed: the game froze (until you refreshed) whenever a Mutation left a trait waiting while the Mutations tab was open.<br>
	<h3>v3.3.1</h3><br>
		- Fixed: Constants couldn't be selected, so they couldn't be equipped or dissolved by hand.<br>
	<h3>v3.3 - The March of Progress</h3><br>
		- Act 6 deepens Act 4, from Loop 4 on (Synergism, retold). Everything here survives every Genesis.<br>
		- Ingenuity: made by your people and techs. Buy Accelerators and Multipliers with it.<br>
		- Five Ages, each a prestige layer on top of the last: Tools, Agriculture, Industry, Information and Space. Each resets the Ages below it (their currency, never their upgrades) and makes Ingenuity grow faster. Their upgrades make your civilization stronger and automate Act 4: jobs, buildings, extinctions, Trials and Eternity.<br>
		- Loop 4's goal: The Space Age.<br>
		- Radiance: a Light upgrade you can buy forever, making Acts 1 to 5 faster.<br>
		- 2 Memories, 1 Light upgrade and 5 achievements.<br>
		- Endgame: reach the Heat Death in Loop 4, in the Space Age.<br>
	<h3>v3.2.4</h3><br>
		- Act 5 can no longer be broken by an invalid number (NaN): if Matter, Seeds or any other Act 5 resource ever goes NaN, it's put back to its last good value.<br>
		- Very fast Act 5 time (in later Loops, or after a long time offline) no longer makes the swarm collapse: probes settle at the room your systems give them.<br>
	<h3>v3.2.3</h3><br>
		- New Probe upgrade, Trust Autopilot (500 probes, on the Probes tab): trust spends itself as you earn it, either keeping the split you've set up or using a balanced split that moves trust into Combat whenever the Drifters start to outpace you.<br>
	<h3>v3.2.2</h3><br>
		- The Heavy Universe Trial could never be won: hazards caught up with copying long before 1e18 systems. Hazards there are now 4 times as deadly instead of 10.<br>
		- Hazards can no longer destroy your last probe, so a swarm can always recover.<br>
	<h3>v3.2.1</h3><br>
		- Signals automates much sooner: decoding pays twice the Contact, and its milestones need 30, 150 and 600 Contact earned (was 50, 500 and 5,000). About 20 decodes instead of 300.<br>
	<h3>v3.2 - The Big Five</h3><br>
		- Act 6 deepens Act 3, from Loop 3 on (Antimatter Dimensions' Infinity and Eternity, retold). All three new layers survive every Genesis, and none of them undo the Spark.<br>
		- Mass Extinctions: with 1.8e308 Biomass, wipe Act 3 out for Lineages. 16 upgrades, including Break the Cycle (Biomass past 1.8e308 counts) and automatic mass extinctions.<br>
		- The Big Five: Ordovician, Devonian, Permian, Triassic and Cretaceous, five runs with harder rules and permanent rewards.<br>
		- Viruses: a population that copies itself up to 1.8e308 and makes every tier stronger, bursting into free viral radiations at the cap.<br>
		- Geological Eras: start Mass Extinctions over for Eons. 8 milestones take Act 3's last choices off your hands (Selection Pressures, competition, the founder, the Big Five), and 8 Eon upgrades.<br>
		- Loop 3's goal: The Phanerozoic, all of the Big Five and the 10th era.<br>
		- 2 Memories, 2 Light upgrades and 5 achievements.<br>
		- Endgame: reach the Heat Death in Loop 3, with the Phanerozoic.<br>
	<h3>v3.1.1</h3><br>
		- Signals (Act 5) is now a tap game instead of a slider, so it works on phones: decode each transmission by tapping its symbols in order before it fades.<br>
	<h3>v3.1 - Back to One Cell</h3><br>
		- Act 6 deepens Act 2. From Loop 2 on, the Life tree has two new layers, and both survive every Genesis.<br>
		- Each Loop now has a goal from its act's deepening, and the Genesis that ends it needs that goal as well as the Heat Death. Loop 2's goal is Fully Vestigial: every Devolution node at level 5.<br>
		- Genetic Engineering: Base Pairs come from DNA. Reroll the trait draft, lock a trait into every offer, see a third option, and finally design traits outright (CRISPR). Each trait can be enhanced.<br>
		- Devolution: after the Tree of Life, start Act 2 over from one cell for Vestiges (every 10 minutes at most, and on its own after 5 devolutions). They grow a mirror of the Life tree from Predators down to Cells: every level triples DNA gain, and each node takes one of Act 2's choices off your hands (predators, routine, partners, body plan, colonists, adaptations, Heritage upgrades, Fecundity and Longevity, the trait draft, and finally every Cell upgrade from the start).<br>
		- Act 2 balance: Instincts open at 1e4 Heritage instead of 1e6, so the long wait between reaching land and the first multicellular form has something to do. Predators fight back: later goals are higher, and DNA gain is weaker while you fight one.<br>
		- Branch milestones that ask for an amount of something you can spend or lose (Goodwill, ore, Banded Iron, Drift, Chitin, Coal and the rest) now count everything you've earned, not what you hold right now.<br>
		- 2 Memories, 2 Light upgrades and 5 achievements.<br>
		- Endgame: reach the Heat Death in Loop 2, Fully Vestigial.<br>
	<h3>v3.0 - Let There Be Light, Again</h3><br>
		- Act 6: Genesis, the first New Game+ (Antimatter Dimensions' Reality, retold). After the Heat Death, a Genesis starts Acts 1 to 5 over from the Big Bang. You keep your achievements.<br>
		- Light: every act ending you reach in a Loop pays Light, and so does the Genesis. 15 Light upgrades and 5 act speeds (each act can run faster on its own).<br>
		- Memories: one per ending. A perk tree with a row for each act: head starts, automation and keeping the museums.<br>
		- The Singularity: every so often, Acts 1 to 5 run many times as fast for a while. Pause it to save a burst.<br>
		- Constants, Act 1's first deepening: measure the new universe's physical constants as its energy grows, equip the best and dissolve the rest into Echoes.<br>
		- 10 achievements; each makes Light 5% brighter.<br>
		- Endgame: reach the Heat Death again, in Loop 1.<br>
	<h3>v2.4 - The Last Question</h3><br>
		- Act 5 is complete! Its final part adds the Multiverse and the end of everything.<br>
		- Multiverse: once you've mapped the observable universe, collapse the multiverse for Realities. It starts all of Act 5 over, Universes included, and every Reality makes Seeds worth more and Act 5 faster. 30 Multiverse upgrades and 8 milestones, including universes consumed on their own.<br>
		- Act 4: new Workshop improvement, Production Planning. Engineers craft whichever material you have least of.<br>
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
	<b>Act 5: Diaspora is complete.</b><br><br>
	And then it all began again: the same quarks, the same first cells, the same long climb, only faster, and a little different, because this time the universe remembered.<br><br>
	<b>You've finished your first Loop.</b><br><br>
	The second time, life went backwards before it went forwards, all the way down to one cell, and came back stronger for it.<br><br>
	<b>You've finished Loop 2.</b><br><br>
	The third time, the sentient ape was not the end of the story but a layer in the rock: five great extinctions, a plague of viruses, and era after era of survivors.<br><br>
	<b>You've finished Loop 3.</b><br><br>
	The fourth time, the civilization did not stop at Eternity. Tools became fields, fields became factories, factories became networks, and the networks reached for the sky.<br><br>
	<b>You've finished Loop 4.</b><br><br>
	The fifth time, the swarm reached the Heat Death and refused it. It ran the universe backwards, again and again, each time a little older, until it remembered exactly how the light had begun.<br><br>
	<b>You've finished Loop 5.</b><br><br>
	The sixth time, nobody had to say anything at all. The universe knew its own way by heart: the first stars, the first cells, the long climb, the fire, the sky, the dark, and the light again. It had been asked, long ago, how to make the light come back. The last answer was simple. You show it, again and again, until it remembers.<br><br>
	<b>Act 6: Genesis is complete.</b><br><br>
	<b>Thank you for playing The Evolution Tree.</b> The Autopilot will keep Looping if you keep going.`

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
	// Act 6: Light and Constants
	if (hasUpgrade("lt", 13)) gain = gain.times(1000)
	gain = gain.times(constantEffect("energy"))
	// Pacing: stretches the whole act evenly so something new unlocks about once a minute
	gain = gain.max(1).pow(ENERGY_PACING)
	if (inChallenge("hz", 12)) gain = gain.max(1).pow(0.5)
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	dna: new Decimal(0),
	biomass: new Decimal(0),
	earned: {},
}}

// Branch resources you can spend or lose: milestones count everything you've ever earned, not what you hold now
const EARNED = { tr: "goodwill", nu: "caught", ps: "radio", as: "ore", ph: "iron", eg: "hatchlings", oc: "drift", hs: "stability", te: "range", se: "fat", sg: "contact", wh: "charts", ix: "chitin", cf: "coal", cv: "fitness" }

function trackEarned() {
	if (!player.earned) player.earned = {}
	for (let l in EARNED) {
		if (!player[l]) continue
		let cur = new Decimal(player[l][EARNED[l]] || 0)
		let e = player.earned[l]
		if (!e) {
			// Start from what you hold now (older saves never tracked this)
			player.earned[l] = { total: cur, last: cur }
			continue
		}
		let last = new Decimal(e.last)
		if (cur.gt(last)) e.total = new Decimal(e.total).add(cur.sub(last))
		e.last = cur
	}
}

function earned(l) {
	return player.earned && player.earned[l] ? new Decimal(player.earned[l].total) : new Decimal(0)
}

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
	return player.lt.genesis >= 6 && canGenesis()
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
	// Before v3.5.4, Directed Evolution could pour every Mutation into one trait, far past where it counts.
	// Spread the extra copies the way the draft does now, so Act 2 isn't left stuck below 1e100 DNA
	// (this runs before the game is set up, so it reads the save directly)
	let gxUp = player.gx && player.gx.upgrades ? player.gx.upgrades.map(Number) : []
	if (versionBefore(oldVersion, "3.5.4") && player.mu && player.mu.traits && gxUp.includes(24)) {
		let t = player.gx.target, cap = gxUp.includes(21) ? 8 : 5
		if (t && player.mu.traits[t] > cap) {
			let extra = player.mu.traits[t] - cap
			player.mu.traits[t] = cap
			for (let i = 0; i < extra; i++) {
				let low = Object.keys(TRAITS).reduce((a, k) => (player.mu.traits[k] || 0) < (player.mu.traits[a] || 0) ? k : a)
				player.mu.traits[low] = (player.mu.traits[low] || 0) + 1
			}
		}
	}
}

function versionBefore(a, b) {
	let x = String(a).split(".").map(Number), y = String(b).split(".").map(Number)
	for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] || 0) != (y[i] || 0)) return (x[i] || 0) < (y[i] || 0)
	return false
}
