package com.sms.backend.service;

import com.sms.backend.model.ReportCard;
import com.sms.backend.repository.ReportCardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReportCardService {

    @Autowired
    private ReportCardRepository reportCardRepository;

    public ReportCard createReportCard(ReportCard reportCard) {
        return reportCardRepository.save(reportCard);
    }

    public ReportCard getReportCardById(String id) {
        return reportCardRepository.findById(id).orElse(null);
    }

    public List<ReportCard> getStudentReportCards(String studentId) {
        return reportCardRepository.findByStudentId(studentId);
    }

    public List<ReportCard> getClassReportCards(String classId) {
        return reportCardRepository.findByClassId(classId);
    }

    public ReportCard getStudentSemesterReport(String studentId, String year, Integer semester) {
        return reportCardRepository.findByStudentIdAndAcademicYearAndSemester(studentId, year, semester);
    }

    public ReportCard updateReportCard(String id, ReportCard reportCard) {
        Optional<ReportCard> optional = reportCardRepository.findById(id);
        if (optional.isPresent()) {
            ReportCard existing = optional.get();
            existing.setSubjectMarks(reportCard.getSubjectMarks());
            existing.setSubjectGrades(reportCard.getSubjectGrades());
            existing.setTotalMarks(reportCard.getTotalMarks());
            existing.setPercentage(reportCard.getPercentage());
            existing.setOverallGrade(reportCard.getOverallGrade());
            existing.setRemarks(reportCard.getRemarks());
            return reportCardRepository.save(existing);
        }
        return null;
    }

    public void deleteReportCard(String id) {
        reportCardRepository.deleteById(id);
    }
}
