package com.donaton.donaciones.factory;

import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import com.donaton.donaciones.model.DonacionDetalle;

@Component
public class DonacionFactory {

    public DonacionDetalle crearDonacion(String nombreDonante, String categoria, String producto, Double cantidad, String detalle) {

        DonacionDetalle donacion = new DonacionDetalle();
        donacion.setNombreDonante(nombreDonante);
        donacion.setFechaDonacion(LocalDateTime.now());
        donacion.setCategoria(categoria.toUpperCase());
        donacion.setProducto(producto);
        donacion.setCantidad(cantidad);
        donacion.setDetalle(detalle);

        // El factory decide la unidad de medida segun el tipo
        switch (categoria.toUpperCase()) {
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
