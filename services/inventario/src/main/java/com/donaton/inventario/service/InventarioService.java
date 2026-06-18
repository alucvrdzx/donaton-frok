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
        return repository.findByCategoriaAndProductoAndDetalle(i.getCategoria(), i.getProducto(), i.getDetalle())
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
    public void agregarStock(String categoria, String producto, String detalle, Double cantidad, String unidadMedida) {
        Inventario inv = repository.findByCategoriaAndProductoAndDetalle(categoria, producto, detalle)
                .orElse(new Inventario(null, categoria, producto, 0.0, detalle, unidadMedida));
        inv.setStock(inv.getStock() + cantidad);
        repository.save(inv);
    }

    // Cuando logistica marca entregado, descuenta del stock
    public void descontarStock(String categoria, String producto, String detalle, Double cantidad) {
        repository.findByCategoriaAndProductoAndDetalle(categoria, producto, detalle).ifPresent(inv -> {
            inv.setStock(Math.max(0, inv.getStock() - cantidad));
            repository.save(inv);
        });
    }

    public Inventario actualizar(Long id, Inventario datos) {
        return repository.findById(id).map(inv -> {
            inv.setCategoria(datos.getCategoria());
            inv.setProducto(datos.getProducto());
            inv.setStock(datos.getStock());
            inv.setDetalle(datos.getDetalle());
            inv.setUnidadMedida(datos.getUnidadMedida());
            return repository.save(inv);
        }).orElse(null);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}
