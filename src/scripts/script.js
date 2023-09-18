"use strict"

// Storing the reference to the DOM elements to use them later
const currencyTag = document.querySelectorAll(".dropdown");
const providedVal = document.querySelector("#provided-val");
const convertedVal = document.querySelector("#converted-val");
const convertBtn = document.querySelector(".convert-btn");
const errorEl = document.querySelector(".error");

// Base Url for the currency conversion API
const baseURL = "https://v6.exchangerate-api.com";

// Initialize the dropdowns with default options
currencyTag.forEach((tag) => {
  const defaultOption = document.createElement("option");
  defaultOption.text = "Choose Currency Option";
  defaultOption.disabled = true; // Disable the default option
  tag.add(defaultOption);
  tag.selectedIndex = 0; // Set the initial selected option to the default
});

// Function to fetch and populate currency options
const fetchCurrencyOptions = async (apiKey) => {
  try {
    const response = await fetch(`${baseURL}/v6/${apiKey}/codes`);
    const result = await response.json();

    if (result.result === "success") {
      const supportedCodes = result.supported_codes;

      // Enable the dropdowns
      currencyTag.forEach((tag) => {
        tag.disabled = false;
      });

      // Populate the currency dropdowns with options
      supportedCodes.forEach((codeNamePair) => {
        const code = codeNamePair[0];
        const name = codeNamePair[1];

        const option = document.createElement("option");
        option.value = code;
        option.text = `${code} - ${name}`;

        currencyTag[0].add(option);
        currencyTag[1].add(option.cloneNode(true));
      });
    } else {
      generateError(
        "Failed to fetch currency options. Please try again later."
      );
      return;
    }
  } catch (error) {
    console.log("Error fetching currency options:", error);
  }
};

// Function to handle currency conversion using the third part api
const handleConversion = async (apiKey) => {
  const url = `${baseURL}/v6/${apiKey}/pair/${currencyTag[0].value}/${currencyTag[1].value}/${providedVal.value}`;
  try {
    const response = await fetch(url);
    const result = await response.json();
    if (result.result === "success") {
      convertedVal.value = result?.conversion_result?.toFixed(2);
    } else {
      generateError("Error converting the currency value!!");
      return;
    }
  } catch (error) {
    console.error("API request error:", error.message);
  }
};

// Function to handle submitting of the form
// Performs value checks then calls the handle conversion function
const handleSubmit = (apiKey) => {
  convertBtn.addEventListener("click", () => {
    if (errorEl.textContent) {
      errorEl.textContent = "";
    }
    if (
      currencyTag[0].value === "Choose Currency Option" ||
      currencyTag[1].value === "Choose Currency Option"
    ) {
      generateError("Set the conversion parameters first!!!");
      return;
    }
    if (!providedVal.value || isNaN(providedVal.value)) {
      generateError("Provide the currency value to be converted!!!");
      return;
    }
    handleConversion(apiKey);
  });
};

// Updates the error value in the DOM if any
const generateError = (message) => {
  console.log(errorEl, errorEl.textContent, message);
  errorEl.textContent = message;
};

// Request the API key from the main process
ipcRenderer.send("get-api-key");
// Receive the API key from the main process
ipcRenderer.on("api-key", (event, apiKey) => {
  // Use the apiKey in the code securely
  fetchCurrencyOptions(apiKey);
  handleSubmit(apiKey);
});
