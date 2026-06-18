package com.donaton.inventario.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DonacionEvent {

    private String categoria;
    private String producto;
    private Double cantidad;
    private String detalle;
    private String unidadMedida;
}
