package com.sms.backend.repository;

import com.sms.backend.model.Timetable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimetableRepository extends MongoRepository<Timetable, String> {
    List<Timetable> findByClassId(String classId);

    List<Timetable> findByDay(String day);

    Timetable findByClassIdAndDay(String classId, String day);

    List<Timetable> findByClassIdAndAcademicYear(String classId, String academicYear);

    List<Timetable> findByStatus(String status);
}
