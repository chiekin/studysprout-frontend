StudySprout – Frontend (Vue 3 + Vite)

This is the frontend of StudySprout, a fictional tutoring marketplace that allows parents and students to browse lessons, add them to a cart, and complete a checkout with validation.

The project is built using Vue 3, Vite, and deployed on GitHub Pages.

Frontend (GitHub Pages):
https://chiekin.github.io/studysprout-frontend/

Backend API (Render):
https://studysprout-backend.onrender.com

📁 Project Structure
src/
  App.vue
  LessonsPage.vue
  CartPage.vue
  cartStore.js
  apiConfig.js
public/
styles/

✨ Features
- Browse lessons dynamically from MongoDB Atlas
- Search by subject, price, location, or spaces
- Sorting (subject, location, price, spaces)
- Add to cart / remove from cart
- Cart count bubble

Checkout form with validation:
Name
Email
Phone
Order submission + space reduction

Works with hosted backend API

Responsive UI

🔧 Tech Stack

Vue 3 (Composition API)

Vite

FontAwesome Icons

GitHub Pages hosting

REST API via Express backend

🛠 Installation (Local Development)
npm install
npm run dev


App runs at:
http://localhost:5173

🏗 Build for Production
npm run build
npm run deploy

This deploys the /dist folder to GitHub Pages.

🌐 Environment Config

API URL is set in:
src/apiConfig.js


🧪 Testing
Screenshots included in the coursework ZIP
