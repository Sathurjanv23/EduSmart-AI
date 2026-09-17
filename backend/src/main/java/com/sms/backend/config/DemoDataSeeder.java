package com.sms.backend.config;

import java.time.Instant;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.sms.backend.model.Student;
import com.sms.backend.model.TeacherProfile;
import com.sms.backend.model.User;
import com.sms.backend.model.UserRole;
import com.sms.backend.repository.StudentRepository;
import com.sms.backend.repository.TeacherProfileRepository;
import com.sms.backend.repository.UserRepository;

@Component
@ConditionalOnProperty(name = "app.seed.demo-data", havingValue = "true")
public class DemoDataSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);
    private static final String ADMIN_EMAIL = "admin@campuscore.local";
    private static final String TEACHER_EMAIL = "teacher@campuscore.local";
    private static final String STUDENT_EMAIL = "student@campuscore.local";
    private static final String PARENT_EMAIL = "parent@campuscore.local";
    private static final String STRONG_PASSWORD =
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&.#_-]).{8,128}$";

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final String demoPassword;

    public DemoDataSeeder(
            UserRepository userRepository,
            StudentRepository studentRepository,
            TeacherProfileRepository teacherProfileRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.seed.demo-password}") String demoPassword) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.teacherProfileRepository = teacherProfileRepository;
        this.passwordEncoder = passwordEncoder;
        if (demoPassword == null || !demoPassword.matches(STRONG_PASSWORD)) {
            throw new IllegalStateException(
                    "DEMO_PASSWORD must be 8-128 characters and include uppercase, lowercase, number, and special character");
        }
        this.demoPassword = demoPassword;
    }

    @Override
    public void run(String... args) {
        User admin = createUserIfMissing("Demo Administrator", ADMIN_EMAIL, UserRole.ADMIN);
        User teacher = createUserIfMissing("Demo Teacher", TEACHER_EMAIL, UserRole.TEACHER);
        User studentUser = createUserIfMissing("Demo Student", STUDENT_EMAIL, UserRole.STUDENT);
        createUserIfMissing("Demo Parent", PARENT_EMAIL, UserRole.PARENT);

        teacherProfileRepository.findByEmail(TEACHER_EMAIL).orElseGet(() -> {
            TeacherProfile profile = new TeacherProfile();
            profile.setUserId(teacher.getId());
            profile.setEmail(teacher.getEmail());
            profile.setName(teacher.getName());
            profile.setAssignedClassIds(List.of("GRADE-10-A"));
            profile.setAssignedSubjects(List.of("Mathematics"));
            return teacherProfileRepository.save(profile);
        });

        studentRepository.findByEmail(STUDENT_EMAIL).orElseGet(() -> {
            Student student = new Student();
            student.setUserId(studentUser.getId());
            student.setName(studentUser.getName());
            student.setEmail(studentUser.getEmail());
            student.setParentEmail(PARENT_EMAIL);
            student.setStudentClass("GRADE-10-A");
            student.setGender("PREFER_NOT_TO_SAY");
            student.setCreatedBy(admin.getEmail());
            return studentRepository.save(student);
        });

        log.warn("Development demo data is enabled. Disable APP_SEED_DEMO_DATA in production.");
    }

    private User createUserIfMissing(String name, String email, UserRole role) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(demoPassword));
            user.setRole(role);
            user.setStatus("ACTIVE");
            user.setEmailVerified(true);
            user.setCreatedAt(Instant.now());
            user.setUpdatedAt(Instant.now());
            return userRepository.save(user);
        });
    }
}
