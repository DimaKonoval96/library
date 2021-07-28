var firebaseConfig = {
  apiKey: "AIzaSyBPDn9OWMjUQ9J9BtQYQf82ZWSg5vqm5qk",
  authDomain: "bookslibrary-261a9.firebaseapp.com",
  databaseURL: "https://bookslibrary-261a9-default-rtdb.firebaseio.com",
  projectId: "bookslibrary-261a9",
  storageBucket: "bookslibrary-261a9.appspot.com",
  messagingSenderId: "668802344734",
  appId: "1:668802344734:web:7452e02d202a4ae64b4b0f",
  measurementId: "G-MYZHW83EVP",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
const db = firebase.firestore();

const library = [];

// Book Form and Cards
const bookObj = new Book();
const addBookBtn = document.querySelector(".addBookBtn");
const cardsList = document.querySelector(".cardsList");
const inputs = document.querySelectorAll("form#addBookForm input");

// Sign Up
const currUser = {};
const signUpForm = document.querySelector("#signUpForm");
const signUpInputs = signUpForm.querySelectorAll("input");
const emailInput = signUpForm.querySelector('input[name="email"]');
const passwdInput = signUpForm.querySelector('input[name="password"');
const passwdComfirmInput = signUpForm.querySelector(
  'input[name="passwordConfirm"'
);
const signUpBtn = signUpForm.querySelector('button[type="submit"]');

// Validator
const isValid = () => {
  let isEmpty = false;
  inputs.forEach((input) => {
    if (input.type != "checkbox" && input.value == "") {
      isEmpty = true;
    }
  });
  return !isEmpty;
};

// Book constractor
function Book() {}

function displayCards() {
  const fragment = document.createDocumentFragment();

  const cards = library.forEach((book) => {
    fragment.appendChild(createCard(book));
  });
  cardsList.append(fragment);
}

function createCard(props) {
  const { title, author, isRead, pages, id } = props;
  const card = document.createElement("div");
  card.className = "card";
  card.setAttribute("id", id);
  const pTitle = document.createElement("p");
  pTitle.textContent = title;

  const pAuthor = document.createElement("p");
  pAuthor.textContent = author;

  const pPages = document.createElement("p");
  pPages.textContent = `${pages} pages`;

  const pIsRead = document.createElement("p");
  pIsRead.textContent = "Have already read?";

  const lSwitch = document.createElement("label");
  lSwitch.classList.add("switch");

  const sSlider = document.createElement("span");
  const checked = isRead ? "checked" : "";
  const input = `<input type="checkbox" ${checked} name="isRead" class='isRead'>`;
  lSwitch.innerHTML += input;
  sSlider.classList.add("slider");
  sSlider.classList.add("round");
  lSwitch.append(sSlider);

  card.append(pTitle, pAuthor, pPages, pIsRead, lSwitch);

  const deleteIcon = '<i class="fas fa-minus-circle delete"></i>';
  card.innerHTML += deleteIcon;
  return card;
}

function makeInputsEmpty(inputs) {
  inputs.forEach((input) => {
    if (input.type != "checkbox") {
      input.value = "";
    } else {
      input.checked = false;
    }
  });
}

function getBooks() {
  db.collection("books")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const id = doc.id;
        library.push({ id, ...doc.data() });
      });
    })
    .then(() => {
      displayCards();
    });
}

// Event handlers
const addBookHandler = (ev) => {
  ev.preventDefault();
  if (!isValid()) return;
  if (!("isRead" in bookObj)) {
    bookObj.isRead = false;
  }
  db.collection("books")
    .add(Object.assign({}, bookObj))
    .then((doc) => {
      bookObj.id = doc.id;
      library.push(bookObj);
      cardsList.append(createCard(bookObj));
      makeInputsEmpty(inputs);
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });
};

function deleteHandler(ev) {
  const id = ev.target.parentNode.id;
  library = library.filter((book) => book.id != id);
  db.collection("books").doc(id).delete();
  ev.currentTarget.removeChild(ev.target.parentNode);
}

function toggleHandler(ev) {
  const id = ev.target.parentNode.parentNode.id;
  db.collection("books").doc(id).set(
    {
      isRead: ev.target.checked,
    },
    { merge: true }
  );
}

const deleteToggleHandler = (ev) => {
  if (ev.target.className.includes("delete")) {
    deleteHandler(ev);
  } else if (ev.target.className.includes("isRead")) {
    toggleHandler(ev);
  }
};

// Event Listeners
inputs.forEach((input) => {
  input.addEventListener("change", (ev) => {
    let inputValue;
    if (input.type == "checkbox") {
      inputValue = ev.target.checked;
    } else {
      inputValue = ev.target.value;
    }
    bookObj[ev.target.name] = inputValue;
  });
});
cardsList.addEventListener("click", deleteToggleHandler);
addBookBtn.addEventListener("click", addBookHandler);

signUpInputs.forEach((input) => {
  input.addEventListener("change", (ev) => {
    currUser[ev.target.name] = ev.target.value;
    console.log(currUser);
  });
});
getBooks();
