package com.sms.backend.service;

import com.sms.backend.model.Timetable;
import com.sms.backend.repository.TimetableRepository;
import com.sms.backend.exception.ApiException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TimetableService {

    private final TimetableRepository timetableRepository;

    public TimetableService(TimetableRepository timetableRepository) {
        this.timetableRepository = timetableRepository;
    }

    public Timetable createTimetable(Timetable timetable) {
        timetable.setStatus("DRAFT");
        return timetableRepository.save(timetable);
    }

    public Timetable updateTimetable(String id, Timetable timetable) {
        Timetable existing = requireById(id);
        existing.setDay(timetable.getDay());
        existing.setPeriods(timetable.getPeriods());
        existing.setStatus(timetable.getStatus());
        return timetableRepository.save(existing);
    }

    public Timetable getTimetableById(String id) {
        return requireById(id);
    }

    public List<Timetable> getTimetablesByClass(String classId) {
        return timetableRepository.findByClassId(classId);
    }

    public List<Timetable> getTimetablesByDay(String day) {
        return timetableRepository.findByDay(day);
    }

    public Timetable getTimetableByClassAndDay(String classId, String day) {
        Timetable timetable = timetableRepository.findByClassIdAndDay(classId, day);
        if (timetable == null) {
            throw ApiException.notFound("Timetable");
        }
        return timetable;
    }

    public Timetable publishTimetable(String id) {
        Timetable timetable = requireById(id);
        timetable.setStatus("ACTIVE");
        return timetableRepository.save(timetable);
    }

    public void deleteTimetable(String id) {
        timetableRepository.delete(requireById(id));
    }

    public List<Timetable> getTimetablesByAcademicYear(String classId, String year) {
        return timetableRepository.findByClassIdAndAcademicYear(classId, year);
    }

    private Timetable requireById(String id) {
        return timetableRepository.findById(id).orElseThrow(() -> ApiException.notFound("Timetable"));
    }
}
