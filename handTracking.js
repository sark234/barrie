const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17]
];

export class HandTracker {
  constructor(videoEl) {
    this.videoEl = videoEl;
    this.hands = [];
    this.ready = false;
    this.error = null;
  }

  async init() {
    try {
      this.mpHands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });
      this.mpHands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.65,
        minTrackingConfidence: 0.65
      });
      this.mpHands.onResults((res) => this.onResults(res));

      this.camera = new Camera(this.videoEl, {
        onFrame: async () => { await this.mpHands.send({ image: this.videoEl }); },
        width: 960,
        height: 540
      });
      await this.camera.start();
      this.ready = true;
    } catch (err) {
      this.error = err;
      throw err;
    }
  }

  smoothLandmark(prev, next, alpha = 0.45) {
    return {
      x: prev ? prev.x + (next.x - prev.x) * alpha : next.x,
      y: prev ? prev.y + (next.y - prev.y) * alpha : next.y,
      z: prev ? prev.z + (next.z - prev.z) * alpha : next.z
    };
  }

  onResults(results) {
    const out = [];
    const landmarks = results.multiHandLandmarks || [];
    const handedness = results.multiHandedness || [];

    landmarks.forEach((lm, i) => {
      const prev = this.hands[i]?.landmarks ?? [];
      const smoothed = lm.map((pt, idx) => this.smoothLandmark(prev[idx], pt));
      const palm = [0, 5, 9, 13, 17].reduce((acc, id) => {
        acc.x += smoothed[id].x; acc.y += smoothed[id].y; acc.z += smoothed[id].z;
        return acc;
      }, { x: 0, y: 0, z: 0 });
      palm.x /= 5; palm.y /= 5; palm.z /= 5;

      out.push({
        landmarks: smoothed,
        handedness: handedness[i]?.label || 'Unknown',
        palm,
        connections: HAND_CONNECTIONS
      });
    });

    this.hands = out;
  }
}
