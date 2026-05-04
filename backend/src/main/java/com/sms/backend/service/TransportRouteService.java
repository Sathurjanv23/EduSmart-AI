package com.sms.backend.service;

import com.sms.backend.model.TransportRoute;
import com.sms.backend.repository.TransportRouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TransportRouteService {

    @Autowired
    private TransportRouteRepository transportRouteRepository;

    public TransportRoute createRoute(TransportRoute route) {
        route.setStatus("ACTIVE");
        route.setCurrentPassengers(0);
        return transportRouteRepository.save(route);
    }

    public TransportRoute getRouteById(String id) {
        return transportRouteRepository.findById(id).orElse(null);
    }

    public List<TransportRoute> getAllRoutes() {
        return transportRouteRepository.findAll();
    }

    public List<TransportRoute> getActiveRoutes() {
        return transportRouteRepository.findByStatus("ACTIVE");
    }

    public TransportRoute getRouteByNumber(String routeNumber) {
        return transportRouteRepository.findByRouteNumber(routeNumber);
    }

    public TransportRoute updateLocation(String routeId, Double latitude, Double longitude) {
        Optional<TransportRoute> optional = transportRouteRepository.findById(routeId);
        if (optional.isPresent()) {
            TransportRoute route = optional.get();
            route.setLatitude(latitude);
            route.setLongitude(longitude);
            route.setLastUpdated(LocalDateTime.now());
            return transportRouteRepository.save(route);
        }
        return null;
    }

    public TransportRoute updatePassengerCount(String routeId, Integer count) {
        Optional<TransportRoute> optional = transportRouteRepository.findById(routeId);
        if (optional.isPresent()) {
            TransportRoute route = optional.get();
            route.setCurrentPassengers(count);
            return transportRouteRepository.save(route);
        }
        return null;
    }

    public TransportRoute updateRoute(String id, TransportRoute route) {
        Optional<TransportRoute> optional = transportRouteRepository.findById(id);
        if (optional.isPresent()) {
            TransportRoute existing = optional.get();
            existing.setRouteName(route.getRouteName());
            existing.setStops(route.getStops());
            existing.setDriverName(route.getDriverName());
            return transportRouteRepository.save(existing);
        }
        return null;
    }

    public void deleteRoute(String id) {
        transportRouteRepository.deleteById(id);
    }
}
