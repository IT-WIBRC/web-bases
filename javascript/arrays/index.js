document.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();
});

const studentList = [];
const studentName = document.querySelector("input");
const addBtn = document.querySelector("button");

const generateUID = () => {
  return crypto.randomUUID();
};

function deleteFromListById(listToRemoveFrom, studentId) {
  const studentToDeleteIndex = studentList.findIndex(
    (student) => student.id === studentId
  );

  if (studentToDeleteIndex === -1) return;

  studentList.splice(studentToDeleteIndex, 1);
  listToRemoveFrom.querySelector(`[data-id="${studentId}"]`).remove();
}

function addDeleteButtonTo(element, label) {
  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-btn";
  deleteButton.textContent = "❌";
  deleteButton.ariaLabel = label;
  deleteButton.title = label;
  element.appendChild(deleteButton);
}

function insertStudentTo(student, target) {
  const li = document.createElement("li");
  li.className = "student";
  li.textContent = student.name;
  li.dataset.id = student.id;

  addDeleteButtonTo(li, `Enlever l'etudiant ${student.name} de la liste`);

  li.querySelector("button").addEventListener("click", () => {
    deleteFromListById(target, student.id);
  });

  target.appendChild(li);
}

function refreshList() {
  const list = document.querySelector(".list");
  list.replaceChildren();
  studentList.forEach((student) => insertStudentTo(student, list));
}

function sortStudentList() {
  studentList.sort((studentA, studentB) =>
    studentA.name.toLowerCase().localeCompare(studentB.name.toLowerCase())
  );
}

function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function clearField() {
  studentName.value = "";
}

function addToStudentList(nameToAdd) {
  const newStudent = {
    id: generateUID(),
    name: capitalize(nameToAdd),
    createdAt: new Date().toString(),
  };
  studentList.push(newStudent);
}

function processAddition(studentName) {
  const hasThisStudentAlready = studentList.find(
    (student) =>
      student.name.toLocaleLowerCase() === studentName.toLocaleLowerCase()
  );

  const canAddToList = studentName && hasThisStudentAlready === undefined;

  if (!canAddToList) {
    clearField();
    return;
  }

  addToStudentList(studentName);
  sortStudentList();
  refreshList();
  clearField();
}

addBtn.addEventListener("click", function () {
  processAddition(studentName.value);
});

studentName.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    processAddition(studentName.value);
  }
});
