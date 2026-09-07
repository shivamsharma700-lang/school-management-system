package com.schoolgroup.sms;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.schoolgroup.sms.dto.AuthDtos;
import com.schoolgroup.sms.dto.SchoolDtos;
import com.schoolgroup.sms.repository.StudentRepository;
import com.schoolgroup.sms.service.FeePaymentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityAndDomainTests {

    private static final String DEV_PASSWORD = "Dev@School123!";

    @Autowired
    MockMvc mockMvc;
    @Autowired
    ObjectMapper mapper;
    @Autowired
    StudentRepository students;
    @Autowired
    FeePaymentService fees;

    @Test
    void loginRejectsInvalidPassword() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"nobody@sms.local","password":"wrong"}
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginSucceedsForSeededAdmin() throws Exception {
        login("super.admin@sms.local");
    }

    @Test
    void parentCannotReadUnlinkedStudent() throws Exception {
        String parentToken = login("parent@sms.local");
        UUID otherStudent = studentId("Other Child");
        mockMvc.perform(get("/api/students/" + otherStudent)
                        .header("Authorization", "Bearer " + parentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void teacherCannotAccessOtherBranchStudent() throws Exception {
        String teacherToken = login("teacher@sms.local");
        UUID other = studentId("Other Child");
        mockMvc.perform(get("/api/students/" + other)
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Transactional
    void duplicateAttendanceIsRejected() throws Exception {
        var student = students.findAll().stream()
                .filter(s -> "Arjun Sharma".equals(s.getFullName()))
                .findFirst().orElseThrow();
        String token = login("teacher@sms.local");
        SchoolDtos.AttendanceSubmitRequest body = new SchoolDtos.AttendanceSubmitRequest(
                student.getSection().getId(),
                student.getAcademicYear().getId(),
                LocalDate.of(2025, 7, 1),
                "FULL_DAY",
                List.of(new SchoolDtos.AttendanceItem(student.getId(), "PRESENT", null))
        );
        mockMvc.perform(post("/api/attendance")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(body)))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/attendance")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(body)))
                .andExpect(status().isConflict());
    }

    @Test
    void paymentWebhookRequiresValidSignature() {
        String payload = "orderId=abc&status=SUCCESS";
        assertThat(fees.verifySignature(payload, "deadbeef")).isFalse();
        assertThat(fees.verifySignature(payload, fees.hmac(payload))).isTrue();
        assertThat(fees.calculateTotal(List.of(), false)).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void notificationsAreOwnerScoped() throws Exception {
        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + login("parent@sms.local")))
                .andExpect(status().isOk());
    }

    @Test
    void studentSearchIsIsolatedForParent() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/students")
                        .header("Authorization", "Bearer " + login("parent@sms.local")))
                .andExpect(status().isOk())
                .andReturn();
        Map<?, ?> body = mapper.readValue(result.getResponse().getContentAsString(), Map.class);
        assertThat((List<?>) body.get("items")).hasSize(2);
    }

    @Test
    @Transactional
    void duplicateAdmissionIsRejected() throws Exception {
        var existing = students.findAll().stream()
                .filter(s -> "Arjun Sharma".equals(s.getFullName()))
                .findFirst().orElseThrow();
        SchoolDtos.StudentRequest request = new SchoolDtos.StudentRequest(
                existing.getBranch().getId(),
                existing.getAcademicYear().getId(),
                existing.getSchoolClass().getId(),
                existing.getSection().getId(),
                existing.getAdmissionNumber(),
                "STU-DUP",
                "Duplicate Student",
                LocalDate.of(2014, 1, 1),
                "MALE",
                null,
                "dup@sms.local",
                "addr",
                LocalDate.of(2025, 4, 3),
                "ACTIVE",
                null,
                null
        );
        mockMvc.perform(post("/api/students")
                        .header("Authorization", "Bearer " + login("branch.admin@sms.local"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    private String login(String username) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(new AuthDtos.LoginRequest(username, DEV_PASSWORD))))
                .andExpect(status().isOk())
                .andReturn();
        return mapper.readTree(result.getResponse().getContentAsString()).get("accessToken").asText();
    }

    private UUID studentId(String name) {
        return students.findAll().stream()
                .filter(s -> name.equals(s.getFullName()))
                .findFirst().orElseThrow()
                .getId();
    }
}
