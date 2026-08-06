import { cartCounterDisplay } from "./shop.js";
import { showOrderSuccessModal } from "./cart.js";
let paypalRendered = false;
let paypalActions = null; //For form validity check
const SERVER_URL = "https://flosandflorere.onrender.com";
function getOrderDetails() {
  const cart = JSON.parse(localStorage.getItem("temporaryCart")) || [];
  return {
    cart,
    customer: {
      email: document.getElementById("checkoutEmail").value,
      phone: document.getElementById("checkoutPhone").value,
      name: document.getElementById("checkoutName").value,
      address: document.getElementById("checkoutAddress").value,
      city: document.getElementById("checkoutCity").value,
      zip: document.getElementById("checkoutZip").value,
      deliveryDate: document.getElementById("checkoutDate").value,
      deliveryTime: document.getElementById("checkoutTime").value,
      note: document.getElementById("order-note").value,
    },
    paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')
      ?.value,
  };
}
//form validation
function checkFormValidity() {
  const form = document.querySelector("#checkout-form");
  const message = document.querySelector("#payment-message");
  const codBtn = document.querySelector("#place-order-btn");
  if (!form || !codBtn) return;
  const isValid = form.checkValidity();
  codBtn.disabled = !isValid;
  //Message
  if (isValid) {
    message.textContent = "";
  } else {
    message.textContent =
      "Please complete all required fields before placing an order.";
  }
  //PayPal only if initialized
  if (paypalActions) {
    if (isValid) {
      paypalActions.enable();
    } else {
      paypalActions.disable();
    }
  }
}
//form initialization
export function initPaymentValidation() {
  const form = document.querySelector("#checkout-form");
  if (!form) return;
  form.addEventListener("input", checkFormValidity);
  form.addEventListener("change", checkFormValidity);
  checkFormValidity();
}
function initPaypalButtons() {
  if (paypalRendered) return; //prevent rendering the PayPal buttons multiple times
  paypal
    .Buttons({
      style: {
        shape: "rect",
        layout: "vertical",
        color: "gold",
        label: "paypal",
      },
      onInit(data, actions) {
        paypalActions = actions; //Store actions for later use in form validation
        actions.disable();
        checkFormValidity();
      },

      async createOrder() {
        console.log("PayPal createOrder called");
        // Get the order details from the form and localstorage
        const orderDetails = getOrderDetails();
        if (orderDetails.paymentMethod !== "paypal") {
          throw new Error(
            "Selected payment method is not PayPal. Please select PayPal to proceed.",
          );
        }
        console.log("Frontend cart:", orderDetails.cart);
        console.log("Selected payment method:", orderDetails.paymentMethod);

        const response = await fetch(`${SERVER_URL}/api/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderDetails), //Send cart and customer info to the server
        });

        const data = await response.json();

        console.log("🔥 PayPal response from server:", data);
        console.log("🔥 PayPal order ID:", data.id);

        return data.id;
      },
      async onApprove(data, actions) {
        showLoadingOverlay();
        document.body.classList.add("no-scroll");
        try {
          const response = await fetch(
            `${SERVER_URL}/api/orders/${data.orderID}/capture`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          //const orderData = await response.json(); the original code
          const result = await response.json(); //capture the passed result from the server.js
          // Three cases to handle:
          //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
          //   (2) Other non-recoverable errors -> Show a failure message
          //   (3) Successful transaction -> Show confirmation or thank you message
          console.log("FULL SERVER RESULT:", result);
          console.log("Payment type:", result.type);
          console.log("Google Script result:", result.googleScript);
          console.log("Full response:", result);
          const errorDetail = result?.paypal?.details?.[0];

          if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
            // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
            // recoverable state, per
            // https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
            hideLoadingOverlay();
            document.body.classList.remove("no-scroll");
            return actions.restart();
          } else if (errorDetail) {
            // (2) Other non-recoverable errors -> Show a failure message
            throw new Error(
              `${errorDetail.description} (${result.paypal.debug_id})`,
            );
          } else if (!result.paypal.purchase_units) {
            throw new Error(JSON.stringify(result.paypal));
          } else {
            // (3) Successful transaction -> Show confirmation or thank you message
            // Or go to another URL:  actions.redirect('thank_you.html');
            const transaction =
              result.paypal?.purchase_units?.[0]?.payments?.captures?.[0] ||
              result.paypal?.purchase_units?.[0]?.payments?.authorizations?.[0];
            resultMessage(
              `Transaction ${transaction.status}: ${transaction.id}
              <br>Thank you for trying our service!<br>`,
            );
            console.log("Capture result", result.paypal);
          }

          if (result.googleScript.success) {
            console.log("Result: " + result);
            console.log("googleScript: " + result.googleScript);
            showOrderSuccessModal(result);
            hideLoadingOverlay();
            document.body.classList.remove("no-scroll");
          }
        } catch (error) {
          hideLoadingOverlay();
          document.body.classList.remove("no-scroll");
          console.error(error);
          resultMessage(
            `Sorry, your transaction could not be processed...<br><br>${error}`,
          );
        }
      },
    })
    .render("#paypal-button-container");
  paypalRendered = true;
}
export function updatePaymentMethod() {
  const paypalContainer = document.querySelector(".paypal-container");
  const CODContainer = document.querySelector(".cash-on-delivery-btn-con");

  if (!paypalContainer || !CODContainer) {
    console.log("PayPal or COD elements not found");
    return;
  }

  const selectedMethod = document.querySelector(
    'input[name="paymentMethod"]:checked',
  )?.value;

  if (selectedMethod === "paypal") {
    CODContainer.classList.remove("showCODbtn");
    paypalContainer.classList.add("show");
    initPaypalButtons();
  }

  if (selectedMethod === "cash-on-delivery") {
    paypalContainer.classList.remove("show");
    CODContainer.classList.add("showCODbtn");
  }
}

// Example function to show a result to the user. Your site's UI library can be used instead.
function resultMessage(message) {
  const container = document.querySelector("#result-message");
  container.innerHTML = message;
}

// COD payment method handling
export async function placeCODOrder() {
  const orderDetails = getOrderDetails();
  try {
    const response = await fetch(`${SERVER_URL}/api/orders/cod`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderDetails),
    });
    if (!response.ok) {
      throw new Error("Failed to place COD order.");
    }

    const result = await response.json();
    return result; // Return the result to be used in the calling function
  } catch (error) {
    console.error("Failed to place COD order:", error);
    throw error; //Throw back the error to be handled in the calling function
  }
}
// COD button event
export function placeOrderCOD() {
  const placeOrderBtn = document.getElementById("place-order-btn");

  if (!placeOrderBtn) return;
  placeOrderBtn.addEventListener("click", async () => {
    //Show loading UI immediately
    showLoadingOverlay();
    //Prevent double clicks
    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = "Placing Order...";
    document.body.classList.add("no-scroll");
    try {
      const result = await placeCODOrder();
      showOrderSuccessModal(result);
    } catch (error) {
      console.error(error);
    } finally {
      hideLoadingOverlay();
      placeOrderBtn.disabled = false;
      placeOrderBtn.textContent = "Place Order";
      document.body.classList.remove("no-scroll");
    }
  });
}
function showLoadingOverlay() {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) {
    overlay.classList.add("show-loading");
  }
}
function hideLoadingOverlay() {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) {
    overlay.classList.remove("show-loading");
  }
}
