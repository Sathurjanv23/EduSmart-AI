package com.sms.backend.service;

import com.sms.backend.model.Book;
import com.sms.backend.repository.BookRepository;
import com.sms.backend.exception.ApiException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookService {

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public Book addBook(Book book) {
        return bookRepository.save(book);
    }

    public Book getBookById(String id) {
        return requireById(id);
    }

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public List<Book> getBooksByCategory(String category) {
        return bookRepository.findByCategory(category);
    }

    public List<Book> getBooksByAuthor(String author) {
        return bookRepository.findByAuthor(author);
    }

    public Book getBookByIsbn(String isbn) {
        Book book = bookRepository.findByIsbn(isbn);
        if (book == null) {
            throw ApiException.notFound("Book");
        }
        return book;
    }

    public List<Book> searchBooks(String keyword) {
        return bookRepository.findByTitleContainingIgnoreCase(keyword);
    }

    public List<Book> getAvailableBooks() {
        return bookRepository.findByAvailableCopiesGreaterThan(0);
    }

    public Book updateBook(String id, Book book) {
        Book existing = requireById(id);
        existing.setTitle(book.getTitle());
        existing.setAuthor(book.getAuthor());
        existing.setCategory(book.getCategory());
        existing.setAvailableCopies(book.getAvailableCopies());
        return bookRepository.save(existing);
    }

    public void deleteBook(String id) {
        bookRepository.delete(requireById(id));
    }

    private Book requireById(String id) {
        return bookRepository.findById(id).orElseThrow(() -> ApiException.notFound("Book"));
    }
}
