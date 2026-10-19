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

// ── In-memory career applications store (persists while server runs) ──
const careerApplications = [];

// Middleware
app.use(compression({
  threshold: 1024,
  level: 6
}));
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Static files with HTTP caching for PageSpeed performance
app.use(express.static(path.join(__dirname), {
  maxAge: '7d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    } else if (/\.(jpg|jpeg|png|webp|avif|svg|gif|woff|woff2|ttf|css|js)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
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

    // Send with a 15-second timeout to prevent hanging
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
    return res.json({ success: true, message: 'Lead notification sent successfully.' });

  } catch (err) {
    console.error('❌ Failed to send lead email:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
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
