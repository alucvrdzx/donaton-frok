package com.donaton.donaciones.factory;

import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import com.donaton.donaciones.model.DonacionDetalle;

@Component
public class DonacionFactory {

    public DonacionDetalle crearDonacion(String nombreDonante, String tipoDonacion, Double cantidad) {

        DonacionDetalle donacion = new DonacionDetalle();
        donacion.setNombreDonante(nombreDonante);
        donacion.setFechaDonacion(LocalDateTime.now());
        donacion.setTipoDonacion(tipoDonacion.toUpperCase());
        donacion.setCantidad(cantidad);

        // El factory decide la unidad de medida segun el tipo
        switch (tipoDonacion.toUpperCase()) {
            case "ROPA":
                donacion.setUnidadMedida("unidades");
                break;
            case "ALIMENTO":
                donacion.setUnidadMedida("kilos");
                break;
            case "BEBESTIBLE":
                donacion.setUnidadMedida("litros");
                break;
            case "MONETARIA":
                donacion.setUnidadMedida("pesos");
                break;
            default:
                donacion.setUnidadMedida("unidades");
                break;
        }

        return donacion;
    }
}
