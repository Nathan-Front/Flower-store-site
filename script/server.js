//added
import path from "path";
import { fileURLToPath } from "url";

import express from "express";
import "dotenv/config";
import {
  ApiError,
  CheckoutPaymentIntent,
  Client,
  Environment,
  LogLevel,
  OrdersController,
  PaymentsController,
  PaypalExperienceLandingPage,
  PaypalExperienceUserAction,
} from "@paypal/paypal-server-sdk";
import bodyParser from "body-parser";
//added
import cors from "cors";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "https://nathan-front.github.io",
];
const pendingOrders = new Map(); //for pending orders, to be used for order capture after approval
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like Postman or server-to-server calls)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy violation"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "..")));

const {
  PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET,
  GOOGLE_SCRIPT_URL,
  PORT = 8080,
} = process.env;

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_CLIENT_ID,
    oAuthClientSecret: PAYPAL_CLIENT_SECRET,
  },
  timeout: 0,
  environment: Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: { logBody: true },
    logResponse: { logHeaders: true },
  },
});

const ordersController = new OrdersController(client);
const paymentsController = new PaymentsController(client);

/**
 * Create an order to start the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
 */
const createOrder = async (cart) => {
  //google apps script url
  const response = await fetch(`${GOOGLE_SCRIPT_URL}?type=checkout`);
  console.log("Google Script URL:", GOOGLE_SCRIPT_URL);
  //console.log("Sending orderData:", orderData);
  const settings = await response.json();

  const items = cart.map((cartItem) => ({
    name: cartItem.item.product,
    unitAmount: {
      currencyCode: "USD",
      value: Number(cartItem.item.price).toFixed(2),
    },
    quantity: String(cartItem.quantity),
    description: cartItem.item.description,
    sku: String(cartItem.item.no),
  }));

  const total = cart.reduce(
    (sum, cartItem) =>
      sum + Number(cartItem.item.price) * Number(cartItem.quantity),
    0,
  );
  const paymentSettings = settings.settings[0];
  const taxRate = Number(paymentSettings.TaxRate);
  const deliveryFee = Number(paymentSettings.DeliveryFee);
  const taxAmount = Number((total * taxRate).toFixed(2));
  const grandTotal = Number((total + taxAmount + deliveryFee).toFixed(2));
  console.log({
    total,
    taxRate,
    deliveryFee,
    taxAmount,
    grandTotal,
  });
  const collect = {
    body: {
      intent: "CAPTURE",

      purchaseUnits: [
        {
          amount: {
            currencyCode: "USD",
            value: Number(grandTotal).toFixed(2),

            breakdown: {
              itemTotal: {
                currencyCode: "USD",
                value: Number(total).toFixed(2),
              },

              taxTotal: {
                currencyCode: "USD",
                value: Number(taxAmount).toFixed(2),
              },

              shipping: {
                currencyCode: "USD",
                value: Number(deliveryFee).toFixed(2),
              },
            },
          },

          items,
        },
      ],
    },

    prefer: "return=minimal",
  };

  try {
    const { body, ...httpResponse } =
      await ordersController.createOrder(collect);
    console.log("✅ PayPal order created:", body);
    return {
      jsonResponse: JSON.parse(body),
      httpStatusCode: httpResponse.statusCode,
      orderCalculation: {
        subTotal: total,
        taxRate,
        taxAmount,
        deliveryFee,
        grandTotal,
      },
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }

    throw error;
  }
};

// createOrder route for paypal
app.post("/api/orders", async (req, res) => {
  console.log("🔥 /api/orders was called");
  try {
    //use the cart information passed from the front-end
    const { cart, customer, paymentMethod } = req.body;
    console.log("Cart received:", cart);
    console.log("Customer received:", customer);
    console.log("Payment method received:", paymentMethod);

    if (!cart || cart.length === 0) {
      return res.status(400).json({
        error: "Cart is empty",
      });
    }

    const { jsonResponse, httpStatusCode, orderCalculation } =
      await createOrder(cart);

    if (!jsonResponse?.id) {
      throw new Error("PayPal did not return an order ID");
    }
    pendingOrders.set(jsonResponse.id, {
      cart,
      customer,
      paymentMethod,
      orderCalculation,
    });

    console.log("Saved pending order:", pendingOrders.get(jsonResponse.id));
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
});

/**
 * Capture payment for the created order to complete the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
 */
const captureOrder = async (orderID) => {
  const collect = {
    id: orderID,
    prefer: "return=minimal",
  };

  try {
    const { body, ...httpResponse } =
      await ordersController.captureOrder(collect);
    // Get more response info...
    // const { statusCode, headers } = httpResponse;
    return {
      jsonResponse: JSON.parse(body),
      httpStatusCode: httpResponse.statusCode,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      // const { statusCode, headers } = error;
      throw new Error(error.message);
    }
  }
};

// capture orderData
function buildOrderData({
  orderID,
  captureID,
  status,
  date,
  customer,
  cart,
  orderCalculation,
  paymentMethod,
}) {
  return {
    formType: "order",
    orderID,
    captureID,
    status,
    date,

    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    city: customer.city,
    zip: customer.zip,
    deliveryDate: customer.deliveryDate,
    deliveryTime: customer.deliveryTime,
    note: customer.note,

    items: cart.map((item) => ({
      productId: item.item.no,
      product: item.item.product,
      price: item.item.price,
      quantity: item.quantity,
    })),

    deliveryFee: orderCalculation.deliveryFee,
    taxRate: orderCalculation.taxRate,
    taxAmount: orderCalculation.taxAmount,
    subTotal: orderCalculation.subTotal,
    grandTotal: orderCalculation.grandTotal,

    paymentMethod,
  };
}

// captureOrder route for paypal
app.post("/api/orders/:orderID/capture", async (req, res) => {
  try {
    const { orderID } = req.params;
    const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
    const capture = jsonResponse.purchase_units[0].payments.captures[0]; // Get the capture details
    const savedOrder = pendingOrders.get(orderID);
    if (!savedOrder) {
      return res.status(404).json({
        success: false,
        error: "Order not found.",
      });
    }
    console.log("Retrieved pending order:", savedOrder);
    if (jsonResponse.status === "COMPLETED") {
      console.log("Payment completed");
      console.log("Customer:", savedOrder.customer);
      console.log("Cart:", savedOrder.cart);
      const orderData = buildOrderData({
        orderID: jsonResponse.id,
        captureID: capture.id,
        status: jsonResponse.status,
        date: new Date(capture.create_time)
          .toISOString()
          .replace("T", " ")
          .substring(0, 19),
        customer: savedOrder.customer, // pass the block
        cart: savedOrder.cart, // pass the block
        orderCalculation: {
          deliveryFee: savedOrder.orderCalculation.deliveryFee,
          taxRate: savedOrder.orderCalculation.taxRate,
          taxAmount: savedOrder.orderCalculation.taxAmount,
          subTotal: savedOrder.orderCalculation.subTotal,
          grandTotal: savedOrder.orderCalculation.grandTotal,
        },

        paymentMethod: savedOrder.paymentMethod,
      });
      console.log("Order data to send to Google Script:", orderData);
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      if (!result.success) {
        return res.status(500).json(result);
      }
      return res.status(httpStatusCode).json({
        success: true,
        type: "paypal",
        orderID: jsonResponse.id,
        captureID: capture.id,
        amount: savedOrder.orderCalculation.grandTotal,
        status: jsonResponse.status,
        paymentMethod: savedOrder.paymentMethod,
        googleScript: result,
        paypal: jsonResponse,
      });
    }

    // Fallback if payment wasn't completed
    return res.status(httpStatusCode).json({
      paypal: jsonResponse,
    });
  } catch (error) {
    console.error("❌ Failed to create order:", error);

    res.status(500).json({
      error: error.message,
      details: error.body || error,
    });
  }
});

// COD order route
app.post("/api/orders/cod", async (req, res) => {
  try {
    const { cart, customer, paymentMethod } = req.body;

    console.log("COD Order Received");
    console.log(cart);
    console.log(customer);
    console.log(paymentMethod);

    const scriptResponse = await fetch(`${GOOGLE_SCRIPT_URL}?type=checkout`);
    const settings = await scriptResponse.json();
    const total = cart.reduce(
      (sum, cartItem) =>
        sum + Number(cartItem.item.price) * Number(cartItem.quantity),
      0,
    );
    const paymentSettings = settings.settings[0];
    const taxRate = Number(paymentSettings.TaxRate);
    const deliveryFee = Number(paymentSettings.DeliveryFee);
    const taxAmount = Number((total * taxRate).toFixed(2));
    const grandTotal = Number((total + taxAmount + deliveryFee).toFixed(2));
    const now = new Date();
    const orderID = `COD-${now.getFullYear()}${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.floor(
      Math.random() * 9000 + 1000,
    )}`;
    const orderCalculation = {
      deliveryFee,
      taxRate,
      taxAmount,
      subTotal: total,
      grandTotal,
    };
    const orderData = buildOrderData({
      orderID,
      captureID: null,
      status: "Pending Delivery",
      date: new Date().toISOString().replace("T", " ").substring(0, 19),
      customer,
      cart,
      orderCalculation, // pass the block
      paymentMethod,
    });
    console.log("Order data to send to Google Script:", orderData);
    const sheetResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });
    const result = await sheetResponse.json();
    if (!result.success) {
      return res.status(500).json(result);
    }
    //Make it similar to paypal return data
    res.json({
      success: true,
      type: "cod",
      orderID,
      captureID: null,
      amount: grandTotal,
      status: "Pending Payment",
      paymentMethod,
      googleScript: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Node server listening at http://localhost:${PORT}/`);
});
