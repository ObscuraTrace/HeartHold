class AIModule {
  constructor(id) {
    this.id = id;
    this.metrics = {};
    this.history = [];
  }
  updateMetrics(newData) {
    Object.assign(this.metrics, newData);
    this.history.push({...newData, timestamp: Date.now()});
  }
}
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
const modules = generateBatchModules(20);
const summaries = modules.map(mod => ({
  id: mod.id,
  trust: mod.calculateTrustIndex(),
  status: mod.predictStatus(),
}));
const unstable = summaries.filter(s => s.status === 'Unstable');
const avgTrust = average(summaries.map(s => parseFloat(s.trust)));
const topModule = summaries.reduce((best, curr) =>
  parseFloat(curr.trust) > parseFloat(best.trust) ? curr : best
);
function transformForUI(summary) {
  return { label: `${summary.id} (${summary.status})`, value: summary.trust };
}

const uniqueIDs = new Set(modules.map(m => m.id));
const trustValues = Object.values(trustBuckets).flat();
const trustRange = {
  min: Math.min(...trustValues.map(v => parseFloat(v))),
  max: Math.max(...trustValues.map(v => parseFloat(v)))
};
function normalize(value, min, max) {
  return (value - min) / (max - min);
}
const normalizedTrust = trustValues.map(v => normalize(parseFloat(v), trustRange.min, trustRange.max));
function labelStatus(trust) {
  return trust > 0.85 ? 'Green' : trust > 0.6 ? 'Yellow' : 'Red';
}

const formatted = summaries.map(formatOutput);
const stableCount = summaries.filter(s => s.status === 'Stable').length;
const optimalCount = summaries.filter(s => s.status === 'Optimal').length;
const instabilityRatio = unstable.length / modules.length;
const lastHistoryItem = modules[0].fetchSnapshot(1)[0];
const highLatencyModules = modules.filter(m => m.metrics.latency > 150);
const moduleTrustPairs = modules.map(m => [m.id, m.calculateTrustIndex()]);
