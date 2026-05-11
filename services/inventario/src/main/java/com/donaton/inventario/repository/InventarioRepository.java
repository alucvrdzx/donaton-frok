package com.donaton.inventario.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.donaton.inventario.model.Inventario;

import java.util.Optional;

public interface InventarioRepository extends JpaRepository<Inventario, Long> {

    Optional<Inventario> findByProductoAndDetalle(String producto, String detalle);

}
