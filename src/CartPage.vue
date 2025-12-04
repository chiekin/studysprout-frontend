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

const isPhoneValid = computed(() =>
  /^[0-9]+$/.test(customerPhone.value.trim())
);

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
