let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (e) {
  console.log('Upgrade needed in IndexDB');
  const db = e.target.result;
  db.createObjectStore("BudgetStore", { autoIncrement: true });
};

request.onsuccess = function (e) {
    console.log('success');
  db = e.target.result;

  if (navigator.onLine) {
    console.log('Backend online! 🗄️');
    checkDatabase();
  }
};

request.onerror = function (e) {
  console.log("Woops! " + e.target.errorCode);
};

function saveRecord(transaction) {
    console.log('Save record invoked');
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  const store = transaction.objectStore("BudgetStore");

  store.add(transaction);
}

function checkDatabase() {
    console.log('check db invoked');
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  const store = transaction.objectStore("BudgetStore");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then(response => response.json())
        .then(() => {
          const transaction = db.transaction(["BudgetStore"], "readwrite");
          const store = transaction.objectStore("BudgetStore");
          store.clear();
        });
    }
  };
}
window.addEventListener("online", checkDatabase);