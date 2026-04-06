// ─────────────────────────────────────────────────────────────
// 📥  Web App entry point — called by the React quiz app
// ─────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const {
      fullName,
      email,
      course,
      batch,
      collegeName,
      score,
      totalCorrect,
      totalIncorrect,
      unattempted,
      disqualified,
      responses,     // per-question breakdown sent from React
    } = data;

    // 🃏 Build individual question cards (same design as Forms version)
    const responseHTML = responses.map((item, j) => {
      const userAnswer    = item.userAnswer || '—';
      const correctAnswer = item.correctAnswer;
      const isCorrect     = item.isCorrect;
      const isSkipped     = item.unattempted;

      const cardBorder = isCorrect ? '#10b981' : '#ef4444';
      const cardBg     = isCorrect ? '#f0fdf4' : '#fff1f2';
      const badge      = isSkipped
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

    // 🎓 Generate Certificate PDF
    const pdf = generateCertificateForWeb(fullName, course, batch, collegeName);

    // 📧 Send Result Email
    MailApp.sendEmail({
      to: email,
      subject: '🎯 Your Exam Result + Certificate',
      htmlBody: `
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
                            <p style="margin:0;font-size:20px;font-weight:800;color:#1e1b4b;">${fullName}</p>
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
                            <p style="margin:0;font-size:14px;font-weight:700;color:#312e81;">${course} · ${batch}</p>
                          </td>
                          <td align="right">
                            <p style="margin:0 0 2px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#7c3aed;font-weight:700;">Institution</p>
                            <p style="margin:0;font-size:13px;color:#4b5563;">${collegeName}</p>
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
                            <p style="margin:0;color:white;font-size:32px;font-weight:900;">${score}</p>
                          </div>
                        </td>
                        <td width="33%" style="text-align:center;padding:0 6px;">
                          <div style="background:linear-gradient(135deg,#11998e,#38ef7d);border-radius:16px;padding:22px 8px;">
                            <p style="margin:0 0 5px;color:rgba(255,255,255,0.8);font-size:11px;text-transform:uppercase;letter-spacing:1px;">✅ Correct</p>
                            <p style="margin:0;color:white;font-size:32px;font-weight:900;">${totalCorrect}</p>
                          </div>
                        </td>
                        <td width="33%" style="text-align:center;padding:0 6px;">
                          <div style="background:linear-gradient(135deg,#f093fb,#f5576c);border-radius:16px;padding:22px 8px;">
                            <p style="margin:0 0 5px;color:rgba(255,255,255,0.8);font-size:11px;text-transform:uppercase;letter-spacing:1px;">❌ Wrong</p>
                            <p style="margin:0;color:white;font-size:32px;font-weight:900;">${totalIncorrect}</p>
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

                ${disqualified ? `
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
                      Powered by Google Apps Script • ${new Date().getFullYear()}
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>

      </body>
      </html>
      `,
      attachments: [pdf],
    });

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


// ─────────────────────────────────────────────────────────────
// 🎓  Certificate generator
// ─────────────────────────────────────────────────────────────
function generateCertificateForWeb(fullName, course, batch, collegeName) {
  const templateId = "1hn_b_E5fiZhYbJE3lX-4a7U5jgYbePXlgysjmHwJnv8";

  const copyFile = DriveApp.getFileById(templateId)
    .makeCopy(`Certificate - ${fullName}`);

  const presentation = SlidesApp.openById(copyFile.getId());

  presentation.getSlides().forEach(slide => {
    slide.replaceAllText("{{NAME}}",        fullName);
    slide.replaceAllText("{{COURSE}}",      course);
    slide.replaceAllText("{{BATCH}}",       batch);
    slide.replaceAllText("{{INSTITUTION}}", collegeName);
  });

  presentation.saveAndClose();

  const pdf = DriveApp.getFileById(copyFile.getId())
    .getAs("application/pdf")
    .setName(`Certificate - ${fullName}.pdf`);

  copyFile.setTrashed(true);

  return pdf;
}


// ─────────────────────────────────────────────────────────────
// 🧪  TEST — select testDoPost from dropdown then click ▶ Run
// ─────────────────────────────────────────────────────────────
function testDoPost() {
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({
        fullName:       "TEST USER",
        email:          "aneesk002@gmail.com",
        course:         "D.El.Ed.",
        batch:          "2024-2026",
        collegeName:    "Government TTI (W), Palakkad",
        score:          85,
        totalCorrect:   22,
        totalIncorrect: 3,
        unattempted:    5,
        disqualified:   false,
        responses: [
          { question: "ഇന്ത്യയുടെ ഇപ്പോഴത്തെ മുഖ്യ തിരഞ്ഞെടുപ്പ് കമ്മീഷണർ (CEC) ആര്?", userAnswer: "ഗ്യാനേഷ് കുമാർ",  correctAnswer: "ഗ്യാനേഷ് കുമാർ",  isCorrect: true,  unattempted: false },
          { question: "ഇലക്ഷൻ കമ്മീഷന്റെ മുദ്രാവാക്യം (Slogan) എന്താണ്?",               userAnswer: "Every Vote Counts", correctAnswer: "No Voter to be Left Behind", isCorrect: false, unattempted: false },
          { question: "NOTA എന്നത് എന്താണ് സൂചിപ്പിക്കുന്നത്?",                         userAnswer: null,               correctAnswer: "None of the Above",          isCorrect: false, unattempted: true  },
        ],
      })
    }
  };
  doPost(fakeEvent);
}
