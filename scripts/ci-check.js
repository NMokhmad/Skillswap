import { access } from 'fs/promises';
import { constants } from 'fs';

const requiredFiles = [
  'data/create_db.sql',
  'data/migration_v2.sql',
  'data/migration_v3.sql',
];

async function fileExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function run() {
  const missingFiles = [];

  for (const file of requiredFiles) {
    const exists = await fileExists(file);
    if (!exists) {
      missingFiles.push(file);
    }
  }

  if (missingFiles.length > 0) {
    console.error('CI migration check failed. Missing files:');
    missingFiles.forEach((file) => {
      console.error(`- ${file}`);
    });
    process.exit(1);
  }

  console.log('CI migration check passed.');
}

run();
