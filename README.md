# OcuNova — Revival Workspace

OcuNova is being developed as an AI-assisted, interactive engineering and learning workspace.

## Repository status

The original `index.html` experiment is preserved. Development prototypes are being added on the `ocunova-revival` branch; the default `main` branch is intentionally left unchanged.

## Current entry points

- `ocunova-visuals.html` — OcuNova light-theme visual landing page with a lightweight WebGL shader background, glass-style reveal interaction and responsive waterline-inspired navigation. This is a standalone browser-compatible adaptation of the visual ideas from the earlier React/21st.dev components; it is not a verbatim copy of those React source files.
- `index.html` — original **NEON AURA AR** visual experiment with MediaPipe Hands tracking, Canvas effects, gesture feedback, themes and optional audio. Camera access depends on browser permissions and a compatible environment.
- `workspace.html` — OcuNova interactive 3D workspace with orbit controls, object selection, eight supported primitive/component shapes, editable transforms/materials and shared project JSON import/export. Three.js is loaded from a CDN.
- `model-studio.html` — 3D Model Studio with a component library, scene layers, sample rover assembly, editable object properties and the same shared project JSON import/export format. Three.js is loaded from a CDN.
- `project-format.js` — shared `ocunova-project-v1` schema, validation, legacy 3D-export normalisation and browser download helper used by both 3D tools.
- `circuit-forge.html` — visual circuit-layout prototype with Arduino-style components, draggable parts, port-to-port visual wires, sample prompt layouts and JSON export. Connections are not electrically validated; the prompt helper is not an AI service.
- `physics-lab.html` — browser-based 2D teaching playground for free fall, ramp motion and bouncing, with adjustable gravity, mass, friction and restitution, live approximate measurements, a speed-history graph and CSV export.
- `sensor-atlas.html` — offline-friendly reference catalogue for 12 common sensors, linked from the landing-page navigation and feature cards. Search and category filters, sensor detail cards, common pin labels, wiring cautions, Arduino starter examples, library notes, manufacturer reference links for selected devices, and comparison of up to three sensors are implemented locally in the browser.
- `learning-path.html` — five guided engineering lessons covering the 3D Workspace, Model Studio, Circuit Forge, Sensor Atlas and Physics Lab. Includes 15 self-check tasks, five knowledge checks and browser-local progress.

## Shared 3D Project Format scope and limitations

The 3D Workspace and Model Studio now use the same `ocunova-project-v1` JSON format through `project-format.js`. Use Export project in either tool, then Import JSON in the other to continue editing the same scene. The format preserves object IDs, names, supported shape types, position, rotation, scale and material color. Supported shapes are box, sphere, cylinder, cone, wheel, sensor, control board and rover base. The importer also accepts the earlier Workspace `ocunova-scene-v1` export and the previous OcuNova Model Studio export structure.

Imports are validated before replacing the current scene, limited to 100 objects and JSON files smaller than 2 MB, and reject unsupported shapes, duplicate IDs, invalid colors, non-numeric or non-finite transform values, and out-of-range transforms. Position and rotation vectors must contain three finite numbers; scale values must be positive and within the supported range. This is a local file hand-off: there is no cloud sync, account storage, collaboration, AI generation or server-side project database. Camera settings, lighting, viewport state and arbitrary custom geometry are not part of the shared format. Circuit Forge continues to use its own separate visual-layout JSON; circuit layouts and electrical simulation are not included in this 3D format.

## Sensor Atlas scope and limitations

The Sensor Atlas is a static educational reference, not a hardware detector or live telemetry service. Its catalogue covers HC-SR04, HC-SR501 PIR, DHT11, DHT22/AM2302, BMP280, MPU-6050, DS18B20, LDR, capacitive soil-moisture modules, IR obstacle modules, BH1750 and SHT31. Search, category filtering, detail selection, copy-code controls and side-by-side comparison are client-side features; no account, AI service or backend is connected.

Electrical values marked as typical are quick-reference guidance. Breakout boards can add regulators, level shifting, pull-ups or different pin layouts, so the exact board documentation takes priority. Analog readings from LDR and soil-moisture modules require calibration and are not universal lux or moisture percentages. Starter sketches require the named Arduino libraries where listed and have not been verified on physical hardware. This catalogue is a learning aid, not a substitute for datasheets or electrical review.

## Guided Learning Path scope and limitations

The Guided Learning Path contains five short lessons linked to the existing tools: 3D Workspace foundations, 3D model assembly, visual circuit layout, sensor research and simplified motion experiments. Each lesson has three self-check tasks and one knowledge check. Checklist state and selected answers are stored in the current browser with local storage; there is no account sync, server-side grading, certificate, AI tutor or remote progress database. The page is a learning guide and does not change or validate the underlying 3D, circuit, sensor or physics tools. Circuit Forge remains a visual layout only, and Physics Lab remains a simplified educational approximation.

## Physics Lab scope and limitations

The Physics Lab is a simplified educational approximation, not a validated scientific or engineering solver. It does not model full 3D motion, rotational dynamics, detailed material behaviour or air-flow physics. Its ramp and collision behaviour is intentionally basic. Treat displayed readings as learning aids, not design or safety calculations. The mass control changes displayed energy; ideal gravitational acceleration is independent of mass in this model.

## Revival roadmap

1. Improve the shared app foundation, responsive navigation and accessibility. The visual landing-page prototype is available in `ocunova-visuals.html`.
2. Connect the 3D Workspace and Model Studio through a consistent project format — the shared `ocunova-project-v1` import/export workflow is now implemented; browser hand-off testing remains.
3. Expand the sensor reference catalogue with additional documented parts and verified board variants; the first 12-sensor Sensor Atlas is now available.
4. Expand guided lessons and build a more complete, validated simulation layer.
5. Add secure AI-assisted project generation only when a server-side integration is available.
6. Add verified PDF/PPT project documentation exports.

## Automated project-format tests

Run `npm test` with Node.js 18 or later to execute the shared 3D project-format regression suite. It uses Node's built-in test runner and has no third-party package dependencies. The tests cover canonical project creation and normalisation, both supported legacy export shapes, defaults, label cleaning, the 100-object limit, duplicate IDs, supported shapes, colour validation, numeric vectors and transform bounds.

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
- The shared `project-format.js`, `workspace.html` and `model-studio.html` files were fetched back from GitHub and parsed with the V8 JavaScript parser. The shared-format helper was exercised with a two-object scene (including rover base and wheel), both previous 3D export structures, and rejection of an unsupported shape.
- The Guided Learning Path and updated landing page were fetched back from GitHub; their inline JavaScript passed V8 syntax parsing, five lesson modules and 15 tasks were confirmed, and the lesson tool destinations were checked against the repository entry points.
- The Sensor Atlas and updated landing page were fetched back from GitHub. JavaScript syntax parsing passed for both inline scripts; the catalogue data check confirmed 12 unique entries with the required fields and starter examples.
- The shared project-format regression suite was run with `npm test`: 12 tests passed using Node's built-in test runner; no external dependencies are required.
- The shared 3D project workflow has not yet been browser-tested between the two pages; manual export/import checks in a WebGL-capable browser are still required.
- These are source-level checks only. The Guided Learning Path has not been browser-tested across devices; local-storage persistence and interactions still need manual browser testing. The Sensor Atlas has not been browser-tested or connected to physical sensors; starter sketches have not been compiled against hardware.
- The Physics Lab has not yet been browser-tested across devices or independently validated against a physics reference.
- The Three.js prototypes require a browser with WebGL and network access to their CDN dependencies.

## Project ownership

OcuNova project concept and development direction: **Mohd Arhan Salmani**.
