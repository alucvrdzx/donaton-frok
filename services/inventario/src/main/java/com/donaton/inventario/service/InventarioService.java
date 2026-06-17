package com.donaton.inventario.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.donaton.inventario.exception.ResourceNotFoundException;
import com.donaton.inventario.model.Inventario;
import com.donaton.inventario.repository.InventarioRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventarioService {

    private final InventarioRepository repository;

    // Creación manual desde el frontend — busca si ya existe para sumar en vez de duplicar
    @Transactional
    public Inventario crear(Inventario i) {
        return repository.findByCategoriaAndProductoAndDetalle(i.getCategoria(), i.getProducto(), i.getDetalle())
                .map(existente -> {
                    existente.setStock(existente.getStock() + i.getStock());
                    return repository.save(existente);
                })
                .orElseGet(() -> repository.save(i));
    }

    @Transactional(readOnly = true)
    public List<Inventario> listar() {
        return repository.findAll();
    }

    // Cuando llega una donacion via RabbitMQ, suma al stock
    @Transactional
    public void agregarStock(String categoria, String producto, String detalle, Double cantidad, String unidadMedida) {
        Inventario inv = repository.findByCategoriaAndProductoAndDetalle(categoria, producto, detalle)
                .orElse(new Inventario(null, categoria, producto, 0.0, detalle, unidadMedida, null));
        inv.setStock(inv.getStock() + cantidad);
        repository.save(inv);
        log.info("Stock agregado: {} {} de {} - {}", cantidad, unidadMedida, producto, detalle);
    }

    // Cuando logistica marca entregado, descuenta del stock
    @Transactional
    public void descontarStock(String categoria, String producto, String detalle, Double cantidad) {
        repository.findByCategoriaAndProductoAndDetalle(categoria, producto, detalle).ifPresent(inv -> {
            inv.setStock(Math.max(0, inv.getStock() - cantidad));
            repository.save(inv);
            log.info("Stock descontado: {} de {} - {}", cantidad, producto, detalle);
        });
    }

    @Transactional
    public Inventario actualizar(Long id, Inventario datos) {
        Inventario inv = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de inventario no encontrado con ID: " + id));
        inv.setCategoria(datos.getCategoria());
        inv.setProducto(datos.getProducto());
        inv.setStock(datos.getStock());
        inv.setDetalle(datos.getDetalle());
        inv.setUnidadMedida(datos.getUnidadMedida());
        return repository.save(inv);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Registro de inventario no encontrado con ID: " + id);
        }
        repository.deleteById(id);
    }
}
