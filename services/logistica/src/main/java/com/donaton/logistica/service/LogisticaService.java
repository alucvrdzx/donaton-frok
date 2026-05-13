package com.donaton.logistica.service;

import java.util.List;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.donaton.logistica.config.RabbitMQConfig;
import com.donaton.logistica.dto.LogisticaEvent;
import com.donaton.logistica.model.Logistica;
import com.donaton.logistica.repository.LogisticaRepository;

@Service
public class LogisticaService {

    @Autowired
    private LogisticaRepository repository;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public Logistica crear(Logistica l) {
        return repository.save(l);
    }

    public List<Logistica> listar() {
        return repository.findAll();
    }

    public Logistica obtenerPorId(Long id) {
        return repository.findById(id).orElse(null);
    }

    // Actualiza el estado y si es ENTREGADO publica evento para descontar inventario
    public Logistica actualizarEstado(Long id, String estado) {
        Logistica logistica = repository.findById(id).orElse(null);
        if (logistica == null) return null;

        // Guard clause: si ya estaba ENTREGADO, no re-enviar evento
        if ("ENTREGADO".equalsIgnoreCase(logistica.getEstado())) {
            return logistica;
        }

        logistica.setEstado(estado);
        Logistica guardada = repository.save(logistica);

        if ("ENTREGADO".equalsIgnoreCase(estado)) {
            LogisticaEvent evento = new LogisticaEvent(
                    guardada.getProducto(),
                    guardada.getCantidad(),
                    guardada.getDetalle());
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY, evento);
            System.out.println(">> Evento enviado: envio.entregado para " + guardada.getProducto() + " x " + guardada.getCantidad());
        }

        return guardada;
    }

    // Editar un envío completo — ajusta stock si ya estaba entregado
    public Logistica actualizar(Long id, Logistica datos) {
        Logistica anterior = repository.findById(id).orElse(null);
        if (anterior == null) return null;

        boolean estabaEntregado = "ENTREGADO".equalsIgnoreCase(anterior.getEstado());
        double cantidadAnterior = anterior.getCantidad();

        // Actualizar campos directamente en la entidad existente
        anterior.setDestino(datos.getDestino());
        anterior.setProducto(datos.getProducto());
        anterior.setCantidad(datos.getCantidad());
        anterior.setDetalle(datos.getDetalle());
        Logistica guardada = repository.save(anterior);

        // Solo ajustar inventario si el envío ya estaba ENTREGADO
        if (estabaEntregado) {
            double diferencia = guardada.getCantidad() - cantidadAnterior;

            if (diferencia > 0) {
                // Aumentó la cantidad entregada → descontar más del inventario
                LogisticaEvent evento = new LogisticaEvent(
                        guardada.getProducto(), diferencia, guardada.getDetalle());
                rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY, evento);
                System.out.println(">> Ajuste post-entrega: descontado " + diferencia + " más de " + guardada.getDetalle());
            } else if (diferencia < 0) {
                // Disminuyó la cantidad entregada → devolver stock
                LogisticaEvent evento = new LogisticaEvent(
                        guardada.getProducto(), Math.abs(diferencia), guardada.getDetalle());
                rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY_REVERTIDO, evento);
                System.out.println(">> Ajuste post-entrega: devuelto " + Math.abs(diferencia) + " de " + guardada.getDetalle());
            }
        }

        return guardada;
    }

    // Eliminar un envío — si estaba ENTREGADO, devuelve todo el stock
    public void eliminar(Long id) {
        Logistica logistica = repository.findById(id).orElse(null);
        if (logistica == null) return;

        // Si estaba ENTREGADO, devolver todo el stock al inventario
        if ("ENTREGADO".equalsIgnoreCase(logistica.getEstado())) {
            LogisticaEvent evento = new LogisticaEvent(
                    logistica.getProducto(),
                    logistica.getCantidad(),
                    logistica.getDetalle());
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY_REVERTIDO, evento);
            System.out.println(">> Envío eliminado: devuelto " + logistica.getCantidad() + " de " + logistica.getDetalle() + " al inventario");
        }

        repository.deleteById(id);
    }
}