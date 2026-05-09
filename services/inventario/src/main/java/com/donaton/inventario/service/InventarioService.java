package com.donaton.inventario.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.donaton.inventario.model.Inventario;
import com.donaton.inventario.repository.InventarioRepository;

@Service
public class InventarioService {

    @Autowired
    private InventarioRepository repository;

    public Inventario crear(Inventario i) {
        return repository.save(i);
    }

    public List<Inventario> listar() {
        return repository.findAll();
    }
}
