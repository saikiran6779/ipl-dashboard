package com.ipl.dashboard.service;

import com.ipl.dashboard.dto.VenueDTO;
import com.ipl.dashboard.model.Venue;
import com.ipl.dashboard.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class VenueService {

    private final VenueRepository venueRepository;

    @Transactional(readOnly = true)
    public List<VenueDTO> getAllVenues() {
        return venueRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VenueDTO getVenueById(Long id) {
        return venueRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new NoSuchElementException("Venue not found: " + id));
    }

    public VenueDTO createVenue(VenueDTO dto) {
        Venue saved = venueRepository.save(Venue.builder()
                .name(dto.getName()).city(dto.getCity()).imageUrl(dto.getImageUrl()).build());
        return toDTO(saved);
    }

    public VenueDTO updateVenue(Long id, VenueDTO dto) {
        Venue v = venueRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Venue not found: " + id));
        v.setName(dto.getName());
        v.setCity(dto.getCity());
        v.setImageUrl(dto.getImageUrl());
        return toDTO(venueRepository.save(v));
    }

    public void deleteVenue(Long id) {
        if (!venueRepository.existsById(id)) throw new NoSuchElementException("Venue not found: " + id);
        venueRepository.deleteById(id);
    }

    public VenueDTO toDTO(Venue v) {
        return VenueDTO.builder().id(v.getId()).name(v.getName()).city(v.getCity()).imageUrl(v.getImageUrl()).build();
    }
}
