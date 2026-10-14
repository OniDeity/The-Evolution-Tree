# The Evolution Tree: Roadmap

Each act takes a well-known incremental game and retells it with new themes, the way The Plague Tree does.
The overall arc is a loop: the universe forms, life evolves, and a civilization eventually builds a universe of its own. Then everything starts again, one level up.

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

Endgame: **Habitable Zone** (survive every Cosmic Hazard, buy every Row 3 upgrade, and have 5 planets in the Habitable orbit). It unlocks Act 2.

**Pacing target:** something new to unlock every 60–90 seconds of human play. Act 1 has 136 unlocks. A perfect bot gets one every 44 seconds on average and finishes in about 100 minutes, so a human should take roughly 2.5 hours.

## Act 2: Life 🚧 (v0.7: Rows 1–3)
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
| Super-Boosters / Super-Gens | Multicellular / Symbiosis | |
| Quirks / Hindrances | Instincts / Predators (Hunted, Famine, Parasites) | |

**Cambrian Explosion** (12 mutations and 12 broods) unlocks Row 3. Current end: **Land Ho!**, colonizing a Shoreline (needs Lungs and 8 generations). A perfect bot takes about 105 minutes from the start of Act 2, at one unlock every 41 seconds.

## Act 3: Species
*Antimatter Dimensions, retold.*

- 8 Dimensions → **8 Species tiers**: Bacteria → Fish → Amphibians → Reptiles → Birds → Mammals → Primates → Humans
- Tickspeed → **Metabolism**
- Dimension Boosts / Galaxies → **Speciation / Adaptive Radiation**

## Act 4: Extinction
*Antimatter Dimensions' Infinity and Eternity, retold.*

- Infinity (1.8e308) → **Extinction Event**
- Infinity Challenges → **Mass Extinctions**: Ice Age, Meteor, Great Dying, Snowball Earth
- Replicanti → **Viruses** (a nod to The Plague Tree)
- Eternity → **Geological Eras**

## Act 5: Devolution
*A mirror of the whole Life tree, run in reverse, from Humans back down to a single cell (like The Plague Tree's "Unvaxxed" layers).*

## Act 6: Civilization
*Synergism-style: Tools → Agriculture → Industry → Information → Space.*

**Payoff for the trait draft: Genetic Engineering.** Once the species is sentient, it takes control of its own evolution, building on the Act 2 trait draft:
- Reroll an offer, at a cost.
- Lock a trait so it keeps appearing.
- Add a third choice to each draft.
- Eventually, design traits directly.


## Act 7: Genesis (the loop)
The civilization builds a universe of its own. That resets everything into **Universe 2**, with new physical constants (for example double gravity, no light, or faster time), and the whole tree is played again with meta-upgrades from the **Multiverse** layer.
