import { fetchSpecificSheet } from "./index.js";
import {
  formatPrice,
  cartCounterDisplay,
  viewCartModal,
  updateCartModalContentCounter,
  updateTotalPaymentDisplay,
} from "./shop.js";
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
    console.log("cartSettings:", cartSettings);
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
  delFee.textContent = "$" + settings[0].delFee.toFixed(2);
  const percentage = Number(settings[0].taxRate) * 100;
  taxRate.textContent = percentage + "%";
  let grand =
    Number(totalPayment) * settings[0].taxRate +
    Number(totalPayment) +
    settings[0].delFee;
  grandTotal.textContent = "$" + grand.toFixed(2);
}

/* export function openPaymentMethod() {
  const paymentMethods = document.querySelectorAll(
    'input[name="paymentMethod"]',
  );
  const paypalContainer = document.querySelector(".paypal-container");
  paymentMethods.forEach((radio) => {
    radio.addEventListener("change", () => {
      paypalContainer.hidden =
        document.getElementById("paypal").checked === false;
    });
  });
} */
/* function getOrderDetails() {
  return {
    customer: {
      name: document.getElementById("checkoutName").value.trim(),
      email: document.getElementById("checkoutEmail").value.trim(),
      phone: document.getElementById("checkoutPhone").value.trim(),
      address: document.getElementById("checkoutAddress").value.trim(),
      city: document.getElementById("checkoutCity").value.trim(),
      zip: document.getElementById("checkoutZip").value.trim(),
      deliveryDate: document.getElementById("checkoutDate").value,
      deliveryTime: document.getElementById("checkoutTime").value,
      note: document.getElementById("order-note").value.trim(),
    },

    paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')
      .value,

    cart: JSON.parse(localStorage.getItem("cartContent")) || [],
  };
}
 */
