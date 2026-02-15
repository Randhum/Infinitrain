/**
 * Infinitrain Main Controller
 * =============================
 * Dual-train anti-phase simulation with catenary power transfer.
 * Train A starts at loading (summit), Train B starts mid-ascent (offset).
 */

(function () {
  'use strict';

  // === State ===
  let stateA = Physics.createState(Physics.DEFAULT_WAGON_COUNT);
  let stateB = Physics.createOffsetState(Physics.DEFAULT_WAGON_COUNT);
  let running = false;
  let simSpeed = 1;
  let lastFrameTime = null;
  let simClock = 0;
  let animFrameId = null;

  // === DOM refs ===
  const btnStart = document.getElementById('btn-start');
  const btnPause = document.getElementById('btn-pause');
  const btnReset = document.getElementById('btn-reset');
  const simSpeedSlider = document.getElementById('sim-speed');
  const speedLabel = document.getElementById('speed-label');
  const wagonSlider = document.getElementById('wagon-count');
  const wagonLabel = document.getElementById('wagon-label');
  const clockEl = document.getElementById('clock');
  const statusDot = document.querySelector('.dot');
  const statusText = document.getElementById('status-text');

  // === Initialize ===
  function init() {
    HelixRenderer.init(document.getElementById('helix-canvas'));
    Dashboard.init();

    btnStart.addEventListener('click', start);
    btnPause.addEventListener('click', pause);
    btnReset.addEventListener('click', reset);

    simSpeedSlider.addEventListener('input', (e) => {
      simSpeed = parseInt(e.target.value);
      speedLabel.textContent = simSpeed + 'x';
    });

    wagonSlider.addEventListener('input', (e) => {
      const count = parseInt(e.target.value);
      wagonLabel.textContent = count;
      // Only apply wagon change during safe phases
      if (stateA.phase === 'loading' || !running) stateA.wagonCount = count;
      if (stateB.phase === 'loading' || !running) stateB.wagonCount = count;
    });

    renderFrame(performance.now());
    updateUI();
    start();
  }

  // === Controls ===
  function start() {
    if (running) return;
    running = true;
    lastFrameTime = null;
    updateUI();
    loop();
  }

  function pause() {
    running = false;
    if (animFrameId) cancelAnimationFrame(animFrameId);
    animFrameId = null;
    updateUI();
  }

  function reset() {
    running = false;
    if (animFrameId) cancelAnimationFrame(animFrameId);
    animFrameId = null;
    const count = parseInt(wagonSlider.value);
    stateA = Physics.createState(count);
    stateB = Physics.createOffsetState(count);
    simClock = 0;
    lastFrameTime = null;
    updateUI();
    renderFrame(performance.now());
  }

  function updateUI() {
    if (running) {
      statusDot.className = 'dot running';
      statusText.textContent = 'RUNNING';
      btnStart.style.display = 'none';
      btnPause.style.display = '';
    } else {
      statusDot.className = 'dot paused';
      statusText.textContent = 'PAUSED';
      btnStart.style.display = '';
      btnPause.style.display = 'none';
    }
  }

  // === Simulation Loop ===
  function loop() {
    if (!running) return;
    animFrameId = requestAnimationFrame((timestamp) => {
      if (lastFrameTime === null) lastFrameTime = timestamp;

      const realDt = Math.min((timestamp - lastFrameTime) / 1000, 0.1);
      lastFrameTime = timestamp;

      const simDt = realDt * simSpeed;
      simClock += simDt;

      // Sub-stepping for stability
      const subSteps = Math.max(1, Math.ceil(simSpeed / 5));
      const subDt = simDt / subSteps;
      for (let i = 0; i < subSteps; i++) {
        stateA = Physics.step(stateA, subDt);
        stateB = Physics.step(stateB, subDt);
      }

      renderFrame(timestamp);
      loop();
    });
  }

  function renderFrame(timestamp) {
    const combined = Physics.getCombinedMetrics(stateA, stateB);

    // Visualization gets both states + combined metrics
    HelixRenderer.render({ stateA, stateB, combined }, timestamp);

    // Dashboard gets combined metrics
    Dashboard.update(combined);

    updateClock();
  }

  function updateClock() {
    const totalSecs = Math.floor(simClock);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    clockEl.textContent =
      String(hrs).padStart(2, '0') + ':' +
      String(mins).padStart(2, '0') + ':' +
      String(secs).padStart(2, '0');
  }

  // === Boot ===
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
