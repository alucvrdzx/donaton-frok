package com.donaton.necesidades.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record NecesidadRequest(
    @NotBlank(message = "El título es obligatorio")
    String titulo,

    @NotBlank(message = "La descripción es obligatoria")
    String descripcion,

    @NotNull(message = "La cantidad requerida es obligatoria")
    @Min(value = 1, message = "La cantidad requerida debe ser al menos 1")
    Double cantidadRequerida,

    @NotBlank(message = "La categoría es obligatoria")
    String categoria,

    @NotBlank(message = "El producto es obligatorio")
    String producto,

    @NotBlank(message = "La ubicación es obligatoria")
    String ubicacion,

    Double lat,
    Double lng
) {
}
