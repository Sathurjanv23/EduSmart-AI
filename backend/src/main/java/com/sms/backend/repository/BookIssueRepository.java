package com.sms.backend.repository;

import com.sms.backend.model.BookIssue;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookIssueRepository extends MongoRepository<BookIssue, String> {
    List<BookIssue> findByStudentId(String studentId);

    List<BookIssue> findByBookId(String bookId);

    List<BookIssue> findByStatus(String status);

    List<BookIssue> findByReturnedDateIsNull();

    List<BookIssue> findByDueDateBeforeAndStatus(LocalDate date, String status);
}
