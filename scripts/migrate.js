import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('Starting database migration...')
    
    // Read the migration file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '001_create_bots_table.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf8')
    
    console.log('Migration SQL:')
    console.log('='.repeat(50))
    console.log(migrationSQL)
    console.log('='.repeat(50))
    
    console.log('\n⚠️  Please copy the SQL above and run it in your Supabase SQL Editor:')
    console.log('1. Go to your Supabase project dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Paste the SQL above')
    console.log('4. Click "Run"')
    
    console.log('\nAlternatively, you can run this script with your database credentials.')
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
