/**
 * Infinitrain Dashboard Controller
 * ==================================
 * Updates gauges, stats, phase indicators, and energy flow bar.
 * Supports dual-train mode with catenary transfer display.
 */

const Dashboard = (() => {
  let gaugeGenCtx, gaugeConCtx, gaugeSurCtx;

  // Max values for gauge scaling (combined two-train peak ~8 MW)
  const MAX_POWER_MW = 10;

  function init() {
    gaugeGenCtx = document.getElementById('gauge-generated').getContext('2d');
    gaugeConCtx = document.getElementById('gauge-consumed').getContext('2d');
    gaugeSurCtx = document.getElementById('gauge-surplus').getContext('2d');
  }

  // Accept combined metrics from two trains
  function update(combined) {
    const mA = combined.trainA;
    const mB = combined.trainB;

    // === Gauges (combined power) ===
    drawGauge(gaugeGenCtx, combined.powerGenerated_MW, MAX_POWER_MW, '#06d6a0', 140);
    drawGauge(gaugeConCtx, combined.powerConsumed_MW, MAX_POWER_MW, '#e63946', 140);
    drawGauge(gaugeSurCtx, Math.max(0, combined.powerSurplus_MW), MAX_POWER_MW, '#457b9d', 140);

    document.getElementById('val-generated').textContent = formatPower(combined.powerGenerated_MW);
    document.getElementById('val-consumed').textContent = formatPower(combined.powerConsumed_MW);
    document.getElementById('val-surplus').textContent = formatPower(Math.max(0, combined.powerSurplus_MW));

    // === Train A status ===
    document.getElementById('val-phase-a').textContent = capitalize(mA.phase);
    document.getElementById('val-alt-a').textContent = Math.round(mA.altitude).toLocaleString() + ' m';
    document.getElementById('val-speed-a').textContent = mA.speedKmh.toFixed(1) + ' km/h';
    document.getElementById('val-water-a').textContent = mA.waterPercent.toFixed(0) + '%';

    // === Train B status ===
    document.getElementById('val-phase-b').textContent = capitalize(mB.phase);
    document.getElementById('val-alt-b').textContent = Math.round(mB.altitude).toLocaleString() + ' m';
    document.getElementById('val-speed-b').textContent = mB.speedKmh.toFixed(1) + ' km/h';
    document.getElementById('val-water-b').textContent = mB.waterPercent.toFixed(0) + '%';

    // === Catenary transfer ===
    const genLabel = mA.powerGenerated_MW > mB.powerGenerated_MW ? 'A' : 'B';
    const conLabel = mA.powerConsumed_MW > mB.powerConsumed_MW ? 'A' : 'B';
    document.getElementById('cat-gen-label').textContent = genLabel + ': ' + formatPower(combined.powerGenerated_MW);
    document.getElementById('cat-con-label').textContent = conLabel + ': ' + formatPower(combined.powerConsumed_MW);
    document.getElementById('cat-dc-label').textContent = 'DC: ' + formatPower(Math.max(0, combined.powerSurplus_MW));

    // === Cumulative ===
    document.getElementById('val-total-energy').textContent = combined.totalGenerated_MWh.toFixed(2);
    document.getElementById('val-total-cycles').textContent = combined.totalCycles;
    document.getElementById('val-total-water').textContent = combined.totalWater_ML.toFixed(2);
    document.getElementById('val-efficiency').textContent = combined.efficiency.toFixed(1) + '%';

    // === Energy Flow Bar ===
    updateFlowBar(combined);
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

    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(42, 54, 80, 0.6)';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();

    if (fraction > 0.001) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, startAngle + fraction * range);
      ctx.strokeStyle = color;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, startAngle + fraction * range);
      ctx.strokeStyle = color;
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.15;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#e8ecf4';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((value * 1000).toFixed(0), cx, cy - 2);

    ctx.font = '8px monospace';
    ctx.fillStyle = '#5a6a84';
    ctx.fillText('kW', cx, cy + 14);
  }

  function updateFlowBar(metrics) {
    const gen = Math.max(0.01, metrics.powerGenerated_MW);
    const con = Math.max(0.01, metrics.powerConsumed_MW);
    const sur = Math.max(0.01, metrics.powerSurplus_MW);
    const total = gen + con + Math.max(0, sur);

    const isActive = gen > 0.05 || con > 0.05;
    if (isActive) {
      document.getElementById('flow-generated').style.flex = (gen / total * 10).toFixed(2);
      document.getElementById('flow-consumed').style.flex = (con / total * 10).toFixed(2);
      document.getElementById('flow-surplus').style.flex = (Math.max(0.3, sur) / total * 10).toFixed(2);
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

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  return { init, update };
})();
