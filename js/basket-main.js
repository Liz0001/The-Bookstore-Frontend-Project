
/////////////////////////////////
// BASKET
import { getJSON } from "./utils/getJsonFile"
let books
let booksInTheBasket = []

async function fetchBooks() {
  books = await getJSON("/json/books.json")
}

fetchBooks()



// button click - get the product id
document.querySelector('body').addEventListener('click', event => {

  let cardAddButton = event.target.closest('.add-to-basket')
  let modalAddButton = event.target.closest('.add-to-basket-2')

  if (cardAddButton) {
    const id1 = Number(cardAddButton.getAttribute("data-id"))
    booksInTheBasket.push(id1)
    // console.log("book ID:", id1, ", added from CARD")
    addBookToBasket()
  }

  if (modalAddButton) {
    const id2 = Number(modalAddButton.getAttribute("data-id"))
    booksInTheBasket.push(id2)
    // console.log("book ID:", id2, ", added from MODAL")
    addBookToBasket()
  }

})


function organiseBasket(bookCounts) {
  let basket = []

  const keys = Object.keys(bookCounts);

  keys.forEach((key, index) => {
    basket.push({
      "cost": books.filter(book => book.id === Number(key)).map(x => x.price)[0],
      "name": books.filter(book => book.id === Number(key)).map(x => x.title)[0],
      "nrOfBooks": bookCounts[key]
    })
  })

  return basket
}

async function addBookToBasket() {
  let bookCounts = {}
  // getting the count ratio per book
  booksInTheBasket.forEach(function (x) { bookCounts[x] = (bookCounts[x] || 0) + 1; });


  let basket = organiseBasket(bookCounts)


  let bookInTheBasket = basket.map(({
    cost, name, nrOfBooks
  }) => /*html*/ `
          
    <li class="list-group-item">
    
      <div>
        <span class="nrOfItems">${nrOfBooks}x - </span>
        <span class="bookName">${name}</span>
      </div>

      <div class="d-flex justify-content-between">
        <div>
          <span class="bookPrice">${cost} SEK </span>
        </div>
        <div>
          <button class="takeOffBook">-</button>
          <button class="addMOreOfTheSameBook">+</button>
        </div>
      </div>
    </li>
  `)

  console.log(bookInTheBasket)
  document.querySelector(".booksInTheBasket").innerHTML = bookInTheBasket

}



//     // const counts = {};
//     // // const booksInTheBasket = ['a', 'a', 'b', 'c'];
//     // booksInTheBasket.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });
//     // console.log(counts)
