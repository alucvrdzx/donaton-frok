package com.donaton.inventario.config;

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

    // Cola para eventos de donaciones
    public static final String DONACION_QUEUE = "inventario.donacion.queue";
    public static final String DONACION_ROUTING_KEY = "donacion.creada";

    // Cola para eventos de logistica
    public static final String LOGISTICA_QUEUE = "inventario.logistica.queue";
    public static final String LOGISTICA_ROUTING_KEY = "envio.entregado";

    // Cola para revertir donaciones (editar/eliminar)
    public static final String REVERT_QUEUE = "inventario.donacion.revert.queue";
    public static final String REVERT_ROUTING_KEY = "donacion.revertida";

    // Cola para revertir logística (editar/eliminar envío entregado)
    public static final String LOGISTICA_REVERT_QUEUE = "inventario.logistica.revert.queue";
    public static final String LOGISTICA_REVERT_ROUTING_KEY = "envio.revertido";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue donacionQueue() {
        return new Queue(DONACION_QUEUE, true);
    }

    @Bean
    public Queue logisticaQueue() {
        return new Queue(LOGISTICA_QUEUE, true);
    }

    @Bean
    public Queue revertQueue() {
        return new Queue(REVERT_QUEUE, true);
    }

    @Bean
    public Queue logisticaRevertQueue() {
        return new Queue(LOGISTICA_REVERT_QUEUE, true);
    }

    @Bean
    public Binding donacionBinding(Queue donacionQueue, TopicExchange exchange) {
        return BindingBuilder.bind(donacionQueue).to(exchange).with(DONACION_ROUTING_KEY);
    }

    @Bean
    public Binding logisticaBinding(Queue logisticaQueue, TopicExchange exchange) {
        return BindingBuilder.bind(logisticaQueue).to(exchange).with(LOGISTICA_ROUTING_KEY);
    }

    @Bean
    public Binding revertBinding(Queue revertQueue, TopicExchange exchange) {
        return BindingBuilder.bind(revertQueue).to(exchange).with(REVERT_ROUTING_KEY);
    }

    @Bean
    public Binding logisticaRevertBinding(Queue logisticaRevertQueue, TopicExchange exchange) {
        return BindingBuilder.bind(logisticaRevertQueue).to(exchange).with(LOGISTICA_REVERT_ROUTING_KEY);
    }

    @Bean
    public org.springframework.amqp.support.converter.MessageConverter messageConverter() {
        return new org.springframework.amqp.support.converter.Jackson2JsonMessageConverter();
    }
}
