package com.sms.backend.controller;

import com.sms.backend.model.BookIssue;
import com.sms.backend.service.BookIssueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/library/issues")
@CrossOrigin(origins = "*")
public class BookIssueController {

    @Autowired
    private BookIssueService bookIssueService;

    @PostMapping
    public ResponseEntity<BookIssue> issueBook(@RequestBody BookIssue bookIssue) {
        return ResponseEntity.ok(bookIssueService.issueBook(bookIssue));
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<BookIssue> returnBook(@PathVariable String id) {
        return ResponseEntity.ok(bookIssueService.returnBook(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookIssue> getIssue(@PathVariable String id) {
        return ResponseEntity.ok(bookIssueService.getIssueById(id));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<BookIssue>> getStudentIssues(@PathVariable String studentId) {
        return ResponseEntity.ok(bookIssueService.getStudentIssuedBooks(studentId));
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<BookIssue>> getOverdueBooks() {
        return ResponseEntity.ok(bookIssueService.getOverdueBooks());
    }

    @GetMapping
    public ResponseEntity<List<BookIssue>> getAllIssues() {
        return ResponseEntity.ok(bookIssueService.getAllIssues());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteIssue(@PathVariable String id) {
        bookIssueService.deleteIssue(id);
        return ResponseEntity.ok("Issue deleted successfully");
    }
}
