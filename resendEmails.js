import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const appJsx = fs.readFileSync('src/ExamApp.jsx', 'utf-8');
const questionsMatch = appJsx.match(/const QUESTIONS = (\[[\s\S]*?\]);\s*const ANSWER_KEY/);
if (!questionsMatch) {
  throw new Error("Could not find QUESTIONS array in ExamApp.jsx");
}

let QUESTIONS;
eval(`QUESTIONS = ${questionsMatch[1]};`);

const supabaseUrl = 'https://qkwutcfxporxixnimkqf.supabase.co';
const supabaseKey = 'sb_publishable_aUJ5sisBi7sbUixHZOUdEw_yrUhAzCe';
const supabase = createClient(supabaseUrl, supabaseKey);

// Read the NEW URL from .env file directly so you don't have to change it here
const envFile = fs.readFileSync('.env', 'utf-8');
const appsScriptMatch = envFile.match(/VITE_APPS_SCRIPT_URL=(.*)/);
const appsScriptUrl = appsScriptMatch ? appsScriptMatch[1].trim() : null;

if (!appsScriptUrl) {
  throw new Error("Could not find VITE_APPS_SCRIPT_URL in .env");
}

// 🛑 ADD THE RECORD ID YOU WANT TO START FROM 🛑
// The script will skip everyone until it finds this ID.
const START_FROM_ID = "69cbf89e-45ba-4c0d-bd6a-4779d9be2189";
let skipping = true;

async function run() {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: true }); // Process oldest to newest

  if (error) {
    console.error("Error fetching submissions", error);
    return;
  }

  console.log(`Found ${data.length} total submissions in the database.`);
  if (data.length === 0) return;

  for (const sub of data) {
    try {
      const email = (sub.mail_id || sub.email).trim();
      const name = (sub.full_name || sub.student_name).trim();

      // SKIP UNTIL WE REACH THE START ID
      if (skipping && START_FROM_ID) {
         if (sub.id === START_FROM_ID) {
            skipping = false; // Found the start point, stop skipping!
            console.log(`[SKIP] Found start point. Skipping ${name} (${email}) as it was already sent.`);
            continue;
         } else {
            console.log(`[SKIP] Skipping ${name} (${email})`);
            continue;
         }
      }

      if (!sub.raw_responses || !sub.raw_responses.answers) {
        continue;
      }

      const answers = sub.raw_responses.answers;
      const responsesList = QUESTIONS.map((q) => {
        const responseIdx = answers[q.id];
        const isUnattempted = responseIdx === null || responseIdx === undefined;
        return {
          question: q.prompt,
          userAnswer: isUnattempted ? null : q.options[responseIdx],
          correctAnswer: q.options[q.correctIndex],
          isCorrect: !isUnattempted && responseIdx === q.correctIndex,
          unattempted: isUnattempted,
        };
      });

      const payload = {
        fullName: name,
        email: email,
        course: sub.course,
        batch: sub.batch,
        collegeName: sub.college_name,
        score: sub.score,
        totalCorrect: sub.total_correct,
        totalIncorrect: sub.total_incorrect,
        unattempted: sub.unattempted,
        disqualified: sub.disqualified,
        responses: responsesList,
      };

      console.log(`Sending to ${email}...`);
      const response = await fetch(appsScriptUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let success = false;
      try {
        const json = JSON.parse(responseText);
        success = json.success;
        if (!success) console.error("   └─ Error from Apps Script:", json.error || responseText);
      } catch (e) {
        console.error("   └─ Failed to parse Apps Script response:", responseText);
      }

      if (success) {
        console.log(` ✅ Successfully sent email for ${name} (${email})`);
      } else {
        console.log(` ❌ Failed to send for ${name} (${email})`);
        console.log(`    Stopping script to prevent further errors.`);
        break; // Stop completely so we don't keep failing
      }

      // 3 second delay to avoid rate limits
      await new Promise(r => setTimeout(r, 3000));
    } catch (e) {
      console.error(`Failed executing loop for ${email}:`, e);
      break;
    }
  }
}

run();
