package com.donaton.logistica.controller;

import com.donaton.logistica.model.Sede;
import com.donaton.logistica.service.SedeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/logistica/sedes")
@RequiredArgsConstructor
public class SedeController {

    private final SedeService sedeService;

    @GetMapping
    public ResponseEntity<List<Sede>> obtenerTodasLasSedes() {
        return ResponseEntity.ok(sedeService.obtenerTodasLasSedes());
    }

    @PostMapping
    public ResponseEntity<Sede> crearSede(@RequestBody Sede sede) {
        return ResponseEntity.ok(sedeService.crearSede(sede));
    }

    @GetMapping("/cercana")
    public ResponseEntity<Sede> obtenerSedeMasCercana(@RequestParam Double lat, @RequestParam Double lng) {
        Sede sede = sedeService.obtenerSedeMasCercana(lat, lng);
        if (sede == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(sede);
    }
}
