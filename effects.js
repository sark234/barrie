export class Effects {
  constructor() {
    this.trails = new Map();
    this.shockwaves = [];
    this.pulses = [];
  }

  addTrail(key, point) {
    const t = this.trails.get(key) || [];
    t.push({ ...point, life: 1 });
    if (t.length > 32) t.shift();
    this.trails.set(key, t);
  }

  triggerShockwave(pos, color = [255, 39, 216]) {
    this.shockwaves.push({ ...pos, r: 0.02, life: 1, color });
  }

  pulseBetween(a, b) {
    this.pulses.push({ a, b, t: 0, life: 1 });
  }

  update() {
    for (const [, arr] of this.trails) arr.forEach((p) => p.life *= 0.96);
    this.shockwaves.forEach((s) => { s.r += 0.01; s.life *= 0.93; });
    this.pulses.forEach((p) => { p.t += 0.045; p.life *= 0.97; });
    this.shockwaves = this.shockwaves.filter((s) => s.life > 0.05);
    this.pulses = this.pulses.filter((p) => p.life > 0.05);
  }
}
