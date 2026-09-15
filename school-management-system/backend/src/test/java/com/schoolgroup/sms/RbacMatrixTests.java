package com.schoolgroup.sms;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.schoolgroup.sms.entity.Role;
import com.schoolgroup.sms.security.PermissionMatrix;
import com.schoolgroup.sms.security.PermissionMatrix.Action;
import com.schoolgroup.sms.security.PermissionMatrix.Resource;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

/**
 * Role-based access regression net.
 *
 * The product rule is that the server, not the UI, decides what a role may do.
 * These tests drive the real HTTP stack as each seeded role and assert the
 * outcome, so a future change that widens access fails here rather than shipping.
 *
 * Covered: vertical escalation (a role reaching an area it should not),
 * horizontal escalation (another branch / another student), unauthorised writes,
 * and correct 401-vs-403 semantics.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RbacMatrixTests {

    private static final String DEV_PASSWORD = "Dev@School123!";

    @Autowired
    MockMvc mockMvc;
    @Autowired
    ObjectMapper mapper;

    /** Static so each role signs in once for the whole class, not once per test. */
    private static final Map<String, String> tokenCache = new HashMap<>();

    private String token(String username) {
        return tokenCache.computeIfAbsent(username, u -> {
            try {
                MvcResult res = mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(mapper.writeValueAsString(Map.of("username", u, "password", DEV_PASSWORD))))
                        .andReturn();
                assertThat(res.getResponse().getStatus())
                        .as("login for %s", u).isEqualTo(200);
                JsonNode body = mapper.readTree(res.getResponse().getContentAsString());
                return body.get("accessToken").asText();
            } catch (Exception e) {
                throw new IllegalStateException("login failed for " + u, e);
            }
        });
    }

    private int getStatus(String username, String path) throws Exception {
        return mockMvc.perform(get(path).header("Authorization", "Bearer " + token(username)))
                .andReturn().getResponse().getStatus();
    }

    private int postStatus(String username, String path, Object body) throws Exception {
        return mockMvc.perform(post(path)
                        .header("Authorization", "Bearer " + token(username))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(body)))
                .andReturn().getResponse().getStatus();
    }

    // ---------------------------------------------------------------- 401 / 403

    @Test
    @DisplayName("missing or invalid credentials return 401, never 403")
    void unauthenticatedIs401() throws Exception {
        // A 403 here would break silent token refresh on the client, which only
        // retries on 401 — an expired session would silently render empty data.
        assertThat(mockMvc.perform(get("/api/dashboard")).andReturn().getResponse().getStatus())
                .isEqualTo(401);
        assertThat(mockMvc.perform(get("/api/dashboard")
                        .header("Authorization", "Bearer not.a.valid.token"))
                .andReturn().getResponse().getStatus())
                .isEqualTo(401);
    }

    @Test
    @DisplayName("authenticated but forbidden returns 403")
    void forbiddenIs403() throws Exception {
        assertThat(getStatus("student", "/api/users")).isEqualTo(403);
    }

    @Test
    @DisplayName("unmatched API routes return 404, not 500")
    void unmatchedRouteIs404() throws Exception {
        assertThat(getStatus("superadmin", "/api/this-route-does-not-exist")).isEqualTo(404);
    }

    // ------------------------------------------------------- vertical escalation

    /** username -> path -> expected status. 200 = allowed, 403 = denied. */
    private static List<Object[]> readMatrix() {
        List<Object[]> rows = new ArrayList<>();
        // Administration surface: only admin-like roles may read it.
        for (String path : List.of("/api/users", "/api/audit-logs")) {
            rows.add(new Object[]{"superadmin", path, 200});
            rows.add(new Object[]{"teacher", path, 403});
            rows.add(new Object[]{"accountant", path, 403});
            rows.add(new Object[]{"parent", path, 403});
            rows.add(new Object[]{"student", path, 403});
            rows.add(new Object[]{"transport", path, 403});
        }
        // Finance surface.
        rows.add(new Object[]{"accountant", "/api/fee-structures", 200});
        rows.add(new Object[]{"superadmin", "/api/fee-structures", 200});
        rows.add(new Object[]{"teacher", "/api/fee-structures", 403});
        rows.add(new Object[]{"student", "/api/fee-structures", 403});
        rows.add(new Object[]{"transport", "/api/fee-structures", 403});
        // Staff directory.
        rows.add(new Object[]{"teacher", "/api/staff", 200});
        rows.add(new Object[]{"parent", "/api/staff", 403});
        rows.add(new Object[]{"student", "/api/staff", 403});
        rows.add(new Object[]{"transport", "/api/staff", 403});
        return rows;
    }

    @Test
    @DisplayName("read access matches the role matrix")
    void readAccessMatrix() throws Exception {
        List<String> failures = new ArrayList<>();
        for (Object[] row : readMatrix()) {
            String user = (String) row[0];
            String path = (String) row[1];
            int expected = (Integer) row[2];
            int actual = getStatus(user, path);
            if (actual != expected) {
                failures.add("%s GET %s -> %d (expected %d)".formatted(user, path, actual, expected));
            }
        }
        assertThat(failures).as("role/route violations").isEmpty();
    }

    // ----------------------------------------------------- unauthorised writes

    @Test
    @DisplayName("non-admin roles cannot create users")
    void cannotCreateUsers() throws Exception {
        Map<String, Object> body = Map.of(
                "fullName", "Probe User", "email", "probe.rbac@sms.local",
                "username", "probe_rbac", "password", "Abcd@123456", "role", "TEACHER");
        for (String user : List.of("teacher", "accountant", "parent", "student", "transport")) {
            assertThat(postStatus(user, "/api/users", body))
                    .as("%s must not create users", user).isEqualTo(403);
        }
    }

    @Test
    @DisplayName("only admin-like roles may issue notices")
    void noticeIssuance() throws Exception {
        Map<String, Object> body = Map.of(
                "title", "RBAC probe", "body", "RBAC probe body", "audienceType", "SCHOOL");
        // Denied for roles with no ISSUE capability on NOTICE.
        for (String user : List.of("student", "parent", "accountant", "transport")) {
            assertThat(postStatus(user, "/api/notices", body))
                    .as("%s must not issue school notices", user).isEqualTo(403);
        }
        assertThat(postStatus("principal", "/api/notices", body)).isEqualTo(200);
    }

    @Test
    @DisplayName("accountant cannot write academic records")
    void accountantCannotTouchAcademics() throws Exception {
        // Payload must satisfy bean validation, otherwise the request is rejected
        // at 400 before authorisation runs and the test proves nothing.
        Map<String, Object> validShape = Map.of(
                "examSubjectId", "00000000-0000-0000-0000-000000000000",
                "studentId", "00000000-0000-0000-0000-000000000000",
                "marksObtained", 50);
        assertThat(postStatus("accountant", "/api/marks", validShape))
                .as("accountant writing marks must be refused on role, not shape")
                .isEqualTo(403);
        assertThat(postStatus("parent", "/api/marks", validShape))
                .as("parent writing marks").isEqualTo(403);
        assertThat(postStatus("student", "/api/marks", validShape))
                .as("student writing marks").isEqualTo(403);
        assertThat(postStatus("transport", "/api/marks", validShape))
                .as("transport writing marks").isEqualTo(403);
    }

    @Test
    @DisplayName("transport role has no academic or financial reach")
    void transportIsFleetOnly() throws Exception {
        for (String path : List.of("/api/fee-structures", "/api/invoices", "/api/users",
                "/api/audit-logs", "/api/exams", "/api/homework")) {
            assertThat(getStatus("transport", path))
                    .as("transport must not read %s", path).isEqualTo(403);
        }
    }

    // ---------------------------------------------------- horizontal escalation

    @Test
    @DisplayName("a student cannot read another student's record")
    void crossStudentDenied() throws Exception {
        MvcResult listed = mockMvc.perform(get("/api/students?size=50")
                        .header("Authorization", "Bearer " + token("superadmin")))
                .andReturn();
        JsonNode items = mapper.readTree(listed.getResponse().getContentAsString()).get("items");
        assertThat(items).as("seeded students").isNotNull();

        // The student account may only ever see its own row.
        MvcResult own = mockMvc.perform(get("/api/students?size=50")
                        .header("Authorization", "Bearer " + token("student")))
                .andReturn();
        JsonNode ownItems = mapper.readTree(own.getResponse().getContentAsString()).get("items");
        assertThat(ownItems.size()).as("student sees only itself").isLessThanOrEqualTo(1);

        // Directly addressing a different student's id must be refused.
        String foreignId = null;
        String ownId = ownItems.size() > 0 ? ownItems.get(0).get("id").asText() : null;
        for (JsonNode n : items) {
            String id = n.get("id").asText();
            if (ownId == null || !id.equals(ownId)) {
                foreignId = id;
                break;
            }
        }
        assertThat(foreignId).as("a second student must exist to prove isolation").isNotNull();
        assertThat(getStatus("student", "/api/students/" + foreignId))
                .as("student reading a foreign record").isEqualTo(403);
    }

    @Test
    @DisplayName("a parent only sees linked children")
    void parentSeesOnlyLinkedChildren() throws Exception {
        MvcResult res = mockMvc.perform(get("/api/students?size=50")
                        .header("Authorization", "Bearer " + token("parent")))
                .andReturn();
        assertThat(res.getResponse().getStatus()).isEqualTo(200);
        JsonNode items = mapper.readTree(res.getResponse().getContentAsString()).get("items");

        MvcResult all = mockMvc.perform(get("/api/students?size=200")
                        .header("Authorization", "Bearer " + token("superadmin")))
                .andReturn();
        JsonNode allItems = mapper.readTree(all.getResponse().getContentAsString()).get("items");
        assertThat(items.size())
                .as("parent must not see the whole roll")
                .isLessThan(allItems.size());
    }

    @Test
    @DisplayName("a branch user cannot reach another branch")
    void crossBranchDenied() throws Exception {
        MvcResult res = mockMvc.perform(get("/api/branches")
                        .header("Authorization", "Bearer " + token("superadmin")))
                .andReturn();
        JsonNode branches = mapper.readTree(res.getResponse().getContentAsString());
        if (branches.size() < 2) {
            return; // single-branch fixture: nothing to prove
        }
        // principal is bound to the primary branch; ask for a different one.
        String otherBranch = branches.get(branches.size() - 1).get("id").asText();
        int status = getStatus("principal", "/api/students?branchId=" + otherBranch + "&size=5");
        assertThat(status).as("principal reaching another branch").isEqualTo(403);
    }

    // ------------------------------------------------------------ transport

    @Test
    @DisplayName("fleet endpoints are reachable by TRANSPORT and admins only")
    void fleetAccess() throws Exception {
        for (String path : List.of("/api/transport/vehicles", "/api/transport/drivers")) {
            assertThat(getStatus("transport", path)).as("transport reads %s", path).isEqualTo(200);
            assertThat(getStatus("superadmin", path)).as("super admin reads %s", path).isEqualTo(200);
            assertThat(getStatus("accountant", path)).as("accountant must not read %s", path).isEqualTo(403);
            assertThat(getStatus("parent", path)).as("parent must not read %s", path).isEqualTo(403);
            assertThat(getStatus("student", path)).as("student must not read %s", path).isEqualTo(403);
        }
    }

    @Test
    @DisplayName("only fleet roles may add a vehicle")
    void vehicleCreation() throws Exception {
        Map<String, Object> body = Map.of(
                "registrationNumber", "DL9XX" + System.nanoTime() % 9999,
                "vehicleType", "BUS", "capacity", 40);
        for (String user : List.of("teacher", "accountant", "parent", "student")) {
            assertThat(postStatus(user, "/api/transport/vehicles", body))
                    .as("%s must not add a vehicle", user).isEqualTo(403);
        }
        assertThat(postStatus("transport", "/api/transport/vehicles", body)).isEqualTo(200);
    }

    // ---------------------------------------------------------------- finance

    @Test
    @DisplayName("refunds and write-offs are not self-serve for an accountant")
    void refundSeparationOfDuties() throws Exception {
        // Write-offs are an admin decision even though the accountant owns fees.
        String fakeInvoice = "/api/invoices/00000000-0000-0000-0000-000000000000/write-offs";
        Map<String, Object> body = Map.of("amount", 100, "reason", "probe");
        assertThat(postStatus("accountant", fakeInvoice, body))
                .as("accountant writing off debt").isEqualTo(403);
        for (String user : List.of("teacher", "parent", "student", "transport")) {
            assertThat(postStatus(user, "/api/invoices/00000000-0000-0000-0000-000000000000/discounts", body))
                    .as("%s granting a discount", user).isEqualTo(403);
        }
    }

    // ------------------------------------------------------------ matrix itself

    @ParameterizedTest
    @EnumSource(Role.class)
    @DisplayName("every role has a declared permission set")
    void everyRoleIsDeclared(Role role) {
        assertThat(PermissionMatrix.forRole(role))
                .as("no permissions declared for %s", role)
                .isNotEmpty();
    }

    @Test
    @DisplayName("only SUPER_ADMIN may administer users and audit")
    void matrixKeepsAdminSurfaceNarrow() {
        for (Role role : Role.values()) {
            boolean canAudit = PermissionMatrix.can(role, Resource.AUDIT, Action.VIEW);
            if (role == Role.SUPER_ADMIN) {
                assertThat(canAudit).as("super admin reads audit").isTrue();
            } else {
                assertThat(canAudit).as("%s must not read audit", role).isFalse();
            }
        }
        assertThat(PermissionMatrix.can(Role.TEACHER, Resource.FEE_STRUCTURE, Action.EDIT)).isFalse();
        assertThat(PermissionMatrix.can(Role.ACCOUNTANT, Resource.MARKS, Action.EDIT)).isFalse();
        assertThat(PermissionMatrix.can(Role.PARENT, Resource.MARKS, Action.EDIT)).isFalse();
        assertThat(PermissionMatrix.can(Role.STUDENT, Resource.ATTENDANCE, Action.EDIT)).isFalse();
        assertThat(PermissionMatrix.can(Role.TRANSPORT, Resource.MARKS, Action.VIEW)).isFalse();
        assertThat(PermissionMatrix.can(Role.TRANSPORT, Resource.TRANSPORT_FLEET, Action.CREATE)).isTrue();
    }
}
