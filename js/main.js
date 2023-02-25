
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
  repeatElements();
}

// repeat DOM elements if they have the attribute 
// repeat = "x" set to a positive number
function repeatElements() {
  while (true) {
    let r = $('[repeat]');
    if (!r) { break; }
    let count = Math.max(1, +r.getAttribute('repeat'));
    r.removeAttribute('repeat');
    for (let i = 0; i < count - 1; i++) {
      let html = unsplashFix(r.outerHTML);
      replaceElement(r, html, false);
    }
  }
}

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
  showAllTheBooksInfo()
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

//////////////////////////////////////////
//////////////////////////////////////////

import { getJSON } from "./utils/getJsonFile"
let books

async function showAllTheBooksInfo() {
  const JSONfile = "/json/books.json"
  books = await getJSON(JSONfile)

  displayBooks()
}



async function displayBooks() {

  // let description = await (await (await fetch("api/?type=hipster-centric&paras=3")).json())

  let bookItem = books.map(({ title, author, description, category, price }) => /*html*/ `

    <!-- my card -->
    <div class="card mb-3">
      <div class="row g-0">
        <div class="col-md-4">
          <img src="https://source.unsplash.com/random/?book" class="img-fluid rounded-start photo" alt=${title}>
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h3 class="card-title">${title}</h3>
            <p>By: ${author}</p>
            <p><span class="book-category">Category: </span>${category}</p>
            <p><span class="price">Price: </span>${price}</p>
            <div class="limit">
              <p class="card-text">${description}</p>
            </div>

            <button type="button" class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
              Read More
            </button>

            <a href="#" class="btn btn-primary">Buy now</a>
          </div>
        </div>
      </div>
    </div>
    <!-- my card ends -->
  `)
  // cut()
  document.querySelector(".bookList").innerHTML = bookItem.join("")

}

// async function cut() {
//   let para = document.querySelector(".limit");
//   let text = para.innerHTML;
//   para.innerHTML = "";
//   let words = text.split(" ");
//   for (i = 0; i < 30; i++) {
//     para.innerHTML += words[i] + " ";
//   }
//   para.innerHTML += "...";
// }




// filter the elements
// ['ux', 'js', 'js', 'ux']
//   .filter(x => x !== ux)
//   .map(x => '<>')

  // .reduce() -
  // .sort()


