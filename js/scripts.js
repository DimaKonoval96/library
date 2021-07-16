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


let library = [];
const bookObj = {};
const addBookBtn = document.querySelector('.addBookBtn');
const cardsList = document.querySelector('.cardsList');
const inputs = document.querySelectorAll('form input');


inputs.forEach(input => {
    if(input.type == 'checkbox'){
      input.addEventListener('change', (ev) =>{
        bookObj[ev.target.name] = ev.target.checked;
      })
    } 
    else {
      input.addEventListener('change', (ev) =>{
          bookObj[ev.target.name] = ev.target.value;
      });
    }
})

const isValid = () => {
  let isEmpty = false;
  inputs.forEach(input => {
    if(input.type != 'checkbox'  && input.value == ''){
      isEmpty = true;
    }
  });
  return !isEmpty;
}

const addBookHandler = (ev) => {
  ev.preventDefault();
  if(!isValid()) return;
  if(!('isRead' in bookObj) ){
    bookObj.isRead = false;
  }
  db.collection('books').add(bookObj)
    .then(doc => {
      bookObj.id = doc.id;
      library.push(bookObj);
      cardsList.append(createCard(bookObj));
      inputs.forEach(input => {
        if(input.type != 'checkbox') {input.value = '';
        }
        else {
          input.checked = false;
        }
      })
    })
    .catch(error => {
      console.error('Error adding document: ', error);
    })
    
}
addBookBtn.addEventListener('click', addBookHandler);

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

//Walk through the library and display every object as a list item
displayLibrary = (library) => {};

const deleteHandler = (ev) =>{
  if(ev.target.className.includes('delete')){
    const id = ev.target.parentNode.id;
    library = library.filter((book) => book.id != id);
    db.collection('books').doc(id).delete().then(() => {
      
      console.log(library)});
    ev.currentTarget.removeChild(ev.target.parentNode);
  }
}


cardsList.addEventListener('click', deleteHandler);

function getBooks() {
	db.collection('books')
		.get()
		.then((querySnapshot) => {
			querySnapshot.forEach((doc) => {
				const id = doc.id;
				library.push({ id, ...doc.data() });
				
			});
		}).then(() =>{
		const fragment = document.createDocumentFragment();
		
		const cards = library.forEach((book) => {
		  fragment.appendChild(createCard(book));
		});
		cardsList.append(fragment);
		});
}

function createCard(props){
  const {title, author, isRead, pages, id} = props;
  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('id', id);
  const pTitle = document.createElement('p');
  pTitle.textContent = title;
  
  const pAuthor = document.createElement('p');
  pAuthor.textContent = author;
 
 const pPages = document.createElement('p');
 pPages.textContent = `${pages} pages`;
 
 const pIsRead = document.createElement('p');
 pIsRead.textContent = 'Have already read?';
 
 const lSwitch = document.createElement('label');
 lSwitch.classList.add('switch');

 const sSlider = document.createElement('span');
 const checked = isRead ? 'checked' : '';
 const input = `<input type="checkbox" ${checked} name="isRead">`;
 lSwitch.innerHTML += input;
 sSlider.classList.add('slider');
 sSlider.classList.add('round');
 lSwitch.append(sSlider);
 
 card.append(pTitle, pAuthor,pPages, pIsRead, lSwitch);


 const deleteIcon = '<i class="fas fa-minus-circle delete"></i>';
 card.innerHTML += deleteIcon;
 return card;
}
getBooks();

/*console.log(createCard({title:'Martin Eden', author: 'Jack London', pages: 235, isRead: false}));
*/
console.log(library);