package com.sms.backend.service;

import com.sms.backend.model.Event;
import com.sms.backend.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    public Event getEventById(String id) {
        return eventRepository.findById(id).orElse(null);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public List<Event> getEventsByType(String eventType) {
        return eventRepository.findByEventType(eventType);
    }

    public List<Event> getEventsByClass(String classId) {
        return eventRepository.findByClassId(classId);
    }

    public List<Event> getEventsByDateRange(LocalDate start, LocalDate end) {
        return eventRepository.findByEventDateBetween(start, end);
    }

    public List<Event> getHolidays() {
        return eventRepository.findByIsHolidayTrue();
    }

    public Event updateEvent(String id, Event event) {
        Optional<Event> optional = eventRepository.findById(id);
        if (optional.isPresent()) {
            Event existing = optional.get();
            existing.setTitle(event.getTitle());
            existing.setDescription(event.getDescription());
            existing.setEventType(event.getEventType());
            existing.setEventDate(event.getEventDate());
            return eventRepository.save(existing);
        }
        return null;
    }

    public void deleteEvent(String id) {
        eventRepository.deleteById(id);
    }
}
