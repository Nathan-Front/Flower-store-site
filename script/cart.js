import { formatPrice } from "./shop.js";
export function cartCheckoutSummary() {
  const ul = document.querySelector(".cart-checkout-content");
  const tempCart = JSON.parse(localStorage.getItem("temporaryCart")) || [];
  ul.innerHTML = `
    ${tempCart
      .map(
        (product) => `
            <li data-product-id=${product.item.no}>
              <div class="product-details-con">
                <div class="cart-product-image">
                  <img src=${product.item.image} alt="product-item-${product.item.no}" />
                </div>
                <div class="cart-product-details">
                  <strong>${product.item.product}</strong>
                  <span>${formatPrice(product.item.price)}</span>
                  <div class="cart-add-minus-con">
                    <div class="quantity-con">
                      <span>Quantity:</span>
                    </div>
                    <button class="cart-minus-qty-btn">−</button>
                    <div class="cart-qty-display-con">
                      <span class="cart-qty-display">${product.quantity}</span>
                    </div>
                    <button class="cart-add-qty-btn">+</button>
                    <button class="cart-modal-del-btn"><i class="fa-solid fa-trash"></i></button>
                  </div>
                </div>
              </div>
            </li>
        `,
      )
      .join("")}
  `;
}
