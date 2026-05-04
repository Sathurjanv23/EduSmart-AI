package com.sms.backend.service;

import com.sms.backend.model.BookIssue;
import com.sms.backend.repository.BookIssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class BookIssueService {

    @Autowired
    private BookIssueRepository bookIssueRepository;

    public BookIssue issueBook(BookIssue bookIssue) {
        bookIssue.setStatus("ISSUED");
        bookIssue.setIssuedDate(LocalDate.now());
        return bookIssueRepository.save(bookIssue);
    }

    public BookIssue returnBook(String id) {
        Optional<BookIssue> optional = bookIssueRepository.findById(id);
        if (optional.isPresent()) {
            BookIssue bookIssue = optional.get();
            bookIssue.setStatus("RETURNED");
            bookIssue.setReturnedDate(LocalDate.now());

            // Calculate fine if overdue
            if (LocalDate.now().isAfter(bookIssue.getDueDate())) {
                long daysLate = java.time.temporal.ChronoUnit.DAYS.between(bookIssue.getDueDate(), LocalDate.now());
                bookIssue.setFine(daysLate * 5.0); // 5 per day
            }

            return bookIssueRepository.save(bookIssue);
        }
        return null;
    }

    public List<BookIssue> getStudentIssuedBooks(String studentId) {
        return bookIssueRepository.findByStudentId(studentId);
    }

    public List<BookIssue> getOverdueBooks() {
        return bookIssueRepository.findByDueDateBeforeAndStatus(LocalDate.now(), "ISSUED");
    }

    public BookIssue getIssueById(String id) {
        return bookIssueRepository.findById(id).orElse(null);
    }

    public List<BookIssue> getAllIssues() {
        return bookIssueRepository.findAll();
    }

    public void deleteIssue(String id) {
        bookIssueRepository.deleteById(id);
    }
}
