package com.donaton.donaciones.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.donaton.donaciones.model.Donacion;
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
    public Donacion crear(@RequestBody Donacion d) {
        return service.crear(d);
    }

    @Operation(summary = "Obtener listado de donaciones")
    @GetMapping
    public List<Donacion> listar() {
        return service.listar();
    }
}