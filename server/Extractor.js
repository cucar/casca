import 'dotenv/config';
import md5 from 'md5';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import OpenAI from 'openai';

class Extractor {

    /**
     * constructor - create the openAI client - API key from environment variable
     */
    constructor() {
        this.openai = new OpenAI();
    }

    /**
     * returns the system prompt
     */
    getSystemPrompt() { 
        return `
Below is a page of a bank statement. Your job is to parse it and extract transactions in it.

Transaction information should be extracted with the following fields: date, description, category (more on that below), check number (if applicable), type (if it is a deposit or a withdrawal), and amount. Each transaction may be given as a single line or in 2 lines. If transactions are given in 2 lines, use the information in the second line as part of description and append to it. It may be used for extracting more information about the transaction. 

# Transaction category:

Your need to classify the transaction category from the description. Here are the categories with tips on how to detect them:

Salary: Usually a larger amount deposit, relative to other transactions. Usually once a month, but may be weekly or bi-weekly.
Income: Any deposit that is not Salary.

Rent: Usually a larger amount withdrawal, relative to the other transactions. Usually once a month. It may be a check or ACH. If it is a rent check, use rent category, not check category.
Mortgage/Loans: Similar to rent, usually a large amount withdrawal, once a month. Should see either a rent or mortgage for most people in a bank statement, at least once. May include words like Mortgage, Loan, etc.
Bills/Utilities: Regular widthdrawals, usually once a month. May include words like BILL, BILLPAY, Water, Electricity, Phone, HOA, etc.
Credit Cards: Smaller withdrawals with varied amounts. May include words like POS, VISA, MASTERCARD, AMEX, DISCOVER, etc.
Cash: Cash withdrawals. Usually even amounts like 20, 100, 50, etc. May include words like CSH or ATM.
Checks: Checks presented by the account owner. May be shown in a separate table. May include words like cheque, chk, chq, etc. Should include a check number (more on that below).
Other: Any other withdrawal that does not fall into one of the categegories above. 

# Relevant Terminology

ACH: Automated Clearing House
APB: Aadhaar Payment Bridge (used in India for Government benefits)
IMPS: Immediate Payment System (money transfer used in India)

# Checks

Most bank statement pages contain only transactions, but some pages may contain checks to give more information about a check withdrawal transaction.
Checks information should be extracted with the following fields: check_number, date, payee, amount, and for. 
Return the transactions and checks in the bank statement page below as JSON. 
Do NOT generate transactions for checks and do NOT generate checks for transactions. Return the transactions and checks from the statement as-is.
`;
    }

    /**
     * returns schema definitions
     */
    getSchemaDefs() {
        return {
            transaction: this.schemaObject('Transaction information', {
                date: { type: 'string', description: 'Transaction Date' },
                description: { type: 'string', description: 'Transaction Description' },
                category: { type: 'string', description: 'Transaction Category', enum: [ 'Rent', 'Salary', 'Income', 'Bills/Utilities', 'Credit cards', 'Cash/ATM', 'Checks', 'Mortgage/Loans', 'Other Expenses' ] },
                checkNumber: { type: 'string', description: 'Check Number' },
                type: { type: 'string', description: 'Transaction Type', enum: [ 'Deposit', 'Withdrawal' ] },
                amount: { type: 'number', description: 'Transaction Amount' }
            }),
            check: this.schemaObject('Check information', {
                checkNumber: { type: 'string', description: 'Check Number' },
                date: { type: 'string', description: 'Check Date' },
                payee: { type: 'string', description: 'The name of the person or business that the check was written to' },
                for: { type: 'string', description: 'What the check was for' },
                amount: { type: 'number', description: 'Check Amount' }
            })
        };
    }

    /**
     * returns the response format for extracting transactions and checks from a page
     */
    getResponseFormat() {
        const schema = {
            name: 'response',
            strict: true,
            schema: this.schemaObject('Response schema', {
                transactions: { type: 'array', description: 'The transactions extracted from the statement page.', items: { $ref: '#/$defs/transaction' } },
                checks: { type: 'array', description: 'The checks extracted from the statement page.', items: { $ref: '#/$defs/check' } }
            }, this.getSchemaDefs())
        };
        return { type: 'json_schema', json_schema: schema };
    }

    /**
     * calls open AI to extract content from a page with a structured output
     */
    async extractPage(pageContent) {

        // assign a unique id to the page based on its contents
        const pageId = md5(pageContent);

        // check if the page data is already cached and return the cached data if it is
        if (this.isCached(pageId)) return this.getCached(pageId);

        // call open AI to extract content from the page
        const completion = await this.openai.chat.completions.create({ 
            model: 'gpt-4o',
            temperature: 0, 
            messages: [ { role: 'system', content: this.getSystemPrompt() }, { role: 'user', content: pageContent } ], 
            response_format: this.getResponseFormat() 
        });
        if (!completion?.choices || !Array.isArray(completion.choices) || completion.choices.length === 0) throw new Error('No response.');
        const response = completion.choices[0];
        if (!response?.message?.content) throw new Error('No content.');

        // save the extracted content to the cache and return it
        this.saveCached(pageId, response.message.content);
        return this.getCached(pageId);
    }

    /**
     * adds mandatory required and additional properties to an object for OpenAI schemas
     */
    schemaObject(description, props, $defs) {
        return { 
            type: 'object', 
            description, 
            $defs, 
            properties: props, 
            required: Object.keys(props), 
            additionalProperties: false 
        };
    }

    /**
     * returns the page cache file
     */
    getCacheFile(pageId) {
        return `./cache/extractor/${pageId}.json`;
    }

    /**
     * returns if the page is already cached
     */
    isCached(pageId) {
        return existsSync(this.getCacheFile(pageId));
    }

    /**
     * saves a page transaction and check data to the cache
     */
    saveCached(pageId, transactionsAndChecks) {
        writeFileSync(this.getCacheFile(pageId), JSON.stringify(transactionsAndChecks));
    }

    /**
     * returns the cached transactions and checks in a page
     */
    getCached(pageId) {
        return JSON.parse(readFileSync(this.getCacheFile(pageId)));
    }
    
}

// Export the class
export default Extractor;