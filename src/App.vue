<script setup>
import { ref } from "vue";
import LessonsPage from "./LessonsPage.vue";
import CartPage from "./CartPage.vue";
import { cartCount } from "./cartStore";

// FONT AWESOME
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faMagnifyingGlass,
  faBasketShopping,
} from "@fortawesome/free-solid-svg-icons";

// register icons in the shared library
library.add(faMagnifyingGlass, faBasketShopping);

// which screen is visible
const currentPage = ref("home");

// search text on the HOME hero
const searchTerm = ref("");

function showHome() {
  currentPage.value = "home";
}

function showLessons() {
  currentPage.value = "lessons";
}

function showCart() {
  currentPage.value = "cart";
}

// when user searches from the hero
function submitSearch() {
  currentPage.value = "lessons";
}
</script>

<template>
  <div class="app-root">
    <!-- NAVIGATION (always visible) -->
    <header class="main-header">
      <nav class="main-nav">
        <div class="logo" @click="showHome">
          <span class="sprout-icon">🌱</span>
          <span class="logo-text">Study Sprout</span>
        </div>
      </nav>
    </header>

    <main>
      <!-- HOME PAGE -->
      <section v-if="currentPage === 'home'">
        <div class="hero">
          <h1>Find your perfect lesson</h1>
          <p class="hero-subtitle">
            Expert tutors. Flexible schedules. Better grades. 📚
          </p>

          <!-- SEARCH -->
          <div class="search-container">
            <input
              type="text"
              class="search-bar"
              v-model="searchTerm"
              placeholder="Search for Math, English, Science..."
              @keyup.enter="submitSearch"
            />
            <!-- FontAwesome search icon as a button -->
            <button class="search-icon-button" @click="submitSearch">
              <FontAwesomeIcon :icon="faMagnifyingGlass" />
            </button>
          </div>

          <button class="cta-button" @click="showLessons">
            Browse All Lessons
          </button>
        </div>

        <div class="subjects-section">
          <h2 class="section-title">Popular Subjects</h2>
          <div class="subjects-grid">
            <div class="subject-card">
              <div class="subject-icon">📐</div>
              <div class="subject-name">Math</div>
            </div>
            <div class="subject-card">
              <div class="subject-icon">📝</div>
              <div class="subject-name">English</div>
            </div>
            <div class="subject-card">
              <div class="subject-icon">🔬</div>
              <div class="subject-name">Science</div>
            </div>
            <div class="subject-card">
              <div class="subject-icon">🌍</div>
              <div class="subject-name">Geography</div>
            </div>
            <div class="subject-card">
              <div class="subject-icon">🎨</div>
              <div class="subject-name">Art</div>
            </div>
            <div class="subject-card">
              <div class="subject-icon">🎵</div>
              <div class="subject-name">Music</div>
            </div>
            <div class="subject-card">
              <div class="subject-icon">💻</div>
              <div class="subject-name">Coding</div>
            </div>
            <div class="subject-card">
              <div class="subject-icon">🗣️</div>
              <div class="subject-name">Languages</div>
            </div>
          </div>
        </div>

        <div class="features-section">
          <div class="features-grid">
            <div class="feature">
              <div class="feature-emoji">⚡</div>
              <h3>Book in Minutes</h3>
              <p>Find and book lessons instantly with just a few clicks</p>
            </div>
            <div class="feature">
              <div class="feature-emoji">🎯</div>
              <h3>Personalized</h3>
              <p>Lessons tailored to your child's learning style and pace</p>
            </div>
            <div class="feature">
              <div class="feature-emoji">💰</div>
              <h3>Affordable</h3>
              <p>Quality education at prices that work for your budget</p>
            </div>
            <div class="feature">
              <div class="feature-emoji">📊</div>
              <h3>Track Progress</h3>
              <p>See your child's improvement with detailed reports</p>
            </div>
          </div>
        </div>

        <div class="cta-section">
          <h2>Ready to get started?</h2>
          <p>Join thousands of parents helping their children succeed</p>
          <button class="cta-white-btn">Create Free Account</button>
        </div>

        <footer>
          <p>© 2024 Study Sprout • Helping children grow through learning 🌱</p>
        </footer>
      </section>

      <!-- LESSONS PAGE (gets the search text once when you go here) -->
      <LessonsPage
        v-else-if="currentPage === 'lessons'"
        :initial-search="searchTerm"
      />

      <!-- CART PAGE -->
      <CartPage v-else-if="currentPage === 'cart'" />
    </main>

    <!-- FLOATING CART BUBBLE – ONLY ON LESSONS PAGE -->
    <button
      v-if="currentPage === 'lessons'"
      class="cart-bubble"
      @click="showCart"
    >
      <FontAwesomeIcon icon="basket-shopping" />
      <span v-if="cartCount > 0" class="cart-count">{{ cartCount }}</span>
    </button>
  </div>
</template>

<style>
.app-root {
  min-height: 100vh;
}

/* search layout */
.search-container {
  position: relative;
  max-width: 650px;
  width: 100%;
  margin: 1.8rem auto;
}

.search-bar {
  width: 100%;
  padding: 1.1rem 1.4rem;
  padding-right: 60px;
  border-radius: 999px;
  border: 2px solid #e0e0e0;
  font-size: 1rem;
}

.search-icon-button {
  position: absolute;
  right: 22px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #4a5759;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* floating cart bubble */
.cart-bubble {
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: #709775;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  z-index: 200;
}

.cart-count {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #edafb8;
  color: #4a5759;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
