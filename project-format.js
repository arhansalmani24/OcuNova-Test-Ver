export const OCU_NOVA_FORMAT = 'ocunova-project-v1';

const SUPPORTED_TYPES = new Set([
  'box', 'sphere', 'cylinder', 'cone', 'wheel', 'sensor', 'board', 'base'
]);
const MAX_OBJECTS = 100;

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function readVector(value, fallback, label, positive = false) {
  const source = value === undefined || value === null ? fallback : value;
  if (!Array.isArray(source) || source.length !== 3) {
    throw new Error(label + ' must contain exactly three numbers.');
  }
  const vector = source.map(Number);
  if (!vector.every(Number.isFinite)) {
    throw new Error(label + ' contains an invalid number.');
  }
  if (positive && vector.some(number => number <= 0 || number > 100)) {
    throw new Error(label + ' values must be greater than 0 and no more than 100.');
  }
  if (!positive && vector.some(number => Math.abs(number) > 1000)) {
    throw new Error(label + ' values must be within -1000 and 1000.');
  }
  return vector;
}

export function normalizeOcuNovaProject(input) {
  if (!isRecord(input)) throw new Error('The selected file is not a valid OcuNova project object.');
  const isSupportedFormat = input.format === OCU_NOVA_FORMAT || input.format === 'ocunova-scene-v1';
  const isRecognisedLegacyExport = typeof input.app === 'string' && input.app.toLowerCase().includes('ocunova');
  if (!isSupportedFormat && !isRecognisedLegacyExport) {
    throw new Error('Unsupported project format. Choose an OcuNova project JSON file.');
  }
  if (!Array.isArray(input.objects)) throw new Error('This project does not contain an objects list.');
  if (input.objects.length > MAX_OBJECTS) {
    throw new Error('A project can contain at most ' + MAX_OBJECTS + ' 3D objects.');
  }

  const ids = new Set();
  const objects = input.objects.map((raw, index) => {
    if (!isRecord(raw)) throw new Error('Object ' + (index + 1) + ' is not valid.');
    const type = String(raw.type || 'box').toLowerCase();
    if (!SUPPORTED_TYPES.has(type)) {
      throw new Error('Object ' + (index + 1) + ' uses an unsupported shape: ' + type + '.');
    }
    const id = String(raw.id ?? ('object-' + (index + 1))).trim().slice(0, 80);
    if (!id || ids.has(id)) throw new Error('Object IDs must be present and unique.');
    ids.add(id);

    const name = String(raw.name || (type[0].toUpperCase() + type.slice(1) + ' ' + (index + 1)))
      .replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 80) || ('Object ' + (index + 1));
    const color = raw.color === undefined ? '#2588e8' : String(raw.color);
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
      throw new Error('Object ' + (index + 1) + ' has an invalid color. Use a six-digit hex color.');
    }

    return {
      id,
      name,
      type,
      position: readVector(raw.position, [0, 0.6, 0], 'Object ' + (index + 1) + ' position'),
      rotation: readVector(raw.rotation, [0, 0, 0], 'Object ' + (index + 1) + ' rotation'),
      scale: readVector(raw.scale, [1, 1, 1], 'Object ' + (index + 1) + ' scale', true),
      color: color.toLowerCase()
    };
  });

  const projectName = isRecord(input.project) && typeof input.project.name === 'string'
    ? input.project.name.replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 80)
    : 'Untitled project';

  return {
    application: 'OcuNova',
    format: OCU_NOVA_FORMAT,
    project: { name: projectName || 'Untitled project' },
    objects
  };
}

export function createOcuNovaProject(objects, projectName = 'Untitled project') {
  return normalizeOcuNovaProject({
    application: 'OcuNova',
    format: OCU_NOVA_FORMAT,
    project: { name: projectName },
    objects
  });
}

export function downloadOcuNovaProject(project, filename = 'ocunova-project.json') {
  const cleanProject = normalizeOcuNovaProject(project);
  const blob = new Blob([JSON.stringify(cleanProject, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
