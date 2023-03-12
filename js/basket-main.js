
// //////////////////////////////////////////
// //////////////////////////////////////////
// // ALl about Basket 
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
    addBookToBasket()
  }
  if (modalAddButton) {
    const id2 = Number(modalAddButton.getAttribute("data-id"))
    booksInTheBasket.push(id2)
    addBookToBasket()
  }
})


// add here for easier access
function organiseBasket(bookCounts) {
  let basket = []
  const keys = Object.keys(bookCounts);

  keys.forEach((key, index) => {
    basket.push({
      "id": books.filter(book => book.id === Number(key)).map(x => x.id)[0],
      "cost": books.filter(book => book.id === Number(key)).map(x => x.price)[0],
      "name": books.filter(book => book.id === Number(key)).map(x => x.title)[0],
      "nrOfBooks": bookCounts[key]
    })
  })
  return basket
}


async function addBookToBasket() {
  let bookCounts = {}
  booksInTheBasket.forEach(function (x) { bookCounts[x] = (bookCounts[x] || 0) + 1; });

  let basket = organiseBasket(bookCounts)

  let bookInTheBasket = basket.map(({
    id, cost, name, nrOfBooks
  }) => /*html*/ `    
    <li class="list-group-item">
      <div>
        <span class="nrOfItems">${nrOfBooks}x </span>
        <span class="bookName">${name}</span>
      </div>

      <div class="d-flex justify-content-between">
        <div>
          <span class="bookPrice">${cost} SEK </span>
        </div>
        <div>
          <button class="takeOffBook btn" data-id=${id}>-</button>
          <button class="addMOreOfTheSameBook btn" data-id=${id}>+</button>
        </div>
      </div>
    </li>
  `)

  document.querySelector(".booksInTheBasket").innerHTML = bookInTheBasket.join("")

  calculateBasketTotal(basket)
  basketFullEmpty()
}


function calculateBasketTotal(basket) {
  let sum = 0
  basket.map(x => sum += (x.cost * x.nrOfBooks))

  document.querySelector('.hrLine').innerHTML = `<hr>`
  let total = `<p class="pt-2">Total: ${sum} SEK </p>`
  document.querySelector('.baskeTotal').innerHTML = total
  let checkout = `<button class="btn btn-primary">Checkout</button>`
  document.querySelector('.proceedToCheckout').innerHTML = checkout
  document.querySelector('.basketIsEmpty').innerHTML = ""

}



function basketFullEmpty() {

  if (booksInTheBasket.length > 0) {
    let filled = `<svg class="fullBasket" xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" class="bi bi-basket3-fill" viewBox="0 0 16 16">
  <path d="M5.757 1.071a.5.5 0 0 1 .172.686L3.383 6h9.234L10.07 1.757a.5.5 0 1 1 .858-.514L13.783 6H15.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H.5a.5.5 0 0 1-.5-.5v-1A.5.5 0 0 1 .5 6h1.717L5.07 1.243a.5.5 0 0 1 .686-.172zM2.468 15.426.943 9h14.114l-1.525 6.426a.75.75 0 0 1-.729.574H3.197a.75.75 0 0 1-.73-.574z"/>
  </svg>`
    document.querySelector('.basketHasBooks').innerHTML = filled


  } else if (booksInTheBasket.length === 0) {

    let notingInTheBasket = "Nothing here!"
    document.querySelector('.basketIsEmpty').innerHTML = notingInTheBasket
    let empty = `<svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" class="bi bi-basket3" viewBox="0 0 16 16">
    <path
      d="M5.757 1.071a.5.5 0 0 1 .172.686L3.383 6h9.234L10.07 1.757a.5.5 0 1 1 .858-.514L13.783 6H15.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H.5a.5.5 0 0 1-.5-.5v-1A.5.5 0 0 1 .5 6h1.717L5.07 1.243a.5.5 0 0 1 .686-.172zM3.394 15l-1.48-6h-.97l1.525 6.426a.75.75 0 0 0 .729.574h9.606a.75.75 0 0 0 .73-.574L15.056 9h-.972l-1.479 6h-9.21z" />
    </svg>`
    document.querySelector('.basketHasBooks').innerHTML = empty

    document.querySelector('.hrLine').innerHTML = ""
    document.querySelector('.baskeTotal').innerHTML = ""
    document.querySelector('.proceedToCheckout').innerHTML = ""
  }
}


///////////////////////////////////////////
// add / take off books from basket

document.querySelector('body').addEventListener('click', event => {

  let less = event.target.closest('.takeOffBook')
  let more = event.target.closest('.addMOreOfTheSameBook')
  if (less) {
    const id1 = Number(less.getAttribute("data-id"))
    takeOffThebook(id1)
  }
  if (more) {
    const id2 = Number(more.getAttribute("data-id"))
    booksInTheBasket.push(id2)
    addBookToBasket()
  }
})


// for books in the basket 
function takeOffThebook(id) {

  if (booksInTheBasket) {
    let index = booksInTheBasket.indexOf(id)
    booksInTheBasket.splice(index, (index + 1))
    addBookToBasket()
  }
}

