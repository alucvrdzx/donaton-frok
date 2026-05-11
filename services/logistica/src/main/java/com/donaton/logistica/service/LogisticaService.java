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

        logistica.setEstado(estado);
        Logistica guardada = repository.save(logistica);

        if ("ENTREGADO".equalsIgnoreCase(estado)) {
            LogisticaEvent evento = new LogisticaEvent(
                    guardada.getProducto(),
                    guardada.getCantidad(),
                    guardada.getDetalle());
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY, evento);
            System.out.println(">> Evento enviado: envio.entregado para " + guardada.getProducto());
        }

        return guardada;
    }
}