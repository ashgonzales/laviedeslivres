import React, { useState, useEffect } from "react";
import { getAllComments } from "../services/comments";
import { getAllBooks, postBook, putBook, destroyBook } from "../services/books";
import { Route, Switch, useHistory } from "react-router-dom";
import { removeToken, verifyUser } from '../services/auth';
import Layout from '../layouts/Layout';
import Comments from "../screens/Comments";
import Books from "../screens/Books/Books";
import BookCreate from "../screens/BookCreate/BookCreate";
import BookEdit from "../screens/BookEdit";
import BookDetail from "../screens/BookDetail/BookDetail";

export default function MainContainer() {
  const [books, setBooks] = useState([]);
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const history = useHistory();

  useEffect(() => {
    const handleVerify = async () => {
      const userData = await verifyUser();
      setCurrentUser(userData)
    }
    handleVerify();
  }, [])

  useEffect(() => {
    const fetchBooks = async () => {
      const booksData = await getAllBooks();
      setBooks(booksData);
    };
    const fetchComments = async () => {
      const commentsData = await getAllComments();
      setComments(commentsData);
    };
    fetchBooks();
    fetchComments();
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('authToken');
    removeToken();
  }

  const handleBookCreate = async (bookData) => {
    const newBook = await postBook(bookData);
    setBooks((prevState) => [...prevState, newBook]);
    history.push("/books");
  };

  const handleBookEdit = async (id, bookData) => {
    const updatedBook = await putBook(id, bookData);
    setBooks((prevState) =>
      prevState.map((book) => {
        return book.id === Number(id) ? updatedBook : book;
      })
    );
    history.push("/books");
  };

  const deleteBook = async (id) => {
    await destroyBook(id);
    setBooks((prevState) =>
      prevState.filter((book) => {
        return book.id !== id;
      })
    );
    history.push("/books");
  };

  return (
    <Layout currentUser={currentUser} handleLogout={handleLogout}>
      <Switch>
        <Route path="/comments">
          <Comments comments={comments} />
        </Route>
        <Route path="/books/new">
          <BookCreate handleBookCreate={handleBookCreate} />
        </Route>
        <Route path="/books/:id/edit">
          <BookEdit handleBookEdit={handleBookEdit} books={books} />
        </Route>
        <Route path="/books/:id">
          <BookDetail comments={comments} deleteBook={deleteBook} />
        </Route>
        <Route path="/books">
          <Books books={books} />
        </Route>
      </Switch>
    </Layout>
  );
}