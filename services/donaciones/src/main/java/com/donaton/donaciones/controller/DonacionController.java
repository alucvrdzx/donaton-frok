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

@RestController
@RequestMapping("/donaciones")
@CrossOrigin(origins = "*")
public class DonacionController {

    @Autowired
    private DonacionService service;

    @PostMapping
    public Donacion crear(@RequestBody Donacion d) {
        return service.crear(d);
    }

    @GetMapping
    public List<Donacion> listar() {
        return service.listar();
    }
}