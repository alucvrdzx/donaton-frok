package com.donaton.necesidades.service;

import com.donaton.necesidades.config.RabbitMQConfig;
import com.donaton.necesidades.dto.DonacionEvent;
import com.donaton.necesidades.dto.NecesidadEvent;
import com.donaton.necesidades.dto.NecesidadRequest;
import com.donaton.necesidades.exception.ResourceNotFoundException;
import com.donaton.necesidades.model.EstadoNecesidad;
import com.donaton.necesidades.model.Necesidad;
import com.donaton.necesidades.repository.NecesidadRepository;
import com.donaton.necesidades.model.OutboxEvent;
import com.donaton.necesidades.repository.OutboxEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NecesidadService {

    private final NecesidadRepository necesidadRepository;
    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public Necesidad crearNecesidad(NecesidadRequest request) {
        Necesidad necesidad = new Necesidad();
        necesidad.setTitulo(request.getTitulo());
        necesidad.setDescripcion(request.getDescripcion());
        necesidad.setCantidadRequerida(request.getCantidadRequerida());
        necesidad.setCantidadCubierta(0.0);
        necesidad.setEstado(EstadoNecesidad.PENDIENTE);
        necesidad.setCategoria(request.getCategoria());
        necesidad.setProducto(request.getProducto());
        necesidad.setUbicacion(request.getUbicacion());
        necesidad.setLat(request.getLat());
        necesidad.setLng(request.getLng());

        Necesidad guardada = necesidadRepository.save(necesidad);
        log.info("Necesidad guardada en base de datos con ID: {}", guardada.getId());

        publicarEventoRabbit(guardada);
        return guardada;
    }

    public void publicarEventoRabbit(Necesidad necesidad) {
        try {
            NecesidadEvent event = new NecesidadEvent(
                    necesidad.getId(),
                    necesidad.getTitulo(),
                    necesidad.getCantidadRequerida(),
                    necesidad.getUbicacion(),
                    necesidad.getEstado().name()
            );
            
            OutboxEvent outboxEvent = new OutboxEvent();
            outboxEvent.setExchange(RabbitMQConfig.EXCHANGE);
            outboxEvent.setRoutingKey(RabbitMQConfig.ROUTING_KEY);
            outboxEvent.setPayload(objectMapper.writeValueAsString(event));
            
            outboxEventRepository.save(outboxEvent);
            log.info("Evento guardado en Outbox para la necesidad ID: {}", necesidad.getId());
        } catch (Exception e) {
            log.error("Error al serializar el evento para Outbox", e);
        }
    }

    @Transactional(readOnly = true)
    public List<Necesidad> listarTodas() {
        return necesidadRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Necesidad obtenerPorId(Long id) {
        return necesidadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Necesidad no encontrada con el ID: " + id));
    }

    @Transactional
    public Necesidad actualizarEstado(Long id, EstadoNecesidad nuevoEstado) {
        Necesidad necesidad = obtenerPorId(id);
        necesidad.setEstado(nuevoEstado);
        return necesidadRepository.save(necesidad);
    }

    @Transactional
    public void eliminar(Long id) {
        Necesidad necesidad = obtenerPorId(id);
        necesidadRepository.delete(necesidad);
    }

    @RabbitListener(queues = RabbitMQConfig.DONACION_QUEUE)
    @Transactional
    public void procesarMatchDonacion(DonacionEvent donacionEvent) {
        log.info("Procesando posible match para donacion de categoria: {} - producto: {}", donacionEvent.getCategoria(), donacionEvent.getProducto());
        
        List<EstadoNecesidad> estados = Arrays.asList(EstadoNecesidad.PENDIENTE, EstadoNecesidad.EN_PROCESO);
        List<Necesidad> necesidades = necesidadRepository.findByCategoriaIgnoreCaseAndProductoIgnoreCaseAndEstadoInOrderByCreadoEnAsc(donacionEvent.getCategoria(), donacionEvent.getProducto(), estados);
        
        double cantidadDisponible = donacionEvent.getCantidad();
        
        for (Necesidad necesidad : necesidades) {
            if (cantidadDisponible <= 0) break;
            
            double cantidadFaltante = necesidad.getCantidadRequerida() - necesidad.getCantidadCubierta();
            
            if (cantidadFaltante > 0) {
                double cantidadAAsignar = Math.min(cantidadDisponible, cantidadFaltante);
                
                necesidad.setCantidadCubierta(necesidad.getCantidadCubierta() + cantidadAAsignar);
                cantidadDisponible -= cantidadAAsignar;
                
                if (necesidad.getCantidadCubierta() >= necesidad.getCantidadRequerida()) {
                    necesidad.setEstado(EstadoNecesidad.CUBIERTA);
                } else {
                    necesidad.setEstado(EstadoNecesidad.EN_PROCESO);
                }
                
                necesidadRepository.save(necesidad);
                log.info("Match realizado! Asignados {} a la necesidad ID: {}", cantidadAAsignar, necesidad.getId());
            }
        }
    }
}
