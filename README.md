> Note this is AI Generated Content. Just explore the idea a little. 

# INFINITRAIN — Swiss Precision Gravity Battery

A perpetual gravity-battery power generator that uses water-loaded cargo trains on a double-helix spiral track to harvest gravitational potential energy — with Swiss railway precision.

Inspired by BreakingLab: https://www.youtube.com/watch?v=e9cVl4hmgZY

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

But the principle extends beyond a single loop. Any electrified mountain railway can recycle braking energy through the catenary — descending trains powering ascending ones. The Jungfrau Railway already returns over 50% of consumed electricity to the grid [13]. Infinitrain is the purest expression of this idea; an optimized alpine rail network is its natural scaling.

A perpetual train. An infinite cycle. From one loop to a network. **Infinitrain** to **Infinitrail.**

## Comparison with Hydropower

Infinitrain is often compared to hydropower, but the comparison requires care: it is fundamentally a **generator** (converting natural gravitational PE to electricity), not a storage system.

### The Three Systems

| | Run-of-River Hydro | Pumped Hydro Storage | Infinitrain |
|---|---|---|---|
| **What it does** | Generates from river flow + natural head | Stores externally generated energy | Generates from mountain water + natural head |
| **Energy source** | Gravitational PE of flowing river | Grid electricity (charged/discharged) | Gravitational PE of mountain water supply |
| **Round-trip efficiency** | 85--90% [11] | 70--85% [5][12] | ~50% (net surplus / total generated) |
| **Continuous output** | Depends on river flow (capacity factor 40--80%) [11] | Depends on charge cycle (capacity factor 10--30%) | ~2.9 MW steady (two-train anti-phase) |
| **Annual output** | Varies widely (1--1,000+ GWh) | Net consumer of energy (stores, not generates) | ~25 GWh/year |
| **Head (height)** | Typically 2--50 m (low head) | 200--800 m | 2,000 m |
| **Construction time** | 3--8 years | 8--15 years | Estimated 3--5 years (track + stations) |
| **Lifespan** | 50--100 years | 50+ years [12] | 40+ years (rail infrastructure) [7] |
| **Environmental impact** | Fish barriers, altered flow, sediment disruption | Reservoir flooding, dam construction | No dam, no reservoir, water returned clean |
| **Civil engineering** | Dam or weir + turbine house | Two reservoirs + tunnel + powerhouse | 46 km track + two small stations |
| **Swiss examples** | Rheinkraftwerk (100 MW) | Nant de Drance (900 MW) [5] | Conceptual (this project) |

### What the Efficiency Numbers Actually Mean

Infinitrain's ~50% "efficiency" is misleading if read as a storage metric. It is not storing anyone else's energy. The 50% means: of the gravitational PE released by the loaded descent, half goes to lifting the empty train back up, and half is surplus. This is an inherent property of the mass ratio (loaded 740 t vs empty 260 t) and conversion losses.

A fairer comparison is **energy harvested per tonne of water per metre of head**:

| System | Energy per tonne per metre head |
|--------|--------------------------------|
| Conventional hydro turbine | 9.81 J x 90% = **8.8 J** |
| Infinitrain (net surplus) | 9.81 J x ~50% x (1 - 260/740) = **3.2 J** |

Infinitrain extracts roughly **36% as much energy per tonne-metre** as a conventional turbine. The penalty comes from two sources: (1) the empty train must be lifted back up (~35% of generated energy), and (2) conversion losses in dynamo/motor chains (~20%). A hydro turbine avoids both because the water exits through the tailrace and the rotor stays in place.

### Where Infinitrain Wins

- **No dam required** -- the single largest cost, environmental impact, and permitting obstacle for hydro. A dam on a Swiss mountain river requires years of environmental review and public consultation. Infinitrain needs only a rail corridor.
- **No reservoir flooding** -- pumped hydro requires two large water bodies, often created by flooding valleys. Infinitrain moves water in wagons and returns it to the natural watercourse.
- **Extreme head** -- conventional turbines are limited to ~500--700 m head per stage (beyond that, pressures exceed material limits). Infinitrain exploits a full 2,000 m drop with no pressure vessel -- the water is in open-top wagons at atmospheric pressure.
- **Modularity** -- add wagons for more power, add trains for more throughput. No civil engineering changes needed.
- **Dual use** -- the rail infrastructure could carry other freight during maintenance windows.

### Where Conventional Hydro Wins

- **Efficiency** -- 85--90% vs ~50%. For every unit of water, hydro extracts nearly twice the energy.
- **Power density** -- a single Pelton turbine in a 2,000 m head installation produces 100+ MW. Infinitrain produces ~3 MW. You would need ~30 Infinitrain systems to match one turbine.
- **Simplicity** -- a penstock and turbine have no moving parts beyond the rotor. Infinitrain has locomotives, wagons, track, switches, catenary, and automation.
- **Proven at scale** -- hydropower provides ~16% of global electricity [11]. Rail-gravity generation has no commercial installations yet.
- **Operating cost** -- hydro turbines run with minimal staffing and near-zero fuel cost. Infinitrain requires rail maintenance, wheel/rail wear, and periodic wagon overhaul.

### The Niche

Infinitrain is not a replacement for hydropower. It occupies a specific niche: **sites where a large natural head exists, water is abundant, but a dam is not feasible** -- whether for environmental, geological, political, or economic reasons. Alpine locations with steep terrain and glacial/snowmelt water are ideal candidates. The key advantage is that Infinitrain can exploit elevation differences that are too steep or too remote for conventional hydro, using modular rail infrastructure that is faster to build and easier to decommission than a dam.

## Beyond Infinitrain: The Self-Sustaining Railway

Infinitrain runs two trains in anti-phase on a shared catenary: the descending train's dynamos power the ascending train's motors through the wire, with surplus going to the datacenter. But this principle is not limited to a purpose-built gravity battery. It applies to **any electrified railway in mountainous terrain**.

The insight: in a mountain railway network, descending trains are continuously converting gravitational potential energy into electricity through regenerative braking. If that energy flows through the catenary to ascending trains on the same electrical section, the network recycles its own gravitational energy. The only external power needed covers friction losses, conversion inefficiencies, and auxiliary systems. Under the right conditions, a mountain railway approaches **energy self-sufficiency**.

### The Physics

For a train on a mountain route with elevation change *h* and track length *L*:

**Descending (generating):** The train brakes regeneratively. Net energy fed to the catenary per tonne:

```
E_gen = (g × h - μ × g × L) × η_regen
      = (9.81 × 800 - 0.002 × 9.81 × 28,000) × 0.88
      = (7,848 - 549) × 0.88
      = 6,423 J/kg  →  1.78 kWh/t
```

**Ascending (consuming):** The train motors draw from the catenary. Energy consumed per tonne:

```
E_cons = (g × h + μ × g × L) / η_motor
       = (7,848 + 549) / 0.90
       = 9,330 J/kg  →  2.59 kWh/t
```

Rolling resistance *opposes motion* in both directions: it reduces the braking energy captured on descent and increases the motor energy needed on ascent. This asymmetry, combined with conversion losses (88% dynamo, 90% motor), means a single train doing a round trip recovers only **69%** of its ascent energy from its own descent (1.78 / 2.59). The remaining 31% must come from somewhere.

But across a *network* with many trains, the math changes. If heavy trains descend while light trains ascend, the generated energy can exceed consumption -- the network becomes a **net energy exporter**.

### Self-Sufficiency Ratio (SSR)

Define a corridor's energy self-sufficiency:

```
SSR = Energy_recycled / Energy_consumed_total
```

where *Energy_recycled* is regenerative braking energy reused by other trains through the catenary, and *Energy_consumed_total* is total traction plus auxiliary energy. An SSR of 1.0 means fully self-sustaining; above 1.0 means net energy export to the grid.

### Example: Alpine Corridor

Consider a Gotthard-like route -- 800 m elevation change, 28 km track, 100 trains per day (50 each direction) [1]:

| Scenario | Downhill avg mass | Uphill avg mass | Generated | Consumed | SSR |
|----------|-------------------|-----------------|-----------|----------|-----|
| **A: Symmetric traffic** | 1,200 t | 1,200 t | 107 MWh/day | 179 MWh/day | **0.60** |
| **B: Optimized scheduling** | 1,800 t | 600 t | 160 MWh/day | 89 MWh/day | **1.80** |

Consumed includes a 15% auxiliary overhead (HVAC, lighting, signaling, station systems).

**Scenario A** represents typical mixed traffic: passenger and freight trains of similar average mass in both directions. The corridor is **60% self-sufficient** -- three-fifths of traction energy comes from recycled braking energy, with only 40% drawn from the external grid.

**Scenario B** applies the Infinitrain principle to scheduling: route heavy loaded freight downhill and return empty wagons uphill. The mass asymmetry (3:1 ratio) makes the corridor a **net exporter**, generating 80% more energy than it consumes. The surplus feeds back into the railway grid or the public 50 Hz network.

### Real-World Proof

This is not hypothetical. Mountain railways already do it:

- **Jungfrau Railway** (Switzerland, 1,393 m elevation): In 2020, withdrew 2,870 MWh from the grid but returned **1,450 MWh** (50.5%) as surplus braking energy [13]. The direct catenary transfer between ascending and descending trains -- which is additional and not metered -- means the true recovery ratio is substantially higher. The railway states: *"In the best case, the other train may be operated exclusively with braking power."*

- **European rail average**: Studies find regenerative braking recovers **10--30%** of total traction energy across European networks [6][14]. The wide range reflects topology -- flat networks recover less, mountain routes recover far more.

- **Metro systems globally**: Urban metros with frequent stops recover an average of **27%** of traction energy through regenerative braking, even on flat terrain [14]. Mountain railways with 800+ metre elevation changes have inherently higher potential.

### Three Conditions for High Self-Sufficiency

A railway corridor approaches energy self-sufficiency when three conditions align:

1. **Large elevation change** -- The gravitational PE available for recovery scales linearly with height. Below ~200 m, friction and conversion losses dominate and SSR stays under 30%. Above 500 m, the gravitational term overwhelms losses and SSR climbs rapidly.

2. **Asymmetric or balanced traffic on shared electrical sections** -- Maximum benefit comes when a descending train and an ascending train are on the same catenary section simultaneously (Infinitrain's anti-phase principle at network scale). Timetable coordination to overlap heavy descents with light ascents maximizes direct power transfer.

3. **Modern regenerative rolling stock** -- The fleet must be capable of feeding braking energy back to the catenary. Older mechanical-brake-only vehicles waste all descent energy as heat. SBB's modern fleet (Re 460, FLIRT, Giruno) already supports full regenerative braking [2][6].

### Switzerland as the Ideal Testbed

Switzerland is uniquely positioned for this concept:

- **Nationwide 15 kV 16.7 Hz AC catenary** [1] -- every mainline route is electrified and capable of bidirectional power flow
- **Extreme topography** -- trans-Alpine routes cross 800--1,400 m elevation changes (Gotthard, Lötschberg, Simplon, Albula)
- **High rail modal share** -- 37% of freight crosses the Alps by rail (NRLA policy), providing dense bidirectional mountain traffic
- **100% renewable traction power** since 2025 -- primarily hydroelectric, making the recycled braking energy fully green
- **SBB already recovers braking energy** -- the infrastructure exists; the opportunity is in optimizing schedules to maximize catenary recycling

### From Infinitrain to Infinitrail

| | Current SBB Network | Optimized Alpine Corridor | Infinitrain (dedicated loop) |
|---|---|---|---|
| **SSR** | ~15--20% (estimate) [6][14] | 60--100%+ | ~100% (by design) |
| **Elevation exploited** | Varies (0--1,400 m) | 800 m (single corridor) | 2,000 m (purpose-built) |
| **Traffic optimization** | Schedule-driven, not energy-optimized | Energy-aware scheduling | Perfect anti-phase |
| **Rolling stock** | Mixed (some non-regen) | All regenerative | All regenerative |
| **Infrastructure change** | None | Timetable + fleet upgrades | New track + stations |
| **External energy needed** | ~80--85% of traction | ~0--40% of traction | ~0% (surplus exported) |

The progression is clear: Infinitrain is the theoretical limit of catenary energy recycling -- a system designed from the ground up for maximum mass asymmetry and perfect anti-phase scheduling. A real-world alpine corridor cannot match that, but by applying the same principles (regenerative fleet, timetable coordination, heavy-downhill scheduling), it can close much of the gap. The Jungfrau Railway already demonstrates that mountain railways can be **net energy exporters** [13].

The vision: not just one Infinitrain loop, but an **Infinitrail** -- a network of alpine railway corridors where every descent powers an ascent, and the mountains themselves become the power source.

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
11. **Hydropower** — International Energy Agency. ~16% of global electricity, capacity factors 40–80% for run-of-river, turbine efficiency 85–90%. https://www.iea.org/energy-system/renewables/hydroelectricity
12. **Pumped-storage hydroelectricity** — Wikipedia. 96% of global storage capacity, 70–85% round-trip efficiency, 50+ year lifespan. https://en.wikipedia.org/wiki/Pumped-storage_hydroelectricity
13. **Jungfrau Railway braking energy recovery** — Jungfrau Railways Annual Report 2020. Withdrew 2,870 MWh, returned 1,450 MWh (50.5%) to the distribution grid via regenerative braking. Direct train-to-train catenary transfer additional. https://www.jungfrau.ch/business-report-2020/en_our-operations.html
14. **Energy saving measures in rail** — Europe's Rail Joint Undertaking, 2024. Regenerative braking recovers 10--30% of traction energy across European networks; maximizing braking energy recovery identified as a primary rolling stock solution. https://rail-research.europa.eu/wp-content/uploads/2024/07/ERSIPB-EDSIPB-B-S2R-219-01_-_20240314_Energy_saving_measures_in_rail_report_changes__2_.pdf
