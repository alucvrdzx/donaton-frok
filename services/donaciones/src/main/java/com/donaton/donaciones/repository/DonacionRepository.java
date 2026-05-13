package com.donaton.donaciones.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.donaton.donaciones.model.DonacionDetalle;

public interface DonacionRepository extends JpaRepository<DonacionDetalle, Long> {

    // JPA genera el SQL automáticamente con estos nombres
    List<DonacionDetalle> findByDetalleContaining(String detalle);

    List<DonacionDetalle> findByTipoDonacion(String tipoDonacion);

    // Buscar duplicados exactos para evitar registros repetidos
    java.util.Optional<DonacionDetalle> findByNombreDonanteAndTipoDonacionAndDetalle(
            String nombreDonante, String tipoDonacion, String detalle);

}