package com.donaton.inventario.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import com.donaton.inventario.dto.InventarioRequest;
import com.donaton.inventario.dto.InventarioResponse;
import com.donaton.inventario.service.InventarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/inventario")
@CrossOrigin(origins = "*")
@Tag(name = "Inventario", description = "Controlador para la gestión del inventario")
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioService service;


    @Operation(summary = "Crear un nuevo registro de inventario")
    @PostMapping
    public ResponseEntity<InventarioResponse> crear(@Valid @RequestBody InventarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(request));
    }

    @Operation(summary = "Obtener listado del inventario")
    @GetMapping
    public Page<InventarioResponse> listar(Pageable pageable) {
        return service.listar(pageable);
    }

    @Operation(summary = "Actualizar un registro del inventario")
    @PutMapping("/{id}")
    public InventarioResponse actualizar(@PathVariable Long id, @Valid @RequestBody InventarioRequest request) {
        return service.actualizar(id, request);
    }

    @Operation(summary = "Eliminar un registro del inventario")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}