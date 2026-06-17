package com.donaton.inventario.service;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.donaton.inventario.dto.DonacionEvent;
import com.donaton.inventario.dto.LogisticaEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class InventarioEventConsumer {

    private final InventarioService inventarioService;

    // Escucha donaciones → suma al stock
    @RabbitListener(queues = "inventario.donacion.queue")
    public void procesarDonacion(DonacionEvent evento) {
        log.info("Donación recibida: {} - {} | {} x {} {}",
                evento.getCategoria(), evento.getProducto(),
                evento.getDetalle(), evento.getCantidad(), evento.getUnidadMedida());
        inventarioService.agregarStock(
                evento.getCategoria(),
                evento.getProducto(),
                evento.getDetalle(),
                evento.getCantidad(),
                evento.getUnidadMedida());
    }

    // Escucha logistica → descuenta del stock cuando se entrega
    @RabbitListener(queues = "inventario.logistica.queue")
    public void procesarEntrega(LogisticaEvent evento) {
        log.info("Entrega recibida: {} - {} | {} x {}",
                evento.getCategoria(), evento.getProducto(),
                evento.getDetalle(), evento.getCantidad());
        inventarioService.descontarStock(
                evento.getCategoria(),
                evento.getProducto(),
                evento.getDetalle(),
                evento.getCantidad());
    }

    // Escucha reversiones de donaciones → descuenta del stock cuando se edita/elimina
    @RabbitListener(queues = "inventario.donacion.revert.queue")
    public void procesarReversion(DonacionEvent evento) {
        log.info("Reversión recibida: {} - {} | {} x {} {}",
                evento.getCategoria(), evento.getProducto(),
                evento.getDetalle(), evento.getCantidad(), evento.getUnidadMedida());
        inventarioService.descontarStock(
                evento.getCategoria(),
                evento.getProducto(),
                evento.getDetalle(),
                evento.getCantidad());
    }

    // Escucha reversiones de logística → devuelve stock cuando se edita/elimina un envío entregado
    @RabbitListener(queues = "inventario.logistica.revert.queue")
    public void procesarReversionLogistica(LogisticaEvent evento) {
        log.info("Reversión logística: devuelto {} de {} al inventario",
                evento.getCantidad(), evento.getDetalle());
        inventarioService.agregarStock(
                evento.getCategoria(),
                evento.getProducto(),
                evento.getDetalle(),
                evento.getCantidad(),
                "unidades");
    }
}
