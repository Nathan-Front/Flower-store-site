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
    });
  });
}
