package com.sms.backend.controller;

import com.sms.backend.model.Timetable;
import com.sms.backend.service.TimetableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timetables")
@CrossOrigin(origins = "*")
public class TimetableController {

    @Autowired
    private TimetableService timetableService;

    @PostMapping
    public ResponseEntity<Timetable> createTimetable(@RequestBody Timetable timetable) {
        return ResponseEntity.ok(timetableService.createTimetable(timetable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Timetable> getTimetable(@PathVariable String id) {
        return ResponseEntity.ok(timetableService.getTimetableById(id));
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<Timetable>> getTimetablesByClass(@PathVariable String classId) {
        return ResponseEntity.ok(timetableService.getTimetablesByClass(classId));
    }

    @GetMapping("/day/{day}")
    public ResponseEntity<List<Timetable>> getTimetablesByDay(@PathVariable String day) {
        return ResponseEntity.ok(timetableService.getTimetablesByDay(day));
    }

    @GetMapping("/class/{classId}/day/{day}")
    public ResponseEntity<Timetable> getTimetableByClassAndDay(@PathVariable String classId, @PathVariable String day) {
        return ResponseEntity.ok(timetableService.getTimetableByClassAndDay(classId, day));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Timetable> updateTimetable(@PathVariable String id, @RequestBody Timetable timetable) {
        return ResponseEntity.ok(timetableService.updateTimetable(id, timetable));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<Timetable> publishTimetable(@PathVariable String id) {
        return ResponseEntity.ok(timetableService.publishTimetable(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTimetable(@PathVariable String id) {
        timetableService.deleteTimetable(id);
        return ResponseEntity.ok("Timetable deleted successfully");
    }
}
