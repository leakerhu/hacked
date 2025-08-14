const express = require('express');
const fetch = require('node-fetch'); // v2 so require works
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const REMOTE_BASE = 'https://sbte-api.anantdrishti.com/examform/downloadForm';

// Serve the index.html file at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Proxy endpoint for PDF
app.get('/pdf', async (req, res) => {
  const regId = req.query.regId;
  if (!regId) {
    return res.status(400).send('regId query parameter required');
  }

  const remoteUrl = `${REMOTE_BASE}?regId=${encodeURIComponent(regId)}`;
  try {
    const upstream = await fetch(remoteUrl);
    if (!upstream.ok) {
      const txt = await upstream.text().catch(() => null);
      return res.status(upstream.status).send(`Upstream ${upstream.status}: ${txt || upstream.statusText}`);
    }

    // Force inline display
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="form.pdf"');

    const body = upstream.body;
    if (body && typeof body.pipe === 'function') {
      body.pipe(res);
    } else {
      const buffer = await upstream.buffer();
      res.send(buffer);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching PDF: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
