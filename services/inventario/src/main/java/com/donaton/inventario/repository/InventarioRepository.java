package com.donaton.inventario.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.donaton.inventario.model.Inventario;

public interface InventarioRepository extends JpaRepository<Inventario, Long> {

}
