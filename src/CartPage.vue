<script setup>
import { cartState, cartTotal, removeOneFromCart } from "./cartStore";
</script>

<template>
  <div class="cart-page">
    <h1 class="cart-title">Your Cart</h1>

    <div v-if="cartState.items.length === 0" class="cart-empty">
      Your cart is empty. 🛒
    </div>

    <div v-else class="cart-list">
      <div
        v-for="item in cartState.items"
        :key="item._id"
        class="cart-item"
      >
        <div class="cart-item-main">
          <h3>{{ item.subject }}</h3>
          <p class="cart-location">{{ item.location }}</p>
        </div>

        <div class="cart-item-meta">
          <p>£{{ item.price }} × {{ item.quantity }}</p>
          <p class="cart-subtotal">£{{ item.price * item.quantity }}</p>
          <button class="cart-remove" @click="removeOneFromCart(item._id)">
            Remove
          </button>
        </div>
      </div>

      <div class="cart-total">
        <span>Total:</span>
        <span class="cart-total-amount">£{{ cartTotal }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-page {
  max-width: 900px;
  margin: 3rem auto;
  padding: 2rem;
}

.cart-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #4A5759;
  margin-bottom: 2rem;
  text-align: center;
}

.cart-empty {
  text-align: center;
  font-size: 1.1rem;
  color: #4A5759;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fffbf5;
  border-radius: 20px;
  border: 2px solid #4A5759;
  padding: 1rem 1.5rem;
}

.cart-item-main h3 {
  margin-bottom: 0.2rem;
  font-size: 1.1rem;
}

.cart-location {
  font-size: 0.9rem;
  color: #666;
}

.cart-item-meta {
  text-align: right;
}

.cart-subtotal {
  font-weight: 700;
}

.cart-remove {
  margin-top: 0.3rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  border: none;
  background: #EDAFB8;
  color: #4A5759;
  font-size: 0.85rem;
  cursor: pointer;
}

.cart-total {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: #4A5759;
}

.cart-total-amount {
  font-size: 1.3rem;
}
</style>
