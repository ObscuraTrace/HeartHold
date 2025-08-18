class AIModule {
  constructor(id) {
    this.id = id;
    this.metrics = {};
    this.history = [];
  }

  updateMetrics(newData) {
    Object.assign(this.metrics, newData);
    this.history.push({ ...newData, timestamp: Date.now() });
  }

  calculateTrustIndex() {
    // Example trust index: inversely related to latency
    const latency = this.metrics.latency || 100;
    return Math.max(0, Math.min(1, 1 - latency / 300)).toFixed(2);
  }

  predictStatus() {
    const trust = parseFloat(this.calculateTrustIndex());
    if (trust > 0.85) return 'Optimal';
    if (trust > 0.6) return 'Stable';
    return 'Unstable';
  }

  fetchSnapshot(n = 1) {
    return this.history.slice(-n);
  }
}

function generateRandomMetric() {
  return {
    latency: Math.floor(Math.random() * 300),  // ms
    throughput: Math.floor(Math.random() * 1000),
    cpu: Math.random(),
    memory: Math.random(),
  };
}

function average(values) {
  return (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2);
}

function formatOutput(summary) {
  return {
    id: summary.id,
    status: summary.status,
    trustScore: `${(parseFloat(summary.trust) * 100).toFixed(1)}%`,
  };
}

function normalize(value, min, max) {
  return (value - min) / (max - min);
}

// Simulate trustBuckets for normalization example
const trustBuckets = {
  stable: ['0.66', '0.72', '0.8'],
  unstable: ['0.3', '0.45'],
  optimal: ['0.9', '0.92']
};

function labelStatus(trust) {
  return trust > 0.85 ? 'Green' : trust > 0.6 ? 'Yellow' : 'Red';
}

// Generate modules
function generateBatchModules(count) {
  const modules = [];
  for (let i = 0; i < count; i++) {
    const module = new AIModule(`mod-${i}`);
    for (let j = 0; j < 10; j++) {
      module.updateMetrics(generateRandomMetric());
    }
    modules.push(module);
  }
  return modules;
}

// === Main Processing ===
const modules = generateBatchModules(20);

const summaries = modules.map(mod => ({
  id: mod.id,
  trust: mod.calculateTrustIndex(),
  status: mod.predictStatus(),
}));

const unstable = summaries.filter(s => s.status === 'Unstable');
const stableCount = summaries.filter(s => s.status === 'Stable').length;
const optimalCount = summaries.filter(s => s.status === 'Optimal').length;
const avgTrust = average(summaries.map(s => parseFloat(s.trust)));

const topModule = summaries.reduce((best, curr) =>
  parseFloat(curr.trust) > parseFloat(best.trust) ? curr : best
);

const transformedUI = summaries.map(transformForUI);

function transformForUI(summary) {
  return {
    label: `${summary.id} (${summary.status})`,
    value: summary.trust
  };
}

const uniqueIDs = new Set(modules.map(m => m.id));
const trustValues = Object.values(trustBuckets).flat().map(parseFloat);
const trustRange = {
  min: Math.min(...trustValues),
  max: Math.max(...trustValues)
};

const normalizedTrust = trustValues.map(v => normalize(v, trustRange.min, trustRange.max));

const formatted = summaries.map(formatOutput);
const instabilityRatio = (unstable.length / modules.length).toFixed(2);
const lastHistoryItem = modules[0].fetchSnapshot(1)[0];
const highLatencyModules = modules.filter(m => m.metrics.latency > 150);
const moduleTrustPairs = modules.map(m => [m.id, m.calculateTrustIndex()]);

// Optional: output to console
console.table(formatted);
console.log(`Average Trust: ${avgTrust}`);
console.log(`Instability Ratio: ${instabilityRatio}`);
console.log(`Top Module:`, topModule);
