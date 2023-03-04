
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
  // repeatElements();
}

// repeat DOM elements if they have the attribute 
// repeat = "x" set to a positive number
// function repeatElements() {
//   while (true) {
//     let r = $('[repeat]');
//     if (!r) { break; }
//     let count = Math.max(1, +r.getAttribute('repeat'));
//     r.removeAttribute('repeat');
//     for (let i = 0; i < count - 1; i++) {
//       let html = unsplashFix(r.outerHTML);
//       replaceElement(r, html, false);
//     }
//   }
// }

// special fix on repeat of random unsplash image
// (so that we don't cache and show the same image)
// function unsplashFix(html) {
//   return html.replace(
//     /(https:\/\/source.unsplash.com\/random\/?[^"]*)/g,
//     '$1&' + Math.random()
//   );
// }

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
// // BOOKS


import { getJSON } from "./utils/getJsonFile"
let books

let categories = []
let authors = []
let titles = []
let prices = []

let categoryFilterApplied = "All"
let authorFilterApplied = "All"
let titleFilterApplied = "All"
let priceFilterApplied = "All"


let filter = ""
let ascendDescend = ""


async function showBooksAndFilters() {
  books = await getJSON("/json/books.json")

  displayBooks()

  // chooseYourFilter()

  getCategories()
  getAuthors()
  // getPrices()
  // getTitles()

  // rest
  addCategoryFilter()
  addAuthorFilter()

}


// Initially the user chooses a filter
// function chooseYourFilter() {

//   displayBooks();

//   document.querySelector(".choose-filter").innerHTML = /*html*/ `
//     <label>Filter by:
//       <select class="sortOption">
//         <option></option>
//         <option>Author</option>
//         <option>Category</option>
//         <option>Price</option>
//         <option>Title</option>
//       </select>
//     </label>
//   `;
//   document.querySelector(".sortOption").addEventListener('change', event => {
//     filter = event.target.value
//     if (filter === "") {
//       document.querySelector(".category-filtering").style.display = "none"
//       displayBooks();

//     }
//     else if (filter === "Category") {
//       document.querySelector(".category-filtering").style.display = "show"
//       addFilters()
//     }
//     else if (filter === "Price") {
//       // document.querySelector(".category-filtering").style.display = "none"
//     } else if (filter === "Title") {
//       // document.querySelector(".category-filtering").style.display = "none"
//     }
//     // displayBooks();

//   })
// }


/////////////////////////////////////
// getting all of the book categories
function getCategories() {
  let allCat = books.map(book => book.category)
  categories = [...new Set(allCat)]
  categories.sort()
}

function getAuthors() {
  let allAuthorsNames = []
  let allAuthors = books.map(book => book.author.split(", "))
  allAuthors.forEach(names => names.forEach(name => allAuthorsNames.push(name)))
  authors = [...new Set(allAuthorsNames)]
  authors.sort(function (a, b) {
    let aa = a.split(" ")
    let bb = b.split(" ")
    return aa[aa.length - 1].toLowerCase() > bb[bb.length - 1].toLowerCase() ? 1 : -1
  })

}


////////////////////////////////////=
// add the catogory dropdown filter
function addCategoryFilter() {

  document.querySelector(".category-filtering").innerHTML = /*html*/`
  <label> Category:
    <select class="categoryFilter">
      <option> All </option>
        ${categories.map(category => `<option> ${category} </option>`).join("")}
      </select>
    </label>
    `;
  document.querySelector(".categoryFilter").addEventListener('change', event => {
    categoryFilterApplied = event.target.value;
    displayBooks()
  })
}


function addAuthorFilter() {
  document.querySelector(".author-filtering").innerHTML = /*html*/ `<label> Authors:
    <select class="authorFilter">
      <option> All </option>
        ${authors.map(author => `<option> ${author} </option>`).join("")}
      </select>
    </label>
    `;
  document.querySelector(".authorFilter").addEventListener('change', event => {
    authorFilterApplied = event.target.value;
    displayBooks()
  })
}


// function addFilters() {
//   document.querySelector(".filtering").innerHTML = /*html*/ `
//   <label> Category:  </label>

//       <button class="btn scategoryFilter"> All </button>
//         ${categories.map(cat => `<button class=" btn categoryFilter"> ${cat} </button>`).join("")}

//     `;
//   document.querySelector(".categoryFilter").addEventListener('change', event => {
//     categoryFilterApplied = event.target.value;
//     displayBooks()
//   })

/* <nav class="navbar navbar-inverse">
  <ul class="nav navbar-nav">
    <li><a href="#">Link</a></li>
    <li><a href="#">Link</a></li>
  </ul>
  <p class="navbar-text">Some text</p>
</nav> */
// }





async function displayBooks() {
  let filteredBooks

  filteredBooks = books.filter(({ category }) => categoryFilterApplied === "All"
    || categoryFilterApplied === category)

  filteredBooks = books.filter(({ author }) => authorFilterApplied === "All"
    || author.includes(authorFilterApplied))

  // let description = await (await (await fetch("api/?type=hipster-centric&paras=3")).json())
  // -----------------------

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
    let cover = `<img src=${b[0].cover} class="col-md-6 float-md-end mb-3 ms-md-3" alt=${b[0].title}>`
    document.querySelector('.book-cover').innerHTML = cover;

  }
})



// filter the elements
// ['ux', 'js', 'js', 'ux']
//   .filter(x => x !== ux)
//   .map(x => '<>')

  // .reduce() -
  // .sort()


