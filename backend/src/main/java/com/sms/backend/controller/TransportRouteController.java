package com.sms.backend.controller;

import com.sms.backend.model.TransportRoute;
import com.sms.backend.service.TransportRouteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transport/routes")
public class TransportRouteController {

    private final TransportRouteService transportRouteService;

    public TransportRouteController(TransportRouteService transportRouteService) {
        this.transportRouteService = transportRouteService;
    }

    @PostMapping
    public ResponseEntity<TransportRoute> createRoute(@RequestBody TransportRoute route) {
        return ResponseEntity.ok(transportRouteService.createRoute(route));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransportRoute> getRoute(@PathVariable String id) {
        return ResponseEntity.ok(transportRouteService.getRouteById(id));
    }

    @GetMapping
    public ResponseEntity<List<TransportRoute>> getAllRoutes() {
        return ResponseEntity.ok(transportRouteService.getAllRoutes());
    }

    @GetMapping("/active")
    public ResponseEntity<List<TransportRoute>> getActiveRoutes() {
        return ResponseEntity.ok(transportRouteService.getActiveRoutes());
    }

    @GetMapping("/number/{routeNumber}")
    public ResponseEntity<TransportRoute> getRouteByNumber(@PathVariable String routeNumber) {
        return ResponseEntity.ok(transportRouteService.getRouteByNumber(routeNumber));
    }

    @PutMapping("/{id}/location")
    public ResponseEntity<TransportRoute> updateLocation(
            @PathVariable String id,
            @RequestBody Map<String, Double> location) {
        return ResponseEntity
                .ok(transportRouteService.updateLocation(id, location.get("latitude"), location.get("longitude")));
    }

    @PutMapping("/{id}/passengers")
    public ResponseEntity<TransportRoute> updatePassengerCount(
            @PathVariable String id,
            @RequestBody Map<String, Integer> data) {
        return ResponseEntity.ok(transportRouteService.updatePassengerCount(id, data.get("count")));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransportRoute> updateRoute(@PathVariable String id, @RequestBody TransportRoute route) {
        return ResponseEntity.ok(transportRouteService.updateRoute(id, route));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRoute(@PathVariable String id) {
        transportRouteService.deleteRoute(id);
        return ResponseEntity.ok("Route deleted successfully");
    }
}
