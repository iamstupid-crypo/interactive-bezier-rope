const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ================= FPS =================
let lastTime = performance.now();
let fps = 0;

// ================= VECTOR =================
class Vec2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  add(v) { return new Vec2(this.x + v.x, this.y + v.y); }
  sub(v) { return new Vec2(this.x - v.x, this.y - v.y); }
  mul(s) { return new Vec2(this.x * s, this.y * s); }
  len() { return Math.hypot(this.x, this.y); }
  norm() {
    const l = this.len() || 1;
    return new Vec2(this.x / l, this.y / l);
  }
}

// ================= BÉZIER =================
function cubicBezier(t, p0, p1, p2, p3) {
  const u = 1 - t;
  return p0.mul(u*u*u)
    .add(p1.mul(3*u*u*t))
    .add(p2.mul(3*u*t*t))
    .add(p3.mul(t*t*t));
}

function bezierTangent(t, p0, p1, p2, p3) {
  const u = 1 - t;
  return p1.sub(p0).mul(3*u*u)
    .add(p2.sub(p1).mul(6*u*t))
    .add(p3.sub(p2).mul(3*t*t))
    .norm();
}

// ================= PHYSICS =================
class SpringPoint {
  constructor(pos) {
    this.pos = pos;
    this.vel = new Vec2(0, 0);
    this.target = pos;
  }
  update(k, damping) {
    const force = this.target.sub(this.pos).mul(k);
    this.vel = this.vel.add(force);
    this.vel = this.vel.mul(damping);
    this.pos = this.pos.add(this.vel);
  }
}

// ================= POINTS =================
const p0 = new Vec2(200, canvas.height / 2);
const p3 = new Vec2(canvas.width - 200, canvas.height / 2);
const p1 = new SpringPoint(new Vec2(400, canvas.height / 2 - 120));
const p2 = new SpringPoint(new Vec2(600, canvas.height / 2 + 120));

let mousePos = new Vec2(0, 0);

// ================= INPUT =================
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  mousePos = new Vec2(
    e.clientX - rect.left,
    e.clientY - rect.top
  );
  p1.target = mousePos;
  p2.target = mousePos.add(new Vec2(80, 0));
});

// ================= TRAILS =================
const trail1 = [];
const trail2 = [];
const MAX_TRAIL = 25;

// ================= UI HELPERS =================
function drawGrid() {
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  for (let x = 0; x < canvas.width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawPoint(p, label, sub = "", ox = 8, oy = -10) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillText(label, p.x + ox, p.y + oy);
  if (sub) {
    ctx.fillStyle = "#aaa";
    ctx.fillText(sub, p.x + ox, p.y + oy + 14);
  }
}

function drawTrail(trail, color) {
  for (let i = 0; i < trail.length; i++) {
    const a = i / trail.length;
    ctx.fillStyle = `rgba(${color},${a})`;
    ctx.beginPath();
    ctx.arc(trail[i].x, trail[i].y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawUIPanel(k, damping, speed) {
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(10, canvas.height - 140, 260, 130);

  ctx.fillStyle = "#fff";
  ctx.fillText("Simulation Info", 20, canvas.height - 115);
  ctx.fillText(`Stiffness (k): ${k.toFixed(2)}`, 20, canvas.height - 90);
  ctx.fillText(`Damping: ${damping.toFixed(2)}`, 20, canvas.height - 70);
  ctx.fillText(`Velocity: ${speed.toFixed(1)}`, 20, canvas.height - 50);

  ctx.fillStyle = "#0f0";
  ctx.fillText(`FPS: ${fps.toFixed(1)}`, 20, canvas.height - 30);
}

// ================= ANIMATION =================
let time = 0;

function animate(now) {
  fps = 1000 / (now - lastTime);
  lastTime = now;

  const k = parseFloat(document.getElementById("stiffness").value);
  const damping = parseFloat(document.getElementById("damping").value);

  p1.update(k, damping);
  p2.update(k, damping);

  trail1.push(new Vec2(p1.pos.x, p1.pos.y));
  trail2.push(new Vec2(p2.pos.x, p2.pos.y));
  if (trail1.length > MAX_TRAIL) trail1.shift();
  if (trail2.length > MAX_TRAIL) trail2.shift();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGrid();
  drawTrail(trail1, "255,255,255");
  drawTrail(trail2, "255,180,180");

  const speed = p1.vel.len() + p2.vel.len();
  ctx.lineWidth = Math.min(6, 2 + speed * 0.1);

  // Bézier curve
  for (let t = 0; t <= 1; t += 0.01) {
    const base = cubicBezier(t, p0, p1.pos, p2.pos, p3);
    const tan = bezierTangent(t, p0, p1.pos, p2.pos, p3);
    const wave = Math.sin(t * Math.PI * 6 + time) * 4;
    const normal = new Vec2(-tan.y, tan.x);

    const p = base.add(normal.mul(wave));
    const next = cubicBezier(t + 0.01, p0, p1.pos, p2.pos, p3)
      .add(normal.mul(wave));

    const stress = Math.abs(Math.sin(t * Math.PI + speed * 0.05));
    ctx.strokeStyle = `rgb(${Math.floor(255*stress)},${Math.floor(255*(1-stress))},200)`;

    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
  }

  // Tangents
  ctx.strokeStyle = "rgba(255,80,80,0.6)";
  for (let t = 0; t <= 1; t += 0.2) {
    const p = cubicBezier(t, p0, p1.pos, p2.pos, p3);
    const tan = bezierTangent(t, p0, p1.pos, p2.pos, p3);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + tan.x * 30, p.y + tan.y * 30);
    ctx.stroke();
  }

  // Labels (fixed overlap)
  drawPoint(p0, "P0", "Fixed Anchor");
  drawPoint(p3, "P3", "Fixed Anchor");
  drawPoint(p1.pos, "P1", "Dynamic (Spring)", 8, 18);
  drawPoint(p2.pos, "P2", "Dynamic (Spring)", 12, -10);
  drawPoint(mousePos, "Mouse", "Target", 8, -28);

  // Dotted guide for mouse label
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.beginPath();
  ctx.moveTo(mousePos.x, mousePos.y);
  ctx.lineTo(mousePos.x + 8, mousePos.y - 28);
  ctx.stroke();
  ctx.setLineDash([]);

  drawUIPanel(k, damping, speed);

  time += 0.05;
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
