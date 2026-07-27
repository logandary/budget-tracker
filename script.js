/* ======================================
   Budget Tracker
   Version 2.0
   Part 1 - Data & Rendering
====================================== */

const STORAGE_KEY = "budgetTracker";

/* ==========================
   DEFAULT DATA
========================== */

const DEFAULT_DATA = {
    budget: 250,
    currentMonth: "",
    expenses: [],
    history: {}
};

let data = loadData();

/* ==========================
   ELEMENTS
========================== */

const expenseList = document.getElementById("expenseList");
const emptyState = document.getElementById("emptyState");

const remainingDollars = document.getElementById("remainingDollars");
const remainingCents = document.getElementById("remainingCents");

const settingsSpent = document.getElementById("settingsSpent");
const settingsRemaining = document.getElementById("settingsRemaining");

const spentHeader = document.getElementById("spentHeader");

/* ==========================
   STARTUP
========================== */

initialize();

function initialize(){

    checkForNewMonth();

    render();

}

/* ==========================
   LOAD / SAVE
========================== */

function loadData(){

    const saved = localStorage.getItem(STORAGE_KEY);

    if(!saved){

        return structuredClone(DEFAULT_DATA);

    }

    try{

        return JSON.parse(saved);

    }

    catch{

        return structuredClone(DEFAULT_DATA);

    }

}

function saveData(){

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}

/* ==========================
   MONTH MANAGEMENT
========================== */

function getMonthKey(){

    const now = new Date();

    const year = now.getFullYear();

    const month = String(now.getMonth()+1).padStart(2,"0");

    return `${year}-${month}`;

}

function checkForNewMonth(){

    const current = getMonthKey();

    if(data.currentMonth===""){

        data.currentMonth=current;

        saveData();

        return;

    }

    if(current===data.currentMonth){

        return;

    }

  /* Archive Previous Month */

data.history[data.currentMonth] = {
    budget: data.budget,
    expenses: [...data.expenses]
};

data.expenses = [];

data.currentMonth = current;

saveData();

}

/* ==========================
   CALCULATIONS
========================== */

function getSpent(){

    return data.expenses.reduce(

        (total,expense)=>{

            return total+expense.amount;

        },

        0

    );

}

function getRemaining(){

    return data.budget-getSpent();

}

/* ==========================
   RENDER
========================== */

function render(){

    renderHeader();

    renderExpenseList();

    renderSettingsSummary();

}

function renderHeader(){

    const remaining=getRemaining();

    const dollars=Math.floor(remaining);

    const cents=Math.round(

        (remaining-dollars)*100

    );

    remainingDollars.textContent=`$${dollars}`;

    remainingCents.textContent=
        `.${String(cents).padStart(2,"0")}`;

spentHeader.textContent =
    formatMoney(getSpent());

}

function renderSettingsSummary(){

    settingsSpent.textContent=
        formatMoney(getSpent());

    settingsRemaining.textContent=
        formatMoney(getRemaining());

}

function renderExpenseList(){

    expenseList.innerHTML="";

    if(data.expenses.length===0){

        emptyState.style.display="block";

        return;

    }

    emptyState.style.display="none";

    [...data.expenses]

        .reverse()

        .forEach(expense=>{

            const template=document
                .getElementById("expenseTemplate")
                .content
                .cloneNode(true);

            template.querySelector(
                ".expenseDescription"
            ).textContent=
                expense.description;

            template.querySelector(
                ".expenseAmount"
            ).textContent=
                formatMoney(expense.amount);

            template.querySelector(
                ".expenseDate"
            ).textContent=
                formatDate(expense.date);

            template.querySelector(
                ".expenseItem"
            ).dataset.id=
                expense.id;

            expenseList.appendChild(
                template
            );

        });

}

/* ==========================
   HELPERS
========================== */

function formatMoney(value){

    return value.toLocaleString(

        "en-US",

        {

            style:"currency",

            currency:"USD"

        }

    );

}

function formatDate(dateString){

    const date=new Date(dateString);

    return date.toLocaleDateString(

        "en-US",

        {

            month:"short",

            day:"numeric"

        }

    );

}

function createExpense(

    description,

    amount

){

    return{

        id:crypto.randomUUID(),

        description,

        amount,

        date:new Date().toISOString()

    };

}
/* ======================================
   Budget Tracker
   Version 2.0
   Part 2 - Events & Interaction
====================================== */

let editingExpenseId = null;

/* ==========================
   ELEMENTS
========================== */

const addExpenseButton = document.getElementById("addExpenseButton");

const settingsButton = document.getElementById("settingsButton");

const expenseModal = document.getElementById("expenseModal");

const settingsModal = document.getElementById("settingsModal");

const editModal = document.getElementById("editModal");

const descriptionInput = document.getElementById("descriptionInput");

const amountInput = document.getElementById("amountInput");

const budgetInput = document.getElementById("budgetInput");

const editDescription = document.getElementById("editDescription");

const editAmount = document.getElementById("editAmount");
const historyButton = document.getElementById("historyButton");
const historyModal = document.getElementById("historyModal");
const historyList = document.getElementById("historyList");

const monthModal = document.getElementById("monthModal");
const monthTitle = document.getElementById("monthTitle");
const monthBudget = document.getElementById("monthBudget");
const monthSpent = document.getElementById("monthSpent");
const monthRemaining = document.getElementById("monthRemaining");
const monthExpenseList = document.getElementById("monthExpenseList");
const monthEmptyState = document.getElementById("monthEmptyState");

/* ==========================
   OPEN MODALS
========================== */

addExpenseButton.addEventListener("click", () => {

    descriptionInput.value = "";
    amountInput.value = "";

    expenseModal.classList.remove("hidden");

    setTimeout(() => descriptionInput.focus(), 100);

});

settingsButton.addEventListener("click", () => {

    budgetInput.value = data.budget;

    renderSettingsSummary();

    settingsModal.classList.remove("hidden");

});

historyButton.addEventListener("click", () => {

    settingsModal.classList.add("hidden");

    renderHistory();

    historyModal.classList.remove("hidden");

});

/* ==========================
   CLOSE MODALS
========================== */

document.getElementById("cancelExpense")
.addEventListener("click", () => {

    expenseModal.classList.add("hidden");

});

document.getElementById("cancelSettings")
.addEventListener("click", () => {

    settingsModal.classList.add("hidden");

});

window.addEventListener("click", e => {

    if(e.target === expenseModal){

        expenseModal.classList.add("hidden");

    }

    if(e.target === settingsModal){

        settingsModal.classList.add("hidden");

    }

    if(e.target === editModal){

        editModal.classList.add("hidden");

    }

if(e.target === historyModal){

    historyModal.classList.add("hidden");

}

if(e.target === monthModal){

    monthModal.classList.add("hidden");

}

});

document.getElementById("closeHistory")
.addEventListener("click", () => {

    historyModal.classList.add("hidden");

});

document.getElementById("closeMonth")
.addEventListener("click", () => {

    monthModal.classList.add("hidden");

});

/* ==========================
   SAVE NEW EXPENSE
========================== */

document.getElementById("saveExpense")
.addEventListener("click", () => {

    const description = descriptionInput.value.trim();

    const amount = parseFloat(amountInput.value);

    if(description === ""){

        alert("Please enter a description.");

        return;

    }

    if(isNaN(amount) || amount <= 0){

        alert("Enter a valid amount.");

        return;

    }

    data.expenses.push(

        createExpense(

            description,

            amount

        )

    );

    saveData();

    render();

    expenseModal.classList.add("hidden");

});

/* ==========================
   SAVE SETTINGS
========================== */

document.getElementById("saveSettings")
.addEventListener("click", () => {

    const budget = parseFloat(

        budgetInput.value

    );

    if(isNaN(budget) || budget <= 0){

        alert("Enter a valid budget.");

        return;

    }

    data.budget = budget;

    saveData();

    render();

    settingsModal.classList.add("hidden");

});

/* ==========================
   CLICK EXPENSE
========================== */

expenseList.addEventListener("click", e => {

    const row = e.target.closest(".expenseItem");

    if(!row) return;

    editingExpenseId = row.dataset.id;

    const expense = data.expenses.find(

        x => x.id === editingExpenseId

    );

    if(!expense) return;

    editDescription.value = expense.description;

    editAmount.value = expense.amount;

    editModal.classList.remove("hidden");

});

/* ==========================
   UPDATE EXPENSE
========================== */

document.getElementById("updateExpense")
.addEventListener("click", () => {

    const expense = data.expenses.find(

        x => x.id === editingExpenseId

    );

    if(!expense) return;

    const description = editDescription.value.trim();

    const amount = parseFloat(

        editAmount.value

    );

    if(description === ""){

        alert("Description required.");

        return;

    }

    if(isNaN(amount) || amount <= 0){

        alert("Enter a valid amount.");

        return;

    }

    expense.description = description;

    expense.amount = amount;

    saveData();

    render();

    editModal.classList.add("hidden");

});

/* ==========================
   DELETE EXPENSE
========================== */

document.getElementById("deleteExpense")
.addEventListener("click", () => {

    if(!confirm("Delete this expense?")){

        return;

    }

    data.expenses = data.expenses.filter(

        x => x.id !== editingExpenseId

    );

    saveData();

    render();

    editModal.classList.add("hidden");

});

/* ==========================
   ENTER KEY SUPPORT
========================== */

amountInput.addEventListener("keydown", e => {

    if(e.key === "Enter"){

        document
        .getElementById("saveExpense")
        .click();

    }

});

budgetInput.addEventListener("keydown", e => {

    if(e.key === "Enter"){

        document
        .getElementById("saveSettings")
        .click();

    }

});

editAmount.addEventListener("keydown", e => {

    if(e.key === "Enter"){

        document
        .getElementById("updateExpense")
        .click();

    }

});

function renderHistory(){

    historyList.innerHTML="";

    const months = Object.keys(data.history).reverse();

    if(months.length===0){

        historyList.innerHTML="<p>No previous months.</p>";

        return;

    }

    months.forEach(month=>{

        const info = data.history[month];

        const spent = info.expenses.reduce(
            (t,e)=>t+e.amount,
            0
        );

        const remaining = info.budget-spent;

        const template=document
            .getElementById("historyTemplate")
            .content
            .cloneNode(true);

        template.querySelector(".historyMonth")
            .textContent=month;

        template.querySelector(".historyTotals")
            .textContent=
            `${formatMoney(spent)} spent • ${formatMoney(remaining)} left`;

        template.querySelector(".historyItem")
            .addEventListener("click",()=>{

                openMonth(month);

            });

        historyList.appendChild(template);

    });

}

function openMonth(month){

    const info=data.history[month];

    monthTitle.textContent=month;

    const spent=info.expenses.reduce(
        (t,e)=>t+e.amount,
        0
    );

    monthBudget.textContent=formatMoney(info.budget);

    monthSpent.textContent=formatMoney(spent);

    monthRemaining.textContent=
        formatMoney(info.budget-spent);

    monthExpenseList.innerHTML="";

    if(info.expenses.length===0){

        monthEmptyState.style.display="block";

    }else{

        monthEmptyState.style.display="none";

        [...info.expenses]
        .reverse()
        .forEach(expense=>{

            const template=document
                .getElementById("expenseTemplate")
                .content
                .cloneNode(true);

            template.querySelector(".expenseDescription")
                .textContent=expense.description;

            template.querySelector(".expenseAmount")
                .textContent=formatMoney(expense.amount);

            template.querySelector(".expenseDate")
                .textContent=formatDate(expense.date);

            monthExpenseList.appendChild(template);

        });

    }

    historyModal.classList.add("hidden");

    monthModal.classList.remove("hidden");

}

/* ==========================
   INITIAL RENDER
========================== */

render();