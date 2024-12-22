import 'dotenv/config';
import { readFileSync } from 'fs';
import OpenAI from 'openai';

/**
 * returns the system prompt
 */
function getSystemPrompt() { 
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
function getSchemaDefs() {
    return {
        transaction: schemaObject('Transaction information', {
            date: { type: 'string', description: 'Transaction Date' },
            description: { type: 'string', description: 'Transaction Description' },
            category: { type: 'string', description: 'Transaction Category', enum: [ 'Rent', 'Salary', 'Income', 'Bills/Utilities', 'Credit cards', 'Cash/ATM', 'Checks', 'Mortgage/Loans', 'Other Expenses' ] },
            checkNumber: { type: 'string', description: 'Check Number' },
            type: { type: 'string', description: 'Transaction Type', enum: [ 'Deposit', 'Withdrawal' ] },
            amount: { type: 'number', description: 'Transaction Amount' }
        }),
        check: schemaObject('Check information', {
            checkNumber: { type: 'string', description: 'Check Number' },
            date: { type: 'string', description: 'Check Date' },
            payee: { type: 'string', description: 'The name of the person or business that the check was written to' },
            for: { type: 'string', description: 'What the check was for' },
            amount: { type: 'number', description: 'Check Amount' }
        })
    };
}

/**
 * calls open AI to get a structured output
 */
async function callOpenAI(message) {

    const messages = [ { role: 'system', content: getSystemPrompt() }, { role: 'user', content: message } ];

    const schema = {
        name: 'response',
        strict: true,
        schema: schemaObject('Response schema', {
            transactions: { type: 'array', description: 'The transactions extracted from the statement page.', items: { $ref: '#/$defs/transaction' } },
            checks: { type: 'array', description: 'The checks extracted from the statement page.', items: { $ref: '#/$defs/check' } }
        }, getSchemaDefs())
    };
    const responseFormat = { type: 'json_schema', json_schema: schema };

    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({ model: 'gpt-4o', temperature: 0, messages, response_format: responseFormat });
    
    if (!completion?.choices || !Array.isArray(completion.choices) || completion.choices.length === 0) throw new Error('No response.');
    const response = completion.choices[0];
    if (!response?.message?.content) throw new Error('No content.');
    return JSON.parse(response.message.content);
}

/**
 * adds mandatory required and additional properties to an object for OpenAI schemas
 */
function schemaObject(description, props, $defs) {
    return { type: 'object', description, $defs, properties: props, required: Object.keys(props), additionalProperties: false };
}

/**
 * returns the user message from the test file
 */
function getUserMessage(file, page) {
    return readFileSync(`./test/${file}_${page - 1}.md`, 'utf8');
}

const result = await callOpenAI(getUserMessage('test4', 1));
console.log(result);
