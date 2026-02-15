document.getElementById("calcBtn").addEventListener("click", calculateInterest);

function calculateInterest() {

    let principal = parseFloat(document.getElementById("principal").value);
    let time = parseFloat(document.getElementById("time").value);
    let rateInput = document.getElementById("rateInput");
    let error = document.getElementById("error");

    error.innerText = "";

    if (isNaN(principal) || isNaN(time)) {
        error.innerText = "Please enter valid numbers!";
        return;
    }

    if (principal < 500 || principal > 1000000) {
        error.innerText = "Principal must be between 500 and 10000";
        return;
    }

    let rate;

    if (principal < 1000) {
        rate = 5;
    } 
    else if (principal <= 5000) {
        rate = 7;
    } 
    else {
        rate = 10;
    }

    let bonusMessage = "No bonus applied.";

    if (time > 5) {
        rate += 2;
        bonusMessage = "Bonus 2% added (Time > 5 years).";
    }

    rateInput.value = rate;

    let interest = (principal * rate * time) / 100;
    let total = principal + interest;

    document.getElementById("interest").innerText =
        "Interest: $" + interest.toFixed(2);

    document.getElementById("total").innerText =
        "Total Amount: $" + total.toFixed(2);

    document.getElementById("info").innerText =
        "Applied Rate: " + rate + "% | " + bonusMessage;
}