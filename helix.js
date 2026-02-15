/**
 * Infinitrain Double-Helix Visualization
 * ========================================
 * Renders the double-helix spiral track with train in pseudo-3D.
 * Descending helix on the left, ascending helix on the right,
 * connected at top (summit) and bottom (valley).
 */

const HelixRenderer = (() => {
  let canvas, ctx;
  let width, height;
  let animFrame = null;

  // Visual parameters
  const PADDING_TOP = 60;
  const PADDING_BOTTOM = 60;
  const PADDING_X = 80;

  // Colors
  const COL_BG_GRADIENT_TOP = '#0d1320';
  const COL_BG_GRADIENT_BOT = '#0a1628';
  const COL_MOUNTAIN = '#1a2744';
  const COL_MOUNTAIN_SNOW = '#c8d6e5';
  const COL_TRACK_DOWN = '#06d6a0';
  const COL_TRACK_UP = '#457b9d';
  const COL_TRACK_SHADOW = 'rgba(0,0,0,0.3)';
  const COL_TRAIN = '#e63946';
  const COL_TRAIN_WATER = '#1d7bba';
  const COL_WAGON = '#f4a261';
  const COL_GROUND = '#162030';
  const COL_WATER_STATION = '#2ec4b6';
  const COL_STARS = 'rgba(255,255,255,0.4)';
  const COL_SUMMIT_GLOW = 'rgba(200,214,229,0.03)';

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
        y: Math.random() * h * 0.5,
        r: Math.random() * 1.2 + 0.3,
        brightness: Math.random(),
      });
    }
  }

  // === Helix geometry ===
  // Generate points for one helix spiral
  function generateHelixPoints(centerX, yTop, yBottom, turns, radius, segments) {
    const points = [];
    const totalSegments = turns * segments;
    const yRange = yBottom - yTop;

    for (let i = 0; i <= totalSegments; i++) {
      const t = i / totalSegments; // 0..1
      const angle = t * turns * Math.PI * 2;
      const x = centerX + Math.sin(angle) * radius;
      const y = yTop + t * yRange;
      const z = Math.cos(angle); // -1..1, for depth
      points.push({ x, y, z, t });
    }
    return points;
  }

  // Get position on helix at progress (0..1)
  function getHelixPos(centerX, yTop, yBottom, turns, radius, progress) {
    const angle = progress * turns * Math.PI * 2;
    const x = centerX + Math.sin(angle) * radius;
    const y = yTop + progress * (yBottom - yTop);
    const z = Math.cos(angle);
    return { x, y, z };
  }

  // === Drawing ===
  function render(state, time) {
    const w = width / devicePixelRatio;
    const h = height / devicePixelRatio;
    ctx.clearRect(0, 0, w, h);

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, COL_BG_GRADIENT_TOP);
    bgGrad.addColorStop(1, COL_BG_GRADIENT_BOT);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Stars
    drawStars(time);

    // Layout
    const vizW = w - PADDING_X * 2;
    const vizH = h - PADDING_TOP - PADDING_BOTTOM;
    const yTop = PADDING_TOP;
    const yBottom = PADDING_TOP + vizH;

    const helixSpacing = vizW * 0.35;
    const helixCenterLeft = w * 0.35;
    const helixCenterRight = w * 0.65;
    const helixRadius = Math.min(vizW * 0.12, 70);

    // Mountain silhouette
    drawMountain(w, h, yTop, yBottom);

    // Summit station
    drawStation(helixCenterLeft, helixCenterRight, yTop - 5, 'SUMMIT — 2,400m', COL_WATER_STATION, true);

    // Valley station
    drawStation(helixCenterLeft, helixCenterRight, yBottom + 5, 'VALLEY — 400m', COL_GROUND, false);

    // Draw helixes
    const turns = Physics.HELIX_TURNS_DOWN;
    const segsPerTurn = 40;

    // Descending helix (left)
    const downPts = generateHelixPoints(helixCenterLeft, yTop, yBottom, turns, helixRadius, segsPerTurn);
    drawHelix(downPts, COL_TRACK_DOWN, 'DESCENT');

    // Ascending helix (right)
    const upPts = generateHelixPoints(helixCenterRight, yTop, yBottom, turns, helixRadius, segsPerTurn);
    // Reverse so ascending goes bottom to top visually
    drawHelix(upPts, COL_TRACK_UP, 'ASCENT');

    // Connection at top
    drawConnection(helixCenterLeft, helixCenterRight, yTop, 'top');
    // Connection at bottom
    drawConnection(helixCenterLeft, helixCenterRight, yBottom, 'bottom');

    // Draw train
    drawTrain(state, helixCenterLeft, helixCenterRight, yTop, yBottom, turns, helixRadius, time);

    // Energy particles
    if (state.phase === 'descending') {
      drawEnergyParticles(state, helixCenterLeft, yTop, yBottom, turns, helixRadius, time);
    }
  }

  function drawStars(time) {
    for (const star of stars) {
      const flicker = 0.6 + 0.4 * Math.sin(time * 0.001 * star.brightness + star.x);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * flicker})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawMountain(w, h, yTop, yBottom) {
    // Mountain background shape
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
    ctx.beginPath();
    ctx.moveTo(w * 0.22, yTop - 5);
    ctx.lineTo(w * 0.25, yTop - 20);
    ctx.lineTo(w * 0.28, yTop);
    ctx.closePath();
    ctx.fillStyle = 'rgba(200, 214, 229, 0.15)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(w * 0.47, yTop + 5);
    ctx.lineTo(w * 0.5, yTop - 10);
    ctx.lineTo(w * 0.53, yTop + 5);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(w * 0.72, yTop);
    ctx.lineTo(w * 0.75, yTop - 15);
    ctx.lineTo(w * 0.78, yTop + 5);
    ctx.closePath();
    ctx.fill();
  }

  function drawStation(xLeft, xRight, y, label, color, isTop) {
    // Platform
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(xLeft - 40, y);
    ctx.lineTo(xRight + 40, y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Label
    ctx.font = '10px monospace';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    const labelY = isTop ? y - 12 : y + 18;
    ctx.fillText(label, (xLeft + xRight) / 2, labelY);

    // Water tank at top station
    if (isTop) {
      const tankX = (xLeft + xRight) / 2;
      const tankY = y - 35;
      ctx.fillStyle = 'rgba(29, 123, 186, 0.3)';
      ctx.fillRect(tankX - 20, tankY, 40, 18);
      ctx.strokeStyle = COL_TRAIN_WATER;
      ctx.lineWidth = 1;
      ctx.strokeRect(tankX - 20, tankY, 40, 18);
      ctx.font = '7px monospace';
      ctx.fillStyle = COL_TRAIN_WATER;
      ctx.fillText('WATER', tankX, tankY + 12);
    }
  }

  function drawHelix(points, color, label) {
    // Draw track with depth-based opacity
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const depth = (p1.z + 1) / 2; // 0..1
      const alpha = 0.2 + 0.6 * depth;
      const lineW = 1.5 + depth * 2;

      ctx.strokeStyle = colorWithAlpha(color, alpha);
      ctx.lineWidth = lineW;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();

      // Rail ties every N segments
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

    // Label at middle
    const mid = points[Math.floor(points.length / 2)];
    ctx.font = '8px monospace';
    ctx.fillStyle = colorWithAlpha(color, 0.5);
    ctx.textAlign = 'center';
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

  function drawTrain(state, cxLeft, cxRight, yTop, yBottom, turns, radius, time) {
    let pos;
    const wagonCount = state.wagonCount;

    if (state.phase === 'loading') {
      // At summit, on left helix start
      pos = getHelixPos(cxLeft, yTop, yBottom, turns, radius, 0);
      drawTrainAt(pos, state, time, true);
    } else if (state.phase === 'descending') {
      pos = getHelixPos(cxLeft, yTop, yBottom, turns, radius, state.trackProgress);
      drawTrainAt(pos, state, time, true);
    } else if (state.phase === 'unloading') {
      // At valley, transition area
      pos = getHelixPos(cxRight, yTop, yBottom, turns, radius, 1);
      drawTrainAt(pos, state, time, false);
    } else if (state.phase === 'ascending') {
      // On right helix, going from bottom (1) to top (0)
      const ascProgress = 1 - state.trackProgress;
      pos = getHelixPos(cxRight, yTop, yBottom, turns, radius, ascProgress);
      drawTrainAt(pos, state, time, false);
    }
  }

  function drawTrainAt(pos, state, time, isDescending) {
    const { x, y, z } = pos;
    const depth = (z + 1) / 2;
    const scale = 0.7 + depth * 0.5;
    const alpha = 0.4 + depth * 0.6;

    // Locomotive
    const locoW = 18 * scale;
    const locoH = 10 * scale;

    // Shadow
    ctx.fillStyle = `rgba(0,0,0,${0.3 * alpha})`;
    ctx.fillRect(x - locoW / 2 + 2, y + 2, locoW, locoH);

    // Loco body
    ctx.fillStyle = colorWithAlpha(COL_TRAIN, alpha);
    ctx.fillRect(x - locoW / 2, y - locoH / 2, locoW, locoH);

    // Swiss cross on locomotive
    ctx.fillStyle = colorWithAlpha('#ffffff', alpha * 0.9);
    const cx = x;
    const cy = y;
    const crossSize = 3 * scale;
    ctx.fillRect(cx - crossSize / 6, cy - crossSize / 2, crossSize / 3, crossSize);
    ctx.fillRect(cx - crossSize / 2, cy - crossSize / 6, crossSize, crossSize / 3);

    // Wagons (behind locomotive, spaced along the helix slightly)
    const wagonW = 14 * scale;
    const wagonH = 8 * scale;
    const wagonSpacing = 5 * scale;

    for (let i = 0; i < Math.min(state.wagonCount, 6); i++) {
      const offsetY = (i + 1) * (wagonH + wagonSpacing) * (isDescending ? -1 : -1);
      const wy = y + offsetY;

      // Wagon shadow
      ctx.fillStyle = `rgba(0,0,0,${0.2 * alpha})`;
      ctx.fillRect(x - wagonW / 2 + 2, wy + 2, wagonW, wagonH);

      // Wagon body
      ctx.fillStyle = colorWithAlpha(COL_WAGON, alpha * 0.8);
      ctx.fillRect(x - wagonW / 2, wy - wagonH / 2, wagonW, wagonH);

      // Water level in wagon
      if (state.waterFraction > 0) {
        const waterH = wagonH * state.waterFraction;
        ctx.fillStyle = colorWithAlpha(COL_TRAIN_WATER, alpha * 0.7);
        ctx.fillRect(x - wagonW / 2 + 1, wy - wagonH / 2 + (wagonH - waterH), wagonW - 2, waterH);
      }

      // Dynamo spark when generating
      if (state.phase === 'descending' && state.speed > 1) {
        const sparkIntensity = Math.sin(time * 0.01 + i * 1.5) * 0.5 + 0.5;
        ctx.fillStyle = colorWithAlpha('#ffeb3b', alpha * sparkIntensity * 0.8);
        ctx.beginPath();
        ctx.arc(x + wagonW / 2, wy, 2 * scale * sparkIntensity, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Wagon count indicator if more than 6
    if (state.wagonCount > 6) {
      ctx.font = `${8 * scale}px monospace`;
      ctx.fillStyle = colorWithAlpha('#ffffff', alpha * 0.6);
      ctx.textAlign = 'center';
      ctx.fillText(`+${state.wagonCount - 6} more`, x, y - (7 * (wagonH + wagonSpacing)) * 0.9);
    }
  }

  function drawEnergyParticles(state, cx, yTop, yBottom, turns, radius, time) {
    // Animated energy particles flowing down the track
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

  // === Helpers ===
  function colorWithAlpha(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  return { init, render, resize };
})();
