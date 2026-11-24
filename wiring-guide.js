// Label-level wiring advice for Circuit Forge.
// This is deliberately conservative: it does not build electrical nets or simulate current.
const PIN_GUIDE = Object.freeze({
  arduino: [
    { label: "5V", role: "positive-rail" },
    { label: "GND", role: "ground" },
    { label: "D2", role: "signal" },
    { label: "D3", role: "signal" }
  ],
  ultrasonic: [
    { label: "VCC", role: "low-voltage-input" },
    { label: "TRIG", role: "signal" },
    { label: "ECHO", role: "signal" },
    { label: "GND", role: "ground" }
  ],
  servo: [
    { label: "VCC", role: "low-voltage-input" },
    { label: "SIG", role: "signal" },
    { label: "GND", role: "ground" }
  ],
  breadboard: [
    { label: "+", role: "positive-rail" },
    { label: "−", role: "ground-rail" },
    { label: "A", role: "passive" },
    { label: "B", role: "passive" }
  ],
  battery: [
    { label: "+", role: "source-positive" },
    { label: "−", role: "ground" }
  ],
  led: [
    { label: "A", role: "unclassified" },
    { label: "+", role: "unclassified" },
    { label: "−", role: "unclassified" }
  ],
  resistor: [
    { label: "A", role: "passive" },
    { label: "B", role: "passive" }
  ]
});

const GROUND_ROLES = new Set(["ground", "ground-rail"]);
const POSITIVE_ROLES = new Set(["positive-rail", "source-positive"]);
const LOW_VOLTAGE_ROLES = new Set(["positive-rail", "low-voltage-input", "signal"]);

function endpoint(component, pinIndex) {
  if (!component) return { known: false, role: "unknown", label: "Unknown component" };
  const type = String(component.type || "").toLowerCase();
  const pin = Number.isInteger(pinIndex) && pinIndex >= 0 ? PIN_GUIDE[type]?.[pinIndex] : null;
  const role = pin?.role ?? "unknown";
  return {
    known: Boolean(pin) && role !== "passive" && role !== "unclassified",
    componentId: String(component.id ?? ""),
    type,
    pin: pin?.label ?? ("Port " + (Number.isInteger(pinIndex) && pinIndex >= 0 ? pinIndex + 1 : "?")),
    role
  };
}

function finding(severity, title, message, index, a, b) {
  return {
    severity,
    title,
    message,
    connectionIndex: index,
    componentIds: [a.componentId, b.componentId]
  };
}

export function analyzeCircuitWiring(circuit) {
  const components = Array.isArray(circuit?.components) ? circuit.components : [];
  const connections = Array.isArray(circuit?.connections) ? circuit.connections : [];
  const byId = new Map(components.map(component => [String(component?.id ?? ""), component]));
  const types = new Set(components.map(component => String(component?.type || "").toLowerCase()));
  const findings = [];
  let unclassifiedConnections = 0;

  connections.forEach((connection, index) => {
    const a = endpoint(byId.get(String(connection?.a ?? "")), connection?.ap);
    const b = endpoint(byId.get(String(connection?.b ?? "")), connection?.bp);
    if (!a.known || !b.known) unclassifiedConnections += 1;

    const hasSourceAndGround =
      (a.role === "source-positive" && GROUND_ROLES.has(b.role)) ||
      (b.role === "source-positive" && GROUND_ROLES.has(a.role));
    const hasRailAndGround =
      (POSITIVE_ROLES.has(a.role) && GROUND_ROLES.has(b.role)) ||
      (POSITIVE_ROLES.has(b.role) && GROUND_ROLES.has(a.role));

    if (hasSourceAndGround || hasRailAndGround) {
      findings.push(finding(
        "danger",
        "Possible direct power-to-ground short",
        "These labels suggest a supply-positive point is wired directly to ground. Do not power this layout until the connection has been checked against the real board and schematic.",
        index,
        a,
        b
      ));
      return;
    }

    const sourceToLowVoltage =
      (a.role === "source-positive" && LOW_VOLTAGE_ROLES.has(b.role)) ||
      (b.role === "source-positive" && LOW_VOLTAGE_ROLES.has(a.role));
    if (sourceToLowVoltage) {
      findings.push(finding(
        "danger",
        "Possible 7.4 V battery overvoltage",
        "The palette battery is labelled 7.4 V nominal. A direct path to a 5 V rail, logic signal or low-voltage input may exceed its rating. Use a correctly rated regulator where required and verify the exact module documentation before powering.",
        index,
        a,
        b
      ));
      return;
    }

    const twoSources =
      (a.role === "source-positive" && b.role === "source-positive");
    if (twoSources) {
      findings.push(finding(
        "warning",
        "Two battery-positive terminals are joined",
        "Do not parallel separate battery packs unless their chemistry, voltage, protection and current-sharing arrangement are specifically designed for it.",
        index,
        a,
        b
      ));
      return;
    }

    const railToSignal =
      (a.role === "positive-rail" && b.role === "signal") ||
      (b.role === "positive-rail" && a.role === "signal");
    if (railToSignal) {
      findings.push(finding(
        "warning",
        "Power rail is connected directly to a signal pin",
        "This may hold the signal HIGH and can conflict with code that configures the pin as an output. Confirm the intended pin mode and board limits.",
        index,
        a,
        b
      ));
      return;
    }

  });

  const notes = [];
  if (types.has("battery")) {
    notes.push({
      title: "Battery rating",
      message: "The palette's 7.4 V value is nominal; an actual pack's voltage varies with its chemistry and charge state. Never assume it is a 5 V source."
    });
  }
  if (types.has("led")) {
    notes.push({
      title: "LED current limiting",
      message: "An LED normally needs a suitable series current-limiting resistor. This canvas cannot confirm that a resistor is actually in series."
    });
  }
  if (types.has("servo")) {
    notes.push({
      title: "Servo power",
      message: "A servo can draw more current than a controller board's 5 V output can provide. Check stall current and supply limits; a separate regulated supply may be needed, with a shared ground reference."
    });
  }
  if (types.has("ultrasonic")) {
    notes.push({
      title: "HC-SR04 logic level",
      message: "The HC-SR04 ECHO signal is commonly around 5 V. Check the target controller's input tolerance and use level shifting if its inputs are not 5 V tolerant."
    });
  }
  if (types.has("breadboard")) {
    notes.push({
      title: "Breadboard continuity",
      message: "Internal rail and terminal-strip connections are not modelled. A drawn wire to a breadboard port does not establish or verify the board's real internal connections."
    });
  }
  if (types.has("resistor")) {
    notes.push({
      title: "Resistor values",
      message: "Resistance values and series/parallel placement are not represented, so current, power and voltage-drop calculations are unavailable."
    });
  }

  return {
    reviewedConnections: connections.length,
    unclassifiedConnections,
    findings,
    notes,
    summary: {
      danger: findings.filter(item => item.severity === "danger").length,
      warning: findings.filter(item => item.severity === "warning").length
    }
  };
}
