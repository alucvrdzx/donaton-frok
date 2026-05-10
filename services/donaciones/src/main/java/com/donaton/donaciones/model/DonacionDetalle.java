package com.donaton.donaciones.model;

import jakarta.persistence.Entity;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class DonacionDetalle extends Donacion {

    private String tipoDonacion;

    private Double cantidad;

    private String unidadMedida;
}
