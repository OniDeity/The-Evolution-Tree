# The Evolution Tree: Roadmap

Each act takes a well-known incremental game and retells it with new themes, the way The Plague Tree does.

**Scale goal:** grow the whole game to The Plague Tree's size and scale in content, playtime and numbers (it has about 1,100 upgrades, 320 buyables, 245 milestones, 42 challenges and 169 achievements, numbers far past e1e10, and weeks of play). v2.0 had 180 upgrades, 46 buyables, 159 milestones, 21 challenges and 126 achievements. Act 5 is built deep to close that gap, and Act 6 (the first New Game+) deepens every earlier act.

The overall arc is a loop: the universe forms, life evolves, and a civilization eventually builds a universe of its own. Then everything starts again, one level up.

## Automation (v1.5)
**Rule:** anything you'd otherwise repeat forever gets an automation milestone. It arrives late enough that you've done it by hand for a while, and early enough that it never becomes a chore. One-time choices (body plan, trait draft before the milestone, galaxy shape, keystone, founder, sliders) and challenges (Cosmic Hazards, Predators, Selection Pressures) stay in your hands. Every future act follows the same rule.

| Act | Layer | Repeated action | Automated by |
|---|---|---|---|
| 1 | Particles | Gaining particles, buying upgrades | Row 2 milestones |
| 1 | Atoms, Gravity, Stars, Planets | Resets, merges, supernovae, orbits | Row 2 and Row 3 milestones |
| 1 | Fusion, Dark Energy, Hazards | Reactors, Expansion, Hazard points | Their own milestones |
| 1 | Galaxies, Black Holes | Forming them | 10 galaxies / 10 black holes (paused during Hazards) |
| 1 | Neutrinos, Pulsars, Asteroid Belt | Catching, syncing, prospecting | 150 neutrinos, 2,000 Radio Waves, 600 ore |
| 1 | Quantum Fluctuations, Stellar Winds, Dark Matter | Casting, sails and flares, weighing | 200 casts; 15 and 25 sails (was 1e6 Wind before v1.6.1); 50 halos |
| 2 | Cells, Mutations, Reproduction | Gaining them, Fecundity and Longevity | Row 3 milestones, Generations and Habitats milestones |
| 2 | Mutations | The trait draft | 40 mutations (picks the trait you have fewer of) |
| 2 | Generations, Habitats | Gaining them | Row 4 milestone |
| 2 | Adaptation | Fitness, adaptations | 25 fitness (passive), 1e6 fitness (adaptations) |
| 2 | Habitats | Settling colonists | 10 colonists |
| 2 | Multicellular, Symbiosis | Gaining them, gifts | 6 forms; 3 partners (gifts), 7 partners |
| 2 | Instincts | Gaining instincts | 50 instincts (passive) |
| 2 | Photosynthesis, Gene Transfer, Eggs, Ocean Currents | Venting, absorbing, clutches, steering | 40 Iron, 12 absorbed, 600 hatchlings, 50,000 Drift |
| 2 | Hormones, Homeostasis, Territory, Seasons | Answering, needs, rivals, foraging | 150 right answers, 5,000 Stability, 100 rivals, 1,000 Fat |
| 3 | Tiers, Metabolism, Speciation, Competition, Radiation | Everything | Instincts from Selection Pressures |
| 3 | Evolutionary milestones, Metabolism upgrades | Buying them | Beat 4 Selection Pressures |
| 3 | Insects, Coal, Coevolution | Harvesting, burying and digging, balancing | 800 Chitin; 500 and 10,000 Coal; 10,000 Fitness |
| 3 | Tiers, Metabolism, Speciation, Radiation | Regrowing after an Act 4 extinction | Act 4's first extinction teaches every Instinct but Competition |
| 4 | Knowledge, Workshop | Researching, buying improvements | 3 and 5 extinctions |
| 4 | Village, Settlement, Workshop | Assigning jobs, building, crafting | Deep Time: Division of Labor, Builders' Instinct (and the Assembly Line) |
| 4 | Trade, Breeding, Wonders | Caravans, keeping young, building | 400 Goodwill, total quality 150, 15 wonder levels |
| 5 | Harvest | Drones, factories, farms, upgrades | 1e3 to 1e12 Hulls made |
| 5 | Probes | Launching, calibrating, upgrades | 100, 1,000 and 100,000 systems explored |

## Branches (v1.1)
Every act's tree has small branch layers further out: modest helpers with a little minigame for when you hit a wall. They never reset and are not part of the retold game.

| Act | Branch | Hangs off | Minigame | Helps |
|---|---|---|---|---|
| 1 | Neutrinos | Particles | Catch random bursts before they pass (Supernovae send big ones) | Energy |
| 1 | Pulsars | Stars | Tap on the beat to build a streak | Starlight |
| 1 | Asteroid Belt | Planets | Pick 3 of 9 asteroids, hoping for rich ore | Cheaper planets |
| 2 | Photosynthesis | Cells | Vent Oxygen into Banded Iron before it overflows | DNA |
| 2 | Gene Transfer | Mutations | Spend plasmids to pick up traits you passed on in the draft | Traits (a quarter copy each) |
| 2 | Eggs | Reproduction | Clutch size vs incubation time | Births |
| 2 | Ocean Currents | Habitats | The current turns every 30 s; steer it toward your tiles | Cheaper colonists |
| 3 | Insects | Tiers | Harvest the boom-and-bust swarm near its peak | Biomass |
| 3 | Coal | Metabolism | Bury Biomass right before a reset; dig it up as Coal | Lower food demand |
| 3 | Coevolution | Speciation | Keep predators and prey in balance | Every tier |
| 4 | Trade | Settlement | Prices wander; send caravans when the deal is good | Everything the civilization makes |
| 4 | Breeding | Village | Keep the best of each litter; it becomes the next parent | Food, workers, Wood and Stone, Culture, resilience |
| 4 | Wonders | Workshop | Build 1% at a time; never lost in an extinction | Storage, Food, crafting, Knowledge |

With perfect play the branches make each act roughly 10–20% faster for the bot.

## Act 1: The Cosmos ✅ (v0.5)
*The Prestige Tree, retold from the Big Bang to the first habitable world.*

| Prestige Tree | Cosmos | Notes |
|---|---|---|
| Points | Energy | |
| Prestige | Particles (P) | **Twist: Fermions vs. Bosons.** Choose which kind of particle to make |
| Boosters | Atoms (At) | **Twist: Periodic Table.** Elements are fused from elements you own |
| Generators | Gravity (G) | **Twist: Merging.** Spend Force to merge 3 wells into a Massive Well |
| Time | Stars (St) | **Twist: Supernova.** Trade all stars for permanent Heavy Elements |
| Enhance | Fusion (F) | **Twist: Plasma Temperature.** Slider trades reactor strength for fuel |
| Space | Planets (Pl) | **Twist: Orbits.** Place each planet in Inner, Habitable, Frost Line or Outer orbit |
| Super-Boosters | Galaxies (Ga) | **Twist: Galaxy Shapes.** Spiral, Elliptical or Irregular, chosen before each galaxy forms |
| Super-Generators | Black Holes (BH) | **Twist: Spin.** Black holes spin up the longer you leave them alone |
| Quirks | Dark Energy (DE) | **Twist: Fate of the Universe.** Balance Expansion against Gravity to stay flat |
| Hindrances | Cosmic Hazards (Hz) | **Twist: Combined Hazards.** Gamma-Ray Burst, Big Crunch, Heat Death, Vacuum Decay, plus Cosmic Winter and Doomsday |

**Row 4 (v1.3, optional bonus content, unlocked by the Habitable Zone):** no row resets, so it can't undo the ending. Each layer also gives small gifts to the later acts.

| Prestige Tree | Cosmos | Twist |
|---|---|---|
| Magic | Quantum Fluctuations (QF) | **Uncertainty:** spells are strong and brief or weak and long (energy, DNA or Biomass) |
| Balance | Matter vs. Antimatter (MA) | **Baryon asymmetry:** a slider sets the mix; the meeting point makes Light, the surplus boosts DNA or Biomass |
| Solarity | Stellar Winds (SW) | **Solar cycle:** furl your sails before flares at solar maximum |
| Phantom Souls | Dark Matter Halos (DM) | **Invisible mass:** weigh halos in as few higher/lower guesses as you can; boosts Act 3 tiers |

Side layers: **Observatory** (16 discoveries, +5% energy each) and **Star Log** (statistics).

Endgame: **Habitable Zone** (survive every Cosmic Hazard, buy every Row 3 upgrade, and have 5 planets in the Habitable orbit). It unlocks Act 2.

**Pacing target:** something new to unlock every 60–90 seconds of human play. Act 1 has 136 unlocks. A perfect bot gets one every 44 seconds on average and finishes in about 100 minutes, so a human should take roughly 2.5 hours.

## Act 2: Life ✅ (v0.8)
*The Prestige Tree again, at biological scale, with its own tree and its own resource (DNA).*
Opened from the **Life** node once the Habitable Zone is bought. Act 2 layers use rows 10+ and reset each other through `lifeReset()`, so Act 1 and Act 2 never reset each other.

| Prestige Tree | Life | Twist |
|---|---|---|
| Points | DNA | |
| Prestige | Cells ✅ | **Carrying capacity.** Cells divide on their own and fill up to a capacity |
| Boosters | Mutations ✅ | **Natural selection.** Each mutation offers a choice of two random traits |
| Generators | Reproduction ✅ | **Life and death.** Offspring settle where births balance deaths; Fecundity vs. Longevity |
| Time | Generations ✅ | **Generation clock.** Each time it fills, Heritage is handed down based on cells and offspring at that moment |
| Space | Habitats ✅ | **A map to explore.** Colonize a 5x5 sea outward from where life began; reach the Shoreline |
| Enhance | Adaptation ✅ | **Changing climate.** Four climates cycle; each adaptation is strongest in its own |
| Super-Boosters | Multicellular ✅ | **Body plan.** Six tiers, each an exclusive choice (Radial or Bilateral, Exo- or Endoskeleton…) |
| Super-Generators | Symbiosis ✅ | **Partnerships.** Four partners each want a different gift; their Bond fades unless tended |
| Quirks | Instincts ✅ | **Daily routine.** Behaviors in slots cycle; only the active one counts; Rest and combos boost the next |
| Hindrances | Predators ✅ | **Arms race.** Hunted, Famine and Parasites, each winnable 3 times with rising goals and rewards |

Side layers (never reset): **Fossil Record** (16 fossils found at milestones, +5% DNA each), **Biodiversity** (rewards variety across traits, habitats, climates, body plan, partners, behaviors and predators) and **Field Notes** (statistics).

**Cambrian Explosion** (12 mutations and 12 broods) unlocks Row 3; reaching land unlocks Row 4.
**Row 5 (v1.4, optional bonus content, unlocked by the Tree of Life):** no resets; each layer sends a small gift to Act 3.

| Prestige Tree | Life | Twist |
|---|---|---|
| Magic | Hormones (Ho) | **Fight or flight:** answer each situation with the right hormone; streaks pay more (Act 3 Biomass) |
| Balance | Homeostasis (Hs) | **Plate-spinning:** keep three needs between 30 and 90 (lower Act 3 food demand) |
| Subspace | Territory (Te) | **Border defense:** chase rivals off a 4x4 range; lost patches come back after a minute (stronger Competition) |
| Solarity | Seasons (Yr) | **Storing for winter:** only food that lasts the winter becomes Fat (every Act 3 tier) |

Endgame: **The Tree of Life** (a complete body plan and all 9 predator wins). A perfect bot takes about 80–90 minutes to reach land and about 70 more to finish (v1.0.2 fixed an offspring bug that had been slowing Rows 1–3), at roughly one unlock a minute for a human.

## Act 3: Species ✅ (v1.0)
*Antimatter Dimensions, retold, with its own tree and its own resource (Biomass).*
Opened from the **Species** node once the Tree of Life is bought. Act 3 layers use rows 20+ and reset each other through `speciesReset()`.

| Antimatter Dimensions | Species | Twist |
|---|---|---|
| Antimatter | Biomass | |
| 8 Dimensions | Species tiers (Ti): Bacteria → Fish → Amphibians → Reptiles → Birds → Mammals → Primates → Humans | **The food pyramid.** A tier starves (half strength) if the tier below has fewer purchases |
| Tickspeed | Metabolism (Me) | **Food demand.** Each level eats a growing share of Biomass; more Bacteria move the sweet spot up |
| Dimension Boosts | Speciation (Sn) | **Keystone species.** Each speciation doubles one chosen tier a second time |
| Antimatter Galaxies | Adaptive Radiation (Ar) | **The founder effect.** One chosen tier keeps 10% of its population |
| Dimensional Sacrifice | Competition (Cu) | **Choose the winner.** Any tier can out-compete everything below it |
| Infinity | The Spark of Sentience (1.8e308 Biomass) | |

Plus 16 **Evolutionary milestones** (permanent Biomass upgrades) and 10 achievements (+5% to every tier each).
A perfect bot takes about 90 minutes, with something new about every 34 seconds (roughly 70 seconds for a human).

**Bonus content (v1.2, optional):** after the first radiation, **Selection Pressures** retell AD's challenges: Island, Drought, Ice Age, Crowded Niche, Fragmented Range, Famine, Invasive Species and Bottleneck. **Twist:** each one teaches an **Instinct** (an autobuyer you can toggle), so automation is earned rather than given. Side layers: **Specimen Collection** (12 creatures, +5% Biomass each) and **Field Notes**.

## Planned expansions (optional bonus content)
1. ~~Act 3: Selection Pressures, Specimen Collection, Field Notes~~ ✅ v1.2
2. ~~Act 1: Row 4 (Quantum Fluctuations, Matter vs. Antimatter, Stellar Winds, Dark Matter Halos) plus an Observatory museum and stats~~ ✅ v1.3
3. ~~Act 2: Row 5 on land (Hormones, Homeostasis, Territory, Seasons)~~ ✅ v1.4

## Act 4: Extinction ✅ (v2.0)
*Kittens Game and Evolve, retold.* (This replaced the earlier plan to retell AD's Infinity and Eternity here.)
Opened from the **Extinction** node after the Spark of Sentience. Act 4 layers use rows 29–32 and never reset earlier acts.

| Kittens / Evolve | Extinction | Twist |
|---|---|---|
| Bonfire | Settlement (Se) | **Footprint.** Every building leaves one; biosphere health (resilience vs footprint) scales food |
| Village | Village (Vi, id `vg`) | **Seasons.** Winter grows a quarter of the food; empty stores and people leave |
| Science | Knowledge (Kn) | 23 techs, Agriculture to Rewilding; storage caps gate them |
| Workshop | Workshop (Wk) | Crafting Beams, Slabs, Plates and Books; 18 improvements |
| Karma / MAD reset | Extinction (Ex) | **You are the extinction.** Strata from peak people, techs and footprint; also wipes Act 3's tiers |
| Metaphysics / genes | Deep Time (DT) | 16 Strata upgrades |
| Challenges | Trials | Winter Is Coming, Overshoot, Small Band, Dark Age |

Side layers: **Lost Species** (12 animals, Strata and production) and **Chronicle** (statistics). Ending: **Eternity** (The Long Now, Rewilding, 150 people and a biosphere at 90%+). An optimizing bot takes about 5.7 hours and 12 extinctions.

## Act 5: Diaspora (in progress)
*Universal Paperclips' space stage, retold, and built deep like The Plague Tree.*
Opened from the **Diaspora** node after Eternity. Rows 39–41. It never resets Act 4. It ships in four parts:

| Version | Content |
|---|---|
| v2.1 ✅ | **Probes** (trust across seven stats, calibration, replication, hazards that grow with distance, exploration) and **Harvest** (drones, wire, factories, solar power). 120 upgrades, 23 milestones, 15 achievements, Flight Log. Ends when the Milky Way (1e11 systems) is mapped: about 3.6 hours for the bot |
| v2.2 ✅ | **Drift** (Drifters copy themselves 1.2x as fast as your probes and crowd their room; an 8th stat, Combat, destroys them for Honor and salvage) and **Swarm** (a work-or-think slider makes Compute for game-theory tournaments that pay Yomi; Swarm upgrades unlock **Navigation** across the void between galaxies). 120 upgrades, 6 buyables, 24 milestones, 15 achievements. Ends at the Virgo Supercluster (1e15 systems): about 2.4 hours for the bot |
| v2.3 ✅ | **Projects** (150 one-off projects in 15 series, unlocked from 1e15 to 1e22 systems, each costing a mix of currencies) and **Universes** (first Act 5 reset from 1e16 systems: Seeds double per power of 10; **cosmic expansion** makes each power of 10 past 1e16 three times as slow; Seeds make Act 5 run faster; a new universe keeps all upgrades and starts at half your best digits; a choice of 8 physics; 40 Seed upgrades; 8 milestones). Ends at the observable universe (1e22 systems): about 4 hours and 10 universes for the bot |
| v2.4 ✅ | **Multiverse** (second Act 5 reset after mapping the observable universe: Realities from the digits of Seeds planted, 30 upgrades, 8 milestones including auto-consume), the **Heat Death** ending (the last upgrade, Let There Be Light), 8 **Trials**, branches **Signals**, **Wormholes** and **Terraforming**, the **Hall of Probes** (16), 15 achievements. The Heat Death comes about 3 hours (9 collapses) after the edge for the bot |

Target for Act 5 alone: about 600 upgrades, 150 buyables, 150 milestones, 20 challenges and 60 achievements, 15–25 hours.

**Design rule learned in v2.1:** never multiply a growth *rate* directly. Act 5's rates take the logarithm of their boosts (replication takes the square root of the log), or self-replication runs away.

**Design rule learned in v2.3:** with log-based rates, multipliers can't carry a prestige layer. Reward a reset with *time* instead (a speed multiplier on the whole act) plus a head start, and put a real wall in front of the goal (cosmic expansion) so resetting beats pushing on. Make reward per reset grow slower than the time each further step costs, or players never have a reason to reset.

**Design rule learned in v2.4:** once a speed multiplier is in play, cap how many simulation steps a single tick may take (50, and 400 only for long offline ticks), or very late game freezes the browser. A prestige currency taken from the log of the layer below (Realities from the digits of Seeds) stays sane; price its upgrades to match.

**Testing:** `bot5.js`-style simulations should tick only the act being tested (its layers' update, automate and milestones) in 5-second steps, refreshing temp data every 15 seconds. That runs 10 simulated hours in about 4 minutes.

**Design rule learned in v2.2:** a currency that buys its own multipliers (Yomi) is stable only if each upgrade's cost step outgrows the multiplier it adds; give the cost curve some curvature (`n²` term). Also avoid loops through other systems: Navigation needs Swarm upgrades, so Compute takes only the log of probes, or Yomi, probes and Navigation feed each other and run away.

## Act 6: Genesis, the first New Game+ (in progress)
*Antimatter Dimensions' Reality, retold.* After the Heat Death, say "Let there be light" again: **Genesis** wipes Acts 1–5 and starts a new **Loop** from the Big Bang. Each Loop is faster than the last, and each one opens new content inside the earlier acts.

**Scale:** Acts 1–5 take a bot about 25 hours, so Act 6 should take about 50 (roughly 7 Loops). By its end, Acts 1–5 are fully automated, one-time choices and challenges included, all earned through Loops.

**Testing:** `botlib/act1.js` to `act5.js` play each act like an attentive human (Act 1 ~110 min, Act 2 ~93, Act 3 ~99 with every Selection Pressure, Act 4 ~5.7 h, Act 5 ~13 h), and `act6.js` plays whole Loops with all five at once, spending Light and Memories. Act speeds multiply each layer's time step in the game loop; branches you play against the clock keep their own pace.

**What a Genesis keeps:** achievements, always. Everything else resets at first, the museums (Observatory, Fossil Record, Specimens, Lost Species, Hall of Probes) included. Memories gradually keep more, until by the end a Loop keeps everything.

| AD Reality | Genesis | Twist |
|---|---|---|
| Reality Machines | **Light** | Earned during a Loop: every act ending you reach pays Light (8 endings per Loop), and so does the Genesis itself |
| Perks | **Memories** | One Memory per ending. A perk tree with one column per act: head starts, keeps and automation for that act |
| Reality upgrades | **Light upgrades** | Act speeds (rebuyable) and one-off boosts |
| Black Hole | **Singularity** | Every so often, Acts 1–5 run many times as fast for a while |
| Glyphs | **Constants** (Act 1) | Measure physical constants as energy grows; equip a few, dissolve the rest for permanent echoes |
| Celestials | One deepening per act | See the versions below |
| Automator | **Autopilot** | Plays a whole Loop by itself |

| Version | Content |
|---|---|
| v3.0 ✅ | Loop 1. **Genesis**, Light (15 upgrades, 5 act speeds), Memories (16 perks), the Singularity (3 buyables), **Constants** (Act 1's deepening: 4 kinds, 12 effects, Echoes) and 10 achievements. Loop 1 takes the bot about 6.9 hours (Habitable Zone 24m, Tree of Life +56m, Sentience +19m, Eternity +185m, Heat Death +130m) |
| v3.1 ✅ | Act 2, from Loop 2 on: **Genetic Engineering** (Base Pairs from DNA; reroll, lock, a third offer, CRISPR design, Directed Evolution, 8 trait enhancements) and **Devolution** (reset Act 2 to one cell for Vestiges, on a 10-minute real-time cooldown; a 10-node mirror tree, 5 levels each, that triples DNA per level and automates every Act 2 choice). **Loop goals**: each Loop's Genesis also needs its act's deepening done (Loop 2: Fully Vestigial). Act 2 fixes: Instincts at 1e4 Heritage, Predators fight back. Branch milestones count resources earned. Loop 2 takes the bot about 9.2 hours, most of it the mirror tree; Act 6 so far about 16 hours |
| v3.2 ✅ | Act 3, from Loop 3 on: **Mass Extinctions** (Infinity: wipe Act 3 at 1.8e308 for Lineages, +20% per extinction lived through; 16 upgrades incl. Break the Cycle, 10x per 154 digits past 1.8e308), **the Big Five** (5 challenges), **Viruses** (Replicanti: copy up to 1.8e308, boost every tier, burst into viral radiations) and **Geological Eras** (Eternity: Eons from Lineages past 1e6, 5x Lineages per era, 8 milestones automating Act 3's last choices, 8 Eon upgrades). Loop 3 goal: the Phanerozoic (Big Five and 10 eras). Loop 3 takes the bot about 7.5 hours; Act 6 so far about 24 hours |
| v3.3 ✅ | Act 4, from Loop 4 on: **the March of Progress** (Synergism): Ingenuity from people and techs, Accelerators and Multipliers, and five nested Ages (Tools, Agriculture, Industry, Information, Space), each a prestige layer whose upgrades boost the civilization and automate Act 4 (jobs, buildings, extinctions, Trials, Eternity). Loop 4 goal: the Space Age. **Radiance**, a rebuyable Light sink. Loop 4 takes the bot about 5 to 6 hours; Act 6 so far about 29 hours |
| v3.4 ✅ | Act 5, from Loop 5 on: **Reversal** ("The Last Question", turned around): after the Heat Death, rewind all of Act 5 for Negentropy, with an entropy penalty that grows with every Reversal. Negentropy upgrades and milestones automate the rest of Act 5 (Multiverse and Seed upgrades, collapses, Trials, the Heat Death). Loop 5 goal: Let There Be Light, Again |
| v3.5 ✅ | **The Last Answer** (AD's Automator): from Loop 6 on, the Autopilot writes Routines in real time and buys modules that play Acts 1–5 (every reset, choice, branch and challenge), the deepenings and the Loops themselves. A fifth row of Memories keeps every act's milestones and challenges. Loop 6 goal: The Last Answer, the end of Act 6 |

## Earlier ideas (not scheduled)
These were planned before v2.0 and may still be useful when Act 6 deepens the earlier acts:
- **Devolution:** a mirror of the whole Life tree, run in reverse, from Humans back down to a single cell (like The Plague Tree's "Unvaxxed" layers).
- **Civilization, Synergism-style:** Tools → Agriculture → Industry → Information → Space.
- **Genetic Engineering**, the payoff for the trait draft: reroll an offer, lock a trait, add a third choice, eventually design traits directly.
- **AD Infinity and Eternity:** Mass Extinctions as Infinity Challenges (Ice Age, Meteor, Great Dying, Snowball Earth), Viruses as Replicanti, Geological Eras as Eternity.
- **Genesis:** the civilization builds a universe of its own; Universe 2 has new physical constants (double gravity, no light, faster time), with meta-upgrades from a Multiverse layer.
