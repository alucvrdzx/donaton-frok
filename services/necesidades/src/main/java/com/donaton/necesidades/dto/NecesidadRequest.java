package com.donaton.necesidades.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NecesidadRequest {

    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;

    @NotNull(message = "La cantidad requerida es obligatoria")
    @Min(value = 1, message = "La cantidad requerida debe ser al menos 1")
    private Integer cantidadRequerida;

    @NotBlank(message = "La categoría es obligatoria")
    private String categoria;

    @NotBlank(message = "La ubicación es obligatoria")
    private String ubicacion;
}
