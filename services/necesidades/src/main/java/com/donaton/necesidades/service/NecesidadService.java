package com.donaton.necesidades.service;

import com.donaton.necesidades.config.RabbitMQConfig;
import com.donaton.necesidades.dto.NecesidadEvent;
import com.donaton.necesidades.dto.NecesidadRequest;
import com.donaton.necesidades.exception.ResourceNotFoundException;
import com.donaton.necesidades.model.EstadoNecesidad;
import com.donaton.necesidades.model.Necesidad;
import com.donaton.necesidades.repository.NecesidadRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
public class NecesidadService {

    @Autowired
    private NecesidadRepository necesidadRepository;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Transactional
    public Necesidad crearNecesidad(NecesidadRequest request) {
        Necesidad necesidad = new Necesidad();
        necesidad.setTitulo(request.getTitulo());
        necesidad.setDescripcion(request.getDescripcion());
        necesidad.setCantidadRequerida(request.getCantidadRequerida());
        necesidad.setCantidadCubierta(0);
        necesidad.setEstado(EstadoNecesidad.PENDIENTE);
        necesidad.setCategoria(request.getCategoria());
        necesidad.setUbicacion(request.getUbicacion());

        Necesidad guardada = necesidadRepository.save(necesidad);
        log.info("Necesidad guardada en base de datos con ID: {}", guardada.getId());

        publicarEventoRabbit(guardada);
        return guardada;
    }

    @CircuitBreaker(name = "rabbitMQPub", fallbackMethod = "fallbackPublicarEvento")
    public void publicarEventoRabbit(Necesidad necesidad) {
        NecesidadEvent event = new NecesidadEvent(
                necesidad.getId(),
                necesidad.getTitulo(),
                necesidad.getCantidadRequerida(),
                necesidad.getUbicacion(),
                necesidad.getEstado().name()
        );
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.ROUTING_KEY,
                event
        );
        log.info("Evento publicado en RabbitMQ para la necesidad ID: {}", necesidad.getId());
    }

    public void fallbackPublicarEvento(Necesidad necesidad, Throwable t) {
        log.error("Fallo al publicar evento en RabbitMQ para necesidad ID: {}. Causa: {}",
                necesidad.getId(), t.getMessage());
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
}
