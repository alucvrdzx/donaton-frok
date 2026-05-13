package com.donaton.logistica.controller;
import java.util.List;
import java.util.Map;

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

    @Operation(summary = "Obtener envío por ID")
    @GetMapping("/{id}")
    public Logistica obtenerPorId(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    @Operation(summary = "Actualizar estado de un envío (PENDIENTE, EN_TRANSITO, ENTREGADO)")
    @PutMapping("/{id}/estado")
    public Logistica actualizarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return service.actualizarEstado(id, body.get("estado"));
    }

    @Operation(summary = "Editar un envío completo")
    @PutMapping("/{id}")
    public Logistica actualizar(@PathVariable Long id, @RequestBody Logistica datos) {
        return service.actualizar(id, datos);
    }

    @Operation(summary = "Eliminar un envío")
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}