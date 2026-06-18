package com.donaton.logistica.dto;

import com.donaton.logistica.model.EstadoLogistica;

public record LogisticaResponse(
    Long id,
    String destino,
    Double lat,
    Double lng,
    Long necesidadId,
    EstadoLogistica estado,
    String categoria,
    String producto,
    Double cantidad,
    String detalle
) {
}
