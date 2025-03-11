function addToggleEvent() {
  const bookFormIsComplete = document.getElementById('bookFormIsComplete');
  const bookFormSubmit = document.getElementById('bookFormSubmit');
  const buttonText = bookFormSubmit.querySelector('span');

  if (bookFormIsComplete && buttonText) {
    bookFormIsComplete.addEventListener('change', () => {
      if (bookFormIsComplete.checked) {
        buttonText.innerText = 'selesai dibaca';
      } else {
        buttonText.innerText = 'belum selesai dibaca';
      }
    });
  }
}
document.addEventListener('DOMContentLoaded', addToggleEvent);

document.addEventListener('DOMContentLoaded', () => {
  const bookForm = document.getElementById('bookForm');
  bookForm.addEventListener('submit', function(event) {
    event.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }

  const search = document.querySelector('.search');
  const searchBookContainer = document.getElementById('searchBookContainer');
  search.addEventListener('click', () => {
    searchBookContainer.classList.toggle('active');
  });
  document.addEventListener('click', (e) => {
    if (!search.contains(e.target) && !searchBookContainer.contains(e.target)) {
      searchBookContainer.classList.remove('active');
    }
  });
  document.getElementById('searchSubmit').addEventListener('click', () => {
    searchBookContainer.classList.remove('active');
  });
});

const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year: parseInt(year),
    isComplete: Boolean(isComplete),
  };
}

function findBook(bookId) {
  return books.find(book => book.id === bookId) || null;
}

function findBookIndex(bookId) {
  return books.findIndex(book => book.id === bookId);
}

function isStorageExist() {
  if (typeof(localStorage) === undefined) {
    console.log('Local storage tidak didukung');
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (data) books.push(...data);
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBookElement(bookObject) {
  const {id, title, author, year, isComplete} = bookObject;

  const bookTitle = document.createElement('h3');
  bookTitle.setAttribute('data-testid', 'bookItemTitle');
  bookTitle.innerText = title;

  const bookAuthor = document.createElement('p');
  bookAuthor.setAttribute('data-testid', 'bookItemAuthor');
  bookAuthor.innerText = `Penulis: ${author}`;

  const bookYear = document.createElement('p');
  bookYear.setAttribute('data-testid', 'bookItemYear');
  bookYear.innerText = `Tahun: ${year}`;

  const bookTextContainer = document.createElement('div');
  bookTextContainer.append(bookTitle, bookAuthor, bookYear);

  const isCompleteButton = document.createElement('button');
  isCompleteButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
  isCompleteButton.innerText = isComplete? 'Belum selesai' : 'Tandai selesai';

  isCompleteButton.addEventListener('click', () => {
    bookObject.isComplete = !bookObject.isComplete;
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
  });

  const deleteButton = document.createElement('button');
  deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
  deleteButton.innerText = 'Hapus Buku';

  deleteButton.addEventListener('click', () => {
    removeBook(id);
  });

  const editButton = document.createElement('button');
  editButton.setAttribute('data-testid', 'bookItemEditButton');
  editButton.innerText = 'Edit Buku';

  editButton.addEventListener('click', () => {
    editBook(id);
  });

  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('bookItemButton');
  buttonContainer.append(isCompleteButton, deleteButton, editButton);

  const bookContainer = document.createElement('div');
  bookContainer.setAttribute('data-bookid', id);
  bookContainer.setAttribute('data-testid', 'bookItem');
  bookContainer.classList.add('bookItem');
  bookContainer.append(bookTextContainer, buttonContainer);

  return bookContainer;
}

function addBook() {
  const bookId = generateId();
  const bookTitle = document.getElementById('bookFormTitle').value;
  const bookAuthor = document.getElementById('bookFormAuthor').value;
  const bookYear = document.getElementById('bookFormYear').value;
  const bookIsComplete = document.getElementById('bookFormIsComplete').checked;

  const bookObject = generateBookObject(bookId, bookTitle, bookAuthor, bookYear, bookIsComplete);
  books.push(bookObject);

  document.getElementById('bookForm').reset();

  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function removeBook(bookId){
  const bookIndex = findBookIndex(bookId);
  if (bookIndex === -1) return;

  books.splice(bookIndex, 1);
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function editBook(bookId) {
  const bookTarget = findBook(bookId);
  if (!bookTarget) return;

  const bookForm = document.getElementById('bookForm');

  document.getElementById('bookFormTitle').value = bookTarget.title;
  document.getElementById('bookFormAuthor').value = bookTarget.author;
  document.getElementById('bookFormYear').value = bookTarget.year;
  document.getElementById('bookFormIsComplete').checked = bookTarget.isComplete;

  bookForm.replaceWith(bookForm.cloneNode(true));

  const newBookForm = document.getElementById('bookForm');

  function updateBook(event) {
    event.preventDefault();

    bookTarget.title = document.getElementById('bookFormTitle').value;
    bookTarget.author = document.getElementById('bookFormAuthor').value;
    bookTarget.year = document.getElementById('bookFormYear').value;
    bookTarget.isComplete = document.getElementById('bookFormIsComplete').checked;

    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));

    newBookForm.reset();

    newBookForm.replaceWith(newBookForm.cloneNode(true));
    document.getElementById('bookForm').addEventListener("submit", addBook);

    addToggleEvent();
  }

  newBookForm.addEventListener("submit", updateBook);

  addToggleEvent();
}

function searchBook() {
  const searchInput = document.getElementById('searchBookTitle').value.toLowerCase();
  const incompletedBook = document.getElementById('incompleteBookList');
  const completedBook = document.getElementById('completeBookList');

  incompletedBook.innerHTML = '<h2>Belum Selesai Dibaca</h2>';
  completedBook.innerHTML = '<h2>Selesai Dibaca</h2>';

  for (const bookItem of books) {
    if (bookItem.title.toLowerCase().includes(searchInput)) {
      const bookElement = makeBookElement(bookItem);
      if (bookItem.isComplete) {
        completedBook.append(bookElement);
      } else {
        incompletedBook.append(bookElement);
      }
    }
  }
}

document.getElementById('searchBook').addEventListener('submit', function(event) {
  event.preventDefault();
  searchBook();
});

document.addEventListener(SAVED_EVENT, () => {
  console.log('Berhasil menambahkan buku.')
});

document.addEventListener(RENDER_EVENT, () => {
  const incompletedBook = document.getElementById('incompleteBookList');
  const completedBook = document.getElementById('completeBookList');

  incompletedBook.innerHTML = '<h2>Belum Selesai Dibaca</h2>';
  completedBook.innerHTML = '<h2>Selesai Dibaca</h2>';

  for (const bookItem of books) {
    const bookElement = makeBookElement(bookItem);
    if (bookItem.isComplete) {
      completedBook.append(bookElement);
    } else {
      incompletedBook.append(bookElement);
    }
  }
});