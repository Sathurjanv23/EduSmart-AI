package com.sms.backend.repository;

import com.sms.backend.model.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {
    List<Event> findByEventType(String eventType);

    List<Event> findByClassId(String classId);

    List<Event> findByEventDateBetween(LocalDate start, LocalDate end);

    List<Event> findByIsHolidayTrue();
}
