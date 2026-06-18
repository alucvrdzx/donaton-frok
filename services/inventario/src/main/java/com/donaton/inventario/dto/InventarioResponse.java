package com.donaton.inventario.dto;

public record InventarioResponse(
    Long id,
    String categoria,
    String producto,
    Double stock,
    String detalle,
    String unidadMedida
) {
}
