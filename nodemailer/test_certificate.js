import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

// Detect if image is .png or .jpg
let bgFileName = 'certificate_bg.png';
if (!fs.existsSync(path.join(process.cwd(), bgFileName))) {
  bgFileName = 'certificate_bg.jpg';
}

const bgImagePath = path.join(process.cwd(), bgFileName);

async function testGeneration() {
  if (!fs.existsSync(bgImagePath)) {
    console.error(`❌ Error: Neither certificate_bg.png nor certificate_bg.jpg found in "${process.cwd()}"!`);
    console.log("Please save your blank certificate image into this folder before running this test.");
    process.exit(1);
  }

  console.log(`Using background: ${bgFileName}`);
  console.log("Generating test certificate...");

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  const name = "ANEEES MUHAMMED";
  const details = "D.El.Ed. 2024-2026 Batch, Govt. TTI (W) Palakkad";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@400;600&display=swap');
        body { 
          margin: 0; 
          padding: 0; 
          width: 1123px; /* A4 Landscape at 96 DPI */
          height: 794px; 
          overflow: hidden;
          position: relative;
          font-family: 'Montserrat', sans-serif;
        }
        .background {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          z-index: -1;
        }
        .content {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        /* NAME */
        .name {
          position: absolute;
          top: 330px;   /* adjust slightly if needed */
          left: 50%;
          transform: translateX(-50%);
          font-family: 'Playfair Display', serif;
          font-size: 48px;
          font-weight: 700;
          color: #000;
          text-transform: uppercase;
          letter-spacing: 2px;
          white-space: nowrap;
        }

        /* DETAILS */
        .details {
          position: absolute;
          top: 415px;  /* adjust */
          left: 50%;
          transform: translateX(-50%);
          font-size: 22px;
          color: #1e1b4b;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <img src="data:image/${bgFileName.split('.').pop()};base64,${fs.readFileSync(bgImagePath).toString('base64')}" class="background" />
      <div class="content">
        <div class="name">${name}</div>
        <div class="details">${details}</div>
      </div>
    </body>
    </html>
  `;

  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({
    format: 'A4',
    landscape: true,
    printBackground: true,
  });

  fs.writeFileSync('test_certificate.pdf', pdfBuffer);
  await browser.close();
  console.log("✅ test_certificate.pdf generated successfully!");
}

testGeneration();
