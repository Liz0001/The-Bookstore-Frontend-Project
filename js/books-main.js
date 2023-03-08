
// //////////////////////////////////////////
// //////////////////////////////////////////
// // ALl about Books page


import { getJSON } from "./utils/getJsonFile"
let books

let authors = []
let categories = []

let authorFilterApplied = "All"
let categoryFilterApplied = "All"
let priceFilterApplied = "All"
let sortingBy = "None"



export async function showBooksAndFilters() {
  books = await getJSON("/json/books.json")

  displayBooks()

  addCategoryFilter()
  addAuthorFilter()
  addPriceFilter()

  sorting()
}



/////////////////////////////////////
// Getting all of the book categories and authors
function getCategories() {
  let allCat = books.map(book => book.category)
  categories = [...new Set(allCat)]
  categories.sort()
}


function getAuthors() {
  let allAuthors = books.map(book => book.author)
  authors = [...new Set(allAuthors)]
  authors = authors.sort(function (a, b) {
    let aa = a.split(" ")
    let bb = b.split(" ")
    return aa[aa.length - 1].toLowerCase() > bb[bb.length - 1].toLowerCase() ? 1 : -1
  })
}


////////////////////////////////////
// FILTERING
function addAuthorFilter() {
  getAuthors()
  document.querySelector(".author-filtering").innerHTML = /*html*/`
    <label> Authors:
      <select class="authorFilter form-select" aria-label="Authors">
        <option>All</option>
         ${authors.map(author => `<option> ${author} </option>`).join("")}
      </select>
    </label>

    `;
  document.querySelector(".authorFilter").addEventListener('change', event => {
    authorFilterApplied = event.target.value;
    displayBooks()
  })
}


function addCategoryFilter() {
  getCategories()
  document.querySelector(".category-filtering").innerHTML = /*html*/`
    <label> Category:
      <select class="categoryFilter form-select" aria-label="Category">
        <option>All</option>
          ${categories.map(category => `<option> ${category} </option>`).join("")}
      </select>
    </label>
    `;

  document.querySelector(".categoryFilter").addEventListener('change', event => {
    categoryFilterApplied = event.target.value;
    displayBooks()
  })
}


function addPriceFilter() {
  document.querySelector(".price-filtering").innerHTML = /*html*/`
    <label> Price:
      <select class="priceFilter form-select" aria-label="Price">
        <option>All</option>
        <option>0 - 250 SEK</option>
        <option>251 - 500 SEK</option>
        <option>501 - 750 SEK</option>
        <option>751 - 1000 SEK</option>
        <option>1000+ SEK</option>
      </select>
    </label>
    `;

  document.querySelector(".priceFilter").addEventListener('change', event => {
    priceFilterApplied = event.target.value;
    displayBooks()
  })
}


function filterAll() {

  let filteredBooks

  if (priceFilterApplied === "All") {
    filteredBooks = books.filter(({ author, category, price }) => (authorFilterApplied === "All"
      || author.includes(authorFilterApplied))
      && (categoryFilterApplied === "All" || categoryFilterApplied === category)
      && (priceFilterApplied === "All"))


  } else if (priceFilterApplied === "1000+ SEK") {
    filteredBooks = books.filter(({ author, category, price }) => (authorFilterApplied === "All"
      || author.includes(authorFilterApplied))
      && (categoryFilterApplied === "All" || categoryFilterApplied === category)
      && (price > 1000))

  } else {
    let min = priceFilterApplied.split(" ")[0]
    let max = priceFilterApplied.split(" ")[2]
    filteredBooks = books.filter(({ author, category, price }) => (authorFilterApplied === "All"
      || author.includes(authorFilterApplied))
      && (categoryFilterApplied === "All" || categoryFilterApplied === category)
      && (price >= min && price < max))
  }

  return filteredBooks
}


////////////////////////////////////
// SORTING
function sorting() {
  document.querySelector(".ascending-descending").innerHTML = /*html*/ `
    <label>Sort by:
      <select class="sortingOption form-select" aria-label="Sorting">
        <option>None</option>
        <option>Author: A -> Z</option>
        <option>Author: Z -> A</option>
        <option>Price: low to high</option>
        <option>Price: high to low</option>
        <option>Title: A -> Z</option>
        <option>Title: Z -> A</option>
      </select>
    </label>
  `;

  document.querySelector(".sortingOption").addEventListener('change', event => {
    sortingBy = event.target.value
    displayBooks()

  })
}


function sortAll(filteredBooks) {

  if (sortingBy === "Author: A -> Z") { return sortByAuthorAaZz(filteredBooks) }
  if (sortingBy === "Author: Z -> A") { return sortByAuthorZzAa(filteredBooks) }
  if (sortingBy === "Price: low to high") { return sortByPriceToHigher(filteredBooks) }
  if (sortingBy === "Price: high to low") { return sortByPriceToLower(filteredBooks) }
  if (sortingBy === "Title: A -> Z") { return sortByTitleAaZz(filteredBooks) }
  if (sortingBy === "Title: Z -> A") { return sortByTitleZzAa(filteredBooks) }

}

function sortByAuthorAaZz(filteredBooks) {
  return filteredBooks.sort(function ({ author: a }, { author: b }) {
    if (a == b) { return 0 }
    let aa = a.split(" ")
    let bb = b.split(" ")
    return aa[aa.length - 1] > bb[bb.length - 1] ? 1 : -1
  })
}

function sortByAuthorZzAa(filteredBooks) {
  return filteredBooks.sort(function ({ author: a }, { author: b }) {
    if (a == b) { return 0 }
    let aa = a.split(" ")
    let bb = b.split(" ")
    return aa[aa.length - 1] > bb[bb.length - 1] ? -1 : 1
  })
}

function sortByPriceToHigher(filteredBooks) {
  return filteredBooks.sort(({ price: aPrice }, { price: bPrice }) =>
    aPrice > bPrice ? 1 : -1)
}

function sortByPriceToLower(filteredBooks) {
  return filteredBooks.sort(({ price: aPrice }, { price: bPrice }) =>
    aPrice > bPrice ? -1 : 1)
}

function sortByTitleAaZz(filteredBooks) {
  return filteredBooks.sort(({ title: aTitle }, { title: bTitle }) =>
    aTitle > bTitle ? 1 : -1)
}

function sortByTitleZzAa(filteredBooks) {
  return filteredBooks.sort(({ title: aTitle }, { title: bTitle }) =>
    aTitle > bTitle ? -1 : 1)
}



////////////////////////////////////
// display all the books
async function displayBooks() {

  // fetching hipster ipsum description
  // let description = await (await (await fetch("api/?type=hipster-centric&paras=3")).json())
  // -----------------------

  let filteredBooks = filterAll()

  if (sortingBy !== "None") {
    filteredBooks = sortAll(filteredBooks)
  }

  // /////////////////
  let bookItem = filteredBooks.map(({
    id, title, author, description, category, price, cover
  }) => /*html*/ `
    
    <!-- my card -->
    <div class="card book-card mb-3">
      <div class="row g-0">

        <div class="col-sm-4">
          <img src=${cover} class="img-fluid rounded-start photo" alt=${title}>
        </div>

        <div class="col-sm-8">
          <div class="card-body">
            <p>${category}</p>
            <h3 class="card-title">${title}</h3>
            <p>By: ${author}</p>
            <p>${price}<span class="price"> SEK</span></p>

            <button type="button" class="btn btn-outline-primary read-more" data-bs-toggle="modal" data-bs-target="#exampleModal" data-id=${id}>
              Read More
            </button >

            <button href="#" class="btn btn-primary add-to-basket" data-id=${id}>
              Add to basket
            </button>
                    
          </div >
        </div >
      </div >
    </div >
    <!--my card ends -->
    `)

  document.querySelector(".bookList").innerHTML = bookItem.join("")
}


////////////////////////////////////
// add data to modal about a book - "read more" 
document.querySelector('body').addEventListener('click', event => {

  let readMore = event.target.closest('.read-more')

  if (readMore) {
    const id = Number(readMore.getAttribute("data-id"))
    let b = books.filter(b => b.id === id)

    document.querySelector('.book-title-main').innerHTML = b[0].title;
    document.querySelector('.book-title').innerHTML = b[0].title;
    document.querySelector('.book-author').innerHTML = b[0].author;
    document.querySelector('.book-desc').innerHTML = b[0].description;
    document.querySelector('.book-category').innerHTML = b[0].category;
    document.querySelector('.book-price').innerHTML = b[0].price;

    let cover = `<img src=${b[0].cover} alt=${b[0].title}
    class="col-sm-12 col-lg-5 float-md-end mb-3 ms-md-3">`
    document.querySelector('.book-cover').innerHTML = cover;

    let addButton = `<button type="button" data-id=${id} class="btn btn-primary add-to-basket-2">Add to Basket</button>`
    document.querySelector('.modal-footer').innerHTML = addButton

  }
})
