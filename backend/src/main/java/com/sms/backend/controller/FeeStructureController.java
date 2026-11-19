package com.sms.backend.controller;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sms.backend.exception.ApiException;
import com.sms.backend.model.FeeStructure;
import com.sms.backend.repository.FeeStructureRepository;
import com.sms.backend.security.AcademicAccessService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/fee-structure")
public class FeeStructureController {
    private final FeeStructureRepository feeStructureRepository;
    private final AcademicAccessService accessService;

    public FeeStructureController(
            FeeStructureRepository feeStructureRepository,
            AcademicAccessService accessService) {
        this.feeStructureRepository = feeStructureRepository;
        this.accessService = accessService;
    }

    @PostMapping
    public ResponseEntity<FeeStructure> create(
            @Valid @RequestBody FeeStructure feeStructure,
            Authentication authentication) {
        accessService.requireAdmin(authentication);
        prepare(feeStructure);
        FeeStructure saved = feeStructureRepository.save(feeStructure);
        return ResponseEntity.created(URI.create("/api/fee-structure/" + saved.getId())).body(saved);
    }

    @GetMapping
    public List<FeeStructure> all() {
        return feeStructureRepository.findAll();
    }

    @GetMapping("/{id}")
    public FeeStructure byId(@PathVariable String id) {
        return feeStructureRepository.findById(id).orElseThrow(() -> ApiException.notFound("Fee structure"));
    }

    @GetMapping("/class/{className}/year/{academicYear}")
    public FeeStructure byClassAndYear(@PathVariable String className, @PathVariable String academicYear) {
        FeeStructure feeStructure = feeStructureRepository.findByClassNameAndAcademicYear(className, academicYear);
        if (feeStructure == null) {
            throw ApiException.notFound("Fee structure");
        }
        return feeStructure;
    }

    @PutMapping("/{id}")
    public FeeStructure update(
            @PathVariable String id,
            @Valid @RequestBody FeeStructure request,
            Authentication authentication) {
        accessService.requireAdmin(authentication);
        FeeStructure existing = feeStructureRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Fee structure"));
        request.setId(id);
        request.setCreatedAt(existing.getCreatedAt());
        prepare(request);
        return feeStructureRepository.save(request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, Authentication authentication) {
        accessService.requireAdmin(authentication);
        FeeStructure existing = feeStructureRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Fee structure"));
        feeStructureRepository.delete(existing);
        return ResponseEntity.noContent().build();
    }

    private void prepare(FeeStructure structure) {
        structure.setClassName(structure.getClassName().trim());
        structure.setAcademicYear(structure.getAcademicYear().trim());
        structure.setTotalFee(sum(
                structure.getTuitionFee(), structure.getLabFee(), structure.getSportsFee(),
                structure.getTransportFee(), structure.getOtherFee()));
        structure.setUpdatedAt(LocalDateTime.now());
    }

    private double sum(Double... values) {
        double total = 0;
        for (Double value : values) {
            if (value != null) {
                total += value;
            }
        }
        return total;
    }
}
