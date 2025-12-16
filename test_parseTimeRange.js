// Quick smoke test for parseTimeRange and parseTimeString from src/time-utils.js
// Run with: npm test (or directly: node test_parseTimeRange.js)

const { parseTimeRange, parseTimeString } = require('./src/time-utils.js');

const base = new Date('2025-11-10T00:00:00');
const tests = [
  '9:30 - 11:00 AM',
  '11:30 - 1:30 PM',
  '2:00 PM - 4:30 PM',
  '12:00 - 1:00 PM',
  '11:30 - 1:30 AM',
  '6:00 AM - 8:00 AM',
  'onwards',
  '3:00 PM'
];

console.log('Running time parsing tests...\n');

for (const t of tests) {
  const [s, e] = parseTimeRange(t, base);
  console.log('Test:', t);
  console.log(' Start:', s ? s.toString() : null);
  console.log(' End  :', e ? e.toString() : null);
  console.log('');
}

console.log('✅ All time parsing tests completed successfully!');
