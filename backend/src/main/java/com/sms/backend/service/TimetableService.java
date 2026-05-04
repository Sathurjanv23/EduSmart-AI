package com.sms.backend.service;

import com.sms.backend.model.Timetable;
import com.sms.backend.repository.TimetableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TimetableService {

    @Autowired
    private TimetableRepository timetableRepository;

    public Timetable createTimetable(Timetable timetable) {
        timetable.setStatus("DRAFT");
        return timetableRepository.save(timetable);
    }

    public Timetable updateTimetable(String id, Timetable timetable) {
        Optional<Timetable> optional = timetableRepository.findById(id);
        if (optional.isPresent()) {
            Timetable existing = optional.get();
            existing.setDay(timetable.getDay());
            existing.setPeriods(timetable.getPeriods());
            existing.setStatus(timetable.getStatus());
            return timetableRepository.save(existing);
        }
        return null;
    }

    public Timetable getTimetableById(String id) {
        return timetableRepository.findById(id).orElse(null);
    }

    public List<Timetable> getTimetablesByClass(String classId) {
        return timetableRepository.findByClassId(classId);
    }

    public List<Timetable> getTimetablesByDay(String day) {
        return timetableRepository.findByDay(day);
    }

    public Timetable getTimetableByClassAndDay(String classId, String day) {
        return timetableRepository.findByClassIdAndDay(classId, day);
    }

    public Timetable publishTimetable(String id) {
        Optional<Timetable> optional = timetableRepository.findById(id);
        if (optional.isPresent()) {
            Timetable timetable = optional.get();
            timetable.setStatus("ACTIVE");
            return timetableRepository.save(timetable);
        }
        return null;
    }

    public void deleteTimetable(String id) {
        timetableRepository.deleteById(id);
    }

    public List<Timetable> getTimetablesByAcademicYear(String classId, String year) {
        return timetableRepository.findByClassIdAndAcademicYear(classId, year);
    }
}
