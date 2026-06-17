package com.donaton.necesidades.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "donaton.exchange";
    public static final String QUEUE = "necesidad.creada.queue";
    public static final String ROUTING_KEY = "necesidad.creada";

    public static final String DONACION_QUEUE = "necesidades.donacion.queue";
    public static final String DONACION_ROUTING_KEY = "donacion.creada";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue queue() {
        return new Queue(QUEUE, true);
    }

    @Bean
    public Binding binding(Queue queue, TopicExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(ROUTING_KEY);
    }

    @Bean
    public Queue donacionQueue() {
        return new Queue(DONACION_QUEUE, true);
    }

    @Bean
    public Binding donacionBinding(Queue donacionQueue, TopicExchange exchange) {
        return BindingBuilder.bind(donacionQueue).to(exchange).with(DONACION_ROUTING_KEY);
    }

    public static final String LOGISTICA_ESTADO_QUEUE = "necesidades.logistica.estado.queue";
    public static final String LOGISTICA_ESTADO_ROUTING_KEY = "envio.estado";

    @Bean
    public Queue logisticaEstadoQueue() {
        return new Queue(LOGISTICA_ESTADO_QUEUE, true);
    }

    @Bean
    public Binding logisticaEstadoBinding(Queue logisticaEstadoQueue, TopicExchange exchange) {
        return BindingBuilder.bind(logisticaEstadoQueue).to(exchange).with(LOGISTICA_ESTADO_ROUTING_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    public com.fasterxml.jackson.databind.ObjectMapper objectMapper() {
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        mapper.findAndRegisterModules();
        return mapper;
    }
}
