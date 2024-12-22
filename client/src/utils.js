export function formatAmount(amount) {
    // Round to nearest integer and format with commas
    return Math.round(amount)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
} 