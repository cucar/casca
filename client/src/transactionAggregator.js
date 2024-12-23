export function aggregateTransactions(transactions) {
    const summary = {
        totalDeposits: 0,
        totalWithdrawals: 0,
        income: {
            salary: 0,
            other: 0,
            total: 0
        },
        expenses: {
            rent: 0,
            mortgageAndLoans: 0,
            billsAndUtilities: 0,
            cashAndATM: 0,
            checks: 0,
            creditCards: 0,
            other: 0
        },
        categoryTransactions: {}
    };

    transactions.forEach(trans => {

        // start with the category coming from the parser, but we may need to adjust it in case it is not consistent with the type of transaction
        let category = trans.category;

        // determine the category and add to the transaction category sums 
        if (trans.type === 'Deposit') {
            summary.totalDeposits += trans.amount;
            if (trans.category === 'Salary') {
                summary.income.salary += trans.amount;
                category = 'Salary';
            } else {
                summary.income.other += trans.amount;
                category = 'Income';
            }
        } else {
            summary.totalWithdrawals += trans.amount;
            switch (trans.category) {
                case 'Rent':
                    summary.expenses.rent += trans.amount;
                    category = 'Rent';
                    break;
                case 'Mortgage/Loans':
                    summary.expenses.mortgageAndLoans += trans.amount;
                    category = 'Mortgage/Loans';
                    break;
                case 'Bills/Utilities':
                    summary.expenses.billsAndUtilities += trans.amount;
                    category = 'Bills/Utilities';
                    break;
                case 'Cash/ATM':
                    summary.expenses.cashAndATM += trans.amount;
                    category = 'Cash/ATM';
                    break;
                case 'Checks':
                    summary.expenses.checks += trans.amount;
                    category = 'Checks';
                    break;
                case 'Credit Cards':
                    summary.expenses.creditCards += trans.amount;
                    category = 'Credit Cards';
                    break;
                default:
                    category = 'Other Expenses';
                    summary.expenses.other += trans.amount;
            }
        }

        // Group transactions by category for easy access in dialogs
        if (!summary.categoryTransactions[category]) summary.categoryTransactions[category] = [];
        summary.categoryTransactions[category].push(trans);
    });

    summary.income.total = summary.income.salary + summary.income.other;
    return summary;
}

export function calculateRatios(summary) {
    const { income, expenses } = summary;
    return {
        rent: (expenses.rent / income.total) * 100,
        debtToIncome: (expenses.mortgageAndLoans / income.total) * 100,
        billsToIncome: (expenses.billsAndUtilities / income.total) * 100,
        cashToIncome: (expenses.cashAndATM / income.total) * 100,
        checksToIncome: (expenses.checks / income.total) * 100,
        creditToIncome: (expenses.creditCards / income.total) * 100,
        otherToIncome: (expenses.other / income.total) * 100
    };
} 