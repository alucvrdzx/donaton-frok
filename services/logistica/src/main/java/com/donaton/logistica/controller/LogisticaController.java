package com.donaton.logistica.controller;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import com.donaton.logistica.dto.LogisticaRequest;
import com.donaton.logistica.dto.LogisticaResponse;
import com.donaton.logistica.service.LogisticaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/logistica")
@CrossOrigin(origins = "*")
@Tag(name = "Logística", description = "Controlador para la gestión logística")
@RequiredArgsConstructor
public class LogisticaController {

    private final LogisticaService service;

    @Operation(summary = "Crear un nuevo registro logístico")
    @PostMapping
    public ResponseEntity<LogisticaResponse> crear(@Valid @RequestBody LogisticaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(request));
    }

    @Operation(summary = "Obtener listado logístico paginado")
    @GetMapping
    public Page<LogisticaResponse> listar(@ParameterObject Pageable pageable) {
        return service.listar(pageable);
    }

    @Operation(summary = "Obtener envío por ID")
    @GetMapping("/{id}")
    public LogisticaResponse obtenerPorId(@PathVariable Long id) {
        return service.obtenerPorIdResponse(id);
    }

    @Operation(summary = "Actualizar estado de un envío (PENDIENTE, EN_TRANSITO, ENTREGADO)")
    @PutMapping("/{id}/estado")
    public LogisticaResponse actualizarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return service.actualizarEstado(id, body.get("estado"));
    }

    @Operation(summary = "Editar un envío completo")
    @PutMapping("/{id}")
    public LogisticaResponse actualizar(@PathVariable Long id, @Valid @RequestBody LogisticaRequest datos) {
        return service.actualizar(id, datos);
    }

    @Operation(summary = "Eliminar un envío")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}