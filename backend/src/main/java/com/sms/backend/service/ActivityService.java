package com.sms.backend.service;

import com.sms.backend.model.Activity;
import com.sms.backend.repository.ActivityRepository;
import com.sms.backend.exception.ApiException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;

    public ActivityService(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    public Activity addActivity(Activity activity) {
        return activityRepository.save(activity);
    }

    public List<Activity> getAllActivities() {
        return activityRepository.findAll();
    }

    public Activity updateActivity(String id, Activity updatedActivity) {
        Activity existing = requireById(id);
        existing.setStudentId(updatedActivity.getStudentId());
        existing.setStudentName(updatedActivity.getStudentName());
        existing.setActivityType(updatedActivity.getActivityType());
        existing.setActivityName(updatedActivity.getActivityName());
        existing.setDescription(updatedActivity.getDescription());
        existing.setDate(updatedActivity.getDate());
        existing.setResult(updatedActivity.getResult());
        existing.setRemarks(updatedActivity.getRemarks());
        return activityRepository.save(existing);
    }

    public void deleteActivity(String id) {
        activityRepository.delete(requireById(id));
    }

    private Activity requireById(String id) {
        return activityRepository.findById(id).orElseThrow(() -> ApiException.notFound("Activity"));
    }
}
