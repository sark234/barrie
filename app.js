import { HandTracker } from './handTracking.js';
import { detectGestures } from './gestures.js';
import { ParticleSystem } from './particles.js';
import { Effects } from './effects.js';
import { postVert, postFrag } from './shaders.js';
import { createUI } from './ui.js';

const video = document.getElementById('inputVideo');
const ui = createUI();
const tracker = new HandTracker(video);
const particles = new ParticleSystem();
const effects = new Effects();
const gestureHistory = [];
let postShader;

window.setup = async function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(Math.min(devicePixelRatio, 2));
  postShader = createShader(postVert, postFrag);

  try {
    await tracker.init();
    ui.setStatus('Live: Track both hands to trigger neon effects.');
  } catch (err) {
    ui.setStatus(`Camera error: ${err.message}`, true);
  }
};

function n2s(pt) {
  return { x: (pt.x - 0.5) * width, y: (pt.y - 0.5) * -height, z: pt.z * 700 };
}

function drawHand(hand, handIdx) {
  const { landmarks, connections } = hand;
  for (const [a, b] of connections) {
    const p1 = n2s(landmarks[a]);
    const p2 = n2s(landmarks[b]);
    stroke(0, 246, 255, 120);
    strokeWeight(2.2);
    line(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
  }

  [4, 8, 12, 16, 20].forEach((tip) => {
    const p = n2s(landmarks[tip]);
    effects.addTrail(`${handIdx}-${tip}`, p);
    particles.emit({ x: p.x * 0.001, y: -p.y * 0.001, z: p.z * 0.001 }, 2, [255, 218, 68]);
    noStroke();
    fill(255, 218, 68, 220);
    push();
    translate(p.x, p.y, p.z);
    sphere(6);
    pop();
  });
}

window.draw = function draw() {
  background(4, 5, 11, 180);
  orbitControl(0, 0, 0);

  const hands = tracker.hands;
  const events = detectGestures(hands, gestureHistory);
  for (const e of events) {
    if (e.type === 'pinch' || e.type === 'swipe' || e.type === 'fingerGun') effects.triggerShockwave(n2s(e.pos));
    if (e.type === 'energySphere' && hands.length === 2) effects.pulseBetween(n2s(hands[0].palm), n2s(hands[1].palm));
  }

  hands.forEach(drawHand);

  if (hands.length === 2) {
    const tips = [4, 8, 12, 16, 20];
    for (const t of tips) {
      const a = n2s(hands[0].landmarks[t]);
      const b = n2s(hands[1].landmarks[t]);
      for (let s = 0; s < 8; s++) {
        const t1 = s / 8;
        const t2 = (s + 1) / 8;
        const mx1 = lerp(a.x, b.x, t1), my1 = lerp(a.y, b.y, t1) + sin(frameCount * 0.08 + t1 * 12) * 12;
        const mx2 = lerp(a.x, b.x, t2), my2 = lerp(a.y, b.y, t2) + sin(frameCount * 0.08 + t2 * 12) * 12;
        stroke(255, 39, 216, 80 + s * 14);
        strokeWeight(2.5);
        line(mx1, my1, lerp(a.z, b.z, t1), mx2, my2, lerp(a.z, b.z, t2));
      }
      effects.pulseBetween(a, b);
    }
  }

  effects.update();
  blendMode(ADD);
  effects.trails.forEach((trail) => {
    noFill();
    beginShape();
    trail.forEach((p, idx) => {
      stroke(0, 246, 255, 120 * p.life + idx * 3);
      strokeWeight(1 + idx * 0.12);
      curveVertex(p.x, p.y, p.z);
    });
    endShape();
  });

  effects.shockwaves.forEach((s) => {
    push();
    translate(s.x, s.y, s.z);
    noFill();
    stroke(s.color[0], s.color[1], s.color[2], 180 * s.life);
    strokeWeight(4 * s.life);
    ellipse(0, 0, s.r * width, s.r * width);
    pop();
  });

  particles.update({ x: 0, y: 0 }, deltaTime / 16.7);
  noStroke();
  particles.pool.forEach((p) => {
    fill(p.color[0], p.color[1], p.color[2], 200 * p.life);
    push();
    translate(p.x * width, -p.y * height, p.z * 400);
    sphere(2.2);
    pop();
  });

  blendMode(BLEND);
  shader(postShader);
  postShader.setUniform('tex0', get());
  postShader.setUniform('resolution', [width, height]);
  postShader.setUniform('time', millis() / 1000);
  rect(-width / 2, -height / 2, width, height);
  resetShader();
};

window.windowResized = function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
};
