import PropTypes from 'prop-types';
import { useState } from 'react';
import { aggregateTransactions, calculateRatios } from './transactionAggregator.js';
import { formatAmount } from './utils.js';

const HIGH_EXPENSE_THRESHOLD = 30;

export function TransactionSummary({ transactions }) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const summary = aggregateTransactions(transactions);
    const ratios = calculateRatios(summary);

    const hasWithdrawalWarning = summary.totalWithdrawals > summary.totalDeposits;

    const renderExpenseCategory = (category, amount, ratio, label) => {
        if (amount === 0) return null;
        return (
            <>
                <div className="expense-category" onClick={() => setSelectedCategory(category)}>
                    <span>{label}</span>
                    <span>{formatAmount(amount)}</span>
                    <span>{ratio.toFixed(0)}%</span>
                </div>
                {ratio > HIGH_EXPENSE_THRESHOLD && (
                    <div className="warning-message">
                        ⚠️ High expense ({ratio.toFixed(0)}% of income)
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="transaction-summary">
            {/* Income Section */}
            <section className="income-section">
                <h2>Deposits: {formatAmount(summary.totalDeposits)}</h2>
                <div className="grid-header">
                    <span>Category</span>
                    <span>Amount</span>
                </div>
                {summary.income.salary > 0 && (
                    <div className="income-details" onClick={() => setSelectedCategory('Salary')}>
                        <span>Salary</span>
                        <span>{formatAmount(summary.income.salary)}</span>
                    </div>
                )}
                {summary.income.other > 0 && (
                    <div className="income-details" onClick={() => setSelectedCategory('Income')}>
                        <span>Other Income</span>
                        <span>{formatAmount(summary.income.other)}</span>
                    </div>
                )}
            </section>

            {/* Withdrawals Section */}
            <h2>Withdrawals: {formatAmount(summary.totalWithdrawals)}</h2>
            {hasWithdrawalWarning && (
                <div className="warning-message">
                    ⚠️ Warning: Withdrawals exceed deposits
                </div>
            )}

            {/* Expenses Section */}
            <section className="expenses-section">
                <div className="grid-header">
                    <span>Category</span>
                    <span>Amount</span>
                    <span>Income %</span>
                </div>
                {renderExpenseCategory('Rent', summary.expenses.rent, ratios.rent, 'Rent')}
                {renderExpenseCategory('Mortgage/Loans', summary.expenses.mortgageAndLoans, ratios.debtToIncome, 'Loans')}
                {renderExpenseCategory('Bills/Utilities', summary.expenses.billsAndUtilities, ratios.billsToIncome, 'Bills/Utilities')}
                {renderExpenseCategory('Cash/ATM', summary.expenses.cashAndATM, ratios.cashToIncome, 'Cash/ATM')}
                {renderExpenseCategory('Checks', summary.expenses.checks, ratios.checksToIncome, 'Checks')}
                {renderExpenseCategory('Credit Cards', summary.expenses.creditCards, ratios.creditToIncome, 'Credit Cards')}
                {renderExpenseCategory('Other', summary.expenses.other, ratios.otherToIncome, 'Other Expense')}
            </section>

            {/* Transaction details dialog */}
            {selectedCategory && (
                <dialog open onClose={() => setSelectedCategory(null)}>
                    <h3>{selectedCategory} Transactions</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.categoryTransactions[selectedCategory]?.map((trans, i) => (
                                <tr key={i}>
                                    <td>{trans.date}</td>
                                    <td>{trans.description}</td>
                                    <td>{formatAmount(trans.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={() => setSelectedCategory(null)}>Close</button>
                </dialog>
            )}
        </div>
    );
}

TransactionSummary.propTypes = {
    transactions: PropTypes.arrayOf(PropTypes.shape({
        date: PropTypes.string,
        description: PropTypes.string,
        category: PropTypes.string,
        type: PropTypes.string,
        amount: PropTypes.number
    })).isRequired
};