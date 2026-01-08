// HTML වල තියෙන දේවල් JavaScript වලට අඳුන්වා දීම
const expenseForm = document.getElementById('expense-form');
const expenseText = document.getElementById('text');
const expenseAmount = document.getElementById('amount');
const expenseList = document.getElementById('list');
const totalAmountDisplay = document.getElementById('total-amount');

let total = 0; // මුළු එකතුව දැනට 0යි

// Form එක Submit කරනකොට මොකද වෙන්න ඕන?
expenseForm.addEventListener('submit', function(event) {
    // 1. Page එක Refresh වෙන එක නවත්වන්න
    event.preventDefault();

    // 2. කොටු වල තියෙන අගයන් (Values) ලබා ගැනීම
    const text = expenseText.value;
    const amount = parseInt(expenseAmount.value); // අකුරු, ඉලක්කම් බවට හරවනවා

    // 3. පොඩි චෙක් කිරීමක් (Validation)
    if(text === '' || isNaN(amount) || amount <= 0) {
        alert('Please enter a valid text and amount!');
        return;
    }

    // 4. ලිස්ට් එකට අලුත් අයිතමයක් එකතු කිරීම (Create LI element)
    const li = document.createElement('li');
    
    // HTML කෝඩ් එක ඇතුල් කිරීම
    li.innerHTML = `
        ${text} 
        <span>- Rs. ${amount}.00</span>
    `;

    // හදපු LI එක UL (List) එකට දැම්මා
    expenseList.appendChild(li);

    // 5. Total එක අප්ඩේට් කිරීම
    total = total + amount;
    totalAmountDisplay.innerText = `Rs. ${total}.00`;

    // 6. ආපහු කොටු හිස් කිරීම (Clear inputs)
    expenseText.value = '';
    expenseAmount.value = '';
});