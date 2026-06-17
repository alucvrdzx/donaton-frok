package com.donaton.logistica.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "donaton.exchange";
    public static final String QUEUE = "inventario.logistica.queue";
    public static final String ROUTING_KEY = "envio.entregado";

    public static final String REVERT_QUEUE = "inventario.logistica.revert.queue";
    public static final String ROUTING_KEY_REVERTIDO = "envio.revertido";

    public static final String ROUTING_KEY_ESTADO = "envio.estado";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue logisticaQueue() {
        return new Queue(QUEUE, true);
    }

    @Bean
    public Queue logisticaRevertQueue() {
        return new Queue(REVERT_QUEUE, true);
    }

    @Bean
    public Binding logisticaBinding(Queue logisticaQueue, TopicExchange exchange) {
        return BindingBuilder.bind(logisticaQueue).to(exchange).with(ROUTING_KEY);
    }

    @Bean
    public Binding logisticaRevertBinding(Queue logisticaRevertQueue, TopicExchange exchange) {
        return BindingBuilder.bind(logisticaRevertQueue).to(exchange).with(ROUTING_KEY_REVERTIDO);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
