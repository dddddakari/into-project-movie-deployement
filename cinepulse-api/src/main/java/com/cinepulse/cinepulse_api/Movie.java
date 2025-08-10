package com.cinepulse.cinepulse_api;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public String title;
    public Integer releaseYear;
    public String director;

    public Movie() {}

    public Movie(String t, Integer y, String d) {
        title = t;
        releaseYear = y;
        director = d;
    }
}
