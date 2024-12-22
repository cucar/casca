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
        // Group transactions by category for easy access in dialogs
        if (!summary.categoryTransactions[trans.category]) {
            summary.categoryTransactions[trans.category] = [];
        }
        summary.categoryTransactions[trans.category].push(trans);

        if (trans.type === 'Deposit') {
            summary.totalDeposits += trans.amount;
            if (trans.category === 'Salary') {
                summary.income.salary += trans.amount;
            } else {
                summary.income.other += trans.amount;
            }
        } else {
            summary.totalWithdrawals += trans.amount;
            switch (trans.category) {
                case 'Rent':
                    summary.expenses.rent += trans.amount;
                    break;
                case 'Mortgage/Loans':
                    summary.expenses.mortgageAndLoans += trans.amount;
                    break;
                case 'Bills/Utilities':
                    summary.expenses.billsAndUtilities += trans.amount;
                    break;
                case 'Cash/ATM':
                    summary.expenses.cashAndATM += trans.amount;
                    break;
                case 'Checks':
                    summary.expenses.checks += trans.amount;
                    break;
                case 'Credit Cards':
                    summary.expenses.creditCards += trans.amount;
                    break;
                default:
                    summary.expenses.other += trans.amount;
            }
        }
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