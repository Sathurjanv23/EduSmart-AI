package com.sms.backend.repository;

import com.sms.backend.model.TransportRoute;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransportRouteRepository extends MongoRepository<TransportRoute, String> {
    List<TransportRoute> findByStatus(String status);

    TransportRoute findByRouteNumber(String routeNumber);

    List<TransportRoute> findByRouteName(String routeName);
}
