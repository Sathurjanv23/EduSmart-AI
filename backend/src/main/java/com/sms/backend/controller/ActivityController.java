package com.sms.backend.controller;

import com.sms.backend.model.Activity;
import com.sms.backend.service.ActivityService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @PostMapping
    public Activity addActivity(@RequestBody Activity activity) {
        return activityService.addActivity(activity);
    }

    @GetMapping
    public List<Activity> getAllActivities() {
        return activityService.getAllActivities();
    }

    @PutMapping("/{id}")
    public Activity updateActivity(@PathVariable String id, @RequestBody Activity activity) {
        return activityService.updateActivity(id, activity);
    }

    @DeleteMapping("/{id}")
    public String deleteActivity(@PathVariable String id) {
        activityService.deleteActivity(id);
        return "Activity deleted successfully";
    }
}
