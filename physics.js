/**
 * Infinitrain Physics Engine
 * ===========================
 * Real physics model for a gravity-battery train system.
 *
 * Concept:
 *   - Train loads water at mountain summit (potential energy source)
 *   - Descends on spiral track, dynamos harvest kinetic energy
 *   - At valley, water is released, stored energy is banked
 *   - Lightweight train ascends back using fraction of harvested energy
 *   - Surplus energy powers datacenter
 *
 * Key equations:
 *   E_potential = m * g * Δh
 *   E_kinetic   = 0.5 * m * v²
 *   P_dynamo    = η_dynamo * F_gravity_component * v
 *   F_friction  = μ * m * g * cos(θ)
 *   F_brake     = dynamo regenerative braking force
 */

const Physics = (() => {
  // === Constants ===
  const G = 9.81;                    // m/s² gravity
  const SUMMIT_ALT = 2400;           // m — mountain top
  const VALLEY_ALT = 400;            // m — valley floor
  const HEIGHT_DIFF = SUMMIT_ALT - VALLEY_ALT; // 2000m drop

  // === Track Geometry ===
  const HELIX_TURNS_DOWN = 12;       // number of spiral turns descending
  const HELIX_TURNS_UP = 12;         // number of spiral turns ascending
  const HELIX_RADIUS = 300;          // m — radius of each spiral
  // Resulting grade: ~8.8% (steep but within range of Swiss mountain railways;
  // cf. Brünig line 12%, Pilatus 48%. Standard adhesion limit ~8-9%.)

  // Computed track length per helix
  // Each turn: circumference = 2πr, height drop per turn = HEIGHT_DIFF / turns
  // Track length per turn = sqrt((2πr)² + (Δh_per_turn)²)
  const HEIGHT_PER_TURN = HEIGHT_DIFF / HELIX_TURNS_DOWN;
  const CIRCUMFERENCE = 2 * Math.PI * HELIX_RADIUS;
  const TRACK_LENGTH_PER_TURN = Math.sqrt(CIRCUMFERENCE ** 2 + HEIGHT_PER_TURN ** 2);
  const TOTAL_TRACK_DOWN = TRACK_LENGTH_PER_TURN * HELIX_TURNS_DOWN;
  const TOTAL_TRACK_UP = TRACK_LENGTH_PER_TURN * HELIX_TURNS_UP;
  const TRACK_ANGLE = Math.atan(HEIGHT_PER_TURN / CIRCUMFERENCE); // radians

  // === Train Parameters ===
  const LOCO_MASS = 84000;           // kg — locomotive (SBB Re 460 class)
  const WAGON_EMPTY_MASS = 22000;    // kg — empty tank wagon
  const WAGON_WATER_CAPACITY = 60000;// kg — 60m³ water per wagon (60,000 litres)
  const DEFAULT_WAGON_COUNT = 8;

  // === Efficiency & Friction ===
  const DYNAMO_EFFICIENCY = 0.88;    // 88% dynamo conversion efficiency
  const MOTOR_EFFICIENCY = 0.90;     // 90% electric motor efficiency for ascent
  const ROLLING_RESISTANCE = 0.002;  // steel wheel on steel rail

  // Aerodynamic drag: F = AERO_CDA * v²
  // Based on 0.5 * ρ_air * Cd * A_frontal
  //   ρ_air ≈ 1.0 kg/m³ (avg at ~1400m altitude)
  //   Cd ≈ 1.8 (blunt freight train)
  //   A_frontal ≈ 12 m²
  //   → 0.5 * 1.0 * 1.8 * 12 ≈ 11 N·s²/m²
  // NOT proportional to mass — frontal area is constant regardless of load.
  const AERO_CDA = 11;               // N/(m/s)² — effective drag area coefficient

  // === Speed Limits ===
  const MAX_SPEED_DOWN = 60 / 3.6;   // 60 km/h → m/s (safe descent)
  const MAX_SPEED_UP = 45 / 3.6;     // 45 km/h → m/s (lighter ascent)
  const TARGET_SPEED_DOWN = 50 / 3.6;
  const TARGET_SPEED_UP = 40 / 3.6;

  // === Loading/Unloading ===
  const LOAD_TIME = 300;             // seconds to fill all wagons
  const UNLOAD_TIME = 180;           // seconds to drain all wagons

  // === State Factory ===
  function createState(wagonCount = DEFAULT_WAGON_COUNT) {
    const waterMass = wagonCount * WAGON_WATER_CAPACITY;
    return {
      // Phase: 'loading' | 'descending' | 'unloading' | 'ascending'
      phase: 'loading',
      wagonCount,

      // Position along track (0 = start of current track, 1 = end)
      trackProgress: 0,

      // Current altitude
      altitude: SUMMIT_ALT,

      // Speed in m/s
      speed: 0,

      // Water state (0..1 fraction)
      waterFraction: 0,

      // Phase timer (for loading/unloading)
      phaseTimer: 0,

      // Energy accounting (Joules)
      energyGenerated: 0,          // total dynamo output this cycle
      energyConsumedAscent: 0,     // energy used for ascent this cycle
      instantPowerGenerated: 0,    // Watts — current dynamo power
      instantPowerConsumed: 0,     // Watts — current motor power

      // Cumulative (across all cycles)
      totalEnergyGenerated: 0,     // Joules
      totalEnergyConsumed: 0,      // Joules
      totalCycles: 0,
      totalWaterMoved: 0,          // kg

      // Derived
      totalMass: 0,
      dynamoForce: 0,
    };
  }

  // === Mass Calculation ===
  function getTotalMass(state) {
    const trainMass = LOCO_MASS + state.wagonCount * WAGON_EMPTY_MASS;
    const waterMass = state.waterFraction * state.wagonCount * WAGON_WATER_CAPACITY;
    return trainMass + waterMass;
  }

  // === Simulation Step ===
  function step(state, dt) {
    // dt is in seconds (real time * simulation speed)
    const s = { ...state };
    s.totalMass = getTotalMass(s);

    switch (s.phase) {
      case 'loading':
        s.speed = 0;
        s.instantPowerGenerated = 0;
        s.instantPowerConsumed = 0;
        s.phaseTimer += dt;
        s.waterFraction = Math.min(1, s.phaseTimer / LOAD_TIME);
        s.altitude = SUMMIT_ALT;
        s.trackProgress = 0;

        if (s.waterFraction >= 1) {
          s.phase = 'descending';
          s.phaseTimer = 0;
          s.waterFraction = 1;
          s.energyGenerated = 0;
        }
        break;

      case 'descending':
        s.totalMass = getTotalMass(s);
        const resultDown = simulateMotion(s, dt, 'down');
        Object.assign(s, resultDown);

        if (s.trackProgress >= 1) {
          s.trackProgress = 1;
          s.speed = 0;
          s.altitude = VALLEY_ALT;
          s.phase = 'unloading';
          s.phaseTimer = 0;
          // Bank the cycle's generated energy
          s.totalEnergyGenerated += s.energyGenerated;
        }
        break;

      case 'unloading':
        s.speed = 0;
        s.instantPowerGenerated = 0;
        s.instantPowerConsumed = 0;
        s.phaseTimer += dt;
        s.waterFraction = Math.max(0, 1 - s.phaseTimer / UNLOAD_TIME);
        s.altitude = VALLEY_ALT;

        if (s.waterFraction <= 0) {
          s.phase = 'ascending';
          s.phaseTimer = 0;
          s.waterFraction = 0;
          s.trackProgress = 0;
          s.energyConsumedAscent = 0;
          s.totalWaterMoved += s.wagonCount * WAGON_WATER_CAPACITY;
        }
        break;

      case 'ascending':
        s.totalMass = getTotalMass(s);
        const resultUp = simulateMotion(s, dt, 'up');
        Object.assign(s, resultUp);

        if (s.trackProgress >= 1) {
          s.trackProgress = 0;
          s.speed = 0;
          s.altitude = SUMMIT_ALT;
          s.phase = 'loading';
          s.phaseTimer = 0;
          // Complete cycle
          s.totalEnergyConsumed += s.energyConsumedAscent;
          s.totalCycles += 1;
        }
        break;
    }

    return s;
  }

  // === Motion Simulation ===
  function simulateMotion(state, dt, direction) {
    const s = { ...state };
    const m = s.totalMass;
    const sinA = Math.sin(TRACK_ANGLE);
    const cosA = Math.cos(TRACK_ANGLE);
    const trackLen = direction === 'down' ? TOTAL_TRACK_DOWN : TOTAL_TRACK_UP;
    const targetSpeed = direction === 'down' ? TARGET_SPEED_DOWN : TARGET_SPEED_UP;
    const maxSpeed = direction === 'down' ? MAX_SPEED_DOWN : MAX_SPEED_UP;

    if (direction === 'down') {
      // === DESCENDING ===
      // Gravity component along track (driving force)
      const F_gravity = m * G * sinA;

      // Rolling resistance (opposing)
      const F_rolling = ROLLING_RESISTANCE * m * G * cosA;

      // Aerodynamic drag (opposing) — constant frontal area, not mass-dependent
      const F_air = AERO_CDA * s.speed * s.speed;

      // Dynamo braking force — controlled to regulate speed near target
      // PID-like speed control: more braking when faster than target
      const speedError = s.speed - targetSpeed;
      let dynamoBrakeFraction = 0.5 + 0.5 * Math.tanh(speedError * 2);
      dynamoBrakeFraction = Math.max(0.1, Math.min(0.95, dynamoBrakeFraction));

      const F_net_available = F_gravity - F_rolling - F_air;
      const F_dynamo = Math.max(0, F_net_available * dynamoBrakeFraction);

      // Net force
      const F_net = F_gravity - F_rolling - F_air - F_dynamo;

      // Acceleration
      const accel = F_net / m;
      s.speed = Math.max(0, Math.min(maxSpeed, s.speed + accel * dt));

      // Distance traveled
      const dist = s.speed * dt;
      s.trackProgress += dist / trackLen;
      s.trackProgress = Math.min(1, s.trackProgress);

      // Altitude update
      s.altitude = SUMMIT_ALT - s.trackProgress * HEIGHT_DIFF;

      // Energy harvested by dynamo this step
      const E_dynamo = F_dynamo * dist * DYNAMO_EFFICIENCY;
      s.energyGenerated += E_dynamo;
      s.instantPowerGenerated = F_dynamo * s.speed * DYNAMO_EFFICIENCY;
      s.instantPowerConsumed = 0;
      s.dynamoForce = F_dynamo;

    } else {
      // === ASCENDING ===
      // Gravity component along track (opposing)
      const F_gravity = m * G * sinA;

      // Rolling resistance (opposing)
      const F_rolling = ROLLING_RESISTANCE * m * G * cosA;

      // Aerodynamic drag (opposing) — constant frontal area, not mass-dependent
      const F_air = AERO_CDA * s.speed * s.speed;

      // Motor force needed — enough to climb + overcome friction + accelerate to target
      const speedError = targetSpeed - s.speed;
      const F_accel = m * Math.max(0, speedError) * 0.3; // gentle acceleration
      const F_motor = (F_gravity + F_rolling + F_air + F_accel) / MOTOR_EFFICIENCY;

      // Net force for motion
      const F_net = F_motor * MOTOR_EFFICIENCY - F_gravity - F_rolling - F_air;
      const accel = F_net / m;
      s.speed = Math.max(0, Math.min(maxSpeed, s.speed + accel * dt));

      // Distance
      const dist = s.speed * dt;
      s.trackProgress += dist / trackLen;
      s.trackProgress = Math.min(1, s.trackProgress);

      // Altitude
      s.altitude = VALLEY_ALT + s.trackProgress * HEIGHT_DIFF;

      // Energy consumed by motor this step
      const E_motor = F_motor * dist;
      s.energyConsumedAscent += E_motor;
      s.instantPowerConsumed = F_motor * s.speed;
      s.instantPowerGenerated = 0;
    }

    return s;
  }

  // === Derived Metrics ===
  function getMetrics(state) {
    const cycleEnergyGen = state.energyGenerated;                    // J
    const cycleEnergyAsc = state.energyConsumedAscent;              // J
    const surplus = cycleEnergyGen - cycleEnergyAsc;

    const totalGen = state.totalEnergyGenerated + (state.phase === 'descending' ? state.energyGenerated : 0);
    const totalCon = state.totalEnergyConsumed + (state.phase === 'ascending' ? state.energyConsumedAscent : 0);
    const efficiency = totalGen > 0 ? ((totalGen - totalCon) / totalGen * 100) : 0;

    return {
      // Instantaneous (MW)
      powerGenerated_MW: state.instantPowerGenerated / 1e6,
      powerConsumed_MW: state.instantPowerConsumed / 1e6,
      powerSurplus_MW: (state.instantPowerGenerated - state.instantPowerConsumed) / 1e6,

      // Cycle totals (MWh)
      cycleGenerated_MWh: cycleEnergyGen / 3.6e9,
      cycleConsumed_MWh: cycleEnergyAsc / 3.6e9,
      cycleSurplus_MWh: surplus / 3.6e9,

      // Cumulative (MWh)
      totalGenerated_MWh: totalGen / 3.6e9,
      totalConsumed_MWh: totalCon / 3.6e9,
      totalSurplus_MWh: (totalGen - totalCon) / 3.6e9,

      // Other
      efficiency,
      totalCycles: state.totalCycles,
      totalWater_ML: state.totalWaterMoved / 1e6, // megalitres
      speedKmh: state.speed * 3.6,
      altitude: state.altitude,
      waterPercent: state.waterFraction * 100,
      dynamoOutput_kW: state.instantPowerGenerated / 1e3,
      phase: state.phase,
    };
  }

  // === Theoretical Energy for Display ===
  function theoreticalCycleEnergy(wagonCount) {
    const fullMass = LOCO_MASS + wagonCount * (WAGON_EMPTY_MASS + WAGON_WATER_CAPACITY);
    const emptyMass = LOCO_MASS + wagonCount * WAGON_EMPTY_MASS;
    const E_down = fullMass * G * HEIGHT_DIFF * DYNAMO_EFFICIENCY;
    const E_up = emptyMass * G * HEIGHT_DIFF / MOTOR_EFFICIENCY;
    return {
      generated_MWh: E_down / 3.6e9,
      consumed_MWh: E_up / 3.6e9,
      surplus_MWh: (E_down - E_up) / 3.6e9,
      ratio: E_down / E_up,
    };
  }

  // === Dual-Train Support ===

  // Create a state pre-advanced by exactly half a cycle.
  // We simulate forward through ~half the cycle time so the physics engine
  // naturally places Train B at the correct anti-phase position.
  // Cycle: ~300s load + ~1635s descent + ~180s unload + ~2047s ascent ≈ 4162s
  // Half cycle ≈ 2081s → falls in the unloading phase.
  function createOffsetState(wagonCount = DEFAULT_WAGON_COUNT) {
    let s = createState(wagonCount);

    // First, estimate half-cycle time by running a full cycle
    let probe = createState(wagonCount);
    const dt = 1.0;
    let cycleTime = 0;
    const startCycles = probe.totalCycles;
    while (probe.totalCycles === startCycles) {
      probe = step(probe, dt);
      cycleTime += dt;
      if (cycleTime > 10000) break; // safety limit
    }

    // Pre-simulate Train B for exactly half that cycle
    const halfCycle = cycleTime / 2;
    const preSteps = Math.ceil(halfCycle / dt);
    for (let i = 0; i < preSteps; i++) {
      s = step(s, dt);
    }

    // Reset cumulative counters so both trains start fresh
    s.totalEnergyGenerated = 0;
    s.totalEnergyConsumed = 0;
    s.totalCycles = 0;
    s.totalWaterMoved = 0;

    return s;
  }

  // Combine metrics from two trains into a unified view
  function getCombinedMetrics(stateA, stateB) {
    const mA = getMetrics(stateA);
    const mB = getMetrics(stateB);

    const totalGen = mA.powerGenerated_MW + mB.powerGenerated_MW;
    const totalCon = mA.powerConsumed_MW + mB.powerConsumed_MW;
    const catenaryTransfer = Math.min(totalGen, totalCon); // direct wire transfer
    const surplus = totalGen - totalCon;
    // Buffer is active when there's a net deficit (neither train generating enough)
    const bufferActive = surplus < -0.01;

    const cumGen = mA.totalGenerated_MWh + mB.totalGenerated_MWh;
    const cumCon = mA.totalConsumed_MWh + mB.totalConsumed_MWh;
    const cumEff = cumGen > 0 ? ((cumGen - cumCon) / cumGen * 100) : 0;

    return {
      // Per-train
      trainA: mA,
      trainB: mB,

      // Combined instantaneous (MW)
      powerGenerated_MW: totalGen,
      powerConsumed_MW: totalCon,
      powerSurplus_MW: surplus,
      catenaryTransfer_MW: catenaryTransfer,
      bufferActive,

      // Cumulative
      totalGenerated_MWh: cumGen,
      totalConsumed_MWh: cumCon,
      totalSurplus_MWh: cumGen - cumCon,
      efficiency: cumEff,
      totalCycles: mA.totalCycles + mB.totalCycles,
      totalWater_ML: mA.totalWater_ML + mB.totalWater_ML,
    };
  }

  return {
    G, SUMMIT_ALT, VALLEY_ALT, HEIGHT_DIFF,
    HELIX_TURNS_DOWN, HELIX_TURNS_UP, HELIX_RADIUS,
    TOTAL_TRACK_DOWN, TOTAL_TRACK_UP, TRACK_ANGLE,
    LOCO_MASS, WAGON_EMPTY_MASS, WAGON_WATER_CAPACITY,
    LOAD_TIME, UNLOAD_TIME,
    DEFAULT_WAGON_COUNT,
    MAX_SPEED_DOWN, MAX_SPEED_UP,
    TARGET_SPEED_UP,
    createState,
    createOffsetState,
    getTotalMass,
    step,
    getMetrics,
    getCombinedMetrics,
    theoreticalCycleEnergy,
  };
})();
