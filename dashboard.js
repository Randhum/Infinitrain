/**
 * Infinitrain Dashboard Controller
 * ==================================
 * Updates gauges, stats, phase indicators, and energy flow bar.
 */

const Dashboard = (() => {
  // Gauge canvases
  let gaugeGenCtx, gaugeConCtx, gaugeSurCtx;

  // Max values for gauge scaling (peak descent power ~7.6 MW with 8 wagons)
  const MAX_POWER_MW = 10; // max gauge range

  function init() {
    gaugeGenCtx = document.getElementById('gauge-generated').getContext('2d');
    gaugeConCtx = document.getElementById('gauge-consumed').getContext('2d');
    gaugeSurCtx = document.getElementById('gauge-surplus').getContext('2d');
  }

  function update(metrics) {
    // === Gauges ===
    drawGauge(gaugeGenCtx, metrics.powerGenerated_MW, MAX_POWER_MW, '#06d6a0', 140);
    drawGauge(gaugeConCtx, metrics.powerConsumed_MW, MAX_POWER_MW, '#e63946', 140);
    drawGauge(gaugeSurCtx, Math.max(0, metrics.powerSurplus_MW), MAX_POWER_MW, '#457b9d', 140);

    // Gauge values
    document.getElementById('val-generated').textContent = formatPower(metrics.powerGenerated_MW);
    document.getElementById('val-consumed').textContent = formatPower(metrics.powerConsumed_MW);
    document.getElementById('val-surplus').textContent = formatPower(Math.max(0, metrics.powerSurplus_MW));

    // === Train Status ===
    document.getElementById('val-altitude').textContent = Math.round(metrics.altitude).toLocaleString() + ' m';
    document.getElementById('val-speed').textContent = metrics.speedKmh.toFixed(1) + ' km/h';
    document.getElementById('val-water').textContent = metrics.waterPercent.toFixed(0) + '%';
    document.getElementById('val-dynamo').textContent = metrics.dynamoOutput_kW.toFixed(0) + ' kW';

    // === Phase ===
    updatePhase(metrics.phase);

    // === Cumulative ===
    document.getElementById('val-total-energy').textContent = metrics.totalGenerated_MWh.toFixed(2);
    document.getElementById('val-total-cycles').textContent = metrics.totalCycles;
    document.getElementById('val-total-water').textContent = metrics.totalWater_ML.toFixed(2);
    document.getElementById('val-efficiency').textContent = metrics.efficiency.toFixed(1) + '%';

    // === Energy Flow Bar ===
    updateFlowBar(metrics);
  }

  function drawGauge(ctx, value, max, color, size) {
    const s = size;
    const cx = s / 2;
    const cy = s / 2;
    const r = s / 2 - 12;
    const startAngle = 0.75 * Math.PI;
    const endAngle = 2.25 * Math.PI;
    const range = endAngle - startAngle;
    const fraction = Math.min(1, Math.max(0, value / max));

    ctx.clearRect(0, 0, s, s);

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(42, 54, 80, 0.6)';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Value arc
    if (fraction > 0.001) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, startAngle + fraction * range);
      ctx.strokeStyle = color;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Glow
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, startAngle + fraction * range);
      ctx.strokeStyle = color;
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.15;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Center value
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#e8ecf4';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((value * 1000).toFixed(0), cx, cy - 2);

    ctx.font = '8px monospace';
    ctx.fillStyle = '#5a6a84';
    ctx.fillText('kW', cx, cy + 14);
  }

  function updatePhase(phase) {
    const phases = ['loading', 'descending', 'unloading', 'ascending'];
    const ids = ['phase-load', 'phase-descend', 'phase-unload', 'phase-ascend'];

    for (let i = 0; i < phases.length; i++) {
      const el = document.getElementById(ids[i]);
      if (phases[i] === phase) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    }
  }

  function updateFlowBar(metrics) {
    const gen = Math.max(0.01, metrics.powerGenerated_MW);
    const con = Math.max(0.01, metrics.powerConsumed_MW);
    const sur = Math.max(0.01, metrics.powerSurplus_MW);
    const total = gen + con + Math.max(0, sur);

    if (metrics.phase === 'descending') {
      document.getElementById('flow-generated').style.flex = (gen / total * 10).toFixed(2);
      document.getElementById('flow-consumed').style.flex = '0.5';
      document.getElementById('flow-surplus').style.flex = (Math.max(0, sur) / total * 10).toFixed(2);
    } else if (metrics.phase === 'ascending') {
      document.getElementById('flow-generated').style.flex = '0.5';
      document.getElementById('flow-consumed').style.flex = (con / 0.05 * 2).toFixed(2);
      document.getElementById('flow-surplus').style.flex = '0.5';
    } else {
      document.getElementById('flow-generated').style.flex = '3';
      document.getElementById('flow-consumed').style.flex = '1';
      document.getElementById('flow-surplus').style.flex = '2';
    }

    document.getElementById('flow-gen-val').textContent = formatPower(metrics.powerGenerated_MW);
    document.getElementById('flow-con-val').textContent = formatPower(metrics.powerConsumed_MW);
    document.getElementById('flow-sur-val').textContent = formatPower(Math.max(0, metrics.powerSurplus_MW));
  }

  function formatPower(mw) {
    if (mw < 0.001) return '0 W';
    if (mw < 1) return (mw * 1000).toFixed(0) + ' kW';
    return mw.toFixed(2) + ' MW';
  }

  return { init, update };
})();
