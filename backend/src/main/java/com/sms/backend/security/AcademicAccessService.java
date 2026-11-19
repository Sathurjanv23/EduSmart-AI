package com.sms.backend.security;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.sms.backend.exception.ApiException;
import com.sms.backend.model.Announcement;
import com.sms.backend.model.Assignment;
import com.sms.backend.model.AssignmentSubmission;
import com.sms.backend.model.Student;
import com.sms.backend.model.TeacherProfile;
import com.sms.backend.model.UserRole;
import com.sms.backend.repository.AnnouncementRepository;
import com.sms.backend.repository.AssignmentRepository;
import com.sms.backend.repository.AssignmentSubmissionRepository;
import com.sms.backend.repository.StudentRepository;
import com.sms.backend.repository.TeacherProfileRepository;

@Service
public class AcademicAccessService {
    private final StudentRepository studentRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final AnnouncementRepository announcementRepository;

    public AcademicAccessService(
            StudentRepository studentRepository,
            TeacherProfileRepository teacherProfileRepository,
            AssignmentSubmissionRepository assignmentSubmissionRepository,
            AssignmentRepository assignmentRepository,
            AnnouncementRepository announcementRepository) {
        this.studentRepository = studentRepository;
        this.teacherProfileRepository = teacherProfileRepository;
        this.assignmentSubmissionRepository = assignmentSubmissionRepository;
        this.assignmentRepository = assignmentRepository;
        this.announcementRepository = announcementRepository;
    }

    public Student currentStudent(Authentication authentication) {
        requireAuthority(authentication, "STUDENT");
        return studentRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> ApiException.notFound("Student profile"));
    }

    public List<Student> currentParentChildren(Authentication authentication) {
        requireAuthority(authentication, "PARENT");
        return studentRepository.findByParentEmail(authentication.getName());
    }

    public Student requireStudentAccess(Authentication authentication, String studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> ApiException.notFound("Student"));
        if (hasAuthority(authentication, "ADMIN")) {
            return student;
        }
        if (hasAuthority(authentication, "TEACHER")) {
            TeacherProfile profile = teacherProfileRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> ApiException.forbidden("Teacher profile and class assignments are required"));
            if (profile.getAssignedClassIds() != null
                    && profile.getAssignedClassIds().contains(student.getStudentClass())) {
                return student;
            }
            throw ApiException.forbidden("The student is not in a class assigned to the current teacher");
        }
        if (hasAuthority(authentication, "STUDENT") && authentication.getName().equalsIgnoreCase(student.getEmail())) {
            return student;
        }
        if (hasAuthority(authentication, "PARENT")
                && student.getParentEmail() != null
                && authentication.getName().equalsIgnoreCase(student.getParentEmail())) {
            return student;
        }
        throw ApiException.forbidden("You may only access linked student records");
    }

    public void requireStaff(Authentication authentication) {
        if (!hasAuthority(authentication, "ADMIN") && !hasAuthority(authentication, "TEACHER")) {
            throw ApiException.forbidden("Staff access is required");
        }
    }

    public void requireAdmin(Authentication authentication) {
        if (!hasAuthority(authentication, "ADMIN")) {
            throw ApiException.forbidden("Administrator access is required");
        }
    }

    public void requireTeacherClass(Authentication authentication, String classId) {
        if (hasAuthority(authentication, "ADMIN")) {
            return;
        }
        requireAuthority(authentication, "TEACHER");
        if (classId == null || classId.isBlank()) {
            throw ApiException.forbidden("A valid assigned class is required");
        }
        TeacherProfile profile = teacherProfileRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> ApiException.forbidden("Teacher profile and class assignments are required"));
        if (profile.getAssignedClassIds() == null
                || profile.getAssignedClassIds().stream().noneMatch(classId::equals)) {
            throw ApiException.forbidden("This class is not assigned to the current teacher");
        }
    }

    public void requireTeacherSubject(Authentication authentication, String subject) {
        if (hasAuthority(authentication, "ADMIN")) {
            return;
        }
        requireAuthority(authentication, "TEACHER");
        if (subject == null || subject.isBlank()) {
            throw ApiException.forbidden("A valid assigned subject is required");
        }
        TeacherProfile profile = teacherProfileRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> ApiException.forbidden("Teacher profile and subject assignments are required"));
        if (profile.getAssignedSubjects() == null
                || profile.getAssignedSubjects().stream()
                        .noneMatch(value -> value != null && value.equalsIgnoreCase(subject))) {
            throw ApiException.forbidden("This subject is not assigned to the current teacher");
        }
    }

    public void requireClassReadAccess(Authentication authentication, String classId) {
        if (hasAuthority(authentication, "ADMIN")) {
            return;
        }
        if (classId == null || classId.isBlank()) {
            throw ApiException.forbidden("A valid class is required");
        }
        if (hasAuthority(authentication, "TEACHER")) {
            requireTeacherClass(authentication, classId);
            return;
        }
        if (hasAuthority(authentication, "STUDENT")) {
            if (classId.equals(currentStudent(authentication).getStudentClass())) {
                return;
            }
            throw ApiException.forbidden("This class does not belong to the current student");
        }
        if (hasAuthority(authentication, "PARENT")
                && currentParentChildren(authentication).stream()
                        .anyMatch(student -> classId.equals(student.getStudentClass()))) {
            return;
        }
        throw ApiException.forbidden("You are not allowed to access this class");
    }

    public void requireFileAccess(Authentication authentication, String fileName) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw ApiException.unauthorized("Authentication is required");
        }
        if (hasAuthority(authentication, "ADMIN")) {
            return;
        }
        if (fileName == null || !fileName.matches(
                "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
                        + "\\.(?i:pdf|png|jpg|jpeg|doc|docx|txt)$")) {
            throw ApiException.badRequest("INVALID_FILE_NAME", "File name is invalid");
        }

        // 1. Check AssignmentSubmission (student submissions)
        List<AssignmentSubmission> submissions = assignmentSubmissionRepository.findBySubmissionFileUrlContaining(fileName);
        if (!submissions.isEmpty()) {
            boolean authorized = false;
            for (AssignmentSubmission submission : submissions) {
                if (hasAuthority(authentication, "STUDENT")) {
                    Student current = studentRepository.findByEmail(authentication.getName()).orElse(null);
                    if (current != null && current.getId().equals(submission.getStudentId())) {
                        authorized = true;
                        break;
                    }
                } else if (hasAuthority(authentication, "PARENT")) {
                    List<Student> children = currentParentChildren(authentication);
                    if (children != null && children.stream().anyMatch(c -> c.getId().equals(submission.getStudentId()))) {
                        authorized = true;
                        break;
                    }
                } else if (hasAuthority(authentication, "TEACHER")) {
                    Assignment assignment = assignmentRepository.findById(submission.getAssignmentId()).orElse(null);
                    if (assignment != null) {
                        try {
                            requireTeacherClass(authentication, assignment.getClassId());
                            requireTeacherSubject(authentication, assignment.getSubject());
                            authorized = true;
                            break;
                        } catch (ApiException ignored) {
                        }
                    }
                }
            }
            if (!authorized) {
                throw ApiException.forbidden("You are not allowed to access this submission file");
            }
            return;
        }

        // 2. Check Assignment (teacher assignment attachments / questions)
        List<Assignment> assignments = assignmentRepository.findByFileUrlContainingOrAttachmentUrlContaining(fileName, fileName);
        if (!assignments.isEmpty()) {
            boolean authorized = false;
            for (Assignment assignment : assignments) {
                if (hasAuthority(authentication, "TEACHER")) {
                    try {
                        requireTeacherClass(authentication, assignment.getClassId());
                        requireTeacherSubject(authentication, assignment.getSubject());
                        authorized = true;
                        break;
                    } catch (ApiException ignored) {
                    }
                } else if (hasAuthority(authentication, "STUDENT")) {
                    Student current = studentRepository.findByEmail(authentication.getName()).orElse(null);
                    if (current != null && assignment.getClassId().equals(current.getStudentClass())) {
                        authorized = true;
                        break;
                    }
                } else if (hasAuthority(authentication, "PARENT")) {
                    List<Student> children = currentParentChildren(authentication);
                    if (children != null && children.stream().anyMatch(c -> assignment.getClassId().equals(c.getStudentClass()))) {
                        authorized = true;
                        break;
                    }
                }
            }
            if (!authorized) {
                throw ApiException.forbidden("You are not allowed to access this assignment attachment");
            }
            return;
        }

        // 3. Check Announcement (school announcements)
        List<Announcement> announcements = announcementRepository.findByAttachmentUrlContaining(fileName);
        if (!announcements.isEmpty()) {
            boolean authorized = false;
            for (Announcement announcement : announcements) {
                if (announcement.getVisibleTo() == null || announcement.getVisibleTo().isEmpty()) {
                    authorized = true;
                    break;
                }
                for (UserRole role : announcement.getVisibleTo()) {
                    if (hasAuthority(authentication, role.name())) {
                        authorized = true;
                        break;
                    }
                }
                if (authorized) {
                    break;
                }
            }
            if (!authorized) {
                throw ApiException.forbidden("You are not allowed to access this announcement attachment");
            }
            return;
        }

        // 4. File is not linked to any academic record -> reject unreferenced files
        throw ApiException.forbidden("File is not linked to an authorized academic record");
    }

    public boolean hasAuthority(Authentication authentication, String authority) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(value -> authority.equals(value.getAuthority()));
    }

    private void requireAuthority(Authentication authentication, String authority) {
        if (!hasAuthority(authentication, authority)) {
            throw ApiException.forbidden(authority + " access is required");
        }
    }
}
