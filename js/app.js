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

// Book Form and Cards
const addBookForm = document.querySelector("form#addBookForm");
const addBookBtn = document.querySelector(".addBookBtn");
const cardsList = document.querySelector(".cardsList");
const inputs = document.querySelectorAll("form#addBookForm input");
const bookModal = document.querySelector("#bookModal");
const loginModal = document.querySelector("#loginModal");
let db;

const loginGoogleBtn = document.querySelector("button#loginGoogleBtn");

firebase.auth().onAuthStateChanged((user) => {
  const currUserDiv = document.querySelector("#currUser");
  if (user) {
    db = new Cloud(user.uid);
    db.getBooks();
    currUserDiv.classList.remove("hidden");
    document.querySelector("#loginBtn").classList.add("hidden");
    currUserDiv.querySelector("#userName").textContent = user.displayName;
  } else {
    db = new LS();
    db.getBooks();
    currUserDiv.classList.add("hidden");
  }
});

function createUUID() {
  let dt = new Date().getTime();

  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    }
  );

  return uuid;
}

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
    this.id = createUUID();
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
      <p id='cardTitle'>${title}</p>
      <p id='cardAuthor'>${author}</p>
      <p id='cardPages'>${pages} pages</p>
      <div class='switchContainer'>
        <span>Have already read?</span>
        <label class='switch'>
        
          <input type="checkbox" ${checked} name="isRead" class='isRead'>
          <span class='slider round'></span>
        </label>
      </div>
      <i class="fa-solid fa-pen-to-square edit"></i>
      <i class="fas fa-times-circle delete"></i>`;
    return card;
  }

  static removeCard(ev) {
    ev.currentTarget.removeChild(ev.target.parentNode);
  }

  static editCard(book) {}

  static clearCardsList() {
    cardsList.innerHTML = "";
  }

  static addCard(book) {
    cardsList.append(this.createCard(book));
    makeInputsEmpty(inputs);
  }

  static displayCards(library) {
    const fragment = document.createDocumentFragment();

    library.forEach((book) => {
      fragment.append(this.createCard(book));
    });
    cardsList.innerHTML = "";
    cardsList.append(fragment);
  }
}

class User {
  constructor() {
    this.auth = firebase.auth();
  }

  loginWithGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();
    this.auth
      .signInWithPopup(provider)
      .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;
        var token = credential.accessToken;
        this.user = result.user;
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
        console.log(errorCode, errorMessage);
        // ...
      });
  }

  signOut() {
    this.auth.signOut();
  }
}

// Local Storage
class LS {
  library = [];
  addBook(book) {
    localStorage.setItem(book.id, JSON.stringify(book));
    this.library.push(book);
    BookUI.addCard(book);
  }

  editBook(id) {
    this;
  }

  removeBook(id) {
    this.library = this.library.filter((book) => book.id != id);
    localStorage.removeItem(id);
  }

  updateIsRead(id, isRead) {
    const book = JSON.parse(localStorage.getItem(id));
    book.isRead = isRead;
    localStorage.setItem(id, JSON.stringify(book));
  }
  getBooks() {
    const keys = Object.keys(localStorage);
    let i = keys.length;

    while (i--) {
      this.library.push(JSON.parse(localStorage.getItem(keys[i])));
    }

    BookUI.displayCards(this.library);
  }
}

//Firebase
class Cloud {
  library = [];
  constructor(uid) {
    this.docRef = firebase.firestore().collection(`users`).doc(`${uid}`);
  }

  addBook(book) {
    this.docRef
      .collection("books")
      .doc(book.id)
      .set(Object.assign({}, book))
      .then((doc) => {
        this.library.push(book);
        BookUI.addCard(book);
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
  }

  removeBook(id) {
    this.library = this.library.filter((book) => book.id != id);
    this.docRef.collection("books").doc(id).delete();
  }

  updateIsRead(id, isRead) {
    this.docRef.collection("books").doc(id).set(
      {
        isRead,
      },
      { merge: true }
    );
  }

  editBook(id, bookData) {
    this.docRef
      .collection("books")
      .doc(id)
      .set(Object.assign({}, bookData), { merge: true });
  }

  getBooks() {
    this.docRef
      .collection("books")
      .get()
      .then((querySnapshot) => {
        this.library = [];
        querySnapshot.forEach((doc) => {
          const id = doc.id;
          console.log(doc.data());
          this.library.push({ id, ...doc.data() });
        });
      })
      .then(() => {
        BookUI.displayCards(this.library);
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
  bookModal.classList.add("hidden");
};

function deleteHandler(ev) {
  const id = ev.target.parentNode.id;

  db.removeBook(id);
  BookUI.removeCard(ev);
}

function toggleHandler(ev) {
  const id = ev.target.parentNode.parentNode.parentNode.id;
  const isRead = ev.target.checked;
  db.updateIsRead(id, isRead);
}

const deleteToggleHandler = (ev) => {
  if (ev.target.className.includes("delete")) {
    deleteHandler(ev);
  } else if (ev.target.className.includes("isRead")) {
    toggleHandler(ev);
  } else if (ev.target.className.includes("edit")) {
    const id = ev.target.parentNode.id;
    const bookData = db.library.filter((book) => book.id == id)[0];
    const editBookModal = document.querySelector("#editBookModal");
    editBookModal.classList.remove("hidden");
    const { title, author, pages, isRead } = bookData;
    console.log(isRead);
    document.querySelector("input#editTitle").value = title;
    document.querySelector("input#editAuthor").value = author;
    document.querySelector("input#editPages").value = pages;
    document.querySelector("input#editIsRead").checked = isRead;
    document.querySelector("#editBookForm").setAttribute("data-id", id);
  }
};

function signUpBtnHandler(ev) {
  ev.preventDefault();
  const user = new User();

  const email = signUpForm.querySelector('input[name="email"]').value;
  const password = signUpForm.querySelector('input[name="password"]').value;
  user.createUserWithEmailAndPassword(email, password);
}

function loginWithGoogleHandler(ev) {
  ev.preventDefault();
  const user = new User();
  user.loginWithGoogle();
}

function signInBtnHandler(ev) {
  ev.preventDefault();
  const user = new User();
  const email = signInForm.querySelector('input[name="email"]').value;
  const password = signInForm.querySelector('input[name="password"]').value;
  user.signInWithEmailAndPassword(email, password);
  signInForm.classList.add("hidden");
}

function signOutBtnHandler(ev) {
  const user = new User();
  user.signOut();
}
cardsList.addEventListener("click", deleteToggleHandler);
addBookBtn.addEventListener("click", addBookHandler);

document.querySelector("#newBookBtn").addEventListener("click", (ev) => {
  bookModal.classList.remove("hidden");
});

document
  .querySelector("#loginBtn")
  .addEventListener("click", loginWithGoogleHandler);

document
  .querySelector("#signOutBtn")
  .addEventListener("click", signOutBtnHandler);

document.querySelector(".saveEditBtn").addEventListener("click", (ev) => {
  const book = {};
  book.title = document.querySelector("input#editTitle").value;
  book.author = document.querySelector("input#editAuthor").value;
  book.pages = document.querySelector("input#editPages").value;
  book.isRead = document.querySelector("input#editIsRead").checked;
  id = document.querySelector("#editBookForm").dataset.id;
  db.editBook(id, book);
  const editBookModal = document.querySelector("#editBookModal");
  editBookModal.classList.add("hidden");
  db.getBooks();
});
window.addEventListener("click", (ev) => {
  if (ev.target.className.includes("modal")) {
    ev.target.classList.add("hidden");
  }
});
