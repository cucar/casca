import PropTypes from 'prop-types';
import { useState } from 'react';
import { aggregateTransactions, calculateRatios } from './transactionAggregator.js';

export function TransactionSummary({ transactions }) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const summary = aggregateTransactions(transactions);
    const ratios = calculateRatios(summary);

    const hasWithdrawalWarning = summary.totalWithdrawals > summary.totalDeposits;

    return (
        <div className="transaction-summary">
            {/* Income Section */}
            <section className="income-section">
                <h2>Deposits: {summary.totalDeposits.toFixed(0)}</h2>
                <div className="grid-header">
                    <span>Category</span>
                    <span>Amount</span>
                </div>
                <div className="income-details" onClick={() => setSelectedCategory('Salary')}>
                    <span>Salary</span>
                    <span>${summary.income.salary.toFixed(0)}</span>
                </div>
                <div className="income-details" onClick={() => setSelectedCategory('OtherIncome')}>
                    <span>Other Income</span>
                    <span>${summary.income.other.toFixed(0)}</span>
                </div>
            </section>

            {/* Withdrawals Section */}
            <h2>
                Withdrawals: {summary.totalWithdrawals.toFixed(0)}
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
                    <span>${summary.expenses.rent.toFixed(0)}</span>
                    <span>{ratios.rent.toFixed(0)}%</span>
                </div>
                <div className="expense-category" onClick={() => setSelectedCategory('Mortgage/Loans')}>
                    <span>Loans</span>
                    <span>${summary.expenses.mortgageAndLoans.toFixed(0)}</span>
                    <span>{ratios.debtToIncome.toFixed(0)}%</span>
                </div>
                <div className="expense-category" onClick={() => setSelectedCategory('Bills/Utilities')}>
                    <span>Bills/Utilities</span>
                    <span>${summary.expenses.billsAndUtilities.toFixed(0)}</span>
                    <span>{ratios.billsToIncome.toFixed(0)}%</span>
                </div>
                <div className="expense-category" onClick={() => setSelectedCategory('Cash/ATM')}>
                    <span>Cash/ATM</span>
                    <span>${summary.expenses.cashAndATM.toFixed(0)}</span>
                    <span>{ratios.cashToIncome.toFixed(0)}%</span>
                </div>
                <div className="expense-category" onClick={() => setSelectedCategory('Checks')}>
                    <span>Checks</span>
                    <span>${summary.expenses.checks.toFixed(0)}</span>
                    <span>{ratios.checksToIncome.toFixed(0)}%</span>
                </div>
                <div className="expense-category" onClick={() => setSelectedCategory('Credit Cards')}>
                    <span>Credit Cards</span>
                    <span>${summary.expenses.creditCards.toFixed(0)}</span>
                    <span>{ratios.creditToIncome.toFixed(0)}%</span>
                </div>
                <div className="expense-category" onClick={() => setSelectedCategory('Other')}>
                    <span>Other</span>
                    <span>${summary.expenses.other.toFixed(0)}</span>
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
                                    <td>${trans.amount.toFixed(0)}</td>
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