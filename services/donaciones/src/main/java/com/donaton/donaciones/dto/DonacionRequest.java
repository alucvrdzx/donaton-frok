package com.donaton.donaciones.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record DonacionRequest(
    @NotBlank(message = "El nombre del donante es obligatorio")
    String nombreDonante,

    @NotBlank(message = "La categoría es obligatoria")
    String categoria,

    @NotBlank(message = "El producto es obligatorio")
    String producto,

    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser mayor a cero")
    Double cantidad,

    @NotBlank(message = "El detalle es obligatorio")
    String detalle
) {
}
