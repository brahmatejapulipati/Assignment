var books;
var selectedBooksOnSearch;
var selectedBooks;
var searchBook = document.getElementById("searchText");
var bookShelf = document.getElementById("BookShelf");
var notAvailable = document.getElementById("notAvailable");
var currentlyReading= document.getElementById("currentlyReading");
var wantToRead=document.getElementById("wantToRead");
var readDone=document.getElementById("readDone");
var bookOptions = { "empty": "Move to ..", "none": "None", "currentlyReading": "Currently Reading", "wantToRead": "Want To Read", "readDone": "Read Done" }

function autoSearch() {
    $('#searchText').autocomplete({
        source: Object.keys(books)
    });
}

function search() {
    bookShelf.innerHTML = '';
    if (Object.keys(books).indexOf(searchBook.value) >= 0) {
        notAvailable.className = "notAvailable hide"
        selectedBooksOnSearch = books[searchBook.value]
        selectedBooksOnSearch.forEach(book => {
            addBook(book)
        });
    }
    else {
        notAvailable.className = "notAvailable"
    }
}

function displayBook(book) {
    let select = createDropDown()
    select.options[0].disabled = true
    select.value = book.status;
    select.id = book.id;
    select.onchange = changeValue
    let image = document.createElement("img")
    image.setAttribute("src", book.imageUrl)
    let titleNode = document.createElement("p")
    titleNode.textContent = book.title
    let sampleDiv = document.createElement("div");
    sampleDiv.style = "display:block"
    sampleDiv.id = book.id
    sampleDiv.append(image, select, titleNode)
    return sampleDiv;
}

function addBook(book) {
    let bookToAdd = displayBook(book);
    bookShelf.appendChild(bookToAdd);
}

function createDropDown() {
    var select = document.createElement("select");
    Object.keys(bookOptions).forEach(key => {
        let option = document.createElement("OPTION"),
            optionText = document.createTextNode(bookOptions[key]);
        option.appendChild(optionText);
        option.setAttribute("value", key)
        select.append(option);
    })
    return select;
}

async function intialize() {
    await fetch("http://localhost:3000/books").then(response => response.json().then(result => books = result))
    await fetch("http://localhost:3000/selectedBooks").then(response => response.json().then(result => selectedBooks = result))
    addBooksToshelves()
};

async function changeValue(e) {
    e.preventDefault();
    let id = e.target.id;
    let selectedBook;
    let method = "POST";
    let getBookSelected=(book)=> {if(id==book.id) return selectedBook=book}
    let selectedOption = document.getElementById(id).querySelector("select");
    let status = selectedOption.value
    searchBook?selectedBooksOnSearch.forEach(getBookSelected):selectedBooks.forEach(getBookSelected)
    selectedBook.status = status
    selectedBooks.forEach(book => { if (book.id == id) method = "PUT" })
    let url = method == "POST" ? "http://localhost:3000/selectedBooks" : `http://localhost:3000/selectedBooks/${id}`
    if (status === "none") {
        method = "DELETE";
        await fetch(url, {
            method: method,
        })
    }
    else {
        await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(selectedBook)
        })
    }
    intialize()
}
function getDivToAdd(value) {
    switch (value) {
        case "currentlyReading": return currentlyReading
        case "readDone": return readDone
        case "wantToRead": return wantToRead
    }
}
function addBooksToshelves() {
    console.log(selectedBooks);
    if(!bookShelf)
    currentlyReading.innerHTML=wantToRead.innerHTML=readDone.innerHTML=""
    selectedBooks.forEach(book => {
        let bookToAdd = displayBook(book)
        let bookDivToAdd = getDivToAdd(book.status)
        bookDivToAdd && bookDivToAdd.appendChild(bookToAdd)
    })
}

window.onload = intialize
