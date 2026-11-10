# OcuNova — Revival Workspace

OcuNova is being developed as an AI-assisted, interactive engineering and learning workspace.

## Repository status

The original `index.html` experiment is preserved. Development prototypes are being added on the `ocunova-revival` branch; the default `main` branch is intentionally left unchanged.

## Current entry points

- `ocunova-visuals.html` — OcuNova light-theme visual landing page with a lightweight WebGL shader background, glass-style reveal interaction and responsive waterline-inspired navigation. This is a standalone browser-compatible adaptation of the visual ideas from the earlier React/21st.dev components; it is not a verbatim copy of those React source files.
- `index.html` — original **NEON AURA AR** visual experiment with MediaPipe Hands tracking, Canvas effects, gesture feedback, themes and optional audio. Camera access depends on browser permissions and a compatible environment.
- `workspace.html` — OcuNova interactive 3D workspace with orbit controls, object selection, primitive creation, editable transforms/materials and JSON scene export. Three.js is loaded from a CDN.
- `model-studio.html` — 3D Model Studio with a component library, scene layers, sample rover assembly, editable object properties and JSON export. Three.js is loaded from a CDN.
- `circuit-forge.html` — visual circuit-layout prototype with Arduino-style components, draggable parts, port-to-port visual wires, sample prompt layouts and JSON export. Connections are not electrically validated; the prompt helper is not an AI service.
- `physics-lab.html` — browser-based 2D teaching playground for free fall, ramp motion and bouncing, with adjustable gravity, mass, friction and restitution, live approximate measurements, a speed-history graph and CSV export.
- `sensor-atlas.html` — offline-friendly reference catalogue for 12 common sensors, linked from the landing-page navigation and feature cards. Search and category filters, sensor detail cards, common pin labels, wiring cautions, Arduino starter examples, library notes, manufacturer reference links for selected devices, and comparison of up to three sensors are implemented locally in the browser.

## Sensor Atlas scope and limitations

The Sensor Atlas is a static educational reference, not a hardware detector or live telemetry service. Its catalogue covers HC-SR04, HC-SR501 PIR, DHT11, DHT22/AM2302, BMP280, MPU-6050, DS18B20, LDR, capacitive soil-moisture modules, IR obstacle modules, BH1750 and SHT31. Search, category filtering, detail selection, copy-code controls and side-by-side comparison are client-side features; no account, AI service or backend is connected.

Electrical values marked as typical are quick-reference guidance. Breakout boards can add regulators, level shifting, pull-ups or different pin layouts, so the exact board documentation takes priority. Analog readings from LDR and soil-moisture modules require calibration and are not universal lux or moisture percentages. Starter sketches require the named Arduino libraries where listed and have not been verified on physical hardware. This catalogue is a learning aid, not a substitute for datasheets or electrical review.

## Physics Lab scope and limitations

The Physics Lab is a simplified educational approximation, not a validated scientific or engineering solver. It does not model full 3D motion, rotational dynamics, detailed material behaviour or air-flow physics. Its ramp and collision behaviour is intentionally basic. Treat displayed readings as learning aids, not design or safety calculations. The mass control changes displayed energy; ideal gravitational acceleration is independent of mass in this model.

## Revival roadmap

1. Improve the shared app foundation, responsive navigation and accessibility. The visual landing-page prototype is available in `ocunova-visuals.html`.
2. Connect the 3D workspace and model studio through a consistent project format.
3. Expand the sensor reference catalogue with additional documented parts and verified board variants; the first 12-sensor Sensor Atlas is now available.
4. Build a more complete, validated simulation layer and guided lessons.
5. Add secure AI-assisted project generation only when a server-side integration is available.
6. Add verified PDF/PPT project documentation exports.

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
- The Sensor Atlas and updated landing page were fetched back from GitHub. JavaScript syntax parsing passed for both inline scripts; the catalogue data check confirmed 12 unique entries with the required fields and starter examples.
- These are source-level checks only. The Sensor Atlas has not been browser-tested or connected to physical sensors; starter sketches have not been compiled against hardware.
- The Physics Lab has not yet been browser-tested across devices or independently validated against a physics reference.
- The Three.js prototypes require a browser with WebGL and network access to their CDN dependencies.

## Project ownership

OcuNova project concept and development direction: **Mohd Arhan Salmani**.
