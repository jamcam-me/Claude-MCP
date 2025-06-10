import { createWriteStream } from 'fs';
const testOutput = createWriteStream('./test-log.log', { flags: 'a' });
testOutput.write('Test log entry: ' + new Date().toISOString() + '\n');
testOutput.end();
console.error('Test log script finished.');