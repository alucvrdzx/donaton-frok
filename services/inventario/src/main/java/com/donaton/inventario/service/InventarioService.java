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

    // Cuando llega una donacion via RabbitMQ, suma al stock
    public void agregarStock(String producto, Double cantidad) {
        Inventario inv = repository.findByProducto(producto)
                .orElse(new Inventario(null, producto, 0.0));
        inv.setStock(inv.getStock() + cantidad);
        repository.save(inv);
    }

    // Cuando logistica marca entregado, descuenta del stock
    public void descontarStock(String producto, Double cantidad) {
        repository.findByProducto(producto).ifPresent(inv -> {
            inv.setStock(Math.max(0, inv.getStock() - cantidad));
            repository.save(inv);
        });
    }
}
