package com.sms.backend.repository;

import com.sms.backend.model.FeeStructure;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeStructureRepository extends MongoRepository<FeeStructure, String> {
    FeeStructure findByClassNameAndAcademicYear(String className, String academicYear);

    List<FeeStructure> findByAcademicYear(String academicYear);
}
