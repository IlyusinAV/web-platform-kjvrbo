import { Api } from "./api.js";
import { ToReadList } from "./toread-list.js";
import { BooksUI } from "./books-ui.js";

new BooksUI(new Api(), new ToReadList());
