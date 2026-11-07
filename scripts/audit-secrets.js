#!/usr/bin/env node
/**
 * Secret Key Leak Auditor for TransitWake Client Bundle
 * Scans src/ and scripts/ for sensitive production keys and secrets.
 */
const fs = require('fs');
const path = require('path');

const SECRET_PATTERNS = [
  /service_role/i,
  /supabase_service/i,
  /sk_live_[0-9a-zA-Z]{24}/,
  /rzp_live_[0-9a-zA-Z]{14}/,
  /-----BEGIN (RSA |EC )?PRIVATE KEY-----/,
];

const SCAN_DIRS = ['src', 'scripts'];
let violations = 0;

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
      scanDir(fullPath);
    } else if (entry.isFile() && /\.(ts|tsx|js|json)$/.test(entry.name)) {
      if (entry.name === 'audit-secrets.js') continue;
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.test(content)) {
          console.error(`[CRITICAL] Potential secret leak in ${fullPath}: matches ${pattern}`);
          violations++;
        }
      }
    }
  }
}

SCAN_DIRS.forEach(scanDir);
if (violations > 0) {
  console.error(`\nFAILED: Found ${violations} secret key violation(s).`);
  process.exit(1);
} else {
  console.log('SUCCESS: Zero hardcoded secrets detected in client source code.');
  process.exit(0);
}
