package com.sms.backend.repository;

import com.sms.backend.model.ReportCard;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportCardRepository extends MongoRepository<ReportCard, String> {
    List<ReportCard> findByStudentId(String studentId);

    List<ReportCard> findByClassId(String classId);

    ReportCard findByStudentIdAndAcademicYearAndSemester(String studentId, String year, Integer semester);
}
