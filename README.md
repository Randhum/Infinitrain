# INFINITRAIN — Swiss Precision Gravity Battery

A perpetual gravity-battery power generator that uses water-loaded cargo trains on a double-helix spiral track to harvest gravitational potential energy — with Swiss railway precision.

## The Concept

Imagine a mountain with an almost infinite water supply at the summit. A cargo train loads water into its tank wagons at the top (2,400 m), then descends a spiral track to the valley floor (400 m). The wagons are equipped with dynamos that convert the kinetic energy of the heavy, descending train into electricity. At the bottom, the water is released and the harvested energy is stored. A fraction of that energy pushes the now-lightweight empty train back up a second spiral. The surplus powers a datacenter.

The train never stops. It is a perpetual cycle — a gravity battery on rails.

```
        ~~~ WATER SOURCE ~~~
        ╔═══════════════════╗
        ║   SUMMIT 2,400m   ║ ← Water loading station
        ╚═══════╤═══════════╝
       ┌────────┴────────┐
      ╱╲                ╱╲
     ╱  ╲ DESCENT      ╱  ╲ ASCENT
    ╱ ⚡ ╲ (heavy)    ╱    ╲ (light)
   ╱  ⚡  ╲          ╱      ╲
  ╱   ⚡   ╲        ╱        ╲
 ╱    ⚡    ╲      ╱          ╲
╱     ⚡     ╲    ╱            ╲
       └────────┬────────┘
        ╔═══════╧═══════════╗
        ║   VALLEY  400m    ║ ← Water release + energy bank
        ╚═══════════════════╝
               ↓
        ╔═══════════════════╗
        ║    DATACENTER     ║ ← Powered by surplus energy
        ╚═══════════════════╝
```

## How It Works

### The Double-Helix Track

Two intertwined spiral tracks wrap around the mountain:

1. **Descent Spiral** — The loaded train spirals downward at an ~8.8% grade (steep, but within range of Swiss mountain railways like the Brünig line at 12%). Dynamos on each wagon harvest energy through regenerative braking.
2. **Ascent Spiral** — The empty train spirals back up using a fraction of the stored energy. It's lightweight now, so it needs far less power.

The two spirals are connected at the summit and valley stations, forming a continuous loop.

### Energy Balance

| Phase | What Happens | Energy |
|-------|-------------|--------|
| **Loading** | 8 wagons fill with 60 m³ water each (480 tonnes total) | — |
| **Descent** | 2,000 m drop, dynamos harvest gravitational PE | **3.26 MWh** generated |
| **Unloading** | Water released at valley station | — |
| **Ascent** | Empty train climbs back (only ~260 tonnes) | **1.63 MWh** consumed |
| **Net surplus** | Available for datacenter per cycle | **1.64 MWh** |

> The energy ratio is roughly **2:1** — for every unit spent pushing the empty train back up, two units were harvested from the loaded descent. The loaded train (740 t) has nearly 3x the mass of the empty train (260 t), and round-trip efficiency losses (dynamo 88% × motor 90% × rolling resistance) bring the net cycle efficiency to ~50%. At ~65–70 minutes per cycle, this yields approximately **1.5 MW continuous surplus** — enough to power a small datacenter.

### Physics Model

The simulation uses real physics:

- **Gravitational PE**: `E = m × g × Δh` — the fundamental energy source
- **Dynamo harvesting**: 88% conversion efficiency (regenerative braking)
- **Motor efficiency**: 90% for the electric ascent drive
- **Rolling resistance**: coefficient 0.002 (steel on steel), accounts for ~2.3% of gravitational force
- **Aerodynamic drag**: `F = ½ρCdA × v²` with CdA ≈ 11 N·s²/m² (blunt freight train at altitude) — negligible at 50 km/h (~0.3% of gravity force)
- **Speed regulation**: PID-like dynamo braking maintains safe 50 km/h descent
- **Peak power**: ~7.6 MW steady-state during descent (8.7 MW peak during acceleration), ~2.9 MW steady-state motor draw during ascent

### Train Specifications

| Parameter | Value |
|-----------|-------|
| Locomotive | 84 t (SBB Re 460 class) |
| Empty wagon | 22 t |
| Water capacity per wagon | 60 m³ (60 t) |
| Default wagon count | 8 |
| Loaded train mass | ~740 t |
| Empty train mass | ~260 t |
| Descent speed | ~50 km/h |
| Ascent speed | ~40 km/h |
| Track height difference | 2,000 m |
| Helix radius | 300 m |
| Spiral turns | 12 per helix |
| Track grade | ~8.8% (near adhesion limit) |
| Total track length | ~22.7 km per helix |
| Cycle time | ~65–70 minutes |

## The Simulation

An interactive browser-based simulation with:

- **Double-helix 3D visualization** — pseudo-3D rendering of both spiral tracks with depth shading, the train with water-filled wagons, energy spark particles during generation, mountain silhouette backdrop, and station markers
- **Real-time energy gauges** — generated power, return trip consumption, and datacenter surplus
- **Train telemetry** — altitude, speed, water load percentage, dynamo output
- **Operation phase indicator** — Loading → Descending → Unloading → Ascending
- **Cumulative statistics** — total MWh generated, cycles completed, megalitres of water moved, net efficiency
- **Energy flow bar** — proportional visualization of energy distribution
- **Controls** — start/pause/reset, simulation speed (1x–20x), wagon count (2–20)

## Running

No build tools, no dependencies. Just open the file:

```bash
# Option 1: Direct file open
open index.html        # macOS
xdg-open index.html    # Linux

# Option 2: Local server (if you prefer)
python3 -m http.server 8742
# Then visit http://localhost:8742
```

The simulation auto-starts. Use the speed slider to accelerate time and watch cycles complete.

## Project Structure

```
Infinitrain/
├── index.html       # Main page layout and structure
├── style.css        # Swiss-precision dark theme design system
├── physics.js       # Physics engine: gravity, dynamos, friction, energy accounting
├── helix.js         # Double-helix 3D track renderer with train animation
├── dashboard.js     # Gauge drawing, stat updates, phase indicators
├── main.js          # Simulation loop, controls, clock
├── favicon.svg      # Train-on-helix favicon
└── README.md        # This file
```

## The Philosophy

This is a thought experiment in gravitational energy storage — the same principle behind pumped hydro, but reimagined with Swiss railway engineering. The mountain provides the height. The water provides the mass. The train provides the transport. The dynamos provide the conversion. And Swiss precision keeps it all running on time.

The numbers work because physics is generous: a 740-tonne train dropping 2,000 meters releases enormous energy. The empty return trip costs a fraction. The surplus is real, substantial, and continuous — enough to power a datacenter.

A perpetual train. An infinite cycle. **Infinitrain.**
