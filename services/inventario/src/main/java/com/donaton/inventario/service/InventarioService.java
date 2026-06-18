package com.donaton.inventario.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.donaton.inventario.dto.InventarioRequest;
import com.donaton.inventario.dto.InventarioResponse;
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
    public InventarioResponse crear(InventarioRequest request) {
        Inventario guardado = repository.findByCategoriaAndProductoAndDetalle(request.categoria(), request.producto(), request.detalle())
                .map(existente -> {
                    existente.setStock(existente.getStock() + request.stock());
                    return repository.save(existente);
                })
                .orElseGet(() -> repository.save(new Inventario(null, request.categoria(), request.producto(), request.stock(), request.detalle(), request.unidadMedida(), null)));
        return toResponse(guardado);
    }

    @Transactional(readOnly = true)
    public Page<InventarioResponse> listar(Pageable pageable) {
        return repository.findAll(pageable).map(this::toResponse);
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
    public InventarioResponse actualizar(Long id, InventarioRequest request) {
        Inventario inv = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de inventario no encontrado con ID: " + id));
        inv.setCategoria(request.categoria());
        inv.setProducto(request.producto());
        inv.setStock(request.stock());
        inv.setDetalle(request.detalle());
        inv.setUnidadMedida(request.unidadMedida());
        return toResponse(repository.save(inv));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Registro de inventario no encontrado con ID: " + id);
        }
        repository.deleteById(id);
    }

    private InventarioResponse toResponse(Inventario inv) {
        return new InventarioResponse(
                inv.getId(),
                inv.getCategoria(),
                inv.getProducto(),
                inv.getStock(),
                inv.getDetalle(),
                inv.getUnidadMedida()
        );
    }
}
