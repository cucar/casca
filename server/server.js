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
            // Merge checks with same check number
            result.checks.forEach(check => {
                const existingCheck = checks.find(c => c.checkNumber === check.checkNumber);
                if (existingCheck) Object.assign(existingCheck, check);
                else checks.push(check);
            });
        }

        // now, add the checks to the transactions
        transactions.push(...checks.map(check => ({ 
            date: check.date, 
            description: `Check ${check.checkNumber ? `#${check.checkNumber}` : ''} ${check.payee ? `to ${check.payee}` : ''} ${check.for ? `for ${check.for}` : ''}`,
            category: 'Checks', 
            type: 'Withdrawal', 
            amount: check.amount 
        })));

        // Return the extracted transactions
        res.json({ transactions });

    } catch (error) {
        console.error('Extraction error:', error);
        res.status(500).json({ error: error.message || 'Failed to process file' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 