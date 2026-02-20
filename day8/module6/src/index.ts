const display = document.getElementById("display") as HTMLInputElement;
const buttons = document.querySelectorAll("button");

let currentInput: string = "";
let firstValue: number | null = null;
let operator: string | null = null;

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.textContent || "";

    if (!isNaN(Number(value))) {
      currentInput += value;
      display.value = currentInput;
    }

    else if (value === "C") {
      currentInput = "";
      firstValue = null;
      operator = null;
      display.value = "0";
    }

    else if (value === "=") {
      if (firstValue !== null && operator) {
        const secondValue = Number(currentInput);
        let result = 0;

        if (operator === "/" && secondValue === 0) {
          display.value = "Error";
          return;
        }

        if (operator === "+") result = firstValue + secondValue;
        if (operator === "-") result = firstValue - secondValue;
        if (operator === "*") result = firstValue * secondValue;
        if (operator === "/") result = firstValue / secondValue;

        display.value = result.toString();
        currentInput = result.toString();
        firstValue = null;
        operator = null;
      }
    }

    else {
      firstValue = Number(currentInput);
      operator = value;
      currentInput = "";
    }
  });
});