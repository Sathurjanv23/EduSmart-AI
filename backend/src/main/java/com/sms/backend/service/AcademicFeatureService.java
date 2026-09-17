package com.sms.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.sms.backend.dto.MlPredictionRequest;
import com.sms.backend.model.Assignment;
import com.sms.backend.model.AssignmentSubmission;
import com.sms.backend.model.Attendance;
import com.sms.backend.model.Marks;
import com.sms.backend.model.Student;
import com.sms.backend.repository.AttendanceRepository;
import com.sms.backend.repository.MarksRepository;

@Service
public class AcademicFeatureService {
    private final AttendanceRepository attendanceRepository;
    private final MarksRepository marksRepository;
    private final AssignmentService assignmentService;
    private final AssignmentSubmissionService submissionService;

    public AcademicFeatureService(
            AttendanceRepository attendanceRepository,
            MarksRepository marksRepository,
            AssignmentService assignmentService,
            AssignmentSubmissionService submissionService) {
        this.attendanceRepository = attendanceRepository;
        this.marksRepository = marksRepository;
        this.assignmentService = assignmentService;
        this.submissionService = submissionService;
    }

    public MlPredictionRequest derive(Student student) {
        List<Attendance> attendance = attendanceRepository.findByStudentId(student.getId()).stream()
                .filter(record -> !"PENDING".equals(record.getStatus()))
                .toList();
        long attended = attendance.stream()
                .filter(record -> "PRESENT".equals(record.getStatus()) || "LATE".equals(record.getStatus()))
                .count();
        double attendancePercentage = attendance.isEmpty() ? 0.0 : percentage(attended, attendance.size());

        List<Marks> marks = marksRepository.findByStudentIdOrderByRecordedAtDesc(student.getId());
        double averageMarks = marks.isEmpty() ? 0.0 : marks.stream()
                .mapToDouble(record -> percentage(record.getMarks(), record.getTotalMarks()))
                .average().orElse(0.0);
        double recentGradeTrend = calculateTrend(marks);

        List<Assignment> assignments = assignmentService.getAssignmentsByClass(student.getStudentClass());
        LocalDateTime now = LocalDateTime.now();
        List<Assignment> dueAssignments = assignments.stream()
                .filter(item -> "ACTIVE".equals(item.getStatus()))
                .filter(item -> item.getDueDate() != null && !item.getDueDate().isAfter(now))
                .toList();
        List<AssignmentSubmission> submissions = submissionService.getStudentSubmissions(student.getId());
        Set<String> submittedIds = submissions.stream()
                .map(AssignmentSubmission::getAssignmentId)
                .collect(Collectors.toSet());
        double completionRate = dueAssignments.isEmpty()
                ? 100.0
                : percentage(dueAssignments.stream().filter(item -> submittedIds.contains(item.getId())).count(), dueAssignments.size());
        int missedAssignments = (int) dueAssignments.stream()
                .filter(item -> !submittedIds.contains(item.getId()))
                .count();

        return new MlPredictionRequest(
                round(attendancePercentage),
                round(averageMarks),
                round(completionRate),
                round(recentGradeTrend),
                Math.min(missedAssignments, 50));
    }

    private double calculateTrend(List<Marks> marks) {
        if (marks.size() < 2) {
            return 0.0;
        }
        int recentCount = Math.min(3, marks.size());
        double recent = marks.subList(0, recentCount).stream()
                .mapToDouble(item -> percentage(item.getMarks(), item.getTotalMarks()))
                .average().orElse(0.0);
        int priorEnd = Math.min(recentCount * 2, marks.size());
        if (priorEnd == recentCount) {
            return 0.0;
        }
        double prior = marks.subList(recentCount, priorEnd).stream()
                .mapToDouble(item -> percentage(item.getMarks(), item.getTotalMarks()))
                .average().orElse(0.0);
        return Math.max(-100.0, Math.min(100.0, recent - prior));
    }

    private double percentage(long numerator, long denominator) {
        return denominator == 0 ? 0.0 : (numerator * 100.0) / denominator;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
