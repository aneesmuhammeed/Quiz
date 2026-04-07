import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load variables from the parent .env file
dotenv.config({ path: path.join(process.cwd(), '..', '.env') });

const appJsxPath = path.join(process.cwd(), '..', 'src', 'ExamApp.jsx');
const appJsx = fs.readFileSync(appJsxPath, 'utf-8');
const questionsMatch = appJsx.match(/const QUESTIONS = (\[[\s\S]*?\]);\s*const ANSWER_KEY/);
if (!questionsMatch) {
  throw new Error("Could not find QUESTIONS array in ExamApp.jsx");
}

let QUESTIONS;
eval(`QUESTIONS = ${questionsMatch[1]};`);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Apps script URL (should be updated with the newest deployed code that supports action='get_pdf')
const appsScriptUrl = process.env.VITE_APPS_SCRIPT_URL;

// ======================================
// NODEMAILER SETUP
// ======================================
// It is strongly recommended to use a Gmail App Password
const smtpEmail = process.env.SMTP_EMAIL || 'YOUR_EMAIL@gmail.com';
const smtpPassword = process.env.SMTP_PASSWORD || 'YOUR_APP_PASSWORD';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: smtpEmail,
    pass: smtpPassword
  }
});

// ======================================
// SKIPPING LOGIC
// ======================================
const START_FROM_ID = "8f555110-fa98-4be9-a562-1c5021eadea8 ";
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
        action: 'get_pdf', // Magic flag! Tells Apps Script to just return the PDF instead of sending it!
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

      console.log(`Fetching PDF from Apps Script for ${email}...`);
      const response = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let pdfBase64 = null;
      try {
        const json = JSON.parse(responseText);
        pdfBase64 = json.pdfBase64;
        if (!pdfBase64) {
          console.error("   └─ Error from Apps Script:", json.error || responseText);
          continue; // Try the next one
        }
      } catch (e) {
        console.error("   └─ Failed to parse Apps Script response:", responseText);
        continue;
      }

      // BUILD HTML RESPONSE SHEET
      const responseHTML = responsesList.map((item, j) => {
        const userAnswer = item.userAnswer || '—';
        const correctAnswer = item.correctAnswer;
        const isCorrect = item.isCorrect;
        const isSkipped = item.unattempted;

        const cardBorder = isCorrect ? '#10b981' : '#ef4444';
        const cardBg = isCorrect ? '#f0fdf4' : '#fff1f2';
        const badge = isSkipped
          ? `<span style="background:#9ca3af;color:white;padding:4px 12px;border-radius:100px;font-size:12px;font-weight:700;">⏭️ Skipped</span>`
          : isCorrect
            ? `<span style="background:#10b981;color:white;padding:4px 12px;border-radius:100px;font-size:12px;font-weight:700;">✅ Correct</span>`
            : `<span style="background:#ef4444;color:white;padding:4px 12px;border-radius:100px;font-size:12px;font-weight:700;">❌ Wrong</span>`;

        return `
          <div style="background:${isSkipped ? '#f9fafb' : cardBg};border-left:5px solid ${isSkipped ? '#9ca3af' : cardBorder};border-radius:12px;padding:20px 22px;margin-bottom:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
              <tr>
                <td><span style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Question ${j + 1}</span></td>
                <td align="right">${badge}</td>
              </tr>
            </table>
            <p style="margin:0 0 14px;font-size:15px;font-weight:700;color:#111827;line-height:1.5;">${item.question}</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%" style="padding-right:6px;">
                  <div style="background:white;border-radius:8px;padding:10px 14px;border:1px solid ${isCorrect ? '#d1fae5' : isSkipped ? '#e5e7eb' : '#fecaca'};">
                    <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:${isCorrect ? '#059669' : isSkipped ? '#6b7280' : '#dc2626'};text-transform:uppercase;letter-spacing:1px;">Your Answer</p>
                    <p style="margin:0;font-size:14px;color:${isCorrect ? '#065f46' : isSkipped ? '#6b7280' : '#991b1b'};font-weight:600;">${userAnswer}</p>
                  </div>
                </td>
                <td width="50%" style="padding-left:6px;">
                  <div style="background:white;border-radius:8px;padding:10px 14px;border:1px solid #bfdbfe;">
                    <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:1px;">Correct Answer</p>
                    <p style="margin:0;font-size:14px;color:#1e40af;font-weight:600;">${correctAnswer}</p>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        `;
      }).join('');

      const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background-color:#0f0c29;font-family:'Segoe UI',Arial,sans-serif;">

        <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);min-height:100vh;">
          <tr>
            <td align="center" style="padding:40px 20px;">

              <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:24px;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,0.5);">

                <!-- ── HEADER ── -->
                <tr>
                  <td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:50px 40px;text-align:center;">
                    <div style="font-size:56px;margin-bottom:10px;">🏆</div>
                    <h1 style="margin:0;color:white;font-size:30px;font-weight:800;letter-spacing:1px;text-shadow:0 2px 10px rgba(0,0,0,0.3);">
                      Exam Result
                    </h1>
                    <p style="margin:10px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">
                      Here's how you performed. Great effort! 💪
                    </p>
                  </td>
                </tr>

                <!-- ── CANDIDATE INFO ── -->
                <tr>
                  <td style="background:#ffffff;padding:30px 40px 0;">
                    <div style="background:#f0f0ff;border-radius:12px;padding:20px 25px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#7c3aed;font-weight:700;">Candidate</p>
                            <p style="margin:0;font-size:20px;font-weight:800;color:#1e1b4b;">${name}</p>
                          </td>
                          <td align="right">
                            <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#7c3aed;font-weight:700;">Email</p>
                            <p style="margin:0;font-size:13px;color:#4b5563;">${email}</p>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>

                <!-- ── COLLEGE INFO ── -->
                <tr>
                  <td style="background:#ffffff;padding:16px 40px 0;">
                    <div style="background:#f7f7ff;border-radius:12px;padding:16px 22px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <p style="margin:0 0 2px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#7c3aed;font-weight:700;">Course &amp; Batch</p>
                            <p style="margin:0;font-size:14px;font-weight:700;color:#312e81;">${payload.course} · ${payload.batch}</p>
                          </td>
                          <td align="right">
                            <p style="margin:0 0 2px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#7c3aed;font-weight:700;">Institution</p>
                            <p style="margin:0;font-size:13px;color:#4b5563;">${payload.collegeName}</p>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>

                <!-- ── SCORE CARDS ── -->
                <tr>
                  <td style="background:#ffffff;padding:25px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="33%" style="text-align:center;padding:0 6px;">
                          <div style="background:linear-gradient(135deg,#667eea,#764ba2);border-radius:16px;padding:22px 8px;">
                            <p style="margin:0 0 5px;color:rgba(255,255,255,0.8);font-size:11px;text-transform:uppercase;letter-spacing:1px;">Total Score</p>
                            <p style="margin:0;color:white;font-size:32px;font-weight:900;">${payload.score}</p>
                          </div>
                        </td>
                        <td width="33%" style="text-align:center;padding:0 6px;">
                          <div style="background:linear-gradient(135deg,#11998e,#38ef7d);border-radius:16px;padding:22px 8px;">
                            <p style="margin:0 0 5px;color:rgba(255,255,255,0.8);font-size:11px;text-transform:uppercase;letter-spacing:1px;">✅ Correct</p>
                            <p style="margin:0;color:white;font-size:32px;font-weight:900;">${payload.totalCorrect}</p>
                          </div>
                        </td>
                        <td width="33%" style="text-align:center;padding:0 6px;">
                          <div style="background:linear-gradient(135deg,#f093fb,#f5576c);border-radius:16px;padding:22px 8px;">
                            <p style="margin:0 0 5px;color:rgba(255,255,255,0.8);font-size:11px;text-transform:uppercase;letter-spacing:1px;">❌ Wrong</p>
                            <p style="margin:0;color:white;font-size:32px;font-weight:900;">${payload.totalIncorrect}</p>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- ── SCORING NOTE ── -->
                <tr>
                  <td style="background:#ffffff;padding:0 40px 10px;">
                    <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                      Scoring: +4 per correct · −1 per wrong · 0 for skipped &nbsp;|&nbsp; Total questions: 30 &nbsp;|&nbsp; Max score: 120
                    </p>
                  </td>
                </tr>

                ${payload.disqualified ? `
                <!-- ── DISQUALIFIED NOTICE ── -->
                <tr>
                  <td style="background:#ffffff;padding:0 40px 16px;">
                    <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:14px 18px;border-radius:10px;">
                      <p style="margin:0;font-size:14px;color:#92400e;font-weight:600;">
                        ⚠️ <strong>Note:</strong> This attempt was flagged due to proctoring policy violations.
                      </p>
                    </div>
                  </td>
                </tr>` : ''}

                <!-- ── RESPONSE CARDS HEADER ── -->
                <tr>
                  <td style="background:#ffffff;padding:0 40px 10px;">
                    <div style="border-top:2px dashed #e5e7eb;padding-top:20px;">
                      <p style="margin:0;font-size:16px;font-weight:700;color:#1e1b4b;">🧾 Your Response Sheet</p>
                    </div>
                  </td>
                </tr>

                <!-- ── RESPONSE CARDS ── -->
                <tr>
                  <td style="background:#ffffff;padding:0 40px 30px;">
                    ${responseHTML}
                  </td>
                </tr>

                <!-- ── CERTIFICATE NOTICE ── -->
                <tr>
                  <td style="background:#fffbeb;padding:25px 40px;border-top:3px solid #f59e0b;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#f59e0b;border-radius:14px;padding:24px 28px;text-align:center;">
                          <p style="margin:0 0 8px;font-size:28px;">🎓</p>
                          <p style="margin:0 0 6px;font-size:17px;font-weight:800;color:#1c1400;">
                            Your Certificate of Completion is Attached!
                          </p>
                          <p style="margin:0;font-size:13px;color:#3a2a00;">
                            Please find the PDF certificate attached to this email.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- ── FOOTER ── -->
                <tr>
                  <td style="background:linear-gradient(135deg,#1e1b4b,#312e81);padding:28px 40px;text-align:center;">
                    <p style="margin:0 0 6px;color:rgba(255,255,255,0.6);font-size:13px;">
                      This is an automated result email. Please do not reply.
                    </p>
                    <p style="margin:0;color:rgba(255,255,255,0.3);font-size:11px;letter-spacing:1px;text-transform:uppercase;">
                      Powered by Nodemailer • ${new Date().getFullYear()}
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>

      </body>
      </html>
      `;

      console.log(`Sending Email via Nodemailer to ${email}...`);
      await transporter.sendMail({
        from: '"Exam Platform" <' + smtpEmail + '>',
        to: email,
        subject: '🎯 Your Exam Result + Certificate',
        html: htmlBody,
        attachments: [
          {
            filename: `Certificate - ${name}.pdf`,
            content: Buffer.from(pdfBase64, 'base64'),
            contentType: 'application/pdf'
          }
        ]
      });

      console.log(` ✅ Successfully sent email via Nodemailer for ${name} (${email})`);

      // 2 second delay to avoid SMTP limits
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      console.error(`Failed executing loop for ${sub.email}:`, e);
      break;
    }
  }
}

run();
