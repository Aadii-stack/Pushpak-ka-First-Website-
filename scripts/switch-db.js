const fs = require('fs');
const path = require('path');

const target = (process.argv[2] || '').toLowerCase();
const prismaDir = path.join(__dirname, '..', 'prisma');
const mainSchema = path.join(prismaDir, 'schema.prisma');
const pgSchema = path.join(prismaDir, 'schema.postgresql.prisma');

if (target === 'postgres' || target === 'postgresql') {
  if (!fs.existsSync(pgSchema)) {
    console.error('schema.postgresql.prisma not found!');
    process.exit(1);
  }
  const content = fs.readFileSync(pgSchema, 'utf8');
  fs.writeFileSync(mainSchema, content, 'utf8');
  console.log('✅ Active schema switched to PostgreSQL (schema.prisma).');
  console.log('Next: set DATABASE_URL="postgresql://user:pass@host:5432/dbname" and run `npx prisma db push` or `npx prisma migrate deploy`.');
} else if (target === 'sqlite') {
  let content = fs.readFileSync(mainSchema, 'utf8');
  content = content.replace('provider = "postgresql"', 'provider = "sqlite"');
  fs.writeFileSync(mainSchema, content, 'utf8');
  console.log('✅ Active schema switched to SQLite (schema.prisma).');
  console.log('DATABASE_URL="file:./dev.db"');
} else {
  console.log('Usage: node scripts/switch-db.js [postgres|sqlite]');
  process.exit(1);
}
