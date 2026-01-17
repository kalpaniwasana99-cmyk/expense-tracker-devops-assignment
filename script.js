// Function to handle UI updates and notifications when budget is exceeded
function checkBudgetLimit(total) {
    // Ensure we are comparing numbers, not strings
    const budgetValue = parseFloat(currentBudget);
    const totalValue = parseFloat(total);

    if (budgetValue > 0 && totalValue > budgetValue) {
        // Visual Warning: Budget Exceeded
        budgetCard.classList.add('budget-over');
        totalAmountDisplay.classList.add('text-danger');
        
        // Show the alert message
        budgetStatus.innerHTML = `
            <div style="background: rgba(239, 68, 68, 0.1); padding: 8px; border-radius: 8px; border-left: 4px solid #ef4444; margin-top: 10px;">
                <span style="color: #ef4444; font-size: 12px; font-weight: 800;">
                    <i class="fas fa-exclamation-triangle"></i> ALERT: Monthly Budget Exceeded!
                </span>
            </div>
        `;
    } else {
        // Normal state: Within budget
        budgetCard.classList.remove('budget-over');
        totalAmountDisplay.classList.remove('text-danger');
        
        // Show safe limit message if budget is set
        if (budgetValue > 0) {
            budgetStatus.innerHTML = `
                <div style="margin-top: 10px;">
                    <span style="color: #10b981; font-size: 11px; font-weight: 600;">
                        <i class="fas fa-check-circle"></i> Spending is within your safe limit.
                    </span>
                </div>
            `;
        } else {
            budgetStatus.innerText = "";
        }
    }
}