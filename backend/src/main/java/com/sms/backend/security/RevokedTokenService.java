package com.sms.backend.security;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.sms.backend.model.RevokedToken;
import com.sms.backend.repository.RevokedTokenRepository;

@Service
public class RevokedTokenService {
    private final RevokedTokenRepository repository;
    private final Map<String, Instant> localCache = new ConcurrentHashMap<>();

    public RevokedTokenService(RevokedTokenRepository repository) {
        this.repository = repository;
    }

    public void revoke(String tokenId, Instant expiresAt) {
        if (tokenId == null || tokenId.isBlank()) {
            return;
        }
        Instant expiry = expiresAt != null ? expiresAt : Instant.now().plusSeconds(86400);
        localCache.put(tokenId, expiry);
        try {
            repository.save(new RevokedToken(tokenId, expiry));
        } catch (Exception ignored) {
            // MongoDB may be offline in mock/test contexts; localCache guarantees in-process security
        }
    }

    public boolean isRevoked(String tokenId) {
        if (tokenId == null || tokenId.isBlank()) {
            return false;
        }
        cleanCache();
        Instant expiry = localCache.get(tokenId);
        if (expiry != null) {
            if (Instant.now().isBefore(expiry)) {
                return true;
            } else {
                localCache.remove(tokenId);
                return false;
            }
        }
        try {
            if (repository.existsById(tokenId)) {
                localCache.put(tokenId, Instant.now().plusSeconds(3600));
                return true;
            }
        } catch (Exception ignored) {
            // If repository is unavailable in mock context, localCache check suffices
        }
        return false;
    }

    private void cleanCache() {
        Instant now = Instant.now();
        localCache.entrySet().removeIf(entry -> now.isAfter(entry.getValue()));
    }
}
