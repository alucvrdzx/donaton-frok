package com.donaton.donaciones.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

import com.donaton.donaciones.model.Donacion;

public interface DonacionRepository extends JpaRepository<Donacion, Long> {

    Page<Donacion> findByDetalleContaining(String detalle, Pageable pageable);

    Page<Donacion> findByCategoria(String categoria, Pageable pageable);

    // Buscar duplicados exactos para evitar registros repetidos
    java.util.Optional<Donacion> findByNombreDonanteAndCategoriaAndProductoAndDetalle(
            String nombreDonante, String categoria, String producto, String detalle);

}