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
firebase.initializeApp(firebaseConfig);
firebase.analytics();

let library = [];

// Book Form and Cards
const addBookBtn = document.querySelector(".addBookBtn");
const cardsList = document.querySelector(".cardsList");
const inputs = document.querySelectorAll("form#addBookForm input");

// Sign Up
const signUpForm = document.querySelector("#signUpForm");
const signUpInputs = signUpForm.querySelectorAll("input");
const emailInput = signUpForm.querySelector('input[name="email"]');
const passwdInput = signUpForm.querySelector('input[name="password"');
const passwdComfirmInput = signUpForm.querySelector(
  'input[name="passwordConfirm"'
);
const signUpBtn = signUpForm.querySelector('button[type="submit"]');
const signUpWithGoogleBtn = signUpForm.querySelector(
  'button[name="signUpGoogleBtn"]'
);
const signInForm = document.querySelector("#signInForm");
const signInBtn = signInForm.querySelector('button[type="submit"]');
const signOutBtn = document.querySelector("#signOut");

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

// Book class
class Book {
  constructor(title, author, pages, isRead) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.isRead = isRead;
  }
}

// UI
class BookUI {
  static createCard(props) {
    const { title, author, isRead, pages, id } = props;
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("id", id);
    const checked = isRead ? "checked" : "";

    card.innerHTML = `
      <p>${title}</p>
      <p>${author}</p>
      <p>${pages}</p>
      <p>Have already read?</p>
      <label class='switch'>
        <input type="checkbox" ${checked} name="isRead" class='isRead'>
        <span class='slider round'></span>
      </label>
      <i class="fas fa-minus-circle delete"></i>`;
    return card;
  }

  static removeCard(ev) {
    ev.currentTarget.removeChild(ev.target.parentNode);
  }

  static addCard(book) {
    cardsList.append(this.createCard(book));
    makeInputsEmpty(inputs);
  }

  static displayCards() {
    const fragment = document.createDocumentFragment();

    const cards = library.forEach((book) => {
      fragment.appendChild(this.createCard(book));
    });
    cardsList.append(fragment);
  }
}

class DB {
  constructor() {
    this.db = firebase.firestore();
  }

  addBook(book) {
    this.db
      .collection("books")
      .add(Object.assign({}, book))
      .then((doc) => {
        book.id = doc.id;
        library.push(book);
        BookUI.addCard(book);
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
  }

  removeBook(id) {
    this.db.collection("books").doc(id).delete();
  }

  updateIsRead(id, isRead) {
    this.db.collection("books").doc(id).set(
      {
        isRead,
      },
      { merge: true }
    );
  }

  getBooks() {
    console.log(this.db);
    this.db
      .collection("books")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const id = doc.id;
          library.push({ id, ...doc.data() });
        });
      })
      .then(() => {
        BookUI.displayCards();
      });
  }
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

const db = new DB();

class User {
  constructor() {
    this.auth = firebase.auth();
  }

  createUserWithEmailAndPassword(email, password) {
    this.auth
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Signed in
        this.credential = userCredential.user;
        // ...
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        // ..
      });
  }
  signInWithGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();
    this.auth
      .signInWithPopup(provider)
      .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;

        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = credential.accessToken;
        // The signed-in user info.
        this.user = result.user;
        // ...
        const currUserP = document.querySelector("p.currUserName");
        currUserP.textContent = this.user.displayName;
        console.log(this);
      })
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        console.log(errorCode, errorMessage);
        // ...
      });
  }
  signInWithEmailAndPassword(email, password) {
    this.auth
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        this.user = userCredential.user;
        console.log(this.user);
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
      });
  }

  signOut() {
    this.auth.signOut().then(() => {
      console.log("Sign Out");
    });
  }
}

// Event handlers
const addBookHandler = (ev) => {
  ev.preventDefault();
  if (!isValid()) return;
  const title = document.querySelector("input#title").value;
  const author = document.querySelector("input#author").value;
  const pages = document.querySelector("input#pages").value;
  const isRead = document.querySelector("input#isRead").checked;

  const book = new Book(title, author, pages, isRead);

  db.addBook(book);
};

function deleteHandler(ev) {
  const id = ev.target.parentNode.id;
  library = library.filter((book) => book.id != id);
  db.removeBook(id);
  BookUI.removeCard(ev);
}

function toggleHandler(ev) {
  const id = ev.target.parentNode.parentNode.id;
  const isRead = ev.target.checked;
  db.updateIsRead(id, isRead);
}

const deleteToggleHandler = (ev) => {
  if (ev.target.className.includes("delete")) {
    deleteHandler(ev);
  } else if (ev.target.className.includes("isRead")) {
    toggleHandler(ev);
  }
};

function signUpBtnHandler(ev) {
  ev.preventDefault();
  const user = new User();

  const email = signUpForm.querySelector('input[name="email"]').value;
  const password = signUpForm.querySelector('input[name="password"]').value;
  user.createUserWithEmailAndPassword(email, password);
}

function signUpWithGoogleHandler(ev) {
  ev.preventDefault();
  const user = new User();
  user.signInWithGoogle();
}

function signInBtnHandler(ev) {
  ev.preventDefault();
  const user = new User();
  const email = signInForm.querySelector('input[name="email"]').value;
  const password = signInForm.querySelector('input[name="password"]').value;
  user.signInWithEmailAndPassword(email, password);
  signInForm.classList.add("hidden");
}

function signOutBtnHandler() {}
cardsList.addEventListener("click", deleteToggleHandler);
addBookBtn.addEventListener("click", addBookHandler);

signUpBtn.addEventListener("click", signUpBtnHandler);
signUpWithGoogleBtn.addEventListener("click", signUpWithGoogleHandler);

signInBtn.addEventListener("click", signInBtnHandler);
signOutBtn.addEventListener("click", signOutBtnHandler);
db.getBooks();
