# INFINITRAIN — Swiss Precision Gravity Battery

A perpetual gravity-battery power generator that uses water-loaded cargo trains on a double-helix spiral track to harvest gravitational potential energy — with Swiss railway precision.

## The Concept

Imagine a mountain with an almost infinite water supply at the summit. Two cargo trains run in anti-phase on a double-helix spiral track: one loads water at the top (2,400 m) and descends, while the other ascends empty back to the summit. The wagons are equipped with dynamos that convert the kinetic energy of the heavy, descending train into electricity — which flows directly through the overhead catenary wire to power the ascending train's motors. The surplus powers a datacenter at the valley floor (400 m).

The trains never stop. One always descends, one always ascends. A perpetual cycle — a gravity battery on rails.

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

1. **Descent Spiral** — The loaded train spirals downward at an ~8.8% grade (steep, but within range of Swiss mountain railways like the Brünig line at 12%). Dynamos on each wagon harvest energy through regenerative braking [6].
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
- **Rolling resistance**: coefficient 0.002 (steel on steel [3]), accounts for ~2.3% of gravitational force
- **Aerodynamic drag**: `F = ½ρCdA × v²` with CdA ≈ 11 N·s²/m² (blunt freight train at altitude [4]) — negligible at 50 km/h (~0.3% of gravity force)
- **Speed regulation**: PID-like dynamo braking maintains safe 50 km/h descent
- **Peak power**: ~7.6 MW steady-state during descent (8.7 MW peak during acceleration), ~2.9 MW steady-state motor draw during ascent

### Train Specifications

| Parameter | Value |
|-----------|-------|
| Locomotive | 84 t (SBB Re 460 class [2]) |
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

### Energy Storage & Transport

With a single train, the power output is intermittent: 7.6 MW for 27 minutes of descent, then 2.9 MW draw for 34 minutes of ascent, with 8 minutes of zero during loading/unloading. A datacenter needs steady power. But there's a solution far simpler than any battery.

#### The Simplest Answer: Two Trains, One Wire

Run **two trains in anti-phase** on the shared catenary. While Train A descends (generating 7.6 MW), Train B ascends (consuming 2.9 MW). The electricity flows directly between them through the overhead wire — no storage needed at all.

```
         Train A: DESCENDING ⚡ ──→ catenary wire ──→ Train B: ASCENDING
         generates 7.6 MW          direct transfer      consumes 2.9 MW
                                        │
                                   surplus 4.7 MW
                                        │
                                   ┌────┴────┐
                                   │DATACENTER│
                                   └─────────┘
```

The net surplus of **4.7 MW** flows continuously to the datacenter during the overlap period. The catenary wire itself is the "battery" — it transfers power at the speed of light with negligible loss.

Only during the brief loading/unloading transitions (~3–5 minutes) does neither train generate. The buffer needed for these gaps is just **125–200 kWh** — small enough for:
- A handful of standard **supercapacitor** modules (ideal for short, high-power bursts)
- Two residential-scale **battery units** (e.g. Tesla Powerwall class)
- Or even a modest **flywheel** (mechanical, no chemistry)

No pumped reservoir. No lithium mine. No exotic infrastructure. Just a second train and a wire.

#### From Wheels to Watts: How the Energy Transfers

Swiss railways run on **15 kV 16.7 Hz single-phase AC** [1] — a standard dating to 1916, shared with Germany, Austria, and Scandinavia. Inside a modern locomotive, this catenary voltage is stepped down through a transformer, rectified to DC, then inverted to variable-frequency AC for the traction motors. During regenerative braking, the same power electronics run in reverse: the motors become generators and feed energy back onto the catenary [6].

Infinitrain's wagon dynamos work identically. Each wagon's axle-mounted generator produces variable AC, which is rectified to DC onboard, then inverted back to 15 kV 16.7 Hz and fed to the catenary. Infinitrain runs on its own **isolated catenary loop** — a private overhead wire connecting only the two spirals and the valley station, independent of SBB's national rail grid.

```
  Wagon axle → Generator (AC) → Rectifier → Inverter → Catenary (15 kV 16.7 Hz)
                                                             │
                                  ┌──────────────────────────┤
                                  │                          │
                            ┌─────┴──────┐          ┌───────┴────────┐
                            │ Other      │          │ Frequency      │
                            │ train's    │          │ Converter      │
                            │ motors     │          │ 16.7 Hz→50 Hz  │
                            └────────────┘          └───────┬────────┘
                                                            │
                                                      400V 50Hz AC
                                                            │
                                                    ┌───────┴───────┐
                                                    │  DATACENTER   │
                                                    └───────────────┘
```

Note: 16.7 Hz → 50 Hz conversion requires a **static frequency converter** (AC→DC→AC), not a simple transformer — the same proven technology SBB uses at every railway-to-grid interconnection [1].

#### Swiss Grid Compatibility

Switzerland runs two separate electrical systems:

1. **Railway grid**: 15 kV, 16.7 Hz single-phase AC (SBB's own network since 1916) [1]
2. **Public grid**: 230/400 V, 50 Hz (standard European, managed by Swissgrid) [8]

Infinitrain operates on an **isolated private catenary** — electrically independent from both. The datacenter receives standard 400V 50Hz through the frequency converter. This means:

- **No SBB integration required** — private track, private power
- **No Swissgrid feed-in tariffs** — self-consumption only
- **Optional grid tie** — the frequency converter could export surplus to the 50 Hz public grid if desired

#### What This Powers (Two-Train Configuration)

| Metric | Value |
|--------|-------|
| Continuous surplus | ~2.9 MW |
| Server racks (15 kW each) | ~190 |
| GPU servers (300W each) | ~9,500 |
| Annual energy | 25.0 GWh/year |
| Buffer needed | ~200 kWh (for phase transitions only) |

> Nearly 3 MW continuous from two trains, a wire, and gravity. No chemical batteries, no reservoir, no rare earth metals. ARES North America [7] proved the rail-gravity-storage concept at 50 MW scale in Nevada. Infinitrain adds the water mass trick — loading and unloading water to maximize the mass differential — which is what makes the economics work.

## The Simulation

An interactive browser-based simulation of **two trains running in anti-phase** on a shared catenary, with all architectural subsystems visualized:

- **Dual-train visualization** — both Train A (red) and Train B (blue) rendered simultaneously on the double-helix track with depth shading, water-filled wagons with rounded tank profiles, energy sparks during generation, locomotive pantographs reaching to the catenary wire, and a roof bus bar connecting wagons
- **Summit loading station** — animated reservoir (960 m3) with water level, 8 fill chutes dropping water into wagons during the loading phase, switch markers (SW-A, SW-B) at siding entry/exit
- **Valley unloading station** — elevated trestle siding, 8 drain troughs below track, settling pond with animated water surface, river overflow outlet, switch markers (SW-C, SW-D)
- **Catenary wire** — visible 15 kV overhead wire running along both helixes with support poles, animated power flow arcs between the spirals when energy transfers between trains
- **Valley substation & datacenter** — SFC (static frequency converter, 5 MW) box with 200 kWh supercapacitor buffer, power line to datacenter building with blinking server rack LEDs, live MW reading
- **Combined energy gauges** — total generated power, total return trip consumption, and net datacenter surplus from both trains combined
- **Per-train telemetry** — side-by-side dashboard showing each train's phase, altitude, speed, and water load
- **Catenary power flow display** — real-time visualization of which train generates, which consumes, and how much surplus flows to the datacenter through the overhead wire
- **Cumulative statistics** — total MWh generated (both trains), cycles completed, megalitres of water moved, net efficiency
- **Energy flow bar** — proportional visualization of combined energy distribution
- **Controls** — start/pause/reset, simulation speed (1x–20x), wagon count (2–20)

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed engineering specs behind each visual element.

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
├── index.html         # Main page layout and structure
├── style.css          # Swiss-precision dark theme design system
├── physics.js         # Physics engine: gravity, dynamos, friction, energy accounting
├── helix.js           # Double-helix 3D track renderer with train animation
├── dashboard.js       # Gauge drawing, stat updates, phase indicators
├── main.js            # Simulation loop, controls, clock
├── favicon.svg        # Train-on-helix favicon
├── ARCHITECTURE.md    # Subsystem engineering design (stations, wagons, loco, grid)
└── README.md          # This file
```

## The Philosophy

This is a thought experiment in gravitational energy storage — the same principle behind pumped hydro [5][9], but reimagined with Swiss railway engineering. The mountain provides the height. The water provides the mass. The trains provide the transport. The dynamos provide the conversion. And Swiss precision keeps it all running on time.

The core idea — heavy trains on inclined rails as gravity batteries — is already being built at industrial scale by ARES North America [7]. Infinitrain adds the water mass trick: loading and unloading water to maximize the mass differential between descent and ascent. Two trains running anti-phase on a shared catenary eliminate the need for any chemical battery or reservoir — power transfers directly from the descending train's dynamos to the ascending train's motors through the wire.

The numbers work because physics is generous: a 740-tonne train dropping 2,000 meters releases enormous energy. The empty return trip costs a fraction. The surplus is real, substantial, and continuous — nearly 3 MW, enough to power a datacenter.

A perpetual train. An infinite cycle. **Infinitrain.**

## References

1. **15 kV AC railway electrification** — Wikipedia. Swiss 15 kV 16.7 Hz system history, adopted for the Gotthard line in 1916 during WWI coal shortages. https://en.wikipedia.org/wiki/15_kV_AC_railway_electrification
2. **SBB Re 460** — Wikipedia. Locomotive specifications: 84 t, 6,100 kW max power, 15 kV 16.7 Hz AC, regenerative braking. https://en.wikipedia.org/wiki/SBB-CFF-FFS_Re_460
3. **Rolling resistance coefficients** — Engineering ToolBox. Steel wheel on steel rail: 0.001–0.002. https://www.engineeringtoolbox.com/rolling-friction-resistance-d_1303.html
4. **Davis equation for train resistance** — Federal Railroad Administration, AAR RP-548. Modified Davis equation including aerodynamic term: `R' = 6.5 + 320/wn + 0.046v + 0.096v²/wn` (N/t). https://rosap.ntl.bts.gov/view/dot/79083
5. **Nant de Drance pumped storage plant** — Wikipedia. 900 MW, 20 GWh, 80% round-trip efficiency, operational 2022. https://en.wikipedia.org/wiki/Nant_de_Drance_Hydropower_Plant
6. **Regenerative braking energy recovery in railways** — Gonzalez-Gil et al., *Energies* 13(4), 2020. Feasibility and efficiency of regenerative braking in diesel-electric and electric freight trains. https://doi.org/10.3390/en13040963
7. **Advanced Rail Energy Storage (ARES)** — ARES North America. 50 MW GravityLine facility in Pahrump, Nevada. Rail-based gravity storage using mass cars on inclined tracks. 40-year lifespan, 30–50% lower cost than lithium-ion. https://aresnorthamerica.com
8. **Swiss electricity grid** — Swissgrid. 220/380 kV transmission, 50 Hz, European interconnection. https://www.swissgrid.ch/en/home/operation/grid-data/load.html
9. **Limmern pumped storage plant** — Axpo. 1,000 MW facility in the Glarus Alps, operational 2017. https://www.axpo.com/ch/en/energy/generation-and-distribution/wasserkraft/pumpspeicherwerk-limmern.html
10. **Underground Gravity Energy Storage (UGES)** — Hunt et al., *Energies* 16(2), 2023. Gravity storage using decommissioned mines, $1–10/kWh estimated cost. https://doi.org/10.3390/en16020825
