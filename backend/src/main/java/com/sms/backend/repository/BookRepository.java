package com.sms.backend.repository;

import com.sms.backend.model.Book;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends MongoRepository<Book, String> {
    List<Book> findByCategory(String category);

    List<Book> findByAuthor(String author);

    Book findByIsbn(String isbn);

    List<Book> findByTitleContainingIgnoreCase(String title);

    List<Book> findByAvailableCopiesGreaterThan(Integer count);
}
