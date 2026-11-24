# OcuNova — Revival Workspace

OcuNova is being developed as an AI-assisted, interactive engineering and learning workspace.

## Repository status

The original `index.html` experiment is preserved. Development prototypes are being added on the `ocunova-revival` branch; the default `main` branch is intentionally left unchanged.

## Current entry points

- `ocunova-visuals.html` — OcuNova light-theme visual landing page with a lightweight WebGL shader background, glass-style reveal interaction and responsive waterline-inspired navigation. This is a standalone browser-compatible adaptation of the visual ideas from the earlier React/21st.dev components; it is not a verbatim copy of those React source files.
- `index.html` — original **NEON AURA AR** visual experiment with MediaPipe Hands tracking, Canvas effects, gesture feedback, themes and optional audio. Camera access depends on browser permissions and a compatible environment.
- `workspace.html` — OcuNova interactive 3D workspace with orbit controls, object selection, eight supported primitive/component shapes, editable transforms/materials and shared project JSON import/export. Three.js is loaded from a CDN.
- `model-studio.html` — 3D Model Studio with a component library, scene layers, sample rover assembly, editable object properties and the same shared project JSON import/export format. Three.js is loaded from a CDN.
- `project-format.js` — shared `ocunova-project-v1` schema, validation, legacy 3D and Circuit Forge export normalisation, and browser download helper used by all three project tools.
- `circuit-forge.html` — visual circuit-layout prototype with Arduino-style components, draggable parts, port-to-port visual wires, sample prompt layouts, and shared OcuNova project import/export. Connections are not electrically simulated or electrically validated; the prompt helper is not an AI service.
- `physics-lab.html` — browser-based 2D teaching playground for free fall, ramp motion and bouncing, with adjustable gravity, mass, friction and restitution, live approximate measurements, a speed-history graph and CSV export.
- `sensor-atlas.html` — offline-friendly reference catalogue for 12 common sensors, linked from the landing-page navigation and feature cards. Search and category filters, sensor detail cards, common pin labels, wiring cautions, Arduino starter examples, library notes, manufacturer reference links for selected devices, and comparison of up to three sensors are implemented locally in the browser.
- `learning-path.html` — five guided engineering lessons covering the 3D Workspace, Model Studio, Circuit Forge, Sensor Atlas and Physics Lab. Includes 15 self-check tasks, five knowledge checks and browser-local progress.

## Shared OcuNova Project Format scope and limitations

The 3D Workspace, Model Studio and Circuit Forge now use the same `ocunova-project-v1` JSON container through `project-format.js`. Export a project from any of the three tools and import it into another. The 3D tools preserve an imported circuit section while editing and exporting the 3D scene; Circuit Forge preserves imported 3D objects while editing and exporting the circuit layout. This makes the JSON file a local hand-off container for both parts of a project.

The 3D section preserves object IDs, names, supported shape types, position, rotation, scale and material color. Supported 3D shapes are box, sphere, cylinder, cone, wheel, sensor, control board and rover base. The circuit section stores component IDs and types, normalized board positions (0–1, so layouts can adapt to different viewport sizes), port-index connections and wire colors. Supported Circuit Forge parts are Arduino UNO, HC-SR04, Micro Servo, LED, Resistor, Breadboard and the illustrative 7.4V battery. The importer still accepts the earlier Workspace `ocunova-scene-v1` export, the previous OcuNova Model Studio export structure, and the earlier Circuit Forge pixel-coordinate export (converted using a 720 × 420 reference board because the legacy file did not store its original board dimensions).

Imports are validated before the current project is replaced. Limits are 100 3D objects, 100 circuit components, 250 visual connections and JSON files smaller than 2 MB. Validation rejects unsupported component types, duplicate IDs, invalid positions, dangling connection references, invalid port indexes, duplicate connections, invalid colors and invalid 3D transforms. Circuit validation is structural only: it checks that a visual wire references existing demo components and in-range port indexes. It does not verify electrical compatibility, pin functions, voltage, current, power, polarity, shorts or physical wiring, and there is no electrical simulator. This remains a local file hand-off with no cloud sync, account storage, collaboration, AI generation or server-side project database. Camera settings, lighting, viewport state and arbitrary custom geometry are not part of the shared format.

## Sensor Atlas scope and limitations

The Sensor Atlas is a static educational reference, not a hardware detector or live telemetry service. Its catalogue covers HC-SR04, HC-SR501 PIR, DHT11, DHT22/AM2302, BMP280, MPU-6050, DS18B20, LDR, capacitive soil-moisture modules, IR obstacle modules, BH1750 and SHT31. Search, category filtering, detail selection, copy-code controls and side-by-side comparison are client-side features; no account, AI service or backend is connected.

Electrical values marked as typical are quick-reference guidance. Breakout boards can add regulators, level shifting, pull-ups or different pin layouts, so the exact board documentation takes priority. Analog readings from LDR and soil-moisture modules require calibration and are not universal lux or moisture percentages. Starter sketches require the named Arduino libraries where listed and have not been verified on physical hardware. This catalogue is a learning aid, not a substitute for datasheets or electrical review.

## Guided Learning Path scope and limitations

The Guided Learning Path contains five short lessons linked to the existing tools: 3D Workspace foundations, 3D model assembly, visual circuit layout, sensor research and simplified motion experiments. Each lesson has three self-check tasks and one knowledge check. Checklist state and selected answers are stored in the current browser with local storage; there is no account sync, server-side grading, certificate, AI tutor or remote progress database. The page is a learning guide and does not change or validate the underlying 3D, circuit, sensor or physics tools. Circuit Forge remains a visual layout only, and Physics Lab remains a simplified educational approximation.

## Physics Lab scope and limitations

The Physics Lab is a simplified educational approximation, not a validated scientific or engineering solver. It does not model full 3D motion, rotational dynamics, detailed material behaviour or air-flow physics. Its ramp and collision behaviour is intentionally basic. Treat displayed readings as learning aids, not design or safety calculations. The mass control changes displayed energy; ideal gravitational acceleration is independent of mass in this model.

## Revival roadmap

1. Improve the shared app foundation, responsive navigation and accessibility. The visual landing-page prototype is available in `ocunova-visuals.html`.
2. Connect the 3D Workspace, Model Studio and Circuit Forge through a consistent project format — the shared `ocunova-project-v1` container now carries 3D scenes and visual circuit layouts; browser hand-off testing remains.
3. Add documented pin maps and rule-based wiring guidance for supported Circuit Forge parts; keep this advisory until board variants and electrical rules are verified. Expand the sensor reference catalogue with additional documented parts and verified board variants; the first 12-sensor Sensor Atlas is now available.
4. Expand guided lessons and build a more complete, validated simulation layer.
5. Add secure AI-assisted project generation only when a server-side integration is available.
6. Add verified PDF/PPT project documentation exports.

## Automated project-format tests

Run `npm test` with Node.js 18 or later to execute the project-format regression suite. It uses Node's built-in test runner and has no third-party package dependencies. The suite now contains 18 cases covering canonical 3D-plus-circuit project creation and normalisation, legacy 3D and Circuit Forge exports, defaults, label cleaning, object and circuit limits, supported types, duplicate IDs and wires, color validation, finite positions and transforms, dangling connections and port-index bounds.

## Development and privacy principles

- Preserve the original experiment and work on `ocunova-revival` until changes are explicitly approved for integration.
- Distinguish prototypes, local demos, external services and validated simulations clearly.
- Do not claim a feature is complete until it has been implemented and tested.
- Request camera access only when the user starts a camera-based feature; explain its purpose and avoid storing or uploading camera data by default.
- Support pointer, touch and keyboard interaction where practical.
- Never place API keys, private keys or other secrets in browser source code.

## Verification status

- Source files and commits are present on the `ocunova-revival` branch.
- The Physics Lab source was fetched back from GitHub and checked for its experiment controls, run/pause logic, CSV export and model-limitations note.
- The shared `project-format.js`, `workspace.html`, `model-studio.html` and `circuit-forge.html` files were fetched back from GitHub. Their module/inline app scripts passed V8 syntax parsing. All 18 project-format regression cases were executed in a V8 harness with a strict assertion shim, including canonical 3D-plus-circuit round-trips, legacy Circuit Forge pixel export conversion, legacy 3D compatibility, component/connection limits, and invalid or dangling wire rejection.
- The Guided Learning Path and updated landing page were fetched back from GitHub; their inline JavaScript passed V8 syntax parsing, five lesson modules and 15 tasks were confirmed, and the lesson tool destinations were checked against the repository entry points.
- The Sensor Atlas and updated landing page were fetched back from GitHub. JavaScript syntax parsing passed for both inline scripts; the catalogue data check confirmed 12 unique entries with the required fields and starter examples.
- The earlier 12-case version of the project-format suite had passed `npm test` with Node's built-in test runner. The expanded 18-case suite was exercised in the V8 harness during this milestone; `npm test` has not yet been rerun against the expanded suite.
- The shared 3D-and-circuit project hand-off has not yet been browser-tested between pages. Manual export/import checks in a modern browser are still required; Three.js rendering additionally requires WebGL and network access to the CDN dependencies.
- These are source-level and V8-harness checks only, not browser/device runtime tests. Circuit Forge has not been browser-tested for cross-page import/export, and its connections remain visual only. The Guided Learning Path has not been browser-tested across devices; local-storage persistence and interactions still need manual browser testing. The Sensor Atlas has not been browser-tested or connected to physical sensors; starter sketches have not been compiled against hardware.
- The Physics Lab has not yet been browser-tested across devices or independently validated against a physics reference.
- The Three.js prototypes require a browser with WebGL and network access to their CDN dependencies.

## Project ownership

OcuNova project concept and development direction: **Mohd Arhan Salmani**.
