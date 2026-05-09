package com.donaton.logistica.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.donaton.logistica.model.Logistica;
import com.donaton.logistica.repository.LogisticaRepository;

@Service
public class LogisticaService {

    @Autowired
    private LogisticaRepository repository;

    public Logistica crear(Logistica l) {
        return repository.save(l);
    }

    public List<Logistica> listar() {
        return repository.findAll();
    }
}