export const OCU_NOVA_FORMAT = 'ocunova-project-v1';

const SUPPORTED_TYPES = new Set([
  'box', 'sphere', 'cylinder', 'cone', 'wheel', 'sensor', 'board', 'base'
]);
const CIRCUIT_PIN_COUNTS = Object.freeze({
  arduino: 4,
  ultrasonic: 4,
  servo: 3,
  led: 3,
  resistor: 2,
  breadboard: 4,
  battery: 2
});
const MAX_OBJECTS = 100;
const MAX_CIRCUIT_COMPONENTS = 100;
const MAX_CIRCUIT_CONNECTIONS = 250;

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function readVector(value, fallback, label, positive = false) {
  const source = value === undefined || value === null ? fallback : value;
  if (!Array.isArray(source) || source.length !== 3) {
    throw new Error(label + ' must contain exactly three numbers.');
  }
  const vector = source.map(number => {
    if (typeof number !== 'number' || !Number.isFinite(number)) {
      throw new Error(label + ' must contain finite numeric values.');
    }
    return number;
  });
  if (positive && vector.some(number => number <= 0 || number > 100)) {
    throw new Error(label + ' values must be greater than 0 and no more than 100.');
  }
  if (!positive && vector.some(number => Math.abs(number) > 1000)) {
    throw new Error(label + ' values must be within -1000 and 1000.');
  }
  return vector;
}

function cleanId(value, fallback, label) {
  const id = String(value ?? fallback).trim().slice(0, 80);
  if (!id) throw new Error(label + ' IDs must be present and unique.');
  return id;
}

function normalizeCircuit(input, legacyPixels = false) {
  if (!isRecord(input)) throw new Error('The circuit section must be an object.');
  if (!Array.isArray(input.components)) {
    throw new Error('The circuit section must contain a components list.');
  }
  if (input.components.length > MAX_CIRCUIT_COMPONENTS) {
    throw new Error('A circuit can contain at most ' + MAX_CIRCUIT_COMPONENTS + ' components.');
  }

  const ids = new Set();
  const components = input.components.map((raw, index) => {
    if (!isRecord(raw)) throw new Error('Circuit component ' + (index + 1) + ' is not valid.');
    const type = String(raw.type || '').toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(CIRCUIT_PIN_COUNTS, type)) {
      throw new Error('Circuit component ' + (index + 1) + ' uses an unsupported type: ' + type + '.');
    }
    const id = cleanId(raw.id, 'circuit-' + (index + 1), 'Circuit component');
    if (ids.has(id)) throw new Error('Circuit component IDs must be present and unique.');
    ids.add(id);

    let x = raw.x === undefined ? 0.05 + (index % 4) * 0.2 : raw.x;
    let y = raw.y === undefined ? 0.12 + Math.floor(index / 4) * 0.22 : raw.y;
    if (typeof x !== 'number' || !Number.isFinite(x) || typeof y !== 'number' || !Number.isFinite(y)) {
      throw new Error('Circuit component positions must be finite numbers.');
    }
    if (legacyPixels) {
      if (x < 0 || x > 10000 || y < 0 || y > 10000) {
        throw new Error('Legacy circuit positions are outside the supported range.');
      }
      x = Math.max(0, Math.min(1, x / 720));
      y = Math.max(0, Math.min(1, y / 420));
    } else if (x < 0 || x > 1 || y < 0 || y > 1) {
      throw new Error('Circuit component positions must be between 0 and 1.');
    }
    return { id, type, x, y };
  });

  const connectionsInput = input.connections === undefined ? [] : input.connections;
  if (!Array.isArray(connectionsInput)) {
    throw new Error('Circuit connections must be a list.');
  }
  if (connectionsInput.length > MAX_CIRCUIT_CONNECTIONS) {
    throw new Error('A circuit can contain at most ' + MAX_CIRCUIT_CONNECTIONS + ' connections.');
  }

  const connectionKeys = new Set();
  const connections = connectionsInput.map((raw, index) => {
    if (!isRecord(raw)) throw new Error('Circuit connection ' + (index + 1) + ' is not valid.');
    const a = String(raw.a ?? '');
    const b = String(raw.b ?? '');
    const ap = raw.ap;
    const bp = raw.bp;
    if (!ids.has(a) || !ids.has(b)) {
      throw new Error('Circuit connections must refer to existing component IDs.');
    }
    if (a === b) throw new Error('A circuit connection must join two different components.');
    if (!Number.isInteger(ap) || ap < 0 || ap >= CIRCUIT_PIN_COUNTS[components.find(item => item.id === a).type] ||
        !Number.isInteger(bp) || bp < 0 || bp >= CIRCUIT_PIN_COUNTS[components.find(item => item.id === b).type]) {
      throw new Error('Circuit connections contain an invalid port index.');
    }
    const endpoints = [[a, ap], [b, bp]].sort((left, right) =>
      left[0] === right[0] ? left[1] - right[1] : left[0].localeCompare(right[0])
    );
    const key = JSON.stringify(endpoints);
    if (connectionKeys.has(key)) throw new Error('Duplicate circuit connections are not allowed.');
    connectionKeys.add(key);
    const color = raw.color === undefined ? '#00d8ff' : String(raw.color);
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
      throw new Error('Circuit connection ' + (index + 1) + ' has an invalid color.');
    }
    return { a, ap, b, bp, color: color.toLowerCase() };
  });

  return { version: 1, components, connections };
}

export function normalizeOcuNovaProject(input) {
  if (!isRecord(input)) throw new Error('The selected file is not a valid OcuNova project object.');
  const appName = typeof input.app === 'string' ? input.app.toLowerCase() : '';
  const isSupportedFormat = input.format === OCU_NOVA_FORMAT || input.format === 'ocunova-scene-v1';
  const isLegacyCircuitExport = appName.includes('ocunova circuit forge') && Array.isArray(input.components);
  const isRecognisedLegacyExport = appName.includes('ocunova');
  if (!isSupportedFormat && !isRecognisedLegacyExport) {
    throw new Error('Unsupported project format. Choose an OcuNova project JSON file.');
  }

  const rawObjects = Array.isArray(input.objects) ? input.objects : (isLegacyCircuitExport ? [] : null);
  if (!rawObjects) throw new Error('This project does not contain an objects list.');
  if (rawObjects.length > MAX_OBJECTS) {
    throw new Error('A project can contain at most ' + MAX_OBJECTS + ' 3D objects.');
  }

  const ids = new Set();
  const objects = rawObjects.map((raw, index) => {
    if (!isRecord(raw)) throw new Error('Object ' + (index + 1) + ' is not valid.');
    const type = String(raw.type || 'box').toLowerCase();
    if (!SUPPORTED_TYPES.has(type)) {
      throw new Error('Object ' + (index + 1) + ' uses an unsupported shape: ' + type + '.');
    }
    const id = cleanId(raw.id, 'object-' + (index + 1), 'Object');
    if (ids.has(id)) throw new Error('Object IDs must be present and unique.');
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
  const result = {
    application: 'OcuNova',
    format: OCU_NOVA_FORMAT,
    project: { name: projectName || 'Untitled project' },
    objects
  };

  const circuitInput = input.circuit !== undefined
    ? input.circuit
    : (isLegacyCircuitExport ? { components: input.components, connections: input.connections } : undefined);
  if (circuitInput !== undefined && circuitInput !== null) {
    result.circuit = normalizeCircuit(circuitInput, isLegacyCircuitExport);
  }
  return result;
}

export function createOcuNovaProject(objects, projectName = 'Untitled project', circuit = undefined) {
  const input = {
    application: 'OcuNova',
    format: OCU_NOVA_FORMAT,
    project: { name: projectName },
    objects
  };
  if (circuit !== undefined && circuit !== null) input.circuit = circuit;
  return normalizeOcuNovaProject(input);
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
