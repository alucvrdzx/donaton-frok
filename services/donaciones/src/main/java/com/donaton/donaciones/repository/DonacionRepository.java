package com.donaton.donaciones.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.donaton.donaciones.model.DonacionDetalle;

public interface DonacionRepository extends JpaRepository<DonacionDetalle, Long> {

    List<DonacionDetalle> findByDetalleContaining(String detalle);

    List<DonacionDetalle> findByCategoria(String categoria);

    // Buscar duplicados exactos para evitar registros repetidos
    java.util.Optional<DonacionDetalle> findByNombreDonanteAndCategoriaAndProductoAndDetalle(
            String nombreDonante, String categoria, String producto, String detalle);

}