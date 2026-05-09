package com.donaton.donaciones.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.donaton.donaciones.model.Donacion;

public interface DonacionRepository extends JpaRepository<Donacion, Long> {

}