<script setup>
import { ref, computed } from "vue";
import { cartState, cartTotal, removeOneFromCart, clearCart } from "./cartStore";
import { API_BASE } from "./apiConfig";

const customerName = ref("");
const customerPhone = ref("");
const customerEmail = ref(""); // ✅ NEW
const isSubmitting = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

// simple validation
const isNameValid = computed(() =>
  /^[A-Za-z\s]+$/.test(customerName.value.trim())
);

// ✅ improved phone validation:
// - allows digits, spaces, +, (), -
// - requires at least 10 digits overall
const isPhoneValid = computed(() => {
  const raw = customerPhone.value;
  const digits = raw.replace(/\D/g, "");
  if (!raw.trim()) return false;
  if (!/^[0-9+\s()-]+$/.test(raw)) return false;
  return digits.length >= 10;
});

// ✅ simple email pattern (not perfect, but good enough for front-end)
const isEmailValid = computed(() => {
  const email = customerEmail.value.trim();
  if (!email) return false;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
});

const isFormValid = computed(
  () =>
    customerName.value.trim().length > 0 &&
    customerPhone.value.trim().length > 0 &&
    customerEmail.value.trim().length > 0 && // ✅ NEW
    isNameValid.value &&
    isPhoneValid.value &&
    isEmailValid.value && // ✅ NEW
    cartState.items.length > 0
);

// ---------- CHECKOUT ----------
async function submitOrder() {
  if (!isFormValid.value) return;

  isSubmitting.value = true;
  successMessage.value = "";
  errorMessage.value = "";

  const orderPayload = {
    name: customerName.value.trim(),
    phone: customerPhone.value.trim(),
    email: customerEmail.value.trim(), // ✅ NEW
    items: cartState.items.map((item) => ({
      lessonId: item._id,
      subject: item.subject,
      location: item.location,
      price: item.price,
      quantity: item.quantity,
    })),
    total: cartTotal.value,
    createdAt: new Date(),
  };

  try {
    // 1) save order  🔁 now using hosted backend
    const orderRes = await fetch(`${API_BASE}/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });

    let orderData = {};
    try {
      orderData = await orderRes.json();
    } catch (_) {
      orderData = {};
    }

    if (!orderRes.ok) {
      throw new Error(
        orderData.error ||
          `Order request failed with status ${orderRes.status}`
      );
    }

    // 2) update spaces  🔁 now using hosted backend
    const spacesPayload = orderPayload.items.map((item) => ({
      lessonId: item.lessonId,
      quantity: item.quantity,
    }));

    const updateRes = await fetch(`${API_BASE}/update-spaces`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(spacesPayload),
    });

    let updateData = {};
    try {
      updateData = await updateRes.json();
    } catch (_) {
      updateData = {};
    }

    if (!updateRes.ok) {
      throw new Error(
        updateData.error ||
          `Update-spaces request failed with status ${updateRes.status}`
      );
    }

    // success
    successMessage.value = "Your order has been submitted successfully! 🎉";
    clearCart();
    customerName.value = "";
    customerPhone.value = "";
    customerEmail.value = ""; // ✅ clear email as well
  } catch (err) {
    console.error("Checkout error:", err);
    errorMessage.value =
      err.message ||
      "There was a problem submitting your order. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="cart-page">
    <h1 class="cart-title">Your Cart</h1>

    <!-- ✅ show nice thank-you state when an order has just been placed -->
    <div v-if="successMessage" class="success-panel">
      <p class="success-main">{{ successMessage }}</p>
      <p class="success-sub">
        We’ve received your booking. You’ll get a confirmation from the tutor soon.
      </p>
    </div>

    <!-- show empty message only when there is NO successMessage -->
    <div v-else-if="cartState.items.length === 0" class="cart-empty">
      Your cart is empty. 🛒
    </div>

    <!-- otherwise show normal cart + checkout -->
    <div v-else class="cart-layout">
      <!-- LEFT: cart items -->
      <div class="cart-list">
        <div
          v-for="item in cartState.items"
          :key="item._id"
          class="cart-item"
        >
          <div class="cart-item-left">
            <p class="cart-lesson-title">{{ item.subject }}</p>
            <p class="cart-location">{{ item.location }}</p>
          </div>

          <div class="cart-item-right">
            <p class="cart-line">
              £{{ item.price }} × {{ item.quantity }}
            </p>
            <p class="cart-subtotal">
              £{{ item.price * item.quantity }}
            </p>
            <button class="cart-remove" @click="removeOneFromCart(item._id)">
              Remove
            </button>
          </div>
        </div>

        <div class="cart-total-row">
          <span>Total:</span>
          <span class="cart-total-amount">£{{ cartTotal }}</span>
        </div>
      </div>

      <!-- RIGHT: checkout form -->
      <div class="checkout-card">
        <h2 class="checkout-title">Checkout</h2>

        <div class="form-group">
          <label for="name">Student Name</label>
          <input
            id="name"
            type="text"
            v-model="customerName"
            placeholder="Enter your name"
          />
          <p v-if="customerName && !isNameValid" class="field-error">
            Name must contain letters and spaces only.
          </p>
        </div>

        <!-- email field -->
        <div class="form-group">
          <label for="email">Email address</label>
          <input
            id="email"
            type="email"
            v-model="customerEmail"
            placeholder="you@example.com"
          />
          <p v-if="customerEmail && !isEmailValid" class="field-error">
            Please enter a valid email address.
          </p>
        </div>

        <div class="form-group">
          <label for="phone">Phone number</label>
          <input
            id="phone"
            type="text"
            v-model="customerPhone"
            placeholder="07xxxxxxxx"
          />
          <p v-if="customerPhone && !isPhoneValid" class="field-error">
            Please enter a valid phone number.
          </p>
        </div>

        <button
          class="checkout-btn"
          :disabled="!isFormValid || isSubmitting"
          @click="submitOrder"
        >
          <span v-if="!isSubmitting">Submit Order</span>
          <span v-else>Submitting...</span>
        </button>

        <p v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-page {
  max-width: 1100px;
  margin: 3rem auto;
  padding: 2rem;
}

.cart-title {
  font-size: 2.4rem;
  font-weight: 700;
  color: #4a5759;
  text-align: center;
  margin-bottom: 2rem;
}

/* success panel */
.success-panel {
  max-width: 600px;
  margin: 2rem auto;
  padding: 1.8rem 2rem;
  border-radius: 24px;
  border: 2px solid #4a5759;
  background: #fffbf5;
  text-align: center;
}

.success-main {
  font-size: 1.3rem;
  font-weight: 700;
  color: #4a5759;
  margin-bottom: 0.4rem;
}

.success-sub {
  font-size: 0.95rem;
  color: #555;
}

.cart-empty {
  text-align: center;
  font-size: 1.1rem;
  color: #4a5759;
}

.cart-layout {
  display: grid;
  grid-template-columns: 2fr 1.1fr;
  gap: 2rem;
}

/* cart list */
.cart-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fffbf5;
  border: 2px solid #4a5759;
  border-radius: 30px;
  padding: 1.4rem 1.8rem;
}

.cart-item-left {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.cart-lesson-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #222;
}

.cart-location {
  font-size: 0.95rem;
  color: #777;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.cart-item-right {
  text-align: right;
}

.cart-item-right p {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.cart-line {
  font-size: 0.95rem;
}

.cart-subtotal {
  font-size: 1.1rem;
  font-weight: 700;
}

.cart-remove {
  margin-top: 0.4rem;
  padding: 0.45rem 1.1rem;
  border-radius: 999px;
  border: none;
  background: #edafb8;
  color: #4a5759;
  font-size: 0.9rem;
  cursor: pointer;
}

/* total */
.cart-total-row {
  margin-top: 1.8rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: #4a5759;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.cart-total-amount {
  font-size: 1.3rem;
}

/* checkout card */
.checkout-card {
  background: #fffbf5;
  border-radius: 24px;
  border: 2px solid #4a5759;
  padding: 1.6rem 1.8rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.checkout-title {
  font-size: 1.6rem;
  margin-bottom: 1.2rem;
  color: #4a5759;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.95rem;
  margin-bottom: 0.3rem;
  color: #4a5759;
}

.form-group input {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  border-color: #edafb8;
  box-shadow: 0 0 0 3px rgba(237, 175, 184, 0.18);
}

.field-error {
  margin-top: 0.3rem;
  font-size: 0.8rem;
  color: #c0392b;
}

/* checkout button */
.checkout-btn {
  width: 100%;
  margin-top: 0.8rem;
  padding: 0.9rem;
  border-radius: 999px;
  border: none;
  background: #4a5759;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.2s;
}

.checkout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.checkout-btn:not(:disabled):hover {
  opacity: 0.9;
}

/* messages */
.error-message {
  margin-top: 0.8rem;
  font-size: 0.9rem;
  color: #c0392b;
}

/* mobile */
@media (max-width: 768px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .checkout-card {
    order: -1;
  }

  .cart-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.6rem;
  }

  .cart-item-right {
    align-self: flex-end;
    text-align: right;
  }
}
</style>
