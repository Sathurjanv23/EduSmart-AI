package com.sms.backend.controller;

import com.sms.backend.model.FeeStructure;
import com.sms.backend.repository.FeeStructureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/fee-structure")
@CrossOrigin(origins = "*")
public class FeeStructureController {

    @Autowired
    private FeeStructureRepository feeStructureRepository;

    @PostMapping
    public ResponseEntity<FeeStructure> createFeeStructure(@RequestBody FeeStructure feeStructure) {
        return ResponseEntity.ok(feeStructureRepository.save(feeStructure));
    }

    @GetMapping
    public ResponseEntity<List<FeeStructure>> getAllFeeStructures() {
        return ResponseEntity.ok(feeStructureRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FeeStructure> getFeeStructureById(@PathVariable String id) {
        Optional<FeeStructure> feeStructure = feeStructureRepository.findById(id);
        return feeStructure.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/class/{className}/year/{academicYear}")
    public ResponseEntity<FeeStructure> getFeeStructureByClassAndYear(
            @PathVariable String className,
            @PathVariable String academicYear) {
        FeeStructure feeStructure = feeStructureRepository.findByClassNameAndAcademicYear(className, academicYear);
        return feeStructure != null ? ResponseEntity.ok(feeStructure) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<FeeStructure> updateFeeStructure(@PathVariable String id, @RequestBody FeeStructure feeStructure) {
        Optional<FeeStructure> optional = feeStructureRepository.findById(id);
        if (optional.isPresent()) {
            feeStructure.setId(id);
            return ResponseEntity.ok(feeStructureRepository.save(feeStructure));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFeeStructure(@PathVariable String id) {
        feeStructureRepository.deleteById(id);
        return ResponseEntity.ok("Fee structure deleted successfully");
    }
}
