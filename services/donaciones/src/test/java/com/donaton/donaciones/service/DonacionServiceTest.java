package com.donaton.donaciones.service;

import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import com.donaton.donaciones.factory.DonacionFactory;
import com.donaton.donaciones.repository.DonacionRepository;

@ExtendWith(MockitoExtension.class)
class DonacionServiceTest {

    @Mock
    private DonacionRepository repository;

    @Mock
    private DonacionFactory factory;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private DonacionService service;

}