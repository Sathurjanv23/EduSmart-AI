package com.sms.backend.service;

import com.sms.backend.model.TransportRoute;
import com.sms.backend.repository.TransportRouteRepository;
import com.sms.backend.exception.ApiException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransportRouteService {

    private final TransportRouteRepository transportRouteRepository;

    public TransportRouteService(TransportRouteRepository transportRouteRepository) {
        this.transportRouteRepository = transportRouteRepository;
    }

    public TransportRoute createRoute(TransportRoute route) {
        route.setStatus("ACTIVE");
        route.setCurrentPassengers(0);
        return transportRouteRepository.save(route);
    }

    public TransportRoute getRouteById(String id) {
        return requireById(id);
    }

    public List<TransportRoute> getAllRoutes() {
        return transportRouteRepository.findAll();
    }

    public List<TransportRoute> getActiveRoutes() {
        return transportRouteRepository.findByStatus("ACTIVE");
    }

    public TransportRoute getRouteByNumber(String routeNumber) {
        TransportRoute route = transportRouteRepository.findByRouteNumber(routeNumber);
        if (route == null) {
            throw ApiException.notFound("Transport route");
        }
        return route;
    }

    public TransportRoute updateLocation(String routeId, Double latitude, Double longitude) {
        TransportRoute route = requireById(routeId);
        route.setLatitude(latitude);
        route.setLongitude(longitude);
        route.setLastUpdated(LocalDateTime.now());
        return transportRouteRepository.save(route);
    }

    public TransportRoute updatePassengerCount(String routeId, Integer count) {
        TransportRoute route = requireById(routeId);
        route.setCurrentPassengers(count);
        return transportRouteRepository.save(route);
    }

    public TransportRoute updateRoute(String id, TransportRoute route) {
        TransportRoute existing = requireById(id);
        existing.setRouteName(route.getRouteName());
        existing.setStops(route.getStops());
        existing.setDriverName(route.getDriverName());
        return transportRouteRepository.save(existing);
    }

    public void deleteRoute(String id) {
        transportRouteRepository.delete(requireById(id));
    }

    private TransportRoute requireById(String id) {
        return transportRouteRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Transport route"));
    }
}
