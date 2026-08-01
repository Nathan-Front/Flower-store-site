let paypalRendered = false;
const SERVER_URL = "https://flosandflorere.onrender.com";
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

        const cart = JSON.parse(localStorage.getItem("temporaryCart")) || [];

        console.log("Frontend cart:", cart);

        const orderDetails = {
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
        };

        const response = await fetch(`${SERVER_URL}/api/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderDetails),
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

          const orderData = await response.json();
          // Three cases to handle:
          //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
          //   (2) Other non-recoverable errors -> Show a failure message
          //   (3) Successful transaction -> Show confirmation or thank you message

          const errorDetail = orderData?.details?.[0];

          if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
            // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
            // recoverable state, per
            // https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
            return actions.restart();
          } else if (errorDetail) {
            // (2) Other non-recoverable errors -> Show a failure message
            throw new Error(
              `${errorDetail.description} (${orderData.debug_id})`,
            );
          } else if (!orderData.purchase_units) {
            throw new Error(JSON.stringify(orderData));
          } else {
            // (3) Successful transaction -> Show confirmation or thank you message
            // Or go to another URL:  actions.redirect('thank_you.html');
            const transaction =
              orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
              orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];
            resultMessage(
              `Transaction ${transaction.status}: ${transaction.id}<br>
          <br>See console for all available details`,
            );
            console.log(
              "Capture result",
              orderData,
              JSON.stringify(orderData, null, 2),
            );
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
  const paypalRadio = document.getElementById("paypal");
  const paypalContainer = document.querySelector(".paypal-container");
  if (!paypalRadio || !paypalContainer) {
    console.log("PayPal elements not found");
    return;
  }

  if (paypalRadio.checked) {
    paypalContainer.classList.add("show");
    initPaypalButtons();
  } else {
    paypalContainer.classList.remove("show");
  }
}

// Example function to show a result to the user. Your site's UI library can be used instead.
function resultMessage(message) {
  const container = document.querySelector("#result-message");
  container.innerHTML = message;
}
