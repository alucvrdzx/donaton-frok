package com.donaton.donaciones.service;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.donaton.donaciones.model.Donacion;
import com.donaton.donaciones.repository.DonacionRepository;

@Service
public class DonacionService {

    @Autowired
    private DonacionRepository repository;

    public Donacion crear(Donacion d) {
        return repository.save(d);
    }

    public List<Donacion> listar() {
        return repository.findAll();
    }
}