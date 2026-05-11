package com.donaton.donaciones.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import com.donaton.donaciones.model.DonacionDetalle;
import com.donaton.donaciones.service.DonacionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/donaciones")
@CrossOrigin(origins = "*")
@Tag(name = "Donaciones", description = "Controlador para la gestión de donaciones")
public class DonacionController {

    @Autowired
    private DonacionService service;

    @Operation(summary = "Crear una nueva donación")
    @PostMapping
    public DonacionDetalle crear(@RequestBody DonacionDetalle d) {
        return service.crearDonacion(d.getNombreDonante(), d.getTipoDonacion(), d.getCantidad(), d.getDetalle());
    }

    @Operation(summary = "Obtener listado de donaciones")
    @GetMapping
    public List<DonacionDetalle> listar() {
        return service.listar();
    }

    @Operation(summary = "Buscar donaciones por detalle")
    @GetMapping("/detalle/{detalle}")
    public List<DonacionDetalle> buscarPorDetalle(@PathVariable String detalle) {
        return service.buscarPorDetalle(detalle);
    }

    @Operation(summary = "Buscar donaciones por tipo")
    @GetMapping("/tipo/{tipo}")
    public List<DonacionDetalle> buscarPorTipo(@PathVariable String tipo) {
        return service.buscarPorTipoDonacion(tipo);
    }

    @Operation(summary = "Obtener donación por ID")
    @GetMapping("/{id}")
    public DonacionDetalle obtenerPorId(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    @Operation(summary = "Actualizar una donación")
    @PutMapping("/{id}")
    public DonacionDetalle actualizar(@PathVariable Long id, @RequestBody DonacionDetalle d) {
        return service.actualizar(id, d);
    }

    @Operation(summary = "Eliminar una donación")
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }

}