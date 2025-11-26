import { reactive, computed } from "vue";

// shared reactive cart state
export const cartState = reactive({
  // each item: { _id, subject, location, price, quantity }
  items: [],
});

// add a lesson to cart
export function addToCart(lesson) {
  const existing = cartState.items.find((item) => item._id === lesson._id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cartState.items.push({
      _id: lesson._id,
      subject: lesson.subject,
      location: lesson.location,
      price: lesson.price,
      quantity: 1,
    });
  }
}

// remove ONE of an item 
export function removeOneFromCart(lessonId) {
  const index = cartState.items.findIndex((item) => item._id === lessonId);
  if (index === -1) return;

  const item = cartState.items[index];
  if (item.quantity > 1) {
    item.quantity -= 1;
  } else {
    cartState.items.splice(index, 1);
  }
}

// clear cart (for after checkout)
export function clearCart() {
  cartState.items.splice(0);
}

// total item count (for bubble)
export const cartCount = computed(() =>
  cartState.items.reduce((sum, item) => sum + item.quantity, 0)
);

// total price
export const cartTotal = computed(() =>
  cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);
