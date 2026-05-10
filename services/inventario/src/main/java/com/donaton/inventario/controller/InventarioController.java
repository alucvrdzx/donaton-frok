package com.donaton.inventario.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.donaton.inventario.model.Inventario;
import com.donaton.inventario.service.InventarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/inventario")
@CrossOrigin(origins = "*")
@Tag(name = "Inventario", description = "Controlador para la gestión del inventario")
public class InventarioController {

    @Autowired
    private InventarioService service;

    @Operation(summary = "Crear un nuevo registro de inventario")
    @PostMapping
    public Inventario crear(@RequestBody Inventario i) {
        return service.crear(i);
    }

    @Operation(summary = "Obtener listado del inventario")
    @GetMapping
    public List<Inventario> listar() {
        return service.listar();
    }
}