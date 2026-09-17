package com.sms.backend.service;

import com.sms.backend.model.Event;
import com.sms.backend.repository.EventRepository;
import com.sms.backend.exception.ApiException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    public Event getEventById(String id) {
        return requireById(id);
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
        Event existing = requireById(id);
        existing.setTitle(event.getTitle());
        existing.setDescription(event.getDescription());
        existing.setEventType(event.getEventType());
        existing.setEventDate(event.getEventDate());
        return eventRepository.save(existing);
    }

    public void deleteEvent(String id) {
        eventRepository.delete(requireById(id));
    }

    private Event requireById(String id) {
        return eventRepository.findById(id).orElseThrow(() -> ApiException.notFound("Event"));
    }
}
