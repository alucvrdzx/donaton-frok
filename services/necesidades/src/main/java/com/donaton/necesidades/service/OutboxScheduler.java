package com.donaton.necesidades.service;

import com.donaton.necesidades.model.OutboxEvent;
import com.donaton.necesidades.repository.OutboxEventRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
public class OutboxScheduler {

    @Autowired
    private OutboxEventRepository outboxEventRepository;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Scheduled(fixedDelay = 5000)
    public void processOutboxEvents() {
        List<OutboxEvent> pendingEvents = outboxEventRepository.findByStatusOrderByCreatedAtAsc("PENDING");
        
        for (OutboxEvent event : pendingEvents) {
            try {
                // Envía el payload raw (debería tener la configuración adecuada en RabbitMQ)
                // Ojo: Si el payload es un JSON string pero Rabbit espera un Objeto, 
                // para mantenerlo simple enviamos el Objecto convirtiendo el String back a DTO, o cambiamos MessageConverter
                // Como el MessageConverter es Jackson2Json, si mandamos el string, lo envolverá en strings.
                // Es mejor que Outbox guarde el string y reconstruyamos el evento o cambiemos la configuración.
                // Para evitar complejidad, usaremos convertAndSend sin preocuparnos del tipo por ahora, 
                // o enviamos el mensaje raw reconstruyendo MessageProperties.
                
                // Lo más limpio es recrear un JSON puro:
                org.springframework.amqp.core.MessageProperties props = new org.springframework.amqp.core.MessageProperties();
                props.setContentType("application/json");
                org.springframework.amqp.core.Message message = new org.springframework.amqp.core.Message(event.getPayload().getBytes(), props);
                
                rabbitTemplate.send(event.getExchange(), event.getRoutingKey(), message);
                
                event.setStatus("PROCESSED");
                outboxEventRepository.save(event);
                log.info("OutboxEvent ID {} procesado y enviado a RabbitMQ", event.getId());
                
            } catch (Exception e) {
                log.error("Error al procesar OutboxEvent ID {}: {}", event.getId(), e.getMessage());
            }
        }
    }
}
