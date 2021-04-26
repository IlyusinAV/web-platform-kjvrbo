export class BooksUI {
  searchResultHolder;
  searchStatHolder;
  bookInfoHolder;
  toReadListHolder;
  toReadListStat;

  currentPage = [];
  arrayReadBooks = [];

  api;
  toReadList;

  lastQuery;
  currentPageNum;
  lastPage;

  isBookSelected;

  constructor(api, toReadList) {
    this.toReadList = toReadList;

    this.searchResultHolder = document.getElementById("searchResultHolder");
    this.bookInfoHolder = document.getElementById("bookInfoHolder");
    this.toReadListHolder = document.getElementById("toReadListHolder");

    const searchInput = document.getElementById("searchInput");
    const goButton = document.getElementById("goButton");
    this.searchStatHolder = document.getElementById("searchStatHolder");

    this.toReadListStat = document.getElementById("toReadListStat");

    this.processToReadList();

    goButton.addEventListener("click", () => {
      const query = searchInput.value;
      if (!query) {
        return;
      }

      searchStatHolder.innerHTML = `<strong>Loading...</strong>`;
      this.currentPageNum = 1;

      api.search(query, this.currentPage).then(page => {
        this.processSearchResult(page);
      });

      this.lastQuery = query;
      this.isBookSelected = false;
    });

    searchStatHolder.addEventListener("click", event => {
      const targetDiv = event.target;
      if (targetDiv.id === "refPrevPage" && this.currentPageNum > 1) {
        searchInput.value = this.lastQuery;
        searchStatHolder.innerHTML = `<strong>Loading...</strong>`;
        this.currentPageNum--;
        api.search(this.lastQuery, this.currentPageNum).then(page => {
          this.processSearchResult(page);
        });
        this.isBookSelected = false;
      }

      if (
        targetDiv.id === "refNextPage" &&
        this.currentPageNum < this.lastPage
      ) {
        searchInput.value = this.lastQuery;
        searchStatHolder.innerHTML = `<strong>Loading...</strong>`;
        this.currentPageNum++;
        api.search(this.lastQuery, this.currentPageNum).then(page => {
          this.processSearchResult(page);
        });
        this.isBookSelected = false;
      }
    });

    this.searchResultHolder.addEventListener("click", event => {
      const targetDiv = event.target;
      const id = targetDiv.id;
      const selectedBook = this.currentPage.find(item => item.id === id);

      if (!selectedBook) {
        return;
      }

      if (this.isBookSelected) {
        const bookToUnselect = this.searchResultHolder.querySelector(
          ".selected-book"
        );
        bookToUnselect.classList.remove("selected-book");
      }

      targetDiv.classList.add("selected-book");
      this.isBookSelected = true;

      this.bookInfoHolder.innerHTML = `
          <div class="center-block__title">
            <p>${selectedBook.title}</p>
            <p>${selectedBook.subtitle}</p>
          </div>
          <div class="center-block__book-info">
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
          </div>
          <div class="center-block__add-to-list">
            <a href="#" id="refAddToList">Add book to Read List</a>
          </div>
        
      `;
    });

    this.bookInfoHolder.addEventListener("click", event => {
      const targetDiv = event.target;
      if (targetDiv.id === "refAddToList") {
        const bookToAdd = this.searchResultHolder.querySelector(
          ".selected-book"
        );
        const selectedBook = this.currentPage.find(
          item => item.id === bookToAdd.id
        );
        toReadList.addBook(selectedBook);
        this.processToReadList();
      }
    });

    this.toReadListHolder.addEventListener("click", event => {
      const targetDiv = event.target;
      const id = targetDiv.id;
      if (targetDiv.classList.contains("refRemoveFromList")) {
        toReadList.removeBook(id);
      }
      if (targetDiv.classList.contains("refMarkAsRead")) {
        toReadList.markBookAsRead(id);
      }
      this.processToReadList();
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

    this.lastPage = Math.floor(page.num_found / 100) + 1;

    this.searchStatHolder.innerHTML = `
      <div>Found ${page.num_found}     Start ${
      page.start
    }     Page size 100</div>
      <div class="left-block__footer-nav">
      <a href="#" id="refPrevPage">Prev results</a>
      <a href="#" id="refNextPage">Next results</a>
      </div>
    `;
  }

  processToReadList() {
    this.arrayReadBooks = this.toReadList.getList();
    this.toReadListStat.innerHTML = `${
      this.arrayReadBooks.length
    } books, ${this.toReadList.calcRead()} read`;
    this.toReadListHolder.innerHTML = this.arrayReadBooks.reduce(
      (acc, item) => {
        return (
          acc +
          `
          <div id="${item.id}" class=${
            item.mark_as_read
              ? "right-block__mark-as-read"
              : "right-block__book-to-read"
          }>
          <p>${item.title} (${item.language ? item.language.join(", ") : ""}) ${
            item.subtitle
          }</p>
          <p>${item.author_name[0] ? item.author_name[0] : ""}</p>
          <a href="#" id="${item.id}" class="refMarkAsRead">Mark as read</a>
          <a href="#" id="${
            item.id
          }" class="refRemoveFromList">Remove from list</a>
          </div>
        `
        );
      },
      ""
    );
  }
}
