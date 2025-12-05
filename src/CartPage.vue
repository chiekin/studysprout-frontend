<script setup>
import { ref, computed } from "vue";
import { cartState, cartTotal, removeOneFromCart, clearCart } from "./cartStore";
import { API_BASE } from "./apiConfig";

const customerName = ref("");
const customerPhone = ref("");
const customerEmail = ref("");

const isSubmitting = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

// ---------- VALIDATION ----------

// base checks
const isNameValid = computed(() => {
  const name = customerName.value.trim();
  return name.length > 0 && /^[A-Za-z\s]+$/.test(name);
});

const isPhoneValid = computed(() => {
  const digits = customerPhone.value.replace(/\D/g, "");
  return digits.length >= 10; // at least 10 digits
});

const isEmailValid = computed(() => {
  const email = customerEmail.value.trim();
  if (!email) return false;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
});

// field-level error messages (use in template if you like)
const nameError = computed(() => {
  const name = customerName.value.trim();
  if (!name) return "Please enter your name.";
  if (!/^[A-Za-z\s]+$/.test(name)) {
    return "Name can only contain letters and spaces.";
  }
  return "";
});

const phoneError = computed(() => {
  const raw = customerPhone.value;
  const digits = raw.replace(/\D/g, "");
  if (!raw.trim()) return "Please enter your phone number.";
  if (!/^[0-9+\s()-]+$/.test(raw)) {
    return "Phone number can only contain digits and basic symbols.";
  }
  if (digits.length < 10) return "Phone number looks too short.";
  return "";
});

const emailError = computed(() => {
  const email = customerEmail.value.trim();
  if (!email) return "Please enter your email.";
  if (!isEmailValid.value) return "Please enter a valid email address.";
  return "";
});

// overall form validity (for button disable)
const isFormValid = computed(() => {
  return (
    !nameError.value &&
    !phoneError.value &&
    !emailError.value &&
    cartState.items.length > 0
  );
});

// ---------- CHECKOUT ----------

async function submitOrder() {
  // stop early if invalid
  if (!isFormValid.value) {
    errorMessage.value = "Please fix the highlighted fields before checkout.";
    successMessage.value = "";
    return;
  }

  isSubmitting.value = true;
  successMessage.value = "";
  errorMessage.value = "";

  const orderPayload = {
    name: customerName.value.trim(),
    phone: customerPhone.value.trim(),
    email: customerEmail.value.trim(),
    items: cartState.items.map((item) => ({
      lessonId: item._id,
      subject: item.subject,
      location: item.location,
      price: item.price,
      quantity: item.quantity ?? 1,
    })),
    total: cartTotal.value,
    createdAt: new Date(),
  };

  try {
    // 1) save order
    const orderRes = await fetch(`${API_BASE}/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });

    let orderData = {};
    try {
      orderData = await orderRes.json();
    } catch {
      orderData = {};
    }

    if (!orderRes.ok) {
      throw new Error(
        orderData.error ||
          `Order request failed with status ${orderRes.status}`
      );
    }

    // 2) update lesson spaces
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
    } catch {
      updateData = {};
    }

    if (!updateRes.ok) {
      throw new Error(
        updateData.error ||
          `Update-spaces request failed with status ${updateRes.status}`
      );
    }

    // success
    successMessage.value =
      "Your order has been submitted successfully! A confirmation email has been sent (test).";
    errorMessage.value = "";
    clearCart();
    customerName.value = "";
    customerPhone.value = "";
    customerEmail.value = "";
  } catch (err) {
    console.error("Checkout error:", err);
    successMessage.value = "";
    errorMessage.value =
      err.message ||
      "There was a problem submitting your order. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>
