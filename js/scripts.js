var firebaseConfig = {
	apiKey: 'AIzaSyBPDn9OWMjUQ9J9BtQYQf82ZWSg5vqm5qk',
	authDomain: 'bookslibrary-261a9.firebaseapp.com',
	databaseURL: 'https://bookslibrary-261a9-default-rtdb.firebaseio.com',
	projectId: 'bookslibrary-261a9',
	storageBucket: 'bookslibrary-261a9.appspot.com',
	messagingSenderId: '668802344734',
	appId: '1:668802344734:web:7452e02d202a4ae64b4b0f',
	measurementId: 'G-MYZHW83EVP',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
const db = firebase.firestore();

const library = [];

const addBookBtn = document.querySelector('.addBookBtn');
const booksList = document.querySelector('.booksList');

// Generate and return unique id

function Book(title, author, pages, isRead) {
	this.title = title;
	this.author = author;
	this.pages = pages;
	this.isRead = isRead;
	this.id = getID();
	const getID = () => {
		return '_' + Math.random().toString(36).substr(2, 9);
	};
}
Book.prototype.info = function () {
	return `${this.title} by ${this.author}, ${this.pages} pages, ${
		this.isRead ? 'read already' : 'not read yet'
	}`;
};

// Get user input, create book object and add to the library array
function addBookToLibrary() {
	const title = prompt('Title: ');
	const author = prompt('Author: ');
	const pages = prompt('Number of pages: ');
	let isRead = prompt('Is already read?(y/n)');
	isRead = isRead === 'y' || isRead === 'yes' ? true : false;

	library.push(new Book(title, author, pages, isRead));
}

//Walk through the library and display every object as a list item
displayLibrary = (library) => {};

function getBooks() {
	db.collection('books')
		.get()
		.then((querySnapshot) => {
			querySnapshot.forEach((doc) => {
				const id = doc.id;
				library.push({ id, ...doc.data() });
				console.log(library);
			});
		});
}
getBooks();
