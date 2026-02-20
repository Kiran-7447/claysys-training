"use strict";
const display = document.getElementById("display");
let expression = "";
document.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
        const value = button.textContent;
        if (!value)
            return;
        if (value === "C") {
            expression = "";
            display.value = "";
        }
        else if (value === "=") {
            try {
                expression = eval(expression).toString();
                display.value = expression;
            }
            catch (_a) {
                display.value = "Error";
                expression = "";
            }
        }
        else {
            expression += value;
            display.value = expression;
        }
    });
});
