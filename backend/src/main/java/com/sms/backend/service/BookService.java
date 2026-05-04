package com.sms.backend.service;

import com.sms.backend.model.Book;
import com.sms.backend.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    public Book addBook(Book book) {
        return bookRepository.save(book);
    }

    public Book getBookById(String id) {
        return bookRepository.findById(id).orElse(null);
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
        return bookRepository.findByIsbn(isbn);
    }

    public List<Book> searchBooks(String keyword) {
        return bookRepository.findByTitleContainingIgnoreCase(keyword);
    }

    public List<Book> getAvailableBooks() {
        return bookRepository.findByAvailableCopiesGreaterThan(0);
    }

    public Book updateBook(String id, Book book) {
        Optional<Book> optional = bookRepository.findById(id);
        if (optional.isPresent()) {
            Book existing = optional.get();
            existing.setTitle(book.getTitle());
            existing.setAuthor(book.getAuthor());
            existing.setCategory(book.getCategory());
            existing.setAvailableCopies(book.getAvailableCopies());
            return bookRepository.save(existing);
        }
        return null;
    }

    public void deleteBook(String id) {
        bookRepository.deleteById(id);
    }
}
