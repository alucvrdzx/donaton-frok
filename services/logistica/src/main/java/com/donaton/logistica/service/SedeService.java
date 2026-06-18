package com.donaton.logistica.service;

import com.donaton.logistica.model.Sede;
import com.donaton.logistica.repository.SedeRepository;
import com.donaton.logistica.util.DistanceCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SedeService {

    private final SedeRepository sedeRepository;

    public List<Sede> obtenerTodasLasSedes() {
        return sedeRepository.findAll();
    }

    public Sede crearSede(Sede sede) {
        return sedeRepository.save(sede);
    }

    public Sede obtenerSedeMasCercana(Double lat, Double lng) {
        List<Sede> sedes = sedeRepository.findAll();

        if (sedes.isEmpty()) {
            return null; // o lanzar una excepción SedeNotFoundException
        }

        Sede sedeMasCercana = null;
        double distanciaMinima = Double.MAX_VALUE;

        for (Sede sede : sedes) {
            double distancia = DistanceCalculator.calcularDistancia(lat, lng, sede.getLat(), sede.getLng());
            if (distancia < distanciaMinima) {
                distanciaMinima = distancia;
                sedeMasCercana = sede;
            }
        }

        return sedeMasCercana;
    }
}
