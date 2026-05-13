package com.donaton.donaciones.config;

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
    public static final String QUEUE = "inventario.donacion.queue";
    public static final String ROUTING_KEY = "donacion.creada";

    public static final String REVERT_QUEUE = "inventario.donacion.revert.queue";
    public static final String ROUTING_KEY_REVERTIDA = "donacion.revertida";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue queue() {
        return new Queue(QUEUE, true);
    }

    @Bean
    public Queue revertQueue() {
        return new Queue(REVERT_QUEUE, true);
    }

    @Bean
    public Binding binding(Queue queue, TopicExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(ROUTING_KEY);
    }

    @Bean
    public Binding revertBinding(Queue revertQueue, TopicExchange exchange) {
        return BindingBuilder.bind(revertQueue).to(exchange).with(ROUTING_KEY_REVERTIDA);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
