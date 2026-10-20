/**
 * ============================================================
 *  PROLOAN INDIA — Backend Lead Notification Server
 *  Express + Nodemailer via Gmail SMTP + Multer File Uploads
 * ============================================================
 */

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const compression = require('compression');

// Auto-load .env file if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const val = match[2].trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    }
  });
}

const app = express();
const PORT = process.env.PORT || 3000;

// Gmail SMTP Configuration from environment
const GMAIL_USER = process.env.GMAIL_USER || 'vaibhav.thakur2719@gmail.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';
const LEAD_RECIPIENT = process.env.LEAD_RECIPIENT || 'infoproloanindia@gmail.com';

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD
  }
});

transporter.verify(function (error, success) {
  if (error) {
    console.error('Gmail SMTP connection failed:', error.message);
  } else {
    console.log('Gmail SMTP ready - leads will be sent to', LEAD_RECIPIENT);
  }
});

// ── Multer — memory storage for resume uploads (max 5 MB) ──
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF, DOC, DOCX files are allowed.'));
  }
});

// ── Data Persistence Setup (data/leads.json & data/careers.json) ──
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const CAREERS_FILE = path.join(DATA_DIR, 'careers.json');

function readJsonFile(filePath, defaultVal = []) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
  }
  return defaultVal;
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err.message);
    return false;
  }
}

// Initialize seed leads if leads.json doesn't exist
if (!fs.existsSync(LEADS_FILE)) {
  const seedLeads = [
    {
      ref_id: 'CC-APP-70179',
      applicant_name: 'Varun Sharma',
      mobile: '+91 6284667236',
      loan_product: 'Personal Loan',
      loan_amount: '₹15,00,000',
      monthly_income: '₹75,000 / mo',
      city: 'Ludhiana, Punjab',
      pan_card: 'ABCDE1234F',
      cibil_score: 710,
      cibil_notes: 'Income: ₹75,000 • Verified CIBIL: 710',
      lead_category: 'Portal Application',
      status: 'New',
      admin_notes: 'CIBIL 710 verified. Pre-approved for Top NBFCs (Bajaj Finserv / Tata Capital).',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      ref_id: 'PL-88231',
      applicant_name: 'Rajesh Verma',
      mobile: '+91 98112 34567',
      loan_product: 'Home Loan',
      loan_amount: '₹45,00,000',
      monthly_income: '₹1,20,000 / mo',
      city: 'Indirapuram, Ghaziabad',
      pan_card: 'BPRPV9876K',
      cibil_score: 780,
      cibil_notes: 'Prime Profile • Salaried MNC',
      lead_category: 'Website Lead',
      status: 'Underwriting',
      admin_notes: 'Login initiated in HDFC Bank & SBI @ 8.40% ROI.',
      created_at: new Date(Date.now() - 3600000 * 8).toISOString()
    },
    {
      ref_id: 'BL-43092',
      applicant_name: 'Amit Patel',
      mobile: '+91 99201 88412',
      loan_product: 'Business Loan',
      loan_amount: '₹25,00,000',
      monthly_income: '₹1,80,000 / mo',
      city: 'Noida Sector 62',
      pan_card: 'AAACP4412E',
      cibil_score: 735,
      cibil_notes: 'GST Turnover: 1.8 Cr • 3 Yrs ITR',
      lead_category: 'Website Lead',
      status: 'Docs Pending',
      admin_notes: 'Collecting 12 months GST returns & audited balance sheet.',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ];
  writeJsonFile(LEADS_FILE, seedLeads);
}

// In-memory career applications store loaded from persistent disk storage
const careerApplications = readJsonFile(CAREERS_FILE, []);


// Middleware
app.use(compression({
  threshold: 512,
  level: 9,
  filter: (req, res) => {
    // Don't compress already-compressed formats
    if (/\.(woff2|webp|avif|jpg|jpeg|png|gif|mp4|zip)$/i.test(req.path)) return false;
    return compression.filter(req, res);
  }
}));
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Global Speed & Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-DNS-Prefetch-Control', 'on');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Vary', 'Accept-Encoding');
  next();
});

// Static files with aggressive HTTP caching
app.use(express.static(path.join(__dirname), {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      // HTML: always revalidate so users get latest version
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    } else if (/\.(woff|woff2|ttf|otf)$/i.test(filePath)) {
      // Fonts: immutable 1 year — filenames are stable
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (/\.(webp|avif|jpg|jpeg|png|gif|svg|ico)$/i.test(filePath)) {
      // Images: 30 days
      res.setHeader('Cache-Control', 'public, max-age=2592000');
    } else if (/\.css$/i.test(filePath)) {
      // CSS: 1 year immutable (versioned via query string in HTML)
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (/\.js$/i.test(filePath)) {
      // JS: 1 year immutable (versioned via query string in HTML)
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Staff Portal Route
app.get('/portal', (req, res) => {
  res.sendFile(path.join(__dirname, 'portal.html'));
});

// Helper: Build HTML table row
let rowCount = 0;
function buildRow(label, value) {
  const bg = rowCount++ % 2 === 0 ? '#f9fafb' : '#ffffff';
  return `<tr style="background:${bg};"><td style="padding:10px 12px;color:#374151;font-size:13px;font-weight:600;width:42%;border-bottom:1px solid #f3f4f6;">${label}</td><td style="padding:10px 12px;color:#111827;font-size:13px;border-bottom:1px solid #f3f4f6;">${value || 'Not Provided'}</td></tr>`;
}

// Lead Email Endpoint
app.post('/api/send-lead', async (req, res) => {
  try {
    rowCount = 0;
    const data = req.body;
    if (!data) return res.status(400).json({ success: false, message: 'Invalid lead data' });

    // ── Field alias mapping: supports both loan leads AND career applications ──
    const name    = data['Applicant Legal Name'] || data['Applicant Name'] || data['name'] || 'N/A';
    const refId   = data['Application Reference ID'] || data['Application ID'] || data['ref_id'] || 'N/A';
    const product = data['Requested Loan Product'] || data['Role Applied For'] || data['Lead Category'] || 'General Inquiry';
    const category= data['Lead Category'] || 'Lead';

    // Use _subject if provided by caller, else build one
    const subject = data['_subject']
      ? data['_subject']
      : `NEW ${category.toUpperCase()}: ${product} — ${name} | Ref: ${refId}`;

    // Build rows for ALL submitted fields (skip internal _ prefixed keys)
    const skipKeys = new Set(['_subject', '_template', '_captcha', '_next', '_cc', '_bcc']);
    const rows = Object.entries(data)
      .filter(([k]) => !skipKeys.has(k))
      .map(([k, v]) => buildRow(k, v))
      .join('');

    const htmlBody = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:30px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr><td style="background:linear-gradient(135deg,#1a3c6e 0%,#2563eb 100%);padding:32px 40px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">Proloan India</h1>
    <p style="margin:6px 0 0;color:#93c5fd;font-size:13px;letter-spacing:1px;text-transform:uppercase;">New Lead Notification</p>
  </td></tr>
  <tr><td style="background:#fef3c7;border-left:4px solid #f59e0b;padding:14px 40px;">
    <p style="margin:0;color:#92400e;font-size:14px;font-weight:600;">A new <strong>${category}</strong> has been submitted via the Proloan India website.</p>
  </td></tr>
  <tr><td style="padding:32px 40px;">
    <h2 style="margin:0 0 20px;color:#1e3a5f;font-size:18px;font-weight:700;border-bottom:2px solid #e5e7eb;padding-bottom:10px;">Details</h2>
    <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
    <p style="margin:0;color:#6b7280;font-size:12px;">Auto-generated by the Proloan India Lead System. Follow up promptly.</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

    // ── Auto-record lead to persistent leads.json ──
    try {
      const leads = readJsonFile(LEADS_FILE, []);
      let parsedCibil = null;
      if (data.cibil_score !== undefined && data.cibil_score !== null && !isNaN(data.cibil_score)) {
        const directNum = parseInt(data.cibil_score, 10);
        if ((directNum >= 300 && directNum <= 900) || directNum === -1) {
          parsedCibil = directNum;
        }
      }
      if (parsedCibil === null) {
        const combined = (data['Verification / CIBIL Note'] || '') + ' ' + (data['Monthly Income / Tier'] || '') + ' ' + (data.cibil_notes || '') + ' ' + (data.admin_notes || '');
        const m = combined.match(/(?:cibil|score)\s*[:=\-]?\s*(\d{3})/i);
        if (m) {
          const num = parseInt(m[1], 10);
          if (num >= 300 && num <= 900) parsedCibil = num;
        }
      }

      const leadEntry = {
        ref_id: refId,
        applicant_name: name,
        mobile: data['Contact Mobile Number'] || data['Applicant Mobile'] || data['mobile'] || 'Not Provided',
        loan_product: product,
        loan_amount: data['Requested Loan Amount'] || data['loan_amount'] || 'Flexible',
        monthly_income: data['Monthly Income / Tier'] || data['monthly_income'] || 'N/A',
        city: data['City / Location'] || data['city'] || 'Delhi NCR',
        pan_card: data['PAN Card / Tax ID'] || data['pan_card'] || 'N/A',
        cibil_notes: data['Verification / CIBIL Note'] || data['cibil_notes'] || '',
        cibil_score: parsedCibil,
        lead_category: category,
        status: 'New',
        admin_notes: '',
        created_at: new Date().toISOString()
      };

      const existingIdx = leads.findIndex(l => l.ref_id === refId);
      if (existingIdx >= 0) {
        leads[existingIdx] = { ...leads[existingIdx], ...leadEntry };
      } else {
        leads.unshift(leadEntry);
      }
      writeJsonFile(LEADS_FILE, leads.slice(0, 500));
    } catch (saveErr) {
      console.warn('⚠️ Could not save lead to leads.json:', saveErr.message);
    }

    // Send with a 15-second timeout to prevent hanging
    try {
      await Promise.race([
        transporter.sendMail({
          from: `"Proloan India Leads" <${GMAIL_USER}>`,
          to: LEAD_RECIPIENT,
          subject: subject,
          html: htmlBody
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP timeout after 15s')), 15000))
      ]);
      console.log(`✅ Lead email sent — ${refId} | ${name} | ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    } catch(smtpErr) {
      console.warn(`⚠️ Lead recorded to database, but SMTP failed: ${smtpErr.message}`);
    }

    return res.json({ success: true, message: 'Lead recorded and notification dispatched successfully.' });

  } catch (err) {
    console.error('❌ Failed to process lead:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── Lead Management Endpoints (Staff Console) ──
app.get('/api/leads', (req, res) => {
  const leads = readJsonFile(LEADS_FILE, []);
  res.json({ success: true, leads });
});

app.post('/api/leads', (req, res) => {
  const lead = req.body;
  if (!lead || !lead.applicant_name) {
    return res.status(400).json({ success: false, message: 'Applicant name is required' });
  }
  const leads = readJsonFile(LEADS_FILE, []);
  if (!lead.ref_id) {
    lead.ref_id = 'PL-' + Math.floor(10000 + Math.random() * 90000);
  }
  if (!lead.created_at) {
    lead.created_at = new Date().toISOString();
  }
  if (!lead.status) {
    lead.status = 'New';
  }
  leads.unshift(lead);
  writeJsonFile(LEADS_FILE, leads.slice(0, 500));
  res.json({ success: true, lead });
});

app.patch('/api/leads/:refId', (req, res) => {
  const { refId } = req.params;
  const updates = req.body;
  const leads = readJsonFile(LEADS_FILE, []);
  const idx = leads.findIndex(l => l.ref_id === refId);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Lead not found' });
  }
  leads[idx] = { ...leads[idx], ...updates };
  writeJsonFile(LEADS_FILE, leads);
  res.json({ success: true, lead: leads[idx] });
});

app.delete('/api/leads/:refId', (req, res) => {
  const { refId } = req.params;
  let leads = readJsonFile(LEADS_FILE, []);
  const beforeCount = leads.length;
  leads = leads.filter(l => l.ref_id !== refId);
  if (leads.length === beforeCount) {
    return res.status(404).json({ success: false, message: 'Lead not found' });
  }
  writeJsonFile(LEADS_FILE, leads);
  res.json({ success: true, message: 'Lead removed successfully' });
});




// ── Career Application Endpoint ──────────────────────────────────────────────
app.post('/api/career-apply', upload.single('resume'), async (req, res) => {
  try {
    const body = req.body;
    const file = req.file; // Buffer of the uploaded resume

    const name     = (body.name     || '').trim();
    const mobile   = (body.mobile   || '').trim();
    const email    = (body.email    || '').trim();
    const role     = (body.role     || '').trim();
    const exp      = (body.experience || '').trim();
    const city     = (body.city     || '').trim();
    const note     = (body.note     || '').trim();
    const appId    = body.appId || ('CA-' + Math.floor(10000 + Math.random() * 90000));
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const resumeName = file ? file.originalname : 'Not Uploaded';

    if (!name)   return res.status(400).json({ success: false, message: 'Name is required.' });
    if (!mobile) return res.status(400).json({ success: false, message: 'Mobile is required.' });
    if (!email)  return res.status(400).json({ success: false, message: 'Email is required.' });
    if (!role)   return res.status(400).json({ success: false, message: 'Role is required.' });
    if (!file)   return res.status(400).json({ success: false, message: 'Resume file is required.' });

    // ── Store in memory (admin panel reads this) ──
    const application = {
      appId, name, mobile, email, role, experience: exp,
      city, note, resumeName,
      resumeBase64: file.buffer.toString('base64'),
      resumeMime: file.mimetype,
      timestamp, status: 'New'
    };
    careerApplications.unshift(application);
    if (careerApplications.length > 200) careerApplications.length = 200; // cap at 200
    writeJsonFile(CAREERS_FILE, careerApplications);

    // ── Build HTML email body ──
    rowCount = 0;
    const rows = [
      buildRow('Application ID', appId),
      buildRow('Full Name', name),
      buildRow('Mobile', mobile),
      buildRow('Email', email),
      buildRow('Role Applied For', role),
      buildRow('Experience', exp || 'N/A'),
      buildRow('Location', city || 'N/A'),
      buildRow('Cover Note', note || 'N/A'),
      buildRow('Resume File', resumeName),
      buildRow('Submitted At', timestamp)
    ].join('');

    const htmlBody = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:30px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr><td style="background:linear-gradient(135deg,#1a3c6e 0%,#2563eb 100%);padding:32px 40px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">Proloan India</h1>
    <p style="margin:6px 0 0;color:#93c5fd;font-size:13px;letter-spacing:1px;text-transform:uppercase;">New Career Application</p>
  </td></tr>
  <tr><td style="background:#fef3c7;border-left:4px solid #f59e0b;padding:14px 40px;">
    <p style="margin:0;color:#92400e;font-size:14px;font-weight:600;">📋 A new <strong>Career Application</strong> has been submitted. Resume is attached.</p>
  </td></tr>
  <tr><td style="padding:32px 40px;">
    <h2 style="margin:0 0 20px;color:#1e3a5f;font-size:18px;font-weight:700;border-bottom:2px solid #e5e7eb;padding-bottom:10px;">Applicant Details</h2>
    <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
    <p style="margin:0;color:#6b7280;font-size:12px;">Auto-generated by the Proloan India Career System. Please review and respond within 24–48 hours.</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

    // ── Email attachments ──
    const attachments = [];
    if (file) {
      attachments.push({
        filename: file.originalname,
        content: file.buffer,
        contentType: file.mimetype
      });
    }

    // ── Send email with 15-second timeout ──
    await Promise.race([
      transporter.sendMail({
        from: `"Proloan India HR" <${GMAIL_USER}>`,
        to: LEAD_RECIPIENT,
        replyTo: email,
        subject: `📋 [CAREER] ${role} — ${name} | ${appId}`,
        html: htmlBody,
        attachments
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP timeout after 15s')), 15000))
    ]);

    console.log(`✅ Career application emailed — ${appId} | ${name} | ${role} | ${timestamp}`);
    return res.json({ success: true, message: 'Application submitted successfully!', appId });

  } catch (err) {
    console.error('❌ Career application error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── Admin: Get all career applications (portal reads this) ──
app.get('/api/career-applications', (req, res) => {
  // Return applications without the large base64 blob by default,
  // but include a flag so the portal knows a resume is available.
  const light = careerApplications.map(a => ({
    appId: a.appId,
    name: a.name,
    mobile: a.mobile,
    email: a.email,
    role: a.role,
    experience: a.experience,
    city: a.city,
    note: a.note,
    resumeName: a.resumeName,
    hasResume: !!a.resumeBase64,
    timestamp: a.timestamp,
    status: a.status
  }));
  res.json({ success: true, applications: light });
});

// ── Admin: Download a single resume by appId ──
app.get('/api/career-resume/:appId', (req, res) => {
  const app_ = careerApplications.find(a => a.appId === req.params.appId);
  if (!app_ || !app_.resumeBase64) {
    return res.status(404).json({ success: false, message: 'Resume not found.' });
  }
  const buf = Buffer.from(app_.resumeBase64, 'base64');
  res.set('Content-Type', app_.resumeMime || 'application/octet-stream');
  res.set('Content-Disposition', `attachment; filename="${app_.appId}_${app_.resumeName}"`);
  res.send(buf);
});

// ── Admin: Update career application status ──
app.post('/api/career-status', (req, res) => {
  const { appId, status } = req.body;
  const app_ = careerApplications.find(a => a.appId === appId);
  if (!app_) return res.status(404).json({ success: false, message: 'Application not found.' });
  app_.status = status;
  writeJsonFile(CAREERS_FILE, careerApplications);
  res.json({ success: true });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Proloan India Lead Server', timestamp: new Date().toISOString() });
});

// Start Server
app.listen(PORT, () => {
  console.log('');
  console.log('==============================================');
  console.log('  PROLOAN INDIA - Lead Server Running');
  console.log('  http://localhost:' + PORT);
  console.log('  Nodemailer -> Gmail SMTP Active');
  console.log('==============================================');
  console.log('');
});
