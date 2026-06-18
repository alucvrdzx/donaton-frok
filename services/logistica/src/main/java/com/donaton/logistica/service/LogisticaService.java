package com.donaton.logistica.service;

import java.util.List;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.donaton.logistica.config.RabbitMQConfig;
import com.donaton.logistica.dto.LogisticaEvent;
import com.donaton.logistica.dto.LogisticaEstadoEvent;
import com.donaton.logistica.dto.LogisticaRequest;
import com.donaton.logistica.dto.LogisticaResponse;
import com.donaton.logistica.exception.ResourceNotFoundException;
import com.donaton.logistica.model.EstadoLogistica;
import com.donaton.logistica.model.Logistica;
import com.donaton.logistica.repository.LogisticaRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class LogisticaService {

    private final LogisticaRepository repository;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public LogisticaResponse crear(LogisticaRequest request) {
        Logistica l = new Logistica();
        l.setDestino(request.destino());
        l.setLat(request.lat());
        l.setLng(request.lng());
        l.setNecesidadId(request.necesidadId());
        l.setEstado(request.estado() != null ? request.estado() : EstadoLogistica.PENDIENTE);
        l.setCategoria(request.categoria());
        l.setProducto(request.producto());
        l.setCantidad(request.cantidad());
        l.setDetalle(request.detalle());
        return toResponse(repository.save(l));
    }

    @Transactional(readOnly = true)
    public Page<LogisticaResponse> listar(Pageable pageable) {
        return repository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public LogisticaResponse obtenerPorIdResponse(Long id) {
        return toResponse(obtenerPorId(id));
    }

    protected Logistica obtenerPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Envío no encontrado con ID: " + id));
    }

    // Actualiza el estado y si es ENTREGADO publica evento para descontar inventario
    @Transactional
    public LogisticaResponse actualizarEstado(Long id, String estado) {
        Logistica logistica = obtenerPorId(id);
        EstadoLogistica nuevoEstado = EstadoLogistica.valueOf(estado.toUpperCase());

        // Guard clause: si ya estaba ENTREGADO, no re-enviar evento
        if (logistica.getEstado() == EstadoLogistica.ENTREGADO) {
            return toResponse(logistica);
        }

        logistica.setEstado(nuevoEstado);
        Logistica guardada = repository.save(logistica);

        if (guardada.getNecesidadId() != null) {
            LogisticaEstadoEvent estadoEvent = new LogisticaEstadoEvent(guardada.getNecesidadId(), estado);
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY_ESTADO, estadoEvent);
            log.info("Evento enviado: envio.estado para Necesidad {} -> {}", guardada.getNecesidadId(), estado);
        }

        if (nuevoEstado == EstadoLogistica.ENTREGADO) {
            LogisticaEvent evento = new LogisticaEvent(
                    guardada.getCategoria(),
                    guardada.getProducto(),
                    guardada.getCantidad(),
                    guardada.getDetalle());
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY, evento);
            log.info("Evento enviado: envio.entregado para {} x {}", guardada.getProducto(), guardada.getCantidad());
        }

        return toResponse(guardada);
    }

    // Editar un envío completo — ajusta stock si ya estaba entregado
    @Transactional
    public LogisticaResponse actualizar(Long id, LogisticaRequest datos) {
        Logistica anterior = obtenerPorId(id);

        boolean estabaEntregado = anterior.getEstado() == EstadoLogistica.ENTREGADO;
        double cantidadAnterior = anterior.getCantidad();

        // Actualizar campos directamente en la entidad existente
        anterior.setDestino(datos.destino());
        anterior.setLat(datos.lat());
        anterior.setLng(datos.lng());
        anterior.setNecesidadId(datos.necesidadId());
        anterior.setCategoria(datos.categoria());
        anterior.setProducto(datos.producto());
        anterior.setCantidad(datos.cantidad());
        anterior.setDetalle(datos.detalle());
        if (datos.estado() != null) {
            anterior.setEstado(datos.estado());
        }
        Logistica guardada = repository.save(anterior);

        // Solo ajustar inventario si el envío ya estaba ENTREGADO
        if (estabaEntregado) {
            double diferencia = guardada.getCantidad() - cantidadAnterior;

            if (diferencia > 0) {
                // Aumentó la cantidad entregada → descontar más del inventario
                LogisticaEvent evento = new LogisticaEvent(
                        guardada.getCategoria(), guardada.getProducto(), diferencia, guardada.getDetalle());
                rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY, evento);
                log.info("Ajuste post-entrega: descontado {} más de {}", diferencia, guardada.getDetalle());
            } else if (diferencia < 0) {
                // Disminuyó la cantidad entregada → devolver stock
                LogisticaEvent evento = new LogisticaEvent(
                        guardada.getCategoria(), guardada.getProducto(), Math.abs(diferencia), guardada.getDetalle());
                rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY_REVERTIDO, evento);
                log.info("Ajuste post-entrega: devuelto {} de {}", Math.abs(diferencia), guardada.getDetalle());
            }
        }

        return toResponse(guardada);
    }

    // Eliminar un envío — si estaba ENTREGADO, devuelve todo el stock
    @Transactional
    public void eliminar(Long id) {
        Logistica logistica = obtenerPorId(id);

        // Si estaba ENTREGADO, devolver todo el stock al inventario
        if (logistica.getEstado() == EstadoLogistica.ENTREGADO) {
            LogisticaEvent evento = new LogisticaEvent(
                    logistica.getCategoria(),
                    logistica.getProducto(),
                    logistica.getCantidad(),
                    logistica.getDetalle());
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY_REVERTIDO, evento);
            log.info("Envío eliminado: devuelto {} de {} al inventario", logistica.getCantidad(), logistica.getDetalle());
        }

        repository.deleteById(id);
    }

    private LogisticaResponse toResponse(Logistica l) {
        return new LogisticaResponse(
            l.getId(),
            l.getDestino(),
            l.getLat(),
            l.getLng(),
            l.getNecesidadId(),
            l.getEstado(),
            l.getCategoria(),
            l.getProducto(),
            l.getCantidad(),
            l.getDetalle()
        );
    }
}