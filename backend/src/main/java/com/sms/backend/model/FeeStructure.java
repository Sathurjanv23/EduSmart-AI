package com.sms.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "fee_structures")
public class FeeStructure {
    @Id
    private String id;
    private String className;
    private String academicYear;
    private Double tuitionFee;
    private Double labFee;
    private Double sportsFee;
    private Double transportFee;
    private Double otherFee;
    private Double totalFee;
    private String dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FeeStructure() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public Double getTuitionFee() {
        return tuitionFee;
    }

    public void setTuitionFee(Double tuitionFee) {
        this.tuitionFee = tuitionFee;
    }

    public Double getLabFee() {
        return labFee;
    }

    public void setLabFee(Double labFee) {
        this.labFee = labFee;
    }

    public Double getSportsFee() {
        return sportsFee;
    }

    public void setSportsFee(Double sportsFee) {
        this.sportsFee = sportsFee;
    }

    public Double getTransportFee() {
        return transportFee;
    }

    public void setTransportFee(Double transportFee) {
        this.transportFee = transportFee;
    }

    public Double getOtherFee() {
        return otherFee;
    }

    public void setOtherFee(Double otherFee) {
        this.otherFee = otherFee;
    }

    public Double getTotalFee() {
        return totalFee;
    }

    public void setTotalFee(Double totalFee) {
        this.totalFee = totalFee;
    }

    public String getDueDate() {
        return dueDate;
    }

    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
