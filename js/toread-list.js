export class ToReadList {
  _arrayToReadList = [];

  constructor() {
    let _lsReadBooks = JSON.parse(localStorage.getItem("listReadBooks"));
    if (_lsReadBooks === null) {
      localStorage.setItem("listReadBooks", "[]");
      _lsReadBooks = [];
    }
    this._arrayToReadList = _lsReadBooks;
  }

  getList = () => {
    return JSON.parse(localStorage.getItem("listReadBooks"));
  };

  calcRead = () => {
    return this._arrayToReadList.reduce((cnt, item) => {
      let readBook = 0;
      if (item.mark_as_read) readBook = 1;
      return cnt + readBook;
    }, 0);
  };

  saveList = () => {
    localStorage.setItem(
      "listReadBooks",
      JSON.stringify(this._arrayToReadList)
    );
  };

  addBook = book => {
    const _book = book;
    const id = _book.id;
    const selectedBookId = this._arrayToReadList.findIndex(
      item => item.id === id
    );
    _book.mark_as_read = false;
    if (selectedBookId >= 0) {
      this._arrayToReadList.splice(selectedBookId, 1);
    }
    this._arrayToReadList.push(_book);
    this.saveList();
  };

  removeBook = id => {
    const selectedBookId = this._arrayToReadList.findIndex(
      item => item.id === id
    );
    this._arrayToReadList.splice(selectedBookId, 1);
    this.saveList();
  };

  markBookAsRead = id => {
    const selectedBookId = this._arrayToReadList.findIndex(
      item => item.id === id
    );
    this._arrayToReadList[selectedBookId].mark_as_read = true;
    this.saveList();
  };
}
