export class ParticleSystem {
  constructor(max = 4500) {
    this.max = max;
    this.pool = [];
  }

  emit(pos, n = 8, color = [0, 246, 255]) {
    for (let i = 0; i < n && this.pool.length < this.max; i++) {
      this.pool.push({
        x: pos.x, y: pos.y, z: pos.z || 0,
        vx: (Math.random() - .5) * .02,
        vy: (Math.random() - .5) * .02,
        vz: (Math.random() - .5) * .01,
        life: 1,
        color
      });
    }
  }

  update(attractor, dt = 1) {
    this.pool = this.pool.filter((p) => {
      const dx = attractor.x - p.x, dy = attractor.y - p.y;
      p.vx += dx * 0.0008 * dt;
      p.vy += dy * 0.0008 * dt + 0.0002 * dt;
      p.vx += (Math.random() - 0.5) * 0.0008;
      p.vy += (Math.random() - 0.5) * 0.0008;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      p.life -= 0.01 * dt;
      return p.life > 0;
    });
  }
}
