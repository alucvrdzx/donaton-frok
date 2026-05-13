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

    // Creación manual desde el frontend — busca si ya existe para sumar en vez de duplicar
    public Inventario crear(Inventario i) {
        return repository.findByProductoAndDetalle(i.getProducto(), i.getDetalle())
                .map(existente -> {
                    existente.setStock(existente.getStock() + i.getStock());
                    return repository.save(existente);
                })
                .orElseGet(() -> repository.save(i));
    }

    public List<Inventario> listar() {
        return repository.findAll();
    }

    // Cuando llega una donacion via RabbitMQ, suma al stock
    public void agregarStock(String producto, String detalle, Double cantidad, String unidadMedida) {
        Inventario inv = repository.findByProductoAndDetalle(producto, detalle)
                .orElse(new Inventario(null, producto, 0.0, detalle, unidadMedida));
        inv.setStock(inv.getStock() + cantidad);
        repository.save(inv);
    }

    // Cuando logistica marca entregado, descuenta del stock
    public void descontarStock(String producto, String detalle, Double cantidad) {
        repository.findByProductoAndDetalle(producto, detalle).ifPresent(inv -> {
            inv.setStock(Math.max(0, inv.getStock() - cantidad));
            repository.save(inv);
        });
    }
}
