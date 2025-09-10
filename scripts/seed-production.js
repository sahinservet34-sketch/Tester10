import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../shared/schema.js';
import bcrypt from 'bcrypt';

// Production database seed script
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function seedProduction() {
  console.log('🌱 Starting production database seed...');

  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.insert(schema.users).values({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User'
    });

    // Create menu categories
    const categories = [
      { name: 'Appetizers', description: 'Start your meal right' },
      { name: 'Burgers', description: 'Classic American burgers' },
      { name: 'Wings', description: 'Buffalo and BBQ wings' },
      { name: 'Salads', description: 'Fresh and healthy options' },
      { name: 'Entrees', description: 'Main course dishes' },
      { name: 'Desserts', description: 'Sweet endings' },
      { name: 'Beverages', description: 'Drinks and cocktails' }
    ];

    for (const cat of categories) {
      await db.insert(schema.menuCategories).values(cat);
    }

    // Create sample events
    const events = [
      {
        title: 'NFL Sunday Night Football',
        description: 'Watch the big game with friends',
        dateTime: new Date('2025-09-14T20:00:00'),
        sportType: 'NFL'
      },
      {
        title: 'Fantasy Draft Night',
        description: 'Join our fantasy football draft',
        dateTime: new Date('2025-09-15T19:00:00'),
        sportType: 'Custom'
      }
    ];

    for (const event of events) {
      await db.insert(schema.events).values(event);
    }

    console.log('✅ Production database seeded successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await pool.end();
  }
}

seedProduction();