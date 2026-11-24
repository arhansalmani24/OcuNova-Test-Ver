import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OCU_NOVA_FORMAT,
  createOcuNovaProject,
  normalizeOcuNovaProject
} from '../project-format.js';

const oneObject = (overrides = {}) => ({
  id: 'cube-1',
  name: 'Test cube',
  type: 'box',
  position: [1, 2, 3],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  color: '#ABCDEF',
  ...overrides
});
const project = (objects = [oneObject()], extra = {}) => ({
  application: 'OcuNova',
  format: OCU_NOVA_FORMAT,
  project: { name: 'Test project' },
  objects,
  ...extra
});

test('normalises a canonical project and keeps supported scene properties', () => {
  const result = normalizeOcuNovaProject(project());
  assert.equal(result.format, OCU_NOVA_FORMAT);
  assert.equal(result.project.name, 'Test project');
  assert.deepEqual(result.objects[0], {
    id: 'cube-1', name: 'Test cube', type: 'box',
    position: [1, 2, 3], rotation: [0, 0, 0], scale: [1, 1, 1], color: '#abcdef'
  });
});

test('creates projects and applies safe defaults to omitted object fields', () => {
  const result = createOcuNovaProject([{ type: 'sphere' }], '  Practice scene  ');
  assert.equal(result.project.name, 'Practice scene');
  assert.equal(result.objects[0].id, 'object-1');
  assert.equal(result.objects[0].position[1], 0.6);
  assert.equal(result.objects[0].color, '#2588e8');
});

test('accepts the previous Workspace scene format', () => {
  const result = normalizeOcuNovaProject({ format: 'ocunova-scene-v1', objects: [oneObject()] });
  assert.equal(result.format, OCU_NOVA_FORMAT);
});

test('accepts the previous OcuNova app export shape', () => {
  const result = normalizeOcuNovaProject({ app: 'OcuNova Model Studio', objects: [oneObject()] });
  assert.equal(result.format, OCU_NOVA_FORMAT);
});

test('sanitises object and project labels', () => {
  const result = normalizeOcuNovaProject(project([
    oneObject({ name: '<b>Rover</b>\u0001 chassis' })
  ], { project: { name: '<script>Build</script>\u0001' } }));
  assert.equal(result.objects[0].name, 'bRover/b chassis');
  assert.equal(result.project.name, 'scriptBuild/script');
});

test('rejects unknown formats and malformed project containers', () => {
  assert.throws(() => normalizeOcuNovaProject(null), /valid OcuNova project/);
  assert.throws(() => normalizeOcuNovaProject({ format: 'other-v1', objects: [] }), /Unsupported project format/);
  assert.throws(() => normalizeOcuNovaProject({ format: OCU_NOVA_FORMAT }), /objects list/);
});

test('rejects more than 100 objects', () => {
  const objects = Array.from({ length: 101 }, (_, i) => oneObject({ id: 'part-' + i }));
  assert.throws(() => normalizeOcuNovaProject(project(objects)), /at most 100/);
});

test('rejects unsupported shapes and duplicate IDs', () => {
  assert.throws(() => normalizeOcuNovaProject(project([oneObject({ type: 'unknown' })])), /unsupported shape/);
  assert.throws(() => normalizeOcuNovaProject(project([oneObject(), oneObject()])), /unique/);
});

test('rejects invalid colours', () => {
  assert.throws(() => normalizeOcuNovaProject(project([oneObject({ color: 'blue' })])), /invalid color/);
});

test('rejects vectors with the wrong length or non-numeric values', () => {
  assert.throws(() => normalizeOcuNovaProject(project([oneObject({ position: [1, 2] })])), /exactly three numbers/);
  assert.throws(() => normalizeOcuNovaProject(project([oneObject({ position: [1, '2', 3] })])), /finite numeric values/);
  assert.throws(() => normalizeOcuNovaProject(project([oneObject({ rotation: [0, null, 0] })])), /finite numeric values/);
  assert.throws(() => normalizeOcuNovaProject(project([oneObject({ scale: [1, Infinity, 1] })])), /finite numeric values/);
});

test('rejects unsafe transform ranges and non-positive scales', () => {
  assert.throws(() => normalizeOcuNovaProject(project([oneObject({ position: [1001, 0, 0] })])), /within -1000 and 1000/);
  assert.throws(() => normalizeOcuNovaProject(project([oneObject({ scale: [1, 0, 1] })])), /greater than 0/);
  assert.throws(() => normalizeOcuNovaProject(project([oneObject({ scale: [1, 101, 1] })])), /no more than 100/);
});

test('trims IDs and rejects IDs that become empty', () => {
  const result = normalizeOcuNovaProject(project([oneObject({ id: '  part-a  ' })]));
  assert.equal(result.objects[0].id, 'part-a');
  assert.throws(() => normalizeOcuNovaProject(project([oneObject({ id: '   ' })])), /present and unique/);
});


const sampleCircuit = () => ({
  components: [
    { id: 'board-1', type: 'arduino', x: 0.08, y: 0.28 },
    { id: 'sensor-1', type: 'ultrasonic', x: 0.62, y: 0.18 }
  ],
  connections: [
    { a: 'board-1', ap: 0, b: 'sensor-1', bp: 0, color: '#00D8FF' }
  ]
});

test('normalises a shared circuit section and preserves its connections', () => {
  const result = normalizeOcuNovaProject(project([oneObject()], { circuit: sampleCircuit() }));
  assert.deepEqual(result.circuit, {
    version: 1,
    components: [
      { id: 'board-1', type: 'arduino', x: 0.08, y: 0.28 },
      { id: 'sensor-1', type: 'ultrasonic', x: 0.62, y: 0.18 }
    ],
    connections: [
      { a: 'board-1', ap: 0, b: 'sensor-1', bp: 0, color: '#00d8ff' }
    ]
  });
});

test('creates a project with both 3D objects and a circuit section', () => {
  const result = createOcuNovaProject([oneObject()], 'Rover project', sampleCircuit());
  assert.equal(result.objects.length, 1);
  assert.equal(result.circuit.components.length, 2);
  assert.equal(result.circuit.connections.length, 1);
});

test('imports the previous Circuit Forge pixel-coordinate export', () => {
  const result = normalizeOcuNovaProject({
    app: 'OcuNova Circuit Forge',
    version: 'prototype-0.1',
    components: [
      { id: 'board-legacy', type: 'arduino', name: 'Arduino UNO', x: 360, y: 210 },
      { id: 'led-legacy', type: 'led', name: 'LED', x: 180, y: 105 }
    ],
    connections: [
      { a: 'board-legacy', ap: 0, b: 'led-legacy', bp: 1, color: '#FFD34E' }
    ]
  });
  assert.equal(result.objects.length, 0);
  assert.equal(result.circuit.components[0].x, 0.5);
  assert.equal(result.circuit.components[0].y, 0.5);
  assert.equal(result.circuit.connections[0].color, '#ffd34e');
});

test('rejects unsupported circuit parts, duplicate IDs and invalid positions', () => {
  assert.throws(() => normalizeOcuNovaProject(project([], { circuit: {
    components: [{ id: 'bad', type: 'oscilloscope', x: 0.2, y: 0.2 }]
  } })), /unsupported type/);
  assert.throws(() => normalizeOcuNovaProject(project([], { circuit: {
    components: [
      { id: 'same', type: 'led', x: 0.2, y: 0.2 },
      { id: 'same', type: 'resistor', x: 0.4, y: 0.2 }
    ]
  } })), /unique/);
  assert.throws(() => normalizeOcuNovaProject(project([], { circuit: {
    components: [{ id: 'bad-position', type: 'led', x: 1.2, y: 0.2 }]
  } })), /between 0 and 1/);
});

test('rejects dangling, self-connected, duplicate and out-of-range circuit ports', () => {
  const base = sampleCircuit();
  assert.throws(() => normalizeOcuNovaProject(project([], { circuit: {
    ...base, connections: [{ a: 'missing', ap: 0, b: 'sensor-1', bp: 0 }]
  } })), /existing component IDs/);
  assert.throws(() => normalizeOcuNovaProject(project([], { circuit: {
    ...base, connections: [{ a: 'board-1', ap: 0, b: 'board-1', bp: 1 }]
  } })), /different components/);
  assert.throws(() => normalizeOcuNovaProject(project([], { circuit: {
    ...base, connections: [{ a: 'board-1', ap: 4, b: 'sensor-1', bp: 0 }]
  } })), /invalid port index/);
  assert.throws(() => normalizeOcuNovaProject(project([], { circuit: {
    ...base, connections: [
      { a: 'board-1', ap: 0, b: 'sensor-1', bp: 0 },
      { a: 'sensor-1', ap: 0, b: 'board-1', bp: 0 }
    ]
  } })), /Duplicate circuit connections/);
});

test('enforces circuit component and connection limits', () => {
  const components = Array.from({ length: 101 }, (_, i) => ({
    id: 'led-' + i, type: 'led', x: 0.1, y: 0.1
  }));
  assert.throws(() => normalizeOcuNovaProject(project([], { circuit: { components } })), /at most 100 components/);
  const manyConnections = Array.from({ length: 251 }, (_, i) => ({
    a: 'board-1', ap: 0, b: 'sensor-1', bp: 0, color: '#00d8ff', marker: i
  }));
  assert.throws(() => normalizeOcuNovaProject(project([], { circuit: {
    components: sampleCircuit().components, connections: manyConnections
  } })), /at most 250 connections/);
});
