package ge.autoprice.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "stores")
public class Store {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String slug;
    private String name;
    @Column(name = "name_en")
    private String nameEn;
    private String type;
    @Column(name = "website_url")
    private String websiteUrl;
    @Column(name = "logo_url")
    private String logoUrl;
    private String description;
    private String city;
    @Column(name = "last_checked")
    private Instant lastChecked;
}
