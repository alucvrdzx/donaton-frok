package com.donaton.logistica.dto;

import com.donaton.logistica.model.EstadoLogistica;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record LogisticaRequest(
    @NotBlank(message = "El destino es obligatorio")
    String destino,

    @NotNull(message = "La latitud es obligatoria")
    Double lat,

    @NotNull(message = "La longitud es obligatoria")
    Double lng,

    @NotNull(message = "El ID de necesidad es obligatorio")
    Long necesidadId,

    EstadoLogistica estado,

    @NotBlank(message = "La categoría es obligatoria")
    String categoria,

    @NotBlank(message = "El producto es obligatorio")
    String producto,

    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser mayor a cero")
    Double cantidad,

    String detalle
) {
}
