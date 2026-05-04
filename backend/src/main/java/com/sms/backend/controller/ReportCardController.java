package com.sms.backend.controller;

import com.sms.backend.model.ReportCard;
import com.sms.backend.service.ReportCardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/report-cards")
@CrossOrigin(origins = "*")
public class ReportCardController {

    @Autowired
    private ReportCardService reportCardService;

    @PostMapping
    public ResponseEntity<ReportCard> createReportCard(@RequestBody ReportCard reportCard) {
        return ResponseEntity.ok(reportCardService.createReportCard(reportCard));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReportCard> getReportCard(@PathVariable String id) {
        return ResponseEntity.ok(reportCardService.getReportCardById(id));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ReportCard>> getStudentReportCards(@PathVariable String studentId) {
        return ResponseEntity.ok(reportCardService.getStudentReportCards(studentId));
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<ReportCard>> getClassReportCards(@PathVariable String classId) {
        return ResponseEntity.ok(reportCardService.getClassReportCards(classId));
    }

    @GetMapping("/student/{studentId}/year/{year}/semester/{semester}")
    public ResponseEntity<ReportCard> getStudentSemesterReport(
            @PathVariable String studentId,
            @PathVariable String year,
            @PathVariable Integer semester) {
        return ResponseEntity.ok(reportCardService.getStudentSemesterReport(studentId, year, semester));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReportCard> updateReportCard(@PathVariable String id, @RequestBody ReportCard reportCard) {
        return ResponseEntity.ok(reportCardService.updateReportCard(id, reportCard));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteReportCard(@PathVariable String id) {
        reportCardService.deleteReportCard(id);
        return ResponseEntity.ok("Report card deleted successfully");
    }
}
