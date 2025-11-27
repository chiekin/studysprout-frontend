<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { addToCart } from "./cartStore";

// props (coming from App.vue when a user searches from homepage)
const props = defineProps({
  initialSearch: {
    type: String,
    default: "",
  },
});

// ----- STATE -----
const lessons = ref([]);
const loading = ref(true);
const error = ref("");
const searchTerm = ref(props.initialSearch || "");

// sort state
const sortField = ref("subject");
const sortDirection = ref("asc");

// ----- API CALLS -----
async function fetchAllLessons() {
  try {
    loading.value = true;
    error.value = "";
    const res = await fetch("http://localhost:3000/lessons");
    if (!res.ok) throw new Error("Failed to fetch lessons");
    lessons.value = await res.json();
  } catch (err) {
    console.error(err);
    error.value = "Failed to load lessons";
  } finally {
    loading.value = false;
  }
}

async function fetchSearch(term) {
  try {
    loading.value = true;
    error.value = "";
    const res = await fetch(
      "http://localhost:3000/search?q=" + encodeURIComponent(term)
    );
    if (!res.ok) throw new Error("Search request failed");
    lessons.value = await res.json();
  } catch (err) {
    console.error(err);
    error.value = "Search failed, please try again.";
  } finally {
    loading.value = false;
  }
}

// ----- DEBOUNCE -----
function debounce(fn, delay = 400) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const runSearch = debounce((term) => {
  if (!term) {
    fetchAllLessons();
  } else {
    fetchSearch(term);
  }
}, 400);

// ----- WATCH SEARCH -----
watch(searchTerm, (newVal) => {
  runSearch(newVal.trim());
});

// ----- ON MOUNT -----
onMounted(() => {
  // if there's an initial search from the homepage, use it
  if (props.initialSearch.trim()) {
    fetchSearch(props.initialSearch.trim());
  } else {
    fetchAllLessons();
  }
});

// ----- SORTING -----
const sortedLessons = computed(() => {
  const list = lessons.value || [];
  const field = sortField.value;
  const dir = sortDirection.value === "asc" ? 1 : -1;

  return [...list].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    if (typeof aVal === "string") aVal = aVal.toLowerCase();
    if (typeof bVal === "string") bVal = bVal.toLowerCase();

    if (aVal < bVal) return -1 * dir;
    if (aVal > bVal) return 1 * dir;
    return 0;
  });
});

function handleAddToCart(lesson) {
  addToCart(lesson);
}
</script>

<template>
  <div class="lessons-page">
    <h1 class="lessons-title">Browse Lessons</h1>

    <p v-if="loading" class="lessons-status">Loading lessons...</p>
    <p v-else-if="error" class="lessons-status lessons-status-error">
      {{ error }}
    </p>

    <div v-else>
      <!-- SEARCH + SORT -->
      <div class="lessons-controls">
        <div class="lessons-search">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search lessons..."
          />
        </div>

        <div class="lessons-sort">
          <label>
            Sort by:
            <select v-model="sortField">
              <option value="subject">Subject</option>
              <option value="location">Location</option>
              <option value="price">Price</option>
              <option value="spaces">Spaces left</option>
            </select>
          </label>

          <div class="sort-direction">
            <label>
              <input type="radio" value="asc" v-model="sortDirection" />
              Asc
            </label>
            <label>
              <input type="radio" value="desc" v-model="sortDirection" />
              Desc
            </label>
          </div>
        </div>
      </div>

      <!-- LESSON GRID -->
      <div class="lesson-grid">
        <div
          v-for="lesson in sortedLessons"
          :key="lesson._id"
          class="lesson-card"
        >
          <div class="lesson-icon">📘</div>

          <div class="lesson-topic">{{ lesson.subject }}</div>
          <div class="lesson-location">📍 {{ lesson.location }}</div>
          <div class="lesson-price">£{{ lesson.price }}</div>
          <div class="lesson-space">Spaces left: {{ lesson.spaces }}</div>

          <button
            class="lesson-add-btn"
            :disabled="lesson.spaces <= 0"
            @click="handleAddToCart(lesson)"
          >
            {{ lesson.spaces > 0 ? "Add to Cart" : "Fully Booked" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lessons-page {
  max-width: 1100px;
  margin: 3rem auto;
  padding: 2rem;
}

/* title + status */
.lessons-title {
  text-align: center;
  font-size: 2.5rem;
  color: #4a5759;
  margin-bottom: 2.5rem;
  font-weight: 700;
}

.lessons-status {
  text-align: center;
  font-size: 1.1rem;
  color: #4a5759;
}

.lessons-status-error {
  color: #c0392b;
}

/* controls row */
.lessons-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.8rem;
}

.lessons-search input {
  padding: 0.7rem 1.1rem;
  border-radius: 999px;
  border: 2px solid #e0e0e0;
  min-width: 260px;
  font-size: 0.95rem;
}

.lessons-sort {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.95rem;
  color: #4a5759;
}

.lessons-sort select {
  margin-left: 0.3rem;
  padding: 0.4rem 0.6rem;
  border-radius: 10px;
  border: 2px solid #e0e0e0;
}

.sort-direction label {
  margin-right: 0.6rem;
  font-size: 0.9rem;
}

/* cards grid */
.lesson-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
}

/* card */
.lesson-card {
  background: #b0c4b1;
  border: 4px solid #4a5759;
  padding: 2rem;
  border-radius: 25px;
  text-align: center;
  color: #333;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.lesson-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 5px 18px rgba(0, 0, 0, 0.18);
}

.lesson-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.lesson-topic {
  font-size: 1.3rem;
  font-weight: 700;
  color: #4a5759;
  margin-bottom: 0.4rem;
}

.lesson-location,
.lesson-price,
.lesson-space {
  font-size: 1.05rem;
  color: #4a5759;
  margin: 0.35rem 0;
}

/* button */
.lesson-add-btn {
  margin-top: 1rem;
  padding: 0.8rem 1.4rem;
  background: #4a5759;
  color: white;
  border: none;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.lesson-add-btn:hover:enabled {
  opacity: 0.9;
}

.lesson-add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
