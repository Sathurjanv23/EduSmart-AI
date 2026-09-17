package com.sms.backend.service;

import com.sms.backend.model.BookIssue;
import com.sms.backend.repository.BookIssueRepository;
import com.sms.backend.exception.ApiException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookIssueService {

    private final BookIssueRepository bookIssueRepository;

    public BookIssueService(BookIssueRepository bookIssueRepository) {
        this.bookIssueRepository = bookIssueRepository;
    }

    public BookIssue issueBook(BookIssue bookIssue) {
        bookIssue.setStatus("ISSUED");
        bookIssue.setIssuedDate(LocalDate.now());
        return bookIssueRepository.save(bookIssue);
    }

    public BookIssue returnBook(String id) {
        BookIssue bookIssue = requireById(id);
        bookIssue.setStatus("RETURNED");
        bookIssue.setReturnedDate(LocalDate.now());
        if (bookIssue.getDueDate() != null && LocalDate.now().isAfter(bookIssue.getDueDate())) {
            long daysLate = java.time.temporal.ChronoUnit.DAYS.between(bookIssue.getDueDate(), LocalDate.now());
            bookIssue.setFine(daysLate * 5.0);
        }
        return bookIssueRepository.save(bookIssue);
    }

    public List<BookIssue> getStudentIssuedBooks(String studentId) {
        return bookIssueRepository.findByStudentId(studentId);
    }

    public List<BookIssue> getOverdueBooks() {
        return bookIssueRepository.findByDueDateBeforeAndStatus(LocalDate.now(), "ISSUED");
    }

    public BookIssue getIssueById(String id) {
        return requireById(id);
    }

    public List<BookIssue> getAllIssues() {
        return bookIssueRepository.findAll();
    }

    public void deleteIssue(String id) {
        bookIssueRepository.delete(requireById(id));
    }

    private BookIssue requireById(String id) {
        return bookIssueRepository.findById(id).orElseThrow(() -> ApiException.notFound("Book issue"));
    }
}
