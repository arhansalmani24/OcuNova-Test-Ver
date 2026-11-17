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
