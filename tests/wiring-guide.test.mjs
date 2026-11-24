import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeCircuitWiring } from '../wiring-guide.js';

const part = (id, type) => ({ id, type });
const wire = (a, ap, b, bp) => ({ a, ap, b, bp });
const circuit = (components, connections) => ({ components, connections });

test('flags an Arduino 5V rail connected directly to ground', () => {
  const report = analyzeCircuitWiring(circuit(
    [part('uno', 'arduino'), part('board', 'breadboard')],
    [wire('uno', 0, 'board', 1)]
  ));
  assert.equal(report.summary.danger, 1);
  assert.match(report.findings[0].title, /power-to-ground short/);
});

test('flags a breadboard positive rail connected to its negative rail', () => {
  const report = analyzeCircuitWiring(circuit(
    [part('rails', 'breadboard')],
    [wire('rails', 0, 'rails', 1)]
  ));
  assert.equal(report.summary.danger, 1);
});

test('flags the nominal 7.4 V battery connected to a low-voltage sensor input', () => {
  const report = analyzeCircuitWiring(circuit(
    [part('pack', 'battery'), part('range', 'ultrasonic')],
    [wire('pack', 0, 'range', 0)]
  ));
  assert.equal(report.summary.danger, 1);
  assert.match(report.findings[0].message, /regulator/);
});

test('flags the nominal 7.4 V battery connected to an Arduino signal pin', () => {
  const report = analyzeCircuitWiring(circuit(
    [part('pack', 'battery'), part('uno', 'arduino')],
    [wire('pack', 0, 'uno', 2)]
  ));
  assert.equal(report.summary.danger, 1);
  assert.match(report.findings[0].title, /overvoltage/);
});

test('does not flag a labelled 5 V rail feeding a low-voltage sensor input', () => {
  const report = analyzeCircuitWiring(circuit(
    [part('uno', 'arduino'), part('range', 'ultrasonic')],
    [wire('uno', 0, 'range', 0)]
  ));
  assert.equal(report.findings.length, 0);
});

test('warns when a fixed 5 V rail is joined directly to a signal pin', () => {
  const report = analyzeCircuitWiring(circuit(
    [part('uno', 'arduino')],
    [wire('uno', 0, 'uno', 2)]
  ));
  assert.equal(report.summary.warning, 1);
  assert.match(report.findings[0].message, /pin mode/);
});

test('does not classify a shared ground reference as a fault', () => {
  const report = analyzeCircuitWiring(circuit(
    [part('uno', 'arduino'), part('range', 'ultrasonic')],
    [wire('uno', 1, 'range', 3)]
  ));
  assert.equal(report.findings.length, 0);
});

test('adds context notes for LED, servo, ultrasonic, battery, breadboard and resistor parts', () => {
  const report = analyzeCircuitWiring(circuit([
    part('led', 'led'),
    part('servo', 'servo'),
    part('range', 'ultrasonic'),
    part('pack', 'battery'),
    part('board', 'breadboard'),
    part('r', 'resistor')
  ], []));
  const titles = report.notes.map(note => note.title);
  assert.equal(titles.length, 6);
  assert.ok(titles.includes('LED current limiting'));
  assert.ok(titles.includes('Servo power'));
  assert.ok(titles.includes('HC-SR04 logic level'));
  assert.ok(titles.includes('Battery rating'));
  assert.ok(titles.includes('Breadboard continuity'));
  assert.ok(titles.includes('Resistor values'));
});

test('returns an empty advisory report for an empty board without declaring it safe', () => {
  const report = analyzeCircuitWiring({ components: [], connections: [] });
  assert.equal(report.reviewedConnections, 0);
  assert.deepEqual(report.findings, []);
  assert.deepEqual(report.notes, []);
  assert.equal(report.summary.danger, 0);
  assert.equal(report.summary.warning, 0);
});

test('counts unknown and passive endpoints for manual review instead of treating them as checked', () => {
  const report = analyzeCircuitWiring(circuit(
    [part('uno', 'arduino'), part('r', 'resistor')],
    [wire('uno', 99, 'uno', 2), wire('uno', 2, 'r', 0)]
  ));
  assert.equal(report.unclassifiedConnections, 2);
  assert.equal(report.reviewedConnections, 2);
});
