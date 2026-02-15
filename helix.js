/**
 * Infinitrain Double-Helix Visualization
 * ========================================
 * Renders the full architectural system: double-helix spiral tracks,
 * summit loading station with reservoir & chutes, valley unloading
 * station with drain troughs & settling pond, catenary wire with
 * support poles, valley substation + datacenter, and two trains
 * with pantographs and bus bars.
 */

const HelixRenderer = (() => {
  let canvas, ctx;
  let width, height;

  // Visual parameters
  const PADDING_TOP = 70;
  const PADDING_BOTTOM = 70;
  const PADDING_X = 80;

  // Colors
  const COL_BG_GRADIENT_TOP = '#0d1320';
  const COL_BG_GRADIENT_BOT = '#0a1628';
  const COL_MOUNTAIN = '#1a2744';
  const COL_TRACK_DOWN = '#06d6a0';
  const COL_TRACK_UP = '#457b9d';
  const COL_TRAIN_A = '#e63946';
  const COL_TRAIN_B = '#4895ef';
  const COL_TRAIN_WATER = '#1d7bba';
  const COL_WAGON_A = '#f4a261';
  const COL_WAGON_B = '#7ec8e3';
  const COL_CATENARY = '#ffeb3b';
  const COL_GROUND = '#162030';
  const COL_WATER_STATION = '#2ec4b6';
  const COL_RESERVOIR = '#1565c0';
  const COL_SUBSTATION = '#ff9800';
  const COL_DATACENTER = '#ab47bc';
  const COL_POND = '#0d47a1';
  const COL_SWITCH = '#e0e0e0';

  // Star field
  let stars = [];

  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    resize();
    generateStars();
    window.addEventListener('resize', resize);
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    width = canvas.width;
    height = canvas.height;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    generateStars();
  }

  function generateStars() {
    const w = width / devicePixelRatio;
    const h = height / devicePixelRatio;
    stars = [];
    for (let i = 0; i < 120; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.45,
        r: Math.random() * 1.2 + 0.3,
        brightness: Math.random(),
      });
    }
  }

  // =====================================================================
  //  Helix geometry
  // =====================================================================
  function generateHelixPoints(centerX, yTop, yBottom, turns, radius, segments) {
    const points = [];
    const totalSegments = turns * segments;
    const yRange = yBottom - yTop;
    for (let i = 0; i <= totalSegments; i++) {
      const t = i / totalSegments;
      const angle = t * turns * Math.PI * 2;
      const x = centerX + Math.sin(angle) * radius;
      const y = yTop + t * yRange;
      const z = Math.cos(angle);
      points.push({ x, y, z, t });
    }
    return points;
  }

  function getHelixPos(centerX, yTop, yBottom, turns, radius, progress) {
    const angle = progress * turns * Math.PI * 2;
    const x = centerX + Math.sin(angle) * radius;
    const y = yTop + progress * (yBottom - yTop);
    const z = Math.cos(angle);
    return { x, y, z };
  }

  // =====================================================================
  //  Main render
  // =====================================================================
  function render(stateOrDual, time) {
    const dual = stateOrDual.stateA !== undefined;
    const stateA = dual ? stateOrDual.stateA : stateOrDual;
    const stateB = dual ? stateOrDual.stateB : null;
    const combined = dual ? stateOrDual.combined : null;

    const w = width / devicePixelRatio;
    const h = height / devicePixelRatio;
    ctx.clearRect(0, 0, w, h);

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, COL_BG_GRADIENT_TOP);
    bgGrad.addColorStop(1, COL_BG_GRADIENT_BOT);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    drawStars(time);

    // Layout coordinates (shared by all draw functions)
    const vizW = w - PADDING_X * 2;
    const vizH = h - PADDING_TOP - PADDING_BOTTOM;
    const yTop = PADDING_TOP;
    const yBottom = PADDING_TOP + vizH;
    const cxL = w * 0.35;              // descent helix center
    const cxR = w * 0.65;              // ascent helix center
    const hR = Math.min(vizW * 0.12, 70); // helix radius
    const turns = Physics.HELIX_TURNS_DOWN;
    const midX = (cxL + cxR) / 2;

    // Mountain silhouette
    drawMountain(w, h, yTop, yBottom);

    // --- Infrastructure (drawn behind trains) ---

    // Catenary wire + support poles along both helixes
    drawCatenaryWire(cxL, yTop, yBottom, turns, hR, time);
    drawCatenaryWire(cxR, yTop, yBottom, turns, hR, time);

    // Summit station: reservoir, chutes, siding, switches
    drawSummitStation(cxL, cxR, yTop, midX, stateA, stateB, time);

    // Valley station: drain troughs, settling pond, siding, switches
    drawValleyStation(cxL, cxR, yBottom, midX, stateA, stateB, time);

    // Valley substation + datacenter
    drawSubstationAndDatacenter(cxR, yBottom, w, combined, time);

    // Helix tracks
    const segsPerTurn = 40;
    const downPts = generateHelixPoints(cxL, yTop, yBottom, turns, hR, segsPerTurn);
    drawHelix(downPts, COL_TRACK_DOWN, 'DESCENT');
    const upPts = generateHelixPoints(cxR, yTop, yBottom, turns, hR, segsPerTurn);
    drawHelix(upPts, COL_TRACK_UP, 'ASCENT');

    // Connection arcs (siding representations)
    drawConnection(cxL, cxR, yTop, 'top');
    drawConnection(cxL, cxR, yBottom, 'bottom');

    // --- Trains ---
    drawTrainOnTrack(stateA, cxL, cxR, yTop, yBottom, turns, hR, time, COL_TRAIN_A, COL_WAGON_A, 'A');
    if (stateB) {
      drawTrainOnTrack(stateB, cxL, cxR, yTop, yBottom, turns, hR, time, COL_TRAIN_B, COL_WAGON_B, 'B');
    }

    // Energy particles for descending trains
    if (stateA.phase === 'descending') {
      drawEnergyParticles(stateA, cxL, yTop, yBottom, turns, hR, time);
    }
    if (stateB && stateB.phase === 'descending') {
      drawEnergyParticles(stateB, cxL, yTop, yBottom, turns, hR, time);
    }

    // Catenary power flow arcs
    if (combined && combined.catenaryTransfer_MW > 0.01) {
      drawCatenaryFlow(cxL, cxR, yTop, yBottom, combined.catenaryTransfer_MW, time);
    }

    // Water flow animations (loading / unloading)
    drawWaterFlows(stateA, stateB, cxL, cxR, yTop, yBottom, turns, hR, time);
  }

  // =====================================================================
  //  Background
  // =====================================================================
  function drawStars(time) {
    for (const star of stars) {
      const flicker = 0.6 + 0.4 * Math.sin(time * 0.001 * star.brightness + star.x);
      ctx.fillStyle = `rgba(255,255,255,${0.3 * flicker})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawMountain(w, h, yTop, yBottom) {
    ctx.beginPath();
    ctx.moveTo(0, yBottom + 20);
    ctx.lineTo(w * 0.1, yTop + 80);
    ctx.lineTo(w * 0.25, yTop - 20);
    ctx.lineTo(w * 0.4, yTop + 30);
    ctx.lineTo(w * 0.5, yTop - 10);
    ctx.lineTo(w * 0.6, yTop + 40);
    ctx.lineTo(w * 0.75, yTop - 15);
    ctx.lineTo(w * 0.9, yTop + 70);
    ctx.lineTo(w, yBottom + 20);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, yTop - 20, 0, yBottom + 20);
    grad.addColorStop(0, COL_MOUNTAIN);
    grad.addColorStop(1, COL_GROUND);
    ctx.fillStyle = grad;
    ctx.fill();

    // Snow caps
    ctx.fillStyle = 'rgba(200,214,229,0.15)';
    for (const [l, peak, r] of [[0.22, 0.25, 0.28], [0.47, 0.50, 0.53], [0.72, 0.75, 0.78]]) {
      ctx.beginPath();
      ctx.moveTo(w * l, yTop + (l === 0.22 ? -5 : l === 0.47 ? 5 : 0));
      ctx.lineTo(w * peak, yTop + (peak === 0.25 ? -20 : peak === 0.50 ? -10 : -15));
      ctx.lineTo(w * r, yTop + (r === 0.28 ? 0 : 5));
      ctx.closePath();
      ctx.fill();
    }
  }

  // =====================================================================
  //  Summit Loading Station
  // =====================================================================
  function drawSummitStation(cxL, cxR, yTop, midX, stateA, stateB, time) {
    const sidingY = yTop - 2;
    const reservoirW = 80;
    const reservoirH = 22;
    const reservoirX = midX - reservoirW / 2;
    const reservoirY = yTop - 52;

    // --- Reservoir ---
    // Outer shell
    ctx.strokeStyle = colorWithAlpha(COL_RESERVOIR, 0.7);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(reservoirX, reservoirY, reservoirW, reservoirH);

    // Water level inside (animated slight sloshing)
    const slosh = Math.sin(time * 0.001) * 0.03;
    const anyLoading = (stateA && stateA.phase === 'loading') || (stateB && stateB.phase === 'loading');
    const waterLevel = anyLoading ? 0.6 + slosh : 0.9 + slosh;
    const waterH = reservoirH * waterLevel;
    ctx.fillStyle = colorWithAlpha(COL_RESERVOIR, 0.35);
    ctx.fillRect(reservoirX + 1, reservoirY + (reservoirH - waterH), reservoirW - 2, waterH);

    // Label
    ctx.font = '7px monospace';
    ctx.fillStyle = colorWithAlpha(COL_RESERVOIR, 0.8);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('RESERVOIR 960m\u00B3', midX, reservoirY - 3);

    // Mountain source arrow
    ctx.strokeStyle = colorWithAlpha(COL_WATER_STATION, 0.3);
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(midX, reservoirY);
    ctx.lineTo(midX, reservoirY - 14);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '6px monospace';
    ctx.fillStyle = colorWithAlpha(COL_WATER_STATION, 0.4);
    ctx.fillText('MOUNTAIN SOURCE', midX, reservoirY - 16);

    // --- 8 Fill Chutes (pipes from reservoir down to siding) ---
    const chuteSpan = 70;
    const chuteStartX = midX - chuteSpan / 2;
    const chuteTopY = reservoirY + reservoirH;
    const chuteBottomY = sidingY - 1;

    for (let i = 0; i < 8; i++) {
      const cx = chuteStartX + (i / 7) * chuteSpan;
      ctx.strokeStyle = colorWithAlpha(COL_RESERVOIR, 0.25);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, chuteTopY);
      ctx.lineTo(cx, chuteBottomY);
      ctx.stroke();
    }

    // --- Siding platform ---
    ctx.strokeStyle = colorWithAlpha(COL_WATER_STATION, 0.6);
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(cxL - 40, sidingY);
    ctx.lineTo(cxR + 40, sidingY);
    ctx.stroke();
    ctx.setLineDash([]);

    // --- Switches (A and B) ---
    drawSwitch(cxL - 30, sidingY, 'A');
    drawSwitch(cxR + 30, sidingY, 'B');

    // --- Station label ---
    ctx.font = '9px monospace';
    ctx.fillStyle = colorWithAlpha(COL_WATER_STATION, 0.8);
    ctx.textAlign = 'center';
    ctx.fillText('SUMMIT STATION \u2014 2,400m', midX, sidingY - 8);
  }

  // =====================================================================
  //  Valley Unloading Station
  // =====================================================================
  function drawValleyStation(cxL, cxR, yBottom, midX, stateA, stateB, time) {
    const sidingY = yBottom + 2;

    // --- Elevated siding (trestle) ---
    // Trestle supports
    const trestleLeft = cxL - 40;
    const trestleRight = cxR + 40;
    ctx.strokeStyle = colorWithAlpha(COL_SWITCH, 0.15);
    ctx.lineWidth = 1;
    for (let x = trestleLeft + 10; x < trestleRight; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, sidingY + 1);
      ctx.lineTo(x, sidingY + 10);
      ctx.stroke();
    }

    // Siding platform
    ctx.strokeStyle = colorWithAlpha('#8d6e63', 0.6);
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(trestleLeft, sidingY);
    ctx.lineTo(trestleRight, sidingY);
    ctx.stroke();
    ctx.setLineDash([]);

    // --- Switches (C and D) ---
    drawSwitch(cxL - 30, sidingY, 'C');
    drawSwitch(cxR + 30, sidingY, 'D');

    // --- 8 Drain troughs (below trestle) ---
    const troughSpan = 70;
    const troughStartX = midX - troughSpan / 2;
    const troughY = sidingY + 12;
    const troughW = 6;
    const troughH = 5;

    for (let i = 0; i < 8; i++) {
      const tx = troughStartX + (i / 7) * troughSpan - troughW / 2;
      ctx.fillStyle = colorWithAlpha('#546e7a', 0.4);
      ctx.fillRect(tx, troughY, troughW, troughH);
      ctx.strokeStyle = colorWithAlpha('#78909c', 0.4);
      ctx.lineWidth = 0.5;
      ctx.strokeRect(tx, troughY, troughW, troughH);
    }

    // --- Main drain channel ---
    const channelY = troughY + troughH + 2;
    ctx.strokeStyle = colorWithAlpha('#546e7a', 0.35);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(troughStartX - 4, channelY);
    ctx.lineTo(troughStartX + troughSpan + 4, channelY);
    ctx.stroke();

    // --- Settling pond ---
    const pondX = troughStartX + troughSpan + 12;
    const pondW = 30;
    const pondH = 14;
    const pondY = channelY - 4;

    // Pond body
    ctx.fillStyle = colorWithAlpha(COL_POND, 0.3);
    roundRect(pondX, pondY, pondW, pondH, 3);
    ctx.fill();
    ctx.strokeStyle = colorWithAlpha(COL_POND, 0.5);
    ctx.lineWidth = 1;
    roundRect(pondX, pondY, pondW, pondH, 3);
    ctx.stroke();

    // Water surface animation
    const pondWave = Math.sin(time * 0.002) * 1;
    ctx.fillStyle = colorWithAlpha(COL_TRAIN_WATER, 0.25);
    ctx.fillRect(pondX + 2, pondY + 4 + pondWave, pondW - 4, pondH - 6);

    ctx.font = '5px monospace';
    ctx.fillStyle = colorWithAlpha(COL_POND, 0.6);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('SETTLING', pondX + pondW / 2, pondY - 1);
    ctx.fillText('POND', pondX + pondW / 2, pondY + pondH + 7);

    // Channel to pond connector
    ctx.strokeStyle = colorWithAlpha('#546e7a', 0.3);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(troughStartX + troughSpan + 4, channelY);
    ctx.lineTo(pondX, pondY + pondH / 2);
    ctx.stroke();

    // River outlet (wavy line from pond)
    ctx.strokeStyle = colorWithAlpha(COL_WATER_STATION, 0.25);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pondX + pondW, pondY + pondH / 2);
    for (let i = 1; i <= 6; i++) {
      const rx = pondX + pondW + i * 6;
      const ry = pondY + pondH / 2 + Math.sin(i * 1.2 + time * 0.003) * 2;
      ctx.lineTo(rx, ry);
    }
    ctx.stroke();

    ctx.font = '5px monospace';
    ctx.fillStyle = colorWithAlpha(COL_WATER_STATION, 0.3);
    ctx.textAlign = 'left';
    ctx.fillText('RIVER', pondX + pondW + 8, pondY + pondH / 2 - 4);

    // --- Station label ---
    ctx.font = '9px monospace';
    ctx.fillStyle = colorWithAlpha('#8d6e63', 0.7);
    ctx.textAlign = 'center';
    ctx.fillText('VALLEY STATION \u2014 400m', midX, sidingY + troughH + 30);
  }

  // =====================================================================
  //  Valley Substation + Datacenter
  // =====================================================================
  function drawSubstationAndDatacenter(cxR, yBottom, w, combined, time) {
    const baseY = yBottom + 14;
    const subX = cxR + 55;
    const subW = 42;
    const subH = 24;

    // Power line from catenary tap to substation
    ctx.strokeStyle = colorWithAlpha(COL_CATENARY, 0.25);
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cxR + 40, yBottom);
    ctx.lineTo(subX, baseY + subH / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // --- Substation box ---
    ctx.fillStyle = colorWithAlpha(COL_SUBSTATION, 0.15);
    roundRect(subX, baseY, subW, subH, 3);
    ctx.fill();
    ctx.strokeStyle = colorWithAlpha(COL_SUBSTATION, 0.5);
    ctx.lineWidth = 1;
    roundRect(subX, baseY, subW, subH, 3);
    ctx.stroke();

    ctx.font = 'bold 6px monospace';
    ctx.fillStyle = colorWithAlpha(COL_SUBSTATION, 0.8);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SFC', subX + subW / 2, baseY + 8);
    ctx.font = '5px monospace';
    ctx.fillText('5 MW', subX + subW / 2, baseY + 16);

    // --- Supercapacitor buffer (small box attached) ---
    const capX = subX + subW + 3;
    const capW = 22;
    const capH = 10;
    const capY = baseY + 2;

    ctx.fillStyle = colorWithAlpha(COL_CATENARY, 0.12);
    roundRect(capX, capY, capW, capH, 2);
    ctx.fill();
    ctx.strokeStyle = colorWithAlpha(COL_CATENARY, 0.4);
    ctx.lineWidth = 0.8;
    roundRect(capX, capY, capW, capH, 2);
    ctx.stroke();

    ctx.font = '4.5px monospace';
    ctx.fillStyle = colorWithAlpha(COL_CATENARY, 0.7);
    ctx.textAlign = 'center';
    ctx.fillText('200kWh', capX + capW / 2, capY + capH / 2 + 1.5);

    // Connector line sub -> cap
    ctx.strokeStyle = colorWithAlpha(COL_SUBSTATION, 0.3);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(subX + subW, baseY + subH / 3);
    ctx.lineTo(capX, capY + capH / 2);
    ctx.stroke();

    // --- Power line to datacenter ---
    const dcX = subX + 4;
    const dcY = baseY + subH + 8;
    const dcW = 48;
    const dcH = 18;

    ctx.strokeStyle = colorWithAlpha(COL_DATACENTER, 0.3);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(subX + subW / 2, baseY + subH);
    ctx.lineTo(dcX + dcW / 2, dcY);
    ctx.stroke();

    // Power flow dot animation
    const surplusMW = combined ? Math.max(0, combined.powerSurplus_MW) : 0;
    if (surplusMW > 0.01) {
      const dot_t = (time * 0.003) % 1;
      const dotX = subX + subW / 2 + (dcX + dcW / 2 - subX - subW / 2) * dot_t;
      const dotY = baseY + subH + (dcY - baseY - subH) * dot_t;
      ctx.fillStyle = colorWithAlpha(COL_DATACENTER, 0.7);
      ctx.beginPath();
      ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Datacenter box ---
    ctx.fillStyle = colorWithAlpha(COL_DATACENTER, 0.12);
    roundRect(dcX, dcY, dcW, dcH, 3);
    ctx.fill();
    ctx.strokeStyle = colorWithAlpha(COL_DATACENTER, 0.5);
    ctx.lineWidth = 1;
    roundRect(dcX, dcY, dcW, dcH, 3);
    ctx.stroke();

    // Server rack lines inside
    for (let i = 0; i < 4; i++) {
      const rx = dcX + 6 + i * 10;
      ctx.strokeStyle = colorWithAlpha(COL_DATACENTER, 0.25);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(rx, dcY + 4);
      ctx.lineTo(rx, dcY + dcH - 4);
      ctx.stroke();
      // Blinking LED
      const blink = Math.sin(time * 0.004 + i * 1.7) > 0;
      ctx.fillStyle = blink ? colorWithAlpha('#4caf50', 0.7) : colorWithAlpha('#4caf50', 0.15);
      ctx.beginPath();
      ctx.arc(rx, dcY + 5, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = 'bold 6px monospace';
    ctx.fillStyle = colorWithAlpha(COL_DATACENTER, 0.8);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('DATACENTER', dcX + dcW / 2, dcY + dcH + 8);

    // Power reading
    if (surplusMW > 0.01) {
      ctx.font = '5px monospace';
      ctx.fillStyle = colorWithAlpha(COL_DATACENTER, 0.6);
      ctx.fillText(surplusMW.toFixed(1) + ' MW', dcX + dcW / 2, dcY + dcH + 15);
    }

    // Voltage label on power line
    ctx.font = '4.5px monospace';
    ctx.fillStyle = colorWithAlpha(COL_SUBSTATION, 0.45);
    ctx.textAlign = 'left';
    ctx.fillText('400V 50Hz', subX + subW / 2 + 4, baseY + subH + 4);
  }

  // =====================================================================
  //  Catenary Wire along helix
  // =====================================================================
  function drawCatenaryWire(cx, yTop, yBottom, turns, radius, time) {
    const segments = turns * 20;
    const wireOffset = -5; // pixels above track

    for (let i = 1; i <= segments; i++) {
      const t0 = (i - 1) / segments;
      const t1 = i / segments;
      const a0 = t0 * turns * Math.PI * 2;
      const a1 = t1 * turns * Math.PI * 2;
      const x0 = cx + Math.sin(a0) * radius;
      const y0 = yTop + t0 * (yBottom - yTop) + wireOffset;
      const z0 = Math.cos(a0);
      const x1 = cx + Math.sin(a1) * radius;
      const y1 = yTop + t1 * (yBottom - yTop) + wireOffset;
      const z1 = Math.cos(a1);

      const depth = ((z0 + z1) / 2 + 1) / 2;
      const alpha = 0.06 + 0.12 * depth;

      ctx.strokeStyle = colorWithAlpha(COL_CATENARY, alpha);
      ctx.lineWidth = 0.6 + depth * 0.4;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();

      // Support poles every 3 turns (on the near side only for clarity)
      if (i % 60 === 0 && depth > 0.6) {
        ctx.strokeStyle = colorWithAlpha(COL_SWITCH, 0.12);
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1, y1 + 8);
        ctx.stroke();
      }
    }
  }

  // =====================================================================
  //  Water flow animations (loading + unloading)
  // =====================================================================
  function drawWaterFlows(stateA, stateB, cxL, cxR, yTop, yBottom, turns, hR, time) {
    const midX = (cxL + cxR) / 2;

    // Check if any train is loading (at summit)
    for (const state of [stateA, stateB]) {
      if (!state || state.phase !== 'loading') continue;
      // Water drops falling from chutes to train position
      const chuteSpan = 70;
      const chuteStartX = midX - chuteSpan / 2;
      const chuteTopY = yTop - 30;
      const chuteBottomY = yTop - 4;
      const dropSpeed = 0.004;

      for (let c = 0; c < 8; c++) {
        const cx = chuteStartX + (c / 7) * chuteSpan;
        // Multiple drops per chute, staggered
        for (let d = 0; d < 3; d++) {
          const dt = ((time * dropSpeed + c * 0.13 + d * 0.33) % 1);
          if (dt > state.waterFraction) continue; // stop drops when full
          const dy = chuteTopY + dt * (chuteBottomY - chuteTopY);
          const alpha = 0.4 + 0.3 * Math.sin(time * 0.005 + c + d);
          ctx.fillStyle = colorWithAlpha(COL_TRAIN_WATER, alpha);
          ctx.beginPath();
          ctx.arc(cx, dy, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Check if any train is unloading (at valley)
    for (const state of [stateA, stateB]) {
      if (!state || state.phase !== 'unloading') continue;
      // Water drops falling from train down to troughs
      const troughSpan = 70;
      const troughStartX = midX - troughSpan / 2;
      const dropTopY = yBottom + 4;
      const dropBottomY = yBottom + 14;
      const dropSpeed = 0.006;

      for (let c = 0; c < 8; c++) {
        const cx = troughStartX + (c / 7) * troughSpan;
        for (let d = 0; d < 4; d++) {
          const dt = ((time * dropSpeed + c * 0.11 + d * 0.25) % 1);
          if (dt > (1 - state.waterFraction)) continue; // more drops as water drains
          const dy = dropTopY + dt * (dropBottomY - dropTopY);
          const alpha = 0.5 + 0.3 * Math.sin(time * 0.006 + c + d);
          ctx.fillStyle = colorWithAlpha(COL_TRAIN_WATER, alpha);
          ctx.beginPath();
          ctx.arc(cx, dy, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  // =====================================================================
  //  Helix tracks
  // =====================================================================
  function drawHelix(points, color, label) {
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const depth = (p1.z + 1) / 2;
      const alpha = 0.2 + 0.6 * depth;
      const lineW = 1.5 + depth * 2;

      ctx.strokeStyle = colorWithAlpha(color, alpha);
      ctx.lineWidth = lineW;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();

      if (i % 4 === 0 && depth > 0.5) {
        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
          const nx = -dy / len * 3;
          const ny = dx / len * 3;
          ctx.strokeStyle = colorWithAlpha(color, alpha * 0.3);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p1.x - nx, p1.y - ny);
          ctx.lineTo(p1.x + nx, p1.y + ny);
          ctx.stroke();
        }
      }
    }

    const mid = points[Math.floor(points.length / 2)];
    ctx.font = '8px monospace';
    ctx.fillStyle = colorWithAlpha(color, 0.5);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(label, mid.x, mid.y - 12);
  }

  function drawConnection(xLeft, xRight, y, position) {
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(xLeft, y);
    const cpY = position === 'top' ? y - 20 : y + 20;
    ctx.quadraticCurveTo((xLeft + xRight) / 2, cpY, xRight, y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // =====================================================================
  //  Trains
  // =====================================================================
  function drawTrainOnTrack(state, cxLeft, cxRight, yTop, yBottom, turns, radius, time, colLoco, colWagon, label) {
    let pos;
    if (state.phase === 'loading') {
      pos = getHelixPos(cxLeft, yTop, yBottom, turns, radius, 0);
    } else if (state.phase === 'descending') {
      pos = getHelixPos(cxLeft, yTop, yBottom, turns, radius, state.trackProgress);
    } else if (state.phase === 'unloading') {
      pos = getHelixPos(cxRight, yTop, yBottom, turns, radius, 1);
    } else if (state.phase === 'ascending') {
      const ascProgress = 1 - state.trackProgress;
      pos = getHelixPos(cxRight, yTop, yBottom, turns, radius, ascProgress);
    }
    if (pos) drawTrainAt(pos, state, time, colLoco, colWagon, label);
  }

  function drawTrainAt(pos, state, time, colLoco, colWagon, label) {
    const { x, y, z } = pos;
    const depth = (z + 1) / 2;
    const scale = 0.7 + depth * 0.5;
    const alpha = 0.4 + depth * 0.6;

    const locoW = 18 * scale;
    const locoH = 10 * scale;

    // Shadow
    ctx.fillStyle = `rgba(0,0,0,${0.3 * alpha})`;
    ctx.fillRect(x - locoW / 2 + 2, y + 2, locoW, locoH);

    // Loco body
    ctx.fillStyle = colorWithAlpha(colLoco, alpha);
    ctx.fillRect(x - locoW / 2, y - locoH / 2, locoW, locoH);

    // --- Pantograph (triangle above loco reaching to catenary) ---
    const pantoH = 7 * scale;
    const pantoW = 6 * scale;
    ctx.strokeStyle = colorWithAlpha(COL_SWITCH, alpha * 0.7);
    ctx.lineWidth = 1 * scale;
    // Two legs from loco roof
    ctx.beginPath();
    ctx.moveTo(x - pantoW / 2, y - locoH / 2);
    ctx.lineTo(x, y - locoH / 2 - pantoH);
    ctx.lineTo(x + pantoW / 2, y - locoH / 2);
    ctx.stroke();
    // Contact strip
    ctx.strokeStyle = colorWithAlpha(COL_CATENARY, alpha * 0.6);
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(x - pantoW / 3, y - locoH / 2 - pantoH);
    ctx.lineTo(x + pantoW / 3, y - locoH / 2 - pantoH);
    ctx.stroke();

    // Train label (A/B)
    ctx.fillStyle = colorWithAlpha('#ffffff', alpha * 0.9);
    ctx.font = `bold ${7 * scale}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);

    // --- Wagons with bus bar ---
    const wagonW = 14 * scale;
    const wagonH = 8 * scale;
    const wagonSpacing = 5 * scale;
    const maxShow = Math.min(state.wagonCount, 5);

    // Roof bus bar line (connects loco to last visible wagon)
    if (maxShow > 0) {
      const firstWagonY = y - (wagonH + wagonSpacing);
      const lastWagonY = y - maxShow * (wagonH + wagonSpacing);
      ctx.strokeStyle = colorWithAlpha(COL_CATENARY, alpha * 0.2);
      ctx.lineWidth = 0.8 * scale;
      ctx.beginPath();
      ctx.moveTo(x, y - locoH / 2);
      ctx.lineTo(x, lastWagonY);
      ctx.stroke();
    }

    for (let i = 0; i < maxShow; i++) {
      const offsetY = (i + 1) * (wagonH + wagonSpacing) * -1;
      const wy = y + offsetY;

      // Wagon shadow
      ctx.fillStyle = `rgba(0,0,0,${0.2 * alpha})`;
      ctx.fillRect(x - wagonW / 2 + 2, wy + 2, wagonW, wagonH);

      // Wagon body (cylindrical tank look)
      ctx.fillStyle = colorWithAlpha(colWagon, alpha * 0.8);
      roundRect(x - wagonW / 2, wy - wagonH / 2, wagonW, wagonH, 2 * scale);
      ctx.fill();

      // Water level in wagon
      if (state.waterFraction > 0) {
        const waterH = wagonH * state.waterFraction;
        ctx.fillStyle = colorWithAlpha(COL_TRAIN_WATER, alpha * 0.6);
        roundRect(x - wagonW / 2 + 1, wy - wagonH / 2 + (wagonH - waterH), wagonW - 2, waterH, 1.5 * scale);
        ctx.fill();
      }

      // Dynamo indicator (small circle on one side = generator bogie)
      ctx.fillStyle = colorWithAlpha(COL_CATENARY, alpha * 0.3);
      ctx.beginPath();
      ctx.arc(x - wagonW / 2 + 2, wy + wagonH / 2 - 1, 1.2 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Dynamo spark when generating
      if (state.phase === 'descending' && state.speed > 1) {
        const sparkIntensity = Math.sin(time * 0.01 + i * 1.5) * 0.5 + 0.5;
        ctx.fillStyle = colorWithAlpha('#ffeb3b', alpha * sparkIntensity * 0.8);
        ctx.beginPath();
        ctx.arc(x + wagonW / 2 + 1, wy, 2 * scale * sparkIntensity, 0, Math.PI * 2);
        ctx.fill();

        // Small spark lines
        if (sparkIntensity > 0.6) {
          ctx.strokeStyle = colorWithAlpha('#ffeb3b', alpha * sparkIntensity * 0.4);
          ctx.lineWidth = 0.5;
          for (let s = 0; s < 2; s++) {
            const sx = x + wagonW / 2 + 2 + Math.random() * 4;
            const sy = wy - 2 + Math.random() * 4;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + 3, sy - 2 + Math.random() * 4);
            ctx.stroke();
          }
        }
      }

      // Bottom drain valve indicator (small notch at bottom center)
      ctx.fillStyle = colorWithAlpha('#78909c', alpha * 0.4);
      ctx.fillRect(x - 1, wy + wagonH / 2 - 0.5, 2, 1.5 * scale);
    }

    if (state.wagonCount > maxShow) {
      ctx.font = `${7 * scale}px monospace`;
      ctx.fillStyle = colorWithAlpha('#ffffff', alpha * 0.5);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(`+${state.wagonCount - maxShow}`, x, y - ((maxShow + 1) * (wagonH + wagonSpacing)) * 0.9);
    }
  }

  // =====================================================================
  //  Catenary power flow between helixes
  // =====================================================================
  function drawCatenaryFlow(cxLeft, cxRight, yTop, yBottom, transferMW, time) {
    const midX = (cxLeft + cxRight) / 2;
    const midY = (yTop + yBottom) / 2;
    const intensity = Math.min(1, transferMW / 5);
    const numBolts = 5 + Math.floor(intensity * 10);

    for (let i = 0; i < numBolts; i++) {
      const t = (time * 0.0004 + i / numBolts) % 1;
      const yPos = yTop + t * (yBottom - yTop);
      const progress = Math.sin(t * Math.PI);
      const alpha = 0.12 + 0.35 * intensity * progress;

      ctx.strokeStyle = colorWithAlpha(COL_CATENARY, alpha);
      ctx.lineWidth = 0.8 + intensity * 0.8;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.moveTo(cxLeft + 20, yPos);
      ctx.quadraticCurveTo(midX, yPos - 6 + Math.sin(time * 0.003 + i) * 5, cxRight - 20, yPos);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Catenary label
    ctx.font = '8px monospace';
    ctx.fillStyle = colorWithAlpha(COL_CATENARY, 0.6);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('15kV CATENARY \u2022 ' + transferMW.toFixed(1) + ' MW', midX, midY - 8);
  }

  // =====================================================================
  //  Energy particles
  // =====================================================================
  function drawEnergyParticles(state, cx, yTop, yBottom, turns, radius, time) {
    const numParticles = 15;
    for (let i = 0; i < numParticles; i++) {
      const offset = (time * 0.0003 + i / numParticles) % 1;
      const particleProgress = (state.trackProgress - 0.02 + offset * 0.04) % 1;
      if (particleProgress < 0 || particleProgress > state.trackProgress) continue;

      const pos = getHelixPos(cx, yTop, yBottom, turns, radius, particleProgress);
      const depth = (pos.z + 1) / 2;
      const alpha = depth * 0.6;
      const sparkle = Math.sin(time * 0.005 + i * 2) * 0.3 + 0.7;

      ctx.fillStyle = colorWithAlpha('#ffeb3b', alpha * sparkle);
      ctx.beginPath();
      ctx.arc(pos.x + (Math.random() - 0.5) * 4, pos.y + (Math.random() - 0.5) * 4, 1.5 * depth, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // =====================================================================
  //  Helpers
  // =====================================================================
  function drawSwitch(x, y, label) {
    // Diamond marker for rail switch
    const s = 4;
    ctx.fillStyle = colorWithAlpha(COL_SWITCH, 0.4);
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.lineTo(x + s, y);
    ctx.moveTo(x, y - s);
    ctx.lineTo(x - s, y);
    ctx.lineTo(x, y + s);
    ctx.lineTo(x + s, y);
    ctx.closePath();
    ctx.fill();

    ctx.font = '5px monospace';
    ctx.fillStyle = colorWithAlpha(COL_SWITCH, 0.35);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('SW-' + label, x, y - s - 2);
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function colorWithAlpha(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  return { init, render, resize };
})();
