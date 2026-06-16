package com.donaton.gateway.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FallbackController {

    @GetMapping("/fallback/inventario")
    public String inventarioFallback() {

        return "Servicio de inventario temporalmente no disponible";
    }

    @GetMapping("/fallback/donaciones")
    public String donacionesFallback() {

        return "Servicio de donaciones temporalmente no disponible";
    }

    @GetMapping("/fallback/logistica")
    public String logisticaFallback() {

        return "Servicio de logística temporalmente no disponible";
    }

    @GetMapping("/fallback/necesidades")
    public String necesidadesFallback() {

        return "Servicio de necesidades temporalmente no disponible";
    }
}