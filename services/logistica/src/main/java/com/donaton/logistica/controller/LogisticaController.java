package com.donaton.logistica.controller;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.donaton.logistica.model.Logistica;
import com.donaton.logistica.service.LogisticaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/logistica")
@CrossOrigin(origins = "*")
@Tag(name = "Logística", description = "Controlador para la gestión logística")
public class LogisticaController {

    @Autowired
    private LogisticaService service;

    @Operation(summary = "Crear un nuevo registro logístico")
    @PostMapping
    public Logistica crear(@RequestBody Logistica l) {
        return service.crear(l);
    }

    @Operation(summary = "Obtener listado logístico")
    @GetMapping
    public List<Logistica> listar() {
        return service.listar();
    }
}