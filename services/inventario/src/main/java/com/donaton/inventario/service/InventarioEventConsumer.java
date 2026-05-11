package com.donaton.inventario.service;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.donaton.inventario.dto.DonacionEvent;

@Component
public class InventarioEventConsumer {

    @Autowired
    private InventarioService inventarioService;

    @RabbitListener(queues = "inventario.donacion.queue")
    public void procesarDonacion(DonacionEvent evento) {
        System.out.println(">> Evento recibido: " + evento.getTipoDonacion()
                + " | " + evento.getDetalle()
                + " x " + evento.getCantidad() + " " + evento.getUnidadMedida());
        inventarioService.agregarStock(
                evento.getTipoDonacion(),
                evento.getDetalle(),
                evento.getCantidad(),
                evento.getUnidadMedida());
    }
}
