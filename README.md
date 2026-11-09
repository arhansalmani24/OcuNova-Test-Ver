# OcuNova — Revival Workspace

OcuNova is being developed as an AI-assisted, interactive engineering and learning workspace.

## Repository status

This repository currently contains a single-file browser prototype in `index.html`.

The existing prototype is titled **NEON AURA AR** and includes:
- MediaPipe Hands-based hand landmark tracking
- Canvas-based visual effects and particle animations
- Several visual themes
- Basic pinch/open-hand gesture feedback
- Optional generated audio effects

This is a useful interaction experiment, but it is not yet the complete OcuNova engineering simulation platform.

## Revival direction

The goal is to evolve the prototype into OcuNova while preserving the original experiment until a replacement is tested.

### Planned development stages

1. **Foundation**
   - Establish OcuNova branding, responsive layout, and accessible navigation.
   - Separate the interface, hand-tracking, rendering, and simulation code into maintainable modules.
   - Add clear camera-permission, loading, and error states.

2. **Interactive 3D workspace**
   - Add a 3D scene with selectable, movable, and zoomable models.
   - Provide a project panel with model details and editable properties.
   - Keep gesture interaction optional; provide mouse and touch controls too.

3. **Engineering learning tools**
   - Add learning-focused circuit and component views.
   - Build a searchable component and sensor reference library.
   - Add guided simulation lessons and project explanations.

4. **AI-assisted creation**
   - Design a prompt-to-project workflow with clear preview and edit steps.
   - Show generated content before applying changes.
   - Keep AI/API credentials on a secure server, never in browser source code.

5. **Project exports**
   - Add project summaries and exportable documentation.
   - Test PDF/PPT generation and verify exported files before release.

## Development principles

- Preserve existing work and use feature branches for major changes.
- Do not claim a feature is complete until it has been implemented and tested.
- Ask for camera permission only when the user starts a camera-based feature.
- Explain what camera data is used for and avoid storing or uploading it by default.
- Support keyboard, touch, and pointer interaction alongside gestures.
- Keep secrets, private keys, and API tokens out of the repository.

## Current entry points

- Open `circuit-forge.html` to try the Circuit Forge prototype: add and move sample components, connect visual ports, use prompt-based demo layouts, and export a project JSON. Connections are not electrically validated and the prompt helper is not connected to an AI model.\n- Open `workspace.html` to try the new OcuNova-branded interactive 3D workspace prototype. It supports orbit controls, selecting objects, editing position/scale/color, adding primitive shapes, and exporting a scene description as JSON. Three.js is loaded from a CDN, so an internet connection is required.
- Open `index.html` to run the original hand-tracking visual prototype in a browser environment that supports camera access.

The prompt box in `workspace.html` currently maps simple descriptions to built-in 3D primitives. It is a local demo, not a connected AI model or full engineering simulator.

## Project ownership

OcuNova project concept and development direction: **Mohd Arhan Salmani**.
