package com.donaton.necesidades.service;

import com.donaton.necesidades.model.OutboxEvent;
import com.donaton.necesidades.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxScheduler {

    private final OutboxEventRepository outboxEventRepository;
    private final RabbitTemplate rabbitTemplate;

    @Scheduled(fixedDelay = 5000)
    public void processOutboxEvents() {
        List<OutboxEvent> pendingEvents = outboxEventRepository.findByStatusOrderByCreatedAtAsc("PENDING");
        
        for (OutboxEvent event : pendingEvents) {
            try {
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
