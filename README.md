# Interactive Cubic Bézier Rope Simulation

An **interactive real-time simulation of a cubic Bézier curve** that behaves like a flexible rope, implemented entirely using **HTML5 Canvas and plain JavaScript**.

The project demonstrates a deep understanding of **Bézier mathematics, differential geometry, and basic physics modeling**, with all curve evaluation, tangent computation, and motion logic implemented **manually from scratch**.

## ✨ Highlights

* Manual **cubic Bézier curve evaluation**
* **Spring–damping physics** for rope-like motion
* Real-time **mouse-based interaction**
* Analytical **tangent vector visualization**
* Stress-based **color gradients**
* Velocity-dependent **rope thickness**
* Subtle wave (“breathing”) animation
* Motion trails for dynamic control points
* On-screen **FPS counter (≈ 60 FPS)**
* Clean, labeled, and informative UI


##  Mathematical Foundation

### Cubic Bézier Curve

The curve is defined by four control points ( P_0, P_1, P_2, P_3 ) and evaluated using the standard cubic Bézier equation:

[
B(t) = (1 - t)^3 P_0 + 3(1 - t)^2 t P_1 + 3(1 - t) t^2 P_2 + t^3 P_3
]

* The parameter ( t \in [0, 1] ) is sampled at small intervals
* Each point on the curve is computed explicitly
* No built-in Bézier drawing APIs are used

---

### Tangent Computation

Tangent vectors are calculated using the analytical derivative of the cubic Bézier curve:

[
B'(t) = 3(1 - t)^2 (P_1 - P_0)
+ 6(1 - t)t (P_2 - P_1)
+ 3t^2 (P_3 - P_2)
]

These vectors are normalized and rendered along the curve to visualize **direction, flow, and curvature**.

---

##  Physics Model

The inner control points ( P_1 ) and ( P_2 ) follow a **spring–damping system**:

* Each point accelerates toward a target position
* Velocity is damped to reduce oscillations
* Motion exhibits inertia and elasticity, similar to a real rope

### Adjustable Parameters

* **Stiffness (k):** controls how strongly the rope pulls toward the target
* **Damping:** controls energy loss and smoothness

Both parameters can be modified in real time via the UI.

---

##  Interaction

* Mouse movement defines the rope’s target position
* Control points follow the target with physical lag
* Endpoints remain fixed as anchors
* All control points and targets are clearly labeled

---

##  Visual Design

All visual effects are implemented using **custom rendering logic**, not external libraries:

* Stress-based color mapping (low → high tension)
* Velocity-dependent rope thickness
* Subtle wave displacement along the curve normal
* Motion trails to emphasize dynamics
* Grid background for spatial reference
* UI panel displaying parameters and FPS

---

##  Performance

* Rendering is driven by `requestAnimationFrame`
* Updates are synchronized with the display refresh rate
* An on-screen FPS counter confirms **real-time performance (~60 FPS)**

---

##  Technology Stack

* **HTML5**
* **JavaScript**
* **Canvas API** (used only for drawing primitives)

No external libraries or frameworks are used.

---

##  Rule Compliance

* No prebuilt Bézier APIs (e.g., `bezierCurveTo`)
* No physics or animation libraries
* All math and motion logic implemented manually
* Code organized into logical sections
* Fully interactive and real-time visualization

---

##  How to Run

1. Clone or download the repository
2. Open the project folder
3. Double-click `index.html`
4. The simulation runs directly in your browser

No installation or server setup required.

---

##  Repository Structure

```text
interactive-bezier-rope/
│
├── index.html
├── script.js
└── README.md
```

This version is **clean, confident, and submission-ready**.

