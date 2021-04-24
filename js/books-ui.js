export class BooksUI {
  searchResultHolder;
  bookInfoHolder;
  toReadList;

  currentPage = [];
  arrayReadBooks = [];

  api;

  isBookSelected;

  constructor(api) {
    this.searchResultHolder = document.getElementById("searchResultHolder");
    this.bookInfoHolder = document.getElementById("bookInfoHolder");
    this.toReadList = document.getElementById("toReadList");

    const searchInput = document.getElementById("searchInput");
    const goButton = document.getElementById("goButton");

    this.processToReadList();

    goButton.addEventListener("click", () => {
      const querry = searchInput.value;
      if (!querry) {
        return;
      }

      api.search(querry).then(page => {
        this.processSearchResult(page);
      });

      this.isBookSelected = false;
    });

    this.searchResultHolder.addEventListener("click", event => {
      const targetDiv = event.target;
      const id = targetDiv.id;
      const selectedBook = this.currentPage.find(item => item.id === id);

      if (this.isBookSelected) {
        const bookToUnselect = this.searchResultHolder.querySelector(
          ".selected-book"
        );
        bookToUnselect.classList.remove("selected-book");
      }

      targetDiv.classList.add("selected-book");
      this.isBookSelected = true;

      this.bookInfoHolder.innerHTML = `
        <div>
          <h2>${selectedBook.title}</h2>
          <h3>${selectedBook.subtitle}</h3>
          <p>Languages available: ${
            selectedBook.language ? selectedBook.language.join(", ") : ""
          }</p>
          <p>Full text available: ${
            selectedBook.has_fulltext ? "yes" : "no"
          }</p>
          <p>First publish year: ${selectedBook.first_publish_year}</p>
          <p>Years published: ${
            selectedBook.publish_year
              ? selectedBook.publish_year.join(", ")
              : ""
          }</p>
          <a href="#" id="refAddToList">Add book to Read List</a>
        </div>
      `;
    });

    this.bookInfoHolder.addEventListener("click", event => {
      const targetDiv = event.target;
      if (targetDiv.id === "refAddToList") {
        const bookToAdd = this.searchResultHolder.querySelector(".select-book");
        const selectedBook = this.currentPage.find(
          item => item.id === bookToAdd.id
        );
        this.arrayReadBooks.push(selectedBook);
        localStorage.setItem(
          "listReadBooks",
          JSON.stringify(this.arrayReadBooks)
        );
        this.processToReadList();
      }
    });
  }

  processSearchResult(page) {
    page.docs.forEach(item => {
      item.id = item.key.split("/").pop();
      item.subtitle = item.subtitle ? item.subtitle : "";
    });

    this.currentPage = page.docs;

    const booksHTML = page.docs.reduce((acc, item) => {
      return (
        acc +
        `
          <div id="${item.id}" class="left-block__search-result-item">
            ${item.title} (${item.language ? item.language.join(", ") : ""}) ${
          item.subtitle
        }
          </div>
        `
      );
    }, "");

    this.searchResultHolder.innerHTML = booksHTML;
  }

  processToReadList() {
    let lsReadBooks = JSON.parse(localStorage.getItem("listReadBooks"));
    if (lsReadBooks === null) {
      localStorage.setItem("listReadBooks", "[]");
      lsReadBooks = [];
    }
    this.arrayReadBooks = lsReadBooks;
    const innerHTML = this.arrayReadBooks.reduce((acc, item) => {
      return (
        acc +
        `
          <div id="${item.id}" class="book-to-read">${item.title}</div>
        `
      );
    }, "");

    this.toReadList.innerHTML = innerHTML;
  }
}
