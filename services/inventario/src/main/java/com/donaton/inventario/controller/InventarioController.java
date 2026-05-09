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

@RestController
@RequestMapping("/inventario")
@CrossOrigin(origins = "*")
public class InventarioController {

    @Autowired
    private InventarioService service;

    @PostMapping
    public Inventario crear(@RequestBody Inventario i) {
        return service.crear(i);
    }

    @GetMapping
    public List<Inventario> listar() {
        return service.listar();
    }
}
