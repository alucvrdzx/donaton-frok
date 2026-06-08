package com.donaton.necesidades.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NecesidadEvent {

    private Long id;
    private String titulo;
    private Integer cantidadRequerida;
    private String ubicacion;
    private String estado;
}
