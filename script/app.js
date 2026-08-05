import { cartCounterDisplay } from "./shop.js";
import { showOrderSuccessModal } from "./cart.js";
let paypalRendered = false;
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
function initPaypalButtons() {
  if (paypalRendered) return;
  paypal
    .Buttons({
      style: {
        shape: "rect",
        layout: "vertical",
        color: "gold",
        label: "paypal",
      },
      onInit(data, actions) {
        const form = document.querySelector("#checkout-form");
        const message = document.querySelector("#paypal-message");
        actions.disable();
        function checkFormValidity() {
          if (form.checkValidity()) {
            actions.enable();
            message.textContent = "";
          } else {
            actions.disable();
            message.textContent =
              "Please complete all required fields before paying with PayPal.";
          }
        }

        form.addEventListener("input", checkFormValidity);
        form.addEventListener("change", checkFormValidity);

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

          const errorDetail = result?.paypal?.details?.[0];

          if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
            // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
            // recoverable state, per
            // https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
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
          }
        } catch (error) {
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
  console.log("🔥 COD button function started");
  const orderDetails = getOrderDetails();
  console.log("🔥 COD order details:", orderDetails);
  try {
    const response = await fetch(`${SERVER_URL}/api/orders/cod`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderDetails),
    });
    console.log("🔥 COD response received:", response);
    if (!response.ok) {
      throw new Error("Failed to place COD order.");
    }

    const result = await response.json();
    console.log("🔥 COD modal data:", result);
    showOrderSuccessModal(result);
  } catch (error) {
    console.error("Failed to place COD order:", error);
    alert("Failed to place COD order. Please try again.");
  }
}

export function placeOrderCOD() {
  console.log("🔥 placeOrderCOD initialized");
  const placeOrderBtn = document.getElementById("place-order-btn");
  console.log("Button found:", placeOrderBtn);
  if (!placeOrderBtn) {
    console.error("Place Order button not found");
    return;
  }
  placeOrderBtn.addEventListener("click", async () => {
    console.log("🔥 Place Order clicked");
    await placeCODOrder();
  });
}
