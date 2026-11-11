// Standalone Database Seeder & Migration CLI Utility
// Jurisdiction: FDRE Civil Service Commission & Bole Sub-City Public Service
import { db, initDatabase, seedInitialData } from './db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runSeeder() {
  const isReset = process.argv.includes('--reset');

  console.log('🏛️  Charter Mark KPI Database Seeder');
  console.log('====================================');
  console.log(`Mode: ${isReset ? 'RESET & RE-SEED' : 'SEED (SAFE INSERT)'}`);

  if (isReset) {
    console.log('⚠️  Reset flag detected. Dropping existing tables...');
    const dropTables = [
      'service_sessions',
      'escalation_alerts',
      'semester_appraisals',
      'charter_services',
      'officers',
      'offices',
      'users'
    ];
    for (const table of dropTables) {
      try {
        db.exec(`DROP TABLE IF EXISTS ${table}`);
      } catch (e: any) {
        console.warn(`  - Note: could not drop ${table}: ${e.message}`);
      }
    }
    console.log('  ✓ Tables dropped cleanly.');
  }

  console.log('📦 Initializing schema...');
  initDatabase();
  console.log('  ✓ Schema initialized with WAL pragma.');

  console.log('🌱 Populating sovereign seed records...');
  seedInitialData();

  // Print Summary Stats
  const users: any = db.prepare('SELECT count(*) as count FROM users').get();
  const offices: any = db.prepare('SELECT count(*) as count FROM offices').get();
  const officers: any = db.prepare('SELECT count(*) as count FROM officers').get();
  const services: any = db.prepare('SELECT count(*) as count FROM charter_services').get();
  const sessions: any = db.prepare('SELECT count(*) as count FROM service_sessions').get();
  const appraisals: any = db.prepare('SELECT count(*) as count FROM semester_appraisals').get();
  const alerts: any = db.prepare('SELECT count(*) as count FROM escalation_alerts').get();

  console.log('\n📊 Database State Summary:');
  console.log(`  - Users: ${users.count}`);
  console.log(`  - Offices: ${offices.count}`);
  console.log(`  - Desk Officers: ${officers.count}`);
  console.log(`  - Charter Services: ${services.count}`);
  console.log(`  - Service Sessions: ${sessions.count}`);
  console.log(`  - Semester Appraisals: ${appraisals.count}`);
  console.log(`  - Escalation Alerts: ${alerts.count}`);
  console.log('\n✅ Database seeding completed successfully!\n');
}

runSeeder();
