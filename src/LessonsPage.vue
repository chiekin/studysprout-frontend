<script setup>
import { ref, onMounted, computed } from "vue";
import { addToCart } from "./cartStore";

const lessons = ref([]);
const loading = ref(true);
const error = ref(null);

// FETCH LESSONS FROM BACKEND
onMounted(async () => {
  try {
    const res = await fetch("http://localhost:3000/lessons");
    lessons.value = await res.json();
  } catch (err) {
    console.error("Error loading lessons:", err);
    error.value = "Failed to load lessons";
  } finally {
    loading.value = false;
  }
});

// GROUP LESSONS BY SUBJECT (e.g. "Math - Algebra" -> "Math")
const groupedLessons = computed(() => {
  const groups = {};
  for (const lesson of lessons.value) {
    const fullSubject = lesson.subject || "";
    const sectionName = fullSubject.split(" - ")[0] || "Other";
    if (!groups[sectionName]) groups[sectionName] = [];
    groups[sectionName].push(lesson);
  }
  return groups;
});

// HANDLE ADD TO CART
function handleAddToCart(lesson) {
  if (lesson.spaces <= 0) return;
  addToCart(lesson);      // add to global cart
  lesson.spaces -= 1;     // reduce available spaces in UI
}
</script>

<template>
  <div class="lessons-page">
    <h1 class="page-title">Available Lessons</h1>

    <div v-if="loading" class="status">Loading lessons...</div>
    <div v-else-if="error" class="status error">{{ error }}</div>

    <!-- SUBJECT SECTIONS -->
    <section
      v-else
      v-for="(lessonsInSection, sectionName) in groupedLessons"
      :key="sectionName"
      class="subject-section"
    >
      <h2 class="subject-heading">{{ sectionName }}</h2>

      <div class="lessons-grid">
        <div
          v-for="lesson in lessonsInSection"
          :key="lesson._id"
          class="lesson-card"
        >
          <div class="lesson-icon">📘</div>

          <h3 class="lesson-topic">{{ lesson.subject }}</h3>
          <p class="lesson-location">📍 {{ lesson.location }}</p>
          <p class="lesson-price">£{{ lesson.price }}</p>
          <p class="lesson-space">Spaces left: {{ lesson.spaces }}</p>

          <button
            class="add-btn"
            :disabled="lesson.spaces <= 0"
            @click="handleAddToCart(lesson)"
          >
            <span v-if="lesson.spaces > 0">Add to Cart</span>
            <span v-else>Full</span>
          </button>
        </div>
      </div>

      <!-- Cute divider between sections -->
      <div class="section-divider"></div>
    </section>
  </div>
</template>

<style scoped>
.lessons-page {
  max-width: 1100px;
  margin: 3rem auto;
  padding: 2rem;
}

/* main title */
.page-title {
  text-align: center;
  font-size: 2.5rem;
  color: #4A5759;
  margin-bottom: 2.5rem;
  font-weight: 700;
}

.status {
  text-align: center;
  font-size: 1.1rem;
  color: #4A5759;
}

.status.error {
  color: #c0392b;
}

/* each subject block */
.subject-section {
  margin-bottom: 3rem;
}

.subject-heading {
  font-size: 1.7rem;
  font-weight: 700;
  color: #4A5759;
  margin-bottom: 1.2rem;
}

/* grid inside each section */
.lessons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
}

/* card */
.lesson-card {
  background: #B0C4B1;          /* your chosen colour */
  border: 4px solid #4A5759;
  padding: 2rem;
  border-radius: 25px;
  text-align: center;
  color: #333;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.lesson-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 5px 18px rgba(0,0,0,0.18);
}

.lesson-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.lesson-topic {
  font-size: 1.3rem;
  font-weight: 700;
  color: #4A5759;
  margin-bottom: 0.3rem;
}

.lesson-location,
.lesson-price,
.lesson-space {
  font-size: 1.1rem;
  color: #4A5759;
  margin: 0.4rem 0;
}

/* Button */
.add-btn {
  margin-top: 1rem;
  padding: 0.8rem 1.4rem;
  background: #4A5759;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.add-btn:hover:enabled {
  opacity: 0.85;
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* cute divider in EDAFB8 */
.section-divider {
  width: 100%;
  height: 3px;
  background-color: #EDAFB8;
  margin: 2.5rem 0;
  border-radius: 10px;
  opacity: 0.8;
}

/* no divider after last section */
.subject-section:last-of-type .section-divider {
  display: none;
}
</style>
