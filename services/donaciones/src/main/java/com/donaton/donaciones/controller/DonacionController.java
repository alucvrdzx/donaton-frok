package com.donaton.donaciones.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

import com.donaton.donaciones.dto.DonacionRequest;
import com.donaton.donaciones.dto.DonacionResponse;
import com.donaton.donaciones.service.DonacionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/donaciones")
@CrossOrigin(origins = "*")
@Tag(name = "Donaciones", description = "Controlador para la gestión de donaciones")
@RequiredArgsConstructor
public class DonacionController {

    private final DonacionService service;

    @Operation(summary = "Crear una nueva donación")
    @PostMapping
    public ResponseEntity<DonacionResponse> crear(@Valid @RequestBody DonacionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.crearDonacion(request));
    }

    @Operation(summary = "Obtener listado de donaciones paginado")
    @GetMapping
    public Page<DonacionResponse> listar(Pageable pageable) {
        return service.listar(pageable);
    }

    @Operation(summary = "Buscar donaciones por detalle paginado")
    @GetMapping("/detalle/{detalle}")
    public Page<DonacionResponse> buscarPorDetalle(@PathVariable String detalle, Pageable pageable) {
        return service.buscarPorDetalle(detalle, pageable);
    }

    @Operation(summary = "Buscar donaciones por tipo paginado")
    @GetMapping("/tipo/{tipo}")
    public Page<DonacionResponse> buscarPorTipo(@PathVariable String tipo, Pageable pageable) {
        return service.buscarPorTipoDonacion(tipo, pageable);
    }

    @Operation(summary = "Obtener donación por ID")
    @GetMapping("/{id}")
    public DonacionResponse obtenerPorId(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    @Operation(summary = "Actualizar una donación")
    @PutMapping("/{id}")
    public DonacionResponse actualizar(@PathVariable Long id, @Valid @RequestBody DonacionRequest request) {
        return service.actualizar(id, request);
    }

    @Operation(summary = "Eliminar una donación")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }

}