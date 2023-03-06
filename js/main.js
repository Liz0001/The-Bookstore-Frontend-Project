
//////////////////////////////////////////
//////////////////////////////////////////
// HTML-component + SPA/routing example in Vanilla JS
// © ironboy, Node Hill AB, 2023

// import the main scss file: the scss will compile to css
// and hot reload on changes thanks to Vite
import '../scss/style.scss';

// import bootstrap JS part
import * as bootstrap from 'bootstrap';

// helper: grab a DOM element
const $ = el => document.querySelector(el);

// helper: fetch a text/html file (and remove vite injections)
const fetchText = async url => (await (await (fetch(url))).text())
  .replace(/<script.+?vite\/client.+?<\/script>/g, '');

// helper: replace a DOM element with new element(s) from html string
function replaceElement(element, html, remove = true) {
  let div = document.createElement('div');
  div.innerHTML = html;
  for (let newElement of [...div.children]) {
    element.after(newElement, element);
  }
  remove && element.remove();
}

// mount components (tags like <component="app"> etc 
// will be replaced with content from the html folder)
async function componentMount() {
  while (true) {
    let c = $('component');
    if (!c) { break; }
    let src = `/html${c.getAttribute('src')}.html`;
    let html = await fetchText(src);
    replaceElement(c, html);
  }
}


// listen to click on all a tags
$('body').addEventListener('click', e => {
  let aElement = e.target.closest('a');
  if (!aElement) { return; }
  let href = aElement.getAttribute('href');
  // do nothing if external link (starts with http)
  if (href.indexOf('http') === 0) { return; }
  // do nothing if just '#'
  if (href === '#') { return; }
  // prevent page reload
  e.preventDefault();
  // 'navigate' / change url
  history.pushState(null, null, href);
  // load the page
  loadPage(href);
});

// when the user navigates back / forward -> load page
window.addEventListener('popstate', () => loadPage());

// load page - soft reload / à la SPA 
// (single page application) of the main content
const pageCache = {};
async function loadPage(src = location.pathname) {
  src = src === '/' ? '/home' : src;
  src = `/html/pages/${src}.html`;
  let html = pageCache[src] || await fetchText(src);
  pageCache[src] = html;
  $('main').innerHTML = html;
  // run componentMount (mount new components if any)
  componentMount();
  // set active link in navbar
  setActiveLinkInNavbar();

  // show ALL books on the BOOKS page & filters etc..
  if (window.location.pathname === "/books") {
    showBooksAndFilters()
  }
}

// set the correct link active in navbar match on
// the attributes 'href' and also 'active-if-url-starts-with'
function setActiveLinkInNavbar() {
  let href = location.pathname;
  let oldActive = $('nav .active');
  let newActive = $(`nav a[href="${href}"]:not(.navbar-brand)`);
  if (!newActive) { // match against active-if-url-starts-with
    for (let aTag of $('nav').querySelectorAll('a')) {
      let startsWith = aTag.getAttribute('active-if-url-starts-with');
      newActive = startsWith && href.indexOf(startsWith) === 0 && aTag;
      if (newActive) { break; }
    }
  }
  oldActive && oldActive.classList.remove('active');
  newActive && newActive.classList.add('active');
}

// initially, on hard load/reload:
// mount components and load the page
componentMount().then(x => loadPage());


// //////////////////////////////////////////
// //////////////////////////////////////////
// // BOOKS SECTION code

import { getJSON } from "./utils/getJsonFile"
let books

let authors = []
let categories = []

let authorFilterApplied = "All"
let categoryFilterApplied = "All"
let priceFilterApplied = "All"
let sortingBy = "None"



async function showBooksAndFilters() {
  books = await getJSON("/json/books.json")

  displayBooks()

  getCategories()
  getAuthors()

  addCategoryFilter()
  addAuthorFilter()
  addPriceFilter()

  sorting()
}



/////////////////////////////////////
// Getting all of the book categories, authors
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

  console.log(filteredBooks)
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
    <div class="card book-card mb-3" data-id=${id}>
      <div class="row g-0">

        <div class="col-md-4">
          <img src=${cover} class="img-fluid rounded-start photo" alt=${title}>
        </div>

        <div class="col-md-8">
          <div class="card-body">
            <p>${category}</p>
            <h3 class="card-title">${title}</h3>
            <p>By: ${author}</p>
            <p>${price}<span class="price"> SEK</span></p>

            <button type="button" class="btn btn-outline-primary read-more" data-bs-toggle="modal" data-bs-target="#exampleModal" >
              Read More
            </button >

            <button href="#" class="btn btn-primary add-to-basket">
              Add to basket
            </Button>
                    
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

  let cards = event.target.closest('.book-card')

  if (cards) {
    console.log("here", cards.getAttribute("data-id"))
    const id = Number(cards.getAttribute("data-id"))
    let b = books.filter(b => b.id === id)

    document.querySelector('.book-title-main').innerHTML = b[0].title;
    document.querySelector('.book-title').innerHTML = b[0].title;
    document.querySelector('.book-author').innerHTML = b[0].author;
    document.querySelector('.book-desc').innerHTML = b[0].description;
    document.querySelector('.book-category').innerHTML = b[0].category;
    document.querySelector('.book-price').innerHTML = b[0].price;
    let cover = `<img src=${b[0].cover} class="col-sm-12 col-lg-5 float-md-end mb-3 ms-md-3" alt=${b[0].title}>`
    document.querySelector('.book-cover').innerHTML = cover;

  }
})



// filter the elements
// ['ux', 'js', 'js', 'ux']
//   .filter(x => x !== ux)
//   .map(x => '<>')

//   .reduce() -
//   .sort()
