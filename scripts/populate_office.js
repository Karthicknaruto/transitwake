const { spawnSync } = require('child_process');
const path = require('path');

const dbPath = path.resolve(__dirname, '../.agent-office/office.sqlite');

function runOfficeCmd(cmd, jsonPayload) {
  const jsonStr = JSON.stringify(jsonPayload);
  const args = [
    'agent-office',
    '--sqlite',
    dbPath,
    cmd,
    '--json',
    jsonStr,
  ];

  const res = spawnSync('npx.cmd', args, {
    encoding: 'utf8',
    shell: false,
  });

  if (res.status === 0) {
    console.log(`[SUCCESS] ${cmd}:`, res.stdout.trim());
  } else {
    console.warn(`[WARN] ${cmd}:`, res.stderr || res.stdout);
  }
}

console.log('--- Registering Coworkers in Agent Office ---');
const coworkers = [
  { name: 'GarryTanAI', coworkerType: 'manager' },
  { name: 'StaffArchitect', coworkerType: 'developer' },
  { name: 'TDDLead', coworkerType: 'developer' },
  { name: 'SecurityOfficer', coworkerType: 'reviewer' },
  { name: 'UXDesigner', coworkerType: 'designer' },
  { name: 'ReleaseEngineer', coworkerType: 'developer' },
];

for (const c of coworkers) {
  runOfficeCmd('create-coworker', c);
}

console.log('--- Adding Tasks in Agent Office ---');
const tasks = [
  {
    title: 'AdMob Monetization and Emergency Alarm Separation',
    description: 'Enforce strict ad suppression during active alarm and snooze states. Keep banners unmounted and popup interstitials throttled.',
    assignee: 'StaffArchitect',
    column: 'done'
  },
  {
    title: 'WCAG 2.2 Level AAA Color Contrast and 44dp Touch Targets',
    description: 'Redesign AlarmTriggerModal to Cockpit Dark HUD (#0F172A / #FEF08A / #FFFFFF), add hitSlop, and enforce 44-56dp touch targets.',
    assignee: 'UXDesigner',
    column: 'done'
  },
  {
    title: 'Unit Test Coverage 80%+ on All Core Services',
    description: 'Achieve 56/56 passing tests across 7 test suites with 92% statement coverage across alarmManager, locationService, consentStore, geo, and adService.',
    assignee: 'TDDLead',
    column: 'done'
  },
  {
    title: '20/20 Regulatory and Store Compliance Verification',
    description: 'RAM-only GPS coordinates, 1-tap local data wipe, COPPA 13+ consent, zero fake ratings, and complete business disclosures.',
    assignee: 'SecurityOfficer',
    column: 'done'
  },
  {
    title: 'Carto Voyager Street Tiles Live Map Integration',
    description: 'Render interactive map tiles, geofence radius circle, stop pin, and GPS position marker.',
    assignee: 'StaffArchitect',
    column: 'done'
  },
  {
    title: 'Expo Mobile and Web Bundler Production Export',
    description: 'Compile single-page React Native web app and 3D Virtual Agent Office into dist/ directory.',
    assignee: 'ReleaseEngineer',
    column: 'done'
  },
  {
    title: 'Live 3D Virtual Office Work Environment',
    description: 'Interactive Three.js 3D workplace with real-time station metrics, Garry Tan terminal stream, and Floor 1 TransitWake command desk.',
    assignee: 'GarryTanAI',
    column: 'done'
  }
];

for (const t of tasks) {
  runOfficeCmd('add-task', t);
}

console.log('--- Finished Populating Agent Office ---');
