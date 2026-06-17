package com.donaton.donaciones.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.donaton.donaciones.model.Donacion;

public interface DonacionRepository extends JpaRepository<Donacion, Long> {

    List<Donacion> findByDetalleContaining(String detalle);

    List<Donacion> findByCategoria(String categoria);

    // Buscar duplicados exactos para evitar registros repetidos
    java.util.Optional<Donacion> findByNombreDonanteAndCategoriaAndProductoAndDetalle(
            String nombreDonante, String categoria, String producto, String detalle);

}