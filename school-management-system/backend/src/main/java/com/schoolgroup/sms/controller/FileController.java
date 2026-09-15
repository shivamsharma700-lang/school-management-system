package com.schoolgroup.sms.controller;

import com.schoolgroup.sms.entity.StoredFile;
import com.schoolgroup.sms.service.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileStorageService files;

    public FileController(FileStorageService files) {
        this.files = files;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> upload(@RequestPart("file") MultipartFile file) {
        StoredFile stored = files.store(file);
        return Map.of(
                "id", stored.getId(),
                "originalName", stored.getOriginalName(),
                "contentType", stored.getContentType(),
                "sizeBytes", stored.getSizeBytes()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> download(@PathVariable UUID id) {
        StoredFile meta = files.require(id);
        Resource resource = files.load(id);
        return ResponseEntity.ok()
                .contentType(files.mediaType(meta))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + meta.getOriginalName() + "\"")
                .body(resource);
    }
}
