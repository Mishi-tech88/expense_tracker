// ============================================
// 1. IMPORT FIREBASE FUNCTIONS
// ============================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ============================================
// 2. PASTE YOUR FIREBASE CONFIG HERE
// ============================================
const firebaseConfig = {
  apiKey: "AIzaSyAdzR4Vk7Nj4Un2tqW9s9mDS9cKAN4iZqo",
  authDomain: "expense-tracker-57cb5.firebaseapp.com",
  projectId: "expense-tracker-57cb5",
  storageBucket: "expense-tracker-57cb5.firebasestorage.app",
  messagingSenderId: "143533062824",
  appId: "1:143533062824:web:8465b590137c39c22ea09d",
  measurementId: "G-652LK0L4VW"
};


// ============================================
// 3. INITIALIZE FIREBASE & FIRESTORE
// ============================================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const expensesCollection = collection(db, "expenses");

// ============================================
// 4. GRAB DOM ELEMENTS
// ============================================
const form = document.getElementById("expense-form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const expenseList = document.getElementById("expense-list");
const totalCount = document.getElementById("total-count");
const totalAmount = document.getElementById("total-amount");

// ============================================
// 5. HANDLE FORM SUBMISSION (ADD EXPENSE)
// ============================================
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // stop page refresh

  const title = titleInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  if (!title || !amount || !category || !date) {
    alert("Please fill all fields.");
    return;
  }

  try {
    await addDoc(expensesCollection, {
      title,
      amount,
      category,
      date,
      createdAt: Date.now()
    });
    form.reset();
  } catch (error) {
    console.error("Error adding expense:", error);
    alert("Failed to add expense.");
  }
});

// ============================================
// 6. REAL-TIME LISTENER (DISPLAY + TOTALS)
// ============================================
onSnapshot(expensesCollection, (snapshot) => {
  expenseList.innerHTML = "";
  let count = 0;
  let sum = 0;

  const expenses = [];
  snapshot.forEach((docSnap) => {
    expenses.push({ id: docSnap.id, ...docSnap.data() });
  });

  // Sort by newest first
  expenses.sort((a, b) => b.createdAt - a.createdAt);

  expenses.forEach((expense) => {
    count++;
    sum += expense.amount;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${expense.title}</td>
      <td>Rs ${expense.amount.toFixed(2)}</td>
      <td>${expense.category}</td>
      <td>${expense.date}</td>
      <td><button class="delete-btn" data-id="${expense.id}">Delete</button></td>
    `;
    expenseList.appendChild(row);
  });

  totalCount.textContent = count;
  totalAmount.textContent = sum.toFixed(2);

  // Attach delete handlers
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (confirm("Delete this expense?")) {
        await deleteDoc(doc(db, "expenses", id));
      }
    });
  });
});