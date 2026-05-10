package com.donaton.donaciones.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.donaton.donaciones.factory.DonacionFactory;

import com.donaton.donaciones.model.Donacion;
import com.donaton.donaciones.model.DonacionDetalle;
import com.donaton.donaciones.repository.DonacionRepository;

@Service
public class DonacionService {

    @Autowired
    private DonacionRepository repository;

    @Autowired
    private DonacionFactory factory;

    public Donacion crearDonacion(String nombreDonante, String tipoDonacion, Double cantidad, String detalle) {
        DonacionDetalle donacion = factory.crearDonacion(nombreDonante, tipoDonacion, cantidad, detalle);
        return repository.save(donacion);
    }

    public List<Donacion> listar() {
        return repository.findAll();
    }

}