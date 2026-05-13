package com.donaton.inventario.service;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.donaton.inventario.dto.DonacionEvent;
import com.donaton.inventario.dto.LogisticaEvent;

@Component
public class InventarioEventConsumer {

    @Autowired
    private InventarioService inventarioService;

    // Escucha donaciones → suma al stock
    @RabbitListener(queues = "inventario.donacion.queue")
    public void procesarDonacion(DonacionEvent evento) {
        System.out.println(">> Donacion recibida: " + evento.getTipoDonacion()
                + " | " + evento.getDetalle()
                + " x " + evento.getCantidad() + " " + evento.getUnidadMedida());
        inventarioService.agregarStock(
                evento.getTipoDonacion(),
                evento.getDetalle(),
                evento.getCantidad(),
                evento.getUnidadMedida());
    }

    // Escucha logistica → descuenta del stock cuando se entrega
    @RabbitListener(queues = "inventario.logistica.queue")
    public void procesarEntrega(LogisticaEvent evento) {
        System.out.println(">> Entrega recibida: " + evento.getProducto()
                + " | " + evento.getDetalle()
                + " x " + evento.getCantidad());
        inventarioService.descontarStock(
                evento.getProducto(),
                evento.getDetalle(),
                evento.getCantidad());
    }

    // Escucha reversiones de donaciones → descuenta del stock cuando se edita/elimina
    @RabbitListener(queues = "inventario.donacion.revert.queue")
    public void procesarReversion(DonacionEvent evento) {
        System.out.println(">> Reversion recibida: " + evento.getTipoDonacion()
                + " | " + evento.getDetalle()
                + " x " + evento.getCantidad() + " " + evento.getUnidadMedida());
        inventarioService.descontarStock(
                evento.getTipoDonacion(),
                evento.getDetalle(),
                evento.getCantidad());
    }

    // Escucha reversiones de logística → devuelve stock cuando se edita/elimina un envío entregado
    @RabbitListener(queues = "inventario.logistica.revert.queue")
    public void procesarReversionLogistica(LogisticaEvent evento) {
        System.out.println(">> Reversion logística: devuelto " + evento.getCantidad()
                + " de " + evento.getDetalle() + " al inventario");
        inventarioService.agregarStock(
                evento.getProducto(),
                evento.getDetalle(),
                evento.getCantidad(),
                "unidades");
    }
}
