const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));

export function detectGestures(hands, history) {
  const events = [];
  hands.forEach((hand, i) => {
    const lm = hand.landmarks;
    if (!lm) return;

    const pinch = d(lm[4], lm[8]) < 0.055;
    if (pinch) events.push({ type: 'pinch', hand: i, pos: lm[8] });

    const openPalm = [8, 12, 16, 20].every((tip, idx) => lm[tip].y < lm[[6, 10, 14, 18][idx]].y);
    if (openPalm) events.push({ type: 'openPalm', hand: i, pos: hand.palm });

    const fist = [8, 12, 16, 20].every((tip, idx) => lm[tip].y > lm[[6, 10, 14, 18][idx]].y);
    if (fist) events.push({ type: 'fist', hand: i, pos: hand.palm });

    const fingerGun = lm[8].y < lm[6].y && lm[4].x > lm[3].x && lm[12].y > lm[10].y;
    if (fingerGun) events.push({ type: 'fingerGun', hand: i, pos: lm[8] });

    const prev = history[i] || lm[8];
    const vx = lm[8].x - prev.x;
    if (Math.abs(vx) > 0.06) events.push({ type: 'swipe', hand: i, pos: lm[8], dir: Math.sign(vx) });
    history[i] = { ...lm[8] };
  });

  if (hands.length === 2) {
    const a = hands[0].palm, b = hands[1].palm;
    if (d(a, b) < 0.17) events.push({ type: 'energySphere', pos: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 } });
  }

  return events;
}
