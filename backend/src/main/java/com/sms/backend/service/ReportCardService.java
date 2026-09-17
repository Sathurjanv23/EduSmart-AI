package com.sms.backend.service;

import com.sms.backend.model.ReportCard;
import com.sms.backend.repository.ReportCardRepository;
import com.sms.backend.exception.ApiException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportCardService {

    private final ReportCardRepository reportCardRepository;

    public ReportCardService(ReportCardRepository reportCardRepository) {
        this.reportCardRepository = reportCardRepository;
    }

    public ReportCard createReportCard(ReportCard reportCard) {
        return reportCardRepository.save(reportCard);
    }

    public ReportCard getReportCardById(String id) {
        return requireById(id);
    }

    public List<ReportCard> getStudentReportCards(String studentId) {
        return reportCardRepository.findByStudentId(studentId);
    }

    public List<ReportCard> getClassReportCards(String classId) {
        return reportCardRepository.findByClassId(classId);
    }

    public ReportCard getStudentSemesterReport(String studentId, String year, Integer semester) {
        ReportCard reportCard = reportCardRepository.findByStudentIdAndAcademicYearAndSemester(studentId, year, semester);
        if (reportCard == null) {
            throw ApiException.notFound("Report card");
        }
        return reportCard;
    }

    public ReportCard updateReportCard(String id, ReportCard reportCard) {
        ReportCard existing = requireById(id);
        existing.setSubjectMarks(reportCard.getSubjectMarks());
        existing.setSubjectGrades(reportCard.getSubjectGrades());
        existing.setTotalMarks(reportCard.getTotalMarks());
        existing.setPercentage(reportCard.getPercentage());
        existing.setOverallGrade(reportCard.getOverallGrade());
        existing.setRemarks(reportCard.getRemarks());
        return reportCardRepository.save(existing);
    }

    public void deleteReportCard(String id) {
        reportCardRepository.delete(requireById(id));
    }

    private ReportCard requireById(String id) {
        return reportCardRepository.findById(id).orElseThrow(() -> ApiException.notFound("Report card"));
    }
}
