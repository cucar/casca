import PropTypes from 'prop-types';
import { useState } from 'react';
import { aggregateTransactions, calculateRatios } from './transactionAggregator.js';
import { formatAmount } from './utils.js';

export function TransactionSummary({ transactions }) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const summary = aggregateTransactions(transactions);
    const ratios = calculateRatios(summary);

    const hasWithdrawalWarning = summary.totalWithdrawals > summary.totalDeposits;

    return (
        <div className="transaction-summary">
            {/* Income Section */}
            <section className="income-section">
                <h2>Deposits: {formatAmount(summary.totalDeposits)}</h2>
                <div className="grid-header">
                    <span>Category</span>
                    <span>Amount</span>
                </div>
                <div className="income-details" onClick={() => setSelectedCategory('Salary')}>
                    <span>Salary</span>
                    <span>{formatAmount(summary.income.salary)}</span>
                </div>
                <div className="income-details" onClick={() => setSelectedCategory('OtherIncome')}>
                    <span>Other Income</span>
                    <span>{formatAmount(summary.income.other)}</span>
                </div>
            </section>

            {/* Withdrawals Section */}
            <h2>
                Withdrawals: {formatAmount(summary.totalWithdrawals)}
                {hasWithdrawalWarning && (
                    <span className="warning-icon" title="Withdrawals exceed deposits">⚠️</span>
                )}
            </h2>

            {/* Expenses Section */}
            <section className="expenses-section">
                <div className="grid-header">
                    <span>Category</span>
                    <span>Amount</span>
                    <span>Income %</span>
                </div>
                <div className="expense-category" onClick={() => setSelectedCategory('Rent')}>
                    <span>Rent</span>
                    <span>{formatAmount(summary.expenses.rent)}</span>
                    <span>{ratios.rent.toFixed(0)}%</span>
                </div>
                <div className="expense-category" onClick={() => setSelectedCategory('Mortgage/Loans')}>
                    <span>Loans</span>
                    <span>{formatAmount(summary.expenses.mortgageAndLoans)}</span>
                    <span>{ratios.debtToIncome.toFixed(0)}%</span>
                </div>
                <div className="expense-category" onClick={() => setSelectedCategory('Bills/Utilities')}>
                    <span>Bills/Utilities</span>
                    <span>{formatAmount(summary.expenses.billsAndUtilities)}</span>
                    <span>{ratios.billsToIncome.toFixed(0)}%</span>
                </div>
                <div className="expense-category" onClick={() => setSelectedCategory('Cash/ATM')}>
                    <span>Cash/ATM</span>
                    <span>{formatAmount(summary.expenses.cashAndATM)}</span>
                    <span>{ratios.cashToIncome.toFixed(0)}%</span>
                </div>
                <div className="expense-category" onClick={() => setSelectedCategory('Checks')}>
                    <span>Checks</span>
                    <span>{formatAmount(summary.expenses.checks)}</span>
                    <span>{ratios.checksToIncome.toFixed(0)}%</span>
                </div>
                <div className="expense-category" onClick={() => setSelectedCategory('Credit Cards')}>
                    <span>Credit Cards</span>
                    <span>{formatAmount(summary.expenses.creditCards)}</span>
                    <span>{ratios.creditToIncome.toFixed(0)}%</span>
                </div>
                <div className="expense-category" onClick={() => setSelectedCategory('Other')}>
                    <span>Other</span>
                    <span>{formatAmount(summary.expenses.other)}</span>
                    <span>{ratios.otherToIncome.toFixed(0)}%</span>
                </div>
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