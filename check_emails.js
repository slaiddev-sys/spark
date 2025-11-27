const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const emails = [
  'manuel.odik@gmail.com',
  'manuelreviewss@gmail.com',
  'manuelsuscripciones26@gmail.com',
  'manuelealbetancor@gmail.com'
];

async function checkEmails() {
  for (const email of emails) {
    console.log(`\n=== Checking ${email} ===`);
    
    // Get profile
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', email);
    
    if (!profiles || profiles.length === 0) {
      console.log('❌ No profile found');
      continue;
    }
    
    console.log('✅ Profile found:', profiles[0].id);
    
    // Get projects
    const { data: projects } = await supabase
      .from('projects')
      .select('id, title, created_at')
      .eq('user_id', profiles[0].id);
    
    if (!projects || projects.length === 0) {
      console.log('❌ No projects found');
      continue;
    }
    
    console.log(`✅ Found ${projects.length} project(s)`);
    console.log('Project:', projects[0].title, projects[0].id);
    
    // Get frames
    const { data: frames } = await supabase
      .from('frames')
      .select('id, frame_number')
      .eq('project_id', projects[0].id);
    
    console.log(`✅ Found ${frames?.length || 0} frame(s)`);
  }
}

checkEmails().catch(console.error);
