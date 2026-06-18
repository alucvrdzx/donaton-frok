package com.donaton.donaciones.model;

import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
public class DonacionDetalle extends Donacion {
    private String categoria;

    private String producto;
    private Double cantidad;

    private String unidadMedida;

    private String detalle;

}
