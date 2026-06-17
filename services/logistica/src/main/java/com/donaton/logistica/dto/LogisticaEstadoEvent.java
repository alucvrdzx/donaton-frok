package com.donaton.logistica.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LogisticaEstadoEvent {
    private Long necesidadId;
    private String estado;
}
