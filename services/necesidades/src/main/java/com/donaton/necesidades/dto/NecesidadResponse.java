package com.donaton.necesidades.dto;

import java.time.LocalDateTime;

import com.donaton.necesidades.model.EstadoNecesidad;

public record NecesidadResponse(
    Long id,
    String titulo,
    String descripcion,
    Double cantidadRequerida,
    Double cantidadCubierta,
    EstadoNecesidad estado,
    String categoria,
    String producto,
    String ubicacion,
    Double lat,
    Double lng,
    LocalDateTime creadoEn
) {
}
