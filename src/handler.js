const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;
  const id = nanoid(16);
  let finished = false;

  if (readPage === pageCount) {
    finished = true;
  }

  if (name == null) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    // eslint-disable-next-line max-len
    id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt,
  };

  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal menambahkan buku.',
  });
  response.code(400);
  return response;
};

const getAllBooksHandler = (request) => {
  const { reading, finished, name } = request.query;

  // eslint-disable-next-line max-len
  const filterBooksByReadingStatus = (isReading) => books.filter((book) => book.reading === isReading);

  // eslint-disable-next-line max-len
  const filterBooksByFinishedStatus = (isFinished) => books.filter((book) => book.finished === isFinished);

  // eslint-disable-next-line max-len
  const filterBooksByName = (searchName) => books.filter((book) => book.name.toLowerCase().includes(searchName.toLowerCase()));

  let filteredBooks = books;

  if (reading !== undefined) {
    const isReading = reading === '1';
    filteredBooks = filterBooksByReadingStatus(isReading);
  }

  if (finished !== undefined) {
    const isFinished = finished === '1';
    filteredBooks = filterBooksByFinishedStatus(isFinished);
  }

  if (name !== undefined) {
    filteredBooks = filterBooksByName(name);
  }

  return {
    status: 'success',
    data: {
      books: filteredBooks.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      })),
    },
  };
};

const getDetailBooks = (request, h) => {
  const { id } = request.params;
  const book = books.filter((n) => n.id === id)[0];

  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }
  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });

  response.code(404);
  return response;
};

const updateBook = (request, h) => {
  const { id } = request.params;

  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;
  const updatedAt = new Date().toISOString();

  if (name == null) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

const deleteBook = (request, h) => {
  const { id } = request.params;

  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler, getAllBooksHandler, getDetailBooks, updateBook, deleteBook,
};
