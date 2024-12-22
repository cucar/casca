import express from 'express';
import multer from 'multer';
import Parser from './Parser.js';
import Extractor from './Extractor.js';

const app = express();
const parser = new Parser();
const extractor = new Extractor();

// Configure multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint to handle file upload and extraction
app.post('/api/extract', upload.single('statement'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Pass the file buffer to the parser
        const pages = await parser.parse(req.file.buffer);
        console.log(`parsed ${pages.length} pages`);

        // Extract transactions and checks from each page
        const transactions = [];
        const checks = [];
        for (const page of pages) {
            const result = await extractor.extractPage(page);
            transactions.push(...result.transactions);
            checks.push(...result.checks);
        }

        // Return the extracted transactions and checks
        res.json({ transactions, checks });

    } catch (error) {
        console.error('Extraction error:', error);
        res.status(500).json({ error: error.message || 'Failed to process file' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 