package com.schoolgroup.sms.service;

import com.schoolgroup.sms.config.AppProperties;
import com.schoolgroup.sms.entity.Role;
import com.schoolgroup.sms.entity.StoredFile;
import com.schoolgroup.sms.entity.UserAccount;
import com.schoolgroup.sms.exception.ApiException;
import com.schoolgroup.sms.repository.StudentDocumentRepository;
import com.schoolgroup.sms.repository.StoredFileRepository;
import com.schoolgroup.sms.repository.UserAccountRepository;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_MIME = Set.of(
            "image/jpeg", "image/png", "image/webp", "application/pdf",
            "image/jpg", "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private static final Set<String> ALLOWED_EXT = Set.of(
            "jpg", "jpeg", "png", "webp", "pdf", "doc", "docx"
    );

    private final AppProperties properties;
    private final StoredFileRepository files;
    private final UserAccountRepository users;
    private final AccessService access;
    private final StudentDocumentRepository studentDocuments;
    private final AuditService audit;

    public FileStorageService(AppProperties properties, StoredFileRepository files,
                              UserAccountRepository users, AccessService access,
                              StudentDocumentRepository studentDocuments, AuditService audit) {
        this.properties = properties;
        this.files = files;
        this.users = users;
        this.access = access;
        this.studentDocuments = studentDocuments;
        this.audit = audit;
    }

    @Transactional
    public StoredFile store(MultipartFile upload) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.TEACHER, Role.ACCOUNTANT);
        if (upload == null || upload.isEmpty()) {
            throw ApiException.badRequest("File is required");
        }
        long max = properties.getFiles().getMaxSizeMb() * 1024L * 1024L;
        if (upload.getSize() > max) {
            throw ApiException.badRequest("File exceeds max size of " + properties.getFiles().getMaxSizeMb() + "MB");
        }
        String contentType = upload.getContentType() == null ? "application/octet-stream" : upload.getContentType().toLowerCase(Locale.ROOT);
        if (!ALLOWED_MIME.contains(contentType)) {
            throw ApiException.badRequest("File type not allowed");
        }
        String original = upload.getOriginalFilename() == null ? "upload.bin" : upload.getOriginalFilename();
        String ext = extensionOf(original);
        if (!ALLOWED_EXT.contains(ext)) {
            throw ApiException.badRequest("File extension not allowed");
        }
        try {
            Path dir = Path.of(properties.getFiles().getStorageDir()).toAbsolutePath().normalize();
            Files.createDirectories(dir);
            String safeOriginal = original.replaceAll("[^a-zA-Z0-9._-]", "_");
            if (safeOriginal.length() > 120) {
                safeOriginal = safeOriginal.substring(safeOriginal.length() - 120);
            }
            String storedName = UUID.randomUUID() + "_" + safeOriginal;
            Path target = dir.resolve(storedName).normalize();
            if (!target.startsWith(dir)) {
                throw ApiException.badRequest("Invalid file path");
            }
            upload.transferTo(target);
            UserAccount uploader = users.findById(access.current().getId())
                    .orElseThrow(() -> ApiException.unauthorized("User not found"));
            StoredFile meta = new StoredFile();
            meta.setOriginalName(original.length() > 200 ? original.substring(0, 200) : original);
            meta.setStoredName(storedName);
            meta.setContentType(contentType);
            meta.setSizeBytes(upload.getSize());
            meta.setUploadedBy(uploader);
            StoredFile saved = files.save(meta);
            audit.record("UPLOAD", "FILE", saved.getId().toString(), saved.getOriginalName());
            return saved;
        } catch (IOException ex) {
            throw ApiException.badRequest("Could not store file");
        }
    }

    @Transactional(readOnly = true)
    public StoredFile require(UUID id) {
        StoredFile meta = files.findById(id).orElseThrow(() -> ApiException.notFound("File not found"));
        assertCanAccess(meta);
        return meta;
    }

    @Transactional(readOnly = true)
    public Resource load(UUID id) {
        StoredFile meta = require(id);
        Path dir = Path.of(properties.getFiles().getStorageDir()).toAbsolutePath().normalize();
        Path path = dir.resolve(meta.getStoredName()).normalize();
        if (!path.startsWith(dir) || !Files.exists(path)) {
            throw ApiException.notFound("File missing on disk");
        }
        return new FileSystemResource(path);
    }

    public MediaType mediaType(StoredFile meta) {
        try {
            return MediaType.parseMediaType(meta.getContentType());
        } catch (Exception e) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
    }

    private void assertCanAccess(StoredFile meta) {
        Role role = access.current().getRole();
        if (role == Role.SUPER_ADMIN || role == Role.BRANCH_ADMIN || role == Role.PRINCIPAL
                || role == Role.TEACHER || role == Role.ACCOUNTANT) {
            return;
        }
        if (role == Role.PARENT || role == Role.STUDENT) {
            boolean linked = studentDocuments.findByFileId(meta.getId()).stream()
                    .anyMatch(d -> {
                        try {
                            access.requireStudentAccess(d.getStudent().getId());
                            return true;
                        } catch (RuntimeException ex) {
                            return false;
                        }
                    });
            if (linked || (meta.getUploadedBy() != null && meta.getUploadedBy().getId().equals(access.current().getId()))) {
                return;
            }
            throw ApiException.forbidden("File access denied");
        }
        throw ApiException.forbidden("File access denied");
    }

    private static String extensionOf(String name) {
        int dot = name.lastIndexOf('.');
        if (dot < 0 || dot == name.length() - 1) {
            return "";
        }
        return name.substring(dot + 1).toLowerCase(Locale.ROOT);
    }
}
