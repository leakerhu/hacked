const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = 3000;

app.get('/pdf', async (req, res) => {
    const regId = req.query.regId;
    if (!regId) return res.status(400).send("regId required");

    const pdfUrl = `https://sbte-api.anantdrishti.com/examform/downloadForm?regId=${encodeURIComponent(regId)}`;

    try {
        const response = await fetch(pdfUrl);
        const buffer = await response.buffer();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="form.pdf"');
        res.send(buffer);
    } catch (err) {
        res.status(500).send("Error fetching PDF: " + err.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
