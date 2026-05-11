package com.donaton.inventario.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DonacionEvent {

    private String tipoDonacion;
    private Double cantidad;
    private String detalle;
    private String unidadMedida;
}
