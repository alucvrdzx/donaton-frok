package com.donaton.logistica.config;

import com.donaton.logistica.model.Sede;
import com.donaton.logistica.model.TipoSede;
import com.donaton.logistica.repository.SedeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final SedeRepository sedeRepository;

    @Override
    public void run(String... args) throws Exception {
        if (sedeRepository.count() == 0) {
            Sede central = new Sede(null, "Donatón Santiago (Central)", TipoSede.CENTRAL, -33.4489, -70.6693, "Av. Libertador Bernardo O'Higgins 1234, Santiago");
            Sede valpo = new Sede(null, "Donatón Valparaíso", TipoSede.REGIONAL, -33.0472, -71.6127, "Pedro Montt 1000, Valparaíso");
            Sede biobio = new Sede(null, "Donatón Biobío", TipoSede.REGIONAL, -36.8201, -73.0444, "Caupolicán 500, Concepción");
            Sede coquimbo = new Sede(null, "Donatón Coquimbo", TipoSede.REGIONAL, -29.9533, -71.3395, "Aldunate 800, Coquimbo");
            
            sedeRepository.saveAll(Arrays.asList(central, valpo, biobio, coquimbo));
            System.out.println("✅ Se han inicializado 4 Sedes Logísticas en la base de datos.");
        }
    }
}
