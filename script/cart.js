import { fetchSpecificSheet } from "./index.js";
import {
  formatPrice,
  cartCounterDisplay,
  viewCartModal,
  updateCartModalContentCounter,
  updateTotalPaymentDisplay,
  deleteItemCartModal,
} from "./shop.js";
import { placeCODOrder } from "./app.js";
export function checkCartAvailability() {
  const tempCart = JSON.parse(localStorage.getItem("temporaryCart")) || [];
  const message = document.querySelector(".order-summary-message");
  if (!message) return;
  const paymentRadios = document.querySelectorAll(
    'input[name="paymentMethod"]',
  );
  if (tempCart.length === 0) {
    paymentRadios.forEach((radio) => {
      radio.disabled = true;
    });
    message.textContent = `Your cart is empty. Please add items to your cart before proceeding to checkout.`;
  } else {
    paymentRadios.forEach((radio) => {
      radio.disabled = false;
    });
    message.textContent = "";
  }
}
export function cartCheckoutSummary() {
  const ul = document.querySelector(".cart-checkout-content");
  if (!ul) return;
  const tempCart = JSON.parse(localStorage.getItem("temporaryCart")) || [];
  ul.innerHTML = `
    ${tempCart
      .map(
        (product) => `
            <li data-product-id=${product.item.no}>
              <div class="check-product-details-con">
                <div class="check-cart-product-image">
                  <img src=${product.item.image} alt="product-item-${product.item.no}" />
                </div>
                <div class="check-cart-product-details">
                  <strong>${product.item.product}</strong>
                  <span>${formatPrice(product.item.price)}</span>
                  <div class="check-cart-add-minus-con">
                    <div class="check-quantity-con">
                      <span>Quantity:</span>
                    </div>
                    <button class="check-cart-minus-qty-btn">−</button>
                    <div class="check-cart-qty-display-con">
                      <span class="check-cart-qty-display">${product.quantity}</span>
                    </div>
                    <button class="check-cart-add-qty-btn">+</button>
                    <button class="cart-modal-del-btn"><i class="fa-solid fa-trash"></i></button>
                  </div>
                </div>
              </div>
            </li>
        `,
      )
      .join("")}
  `;
  addMinusCartCheckout();
  deleteItemCartModal();
}

function addMinusCartCheckout() {
  const increaseBtn = document.querySelectorAll(".check-cart-add-qty-btn");
  const decreaseBtn = document.querySelectorAll(".check-cart-minus-qty-btn");
  increaseBtn.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const tempCart = JSON.parse(localStorage.getItem("temporaryCart")) || [];
      const li = btn.closest("li");
      const productId = Number(li.dataset.productId);
      const cartModalCnt = li.querySelector(".check-cart-qty-display");
      //find item using its index in the array
      const cartIndex = tempCart.findIndex(
        (product) => product.item.no === productId, //use the id of li tag to compare
      );
      if (cartIndex === -1) return;
      tempCart[cartIndex].quantity++; //update the quantity of the found index
      localStorage.setItem("temporaryCart", JSON.stringify(tempCart));
      cartModalCnt.textContent = tempCart[cartIndex].quantity;
      updateCartModalContentCounter();
      cartCounterDisplay();
      updateTotalPaymentDisplay();
      viewCartModal();
      renderCheckoutData(cartSettings);
    });
  });

  decreaseBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tempCart = JSON.parse(localStorage.getItem("temporaryCart")) || [];
      const li = btn.closest("li");
      const productId = Number(li.dataset.productId);
      const cartModalCnt = li.querySelector(".check-cart-qty-display");
      const cartIndex = tempCart.findIndex(
        (product) => product.item.no === productId,
      );
      if (cartIndex === -1) return;
      tempCart[cartIndex].quantity = Math.max(
        1,
        tempCart[cartIndex].quantity - 1,
      );
      localStorage.setItem("temporaryCart", JSON.stringify(tempCart));
      cartModalCnt.textContent = tempCart[cartIndex].quantity;
      updateCartModalContentCounter();
      cartCounterDisplay();
      updateTotalPaymentDisplay();
      viewCartModal();
      renderCheckoutData(cartSettings);
    });
  });
}
export let cartSettings = [];
export async function loadCheckoutDisplay() {
  //const secondSection = document.querySelector(".cart-second-sec");
  try {
    cartSettings = await fetchSpecificSheet(
      "checkout",
      "settings",
      formatCartDisplay,
    );
    //console.log("cartSettings:", cartSettings);
    renderCheckoutData(cartSettings);
  } catch (error) {
    console.log(error);
  }
}
function formatCartDisplay(data) {
  return data.map((setting) => ({
    delFee: setting.DeliveryFee,
    taxRate: setting.TaxRate,
  }));
}

export function renderCheckoutData(settings) {
  const subTotal = document.querySelector(".sub-total");
  const delFee = document.querySelector(".delivery-fee");
  const taxRate = document.querySelector(".tax-fee");
  const grandTotal = document.querySelector(".grand-total");
  const tempCart = JSON.parse(localStorage.getItem("temporaryCart")) || [];
  const totalPayment = tempCart.reduce(
    (total, product) => total + product.item.price * product.quantity,
    0,
  );
  subTotal.textContent = "$" + totalPayment.toFixed(2);
  delFee.textContent =
    "$" + (tempCart.length !== 0 ? settings[0].delFee.toFixed(2) : "0.00");
  const percentage = Number(settings[0].taxRate) * 100;
  taxRate.textContent = (tempCart.length !== 0 ? percentage : 0) + "%";
  let grand =
    Number(totalPayment) * settings[0].taxRate +
    Number(totalPayment) +
    settings[0].delFee;
  grandTotal.textContent =
    "$" + (tempCart.length !== 0 ? grand.toFixed(2) : "0.00");
}

export function updateCheckoutFormState() {
  const form = document.querySelector("#checkout-form");
  const cart = JSON.parse(localStorage.getItem("temporaryCart")) || [];

  if (!form) return;

  const hasItems = cart.length > 0;
  form.classList.toggle("form-disabled", !hasItems); //hasItems true = remove form-disabled, false = add form-disabled
  //get all form elements and disable them if cart is empty
  [...form.elements].forEach((element) => {
    element.disabled = !hasItems;
  });
}

export function showOrderSuccessModal(result) {
  //console.log("Order success result:", result);
  if (!result) {
    console.error("No order result received");
    return;
  }
  const aside = document.createElement("aside");
  aside.classList.add("order-success-modal");
  const isPaypal = result.type === "paypal";
  aside.innerHTML = `
    <div>
      <h2>Order Confirmed!</h2>
      <p>Thank you for your order.</p>
      <strong>Order ID: ${
        result.googleScript?.orderId || result.orderID || "N/A"
      }</strong>

      <p>Status: ${result.status}</p>
      <p>Payment Method: ${result.paymentMethod}</p>
      ${
        isPaypal
          ? `
      <p>Transaction ID: ${result.captureID}</p>
      <p>
        Amount Paid:
        $${result.amount}
      </p>
      `
          : `
      <p>Payment will be collected upon delivery.</p>
      <p>
        Amount Due:
        $${result.amount}
      </p>
      `
      }
      <small>Please check your email for order details.</small>
      <button id="close-order-success-modal">
        Close
      </button>
    </div>
  `;
  document.body.appendChild(aside);
  document.querySelector(".overlay").classList.add("activeOverlay");
  document.body.classList.add("no-scroll");
  localStorage.removeItem("temporaryCart");
  closeOrderSuccessModal();
}

function closeOrderSuccessModal() {
  const modal = document.querySelector("#close-order-success-modal");
  modal.addEventListener("click", () => {
    cartCounterDisplay();
    const overlay = document.querySelector(".overlay");
    overlay.classList.remove("activeOverlay");
    document.body.classList.remove("no-scroll");
    window.location.href = "index.html";
  });
}
