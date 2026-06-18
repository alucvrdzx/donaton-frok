package com.donaton.donaciones.dto;

import java.time.LocalDateTime;

public record DonacionResponse(
    Long id,
    String nombreDonante,
    String categoria,
    String producto,
    Double cantidad,
    String unidadMedida,
    String detalle,
    LocalDateTime fechaDonacion
) {
}
