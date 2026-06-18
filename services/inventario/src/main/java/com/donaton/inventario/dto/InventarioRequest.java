package com.donaton.inventario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record InventarioRequest(
    @NotBlank(message = "La categoría es obligatoria")
    String categoria,

    @NotBlank(message = "El producto es obligatorio")
    String producto,

    @NotNull(message = "El stock es obligatorio")
    @PositiveOrZero(message = "El stock no puede ser negativo")
    Double stock,

    @NotBlank(message = "El detalle es obligatorio")
    String detalle,

    @NotBlank(message = "La unidad de medida es obligatoria")
    String unidadMedida
) {
}
