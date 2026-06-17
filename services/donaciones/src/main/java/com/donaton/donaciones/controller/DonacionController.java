package com.donaton.donaciones.controller;

import java.util.List;

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

import com.donaton.donaciones.model.Donacion;
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
    public ResponseEntity<Donacion> crear(@RequestBody Donacion d) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.crearDonacion(d.getNombreDonante(), d.getCategoria(), d.getProducto(), d.getCantidad(), d.getDetalle()));
    }

    @Operation(summary = "Obtener listado de donaciones")
    @GetMapping
    public List<Donacion> listar() {
        return service.listar();
    }

    @Operation(summary = "Buscar donaciones por detalle")
    @GetMapping("/detalle/{detalle}")
    public List<Donacion> buscarPorDetalle(@PathVariable String detalle) {
        return service.buscarPorDetalle(detalle);
    }

    @Operation(summary = "Buscar donaciones por tipo")
    @GetMapping("/tipo/{tipo}")
    public List<Donacion> buscarPorTipo(@PathVariable String tipo) {
        return service.buscarPorTipoDonacion(tipo);
    }

    @Operation(summary = "Obtener donación por ID")
    @GetMapping("/{id}")
    public Donacion obtenerPorId(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    @Operation(summary = "Actualizar una donación")
    @PutMapping("/{id}")
    public Donacion actualizar(@PathVariable Long id, @RequestBody Donacion d) {
        return service.actualizar(id, d);
    }

    @Operation(summary = "Eliminar una donación")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }

}