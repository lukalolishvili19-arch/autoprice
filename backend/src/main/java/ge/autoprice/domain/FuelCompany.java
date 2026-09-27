package ge.autoprice.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "fuel_companies")
public class FuelCompany {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String slug;
    private String name;
    @Column(name = "logo_url")
    private String logoUrl;
    @Column(name = "website_url")
    private String websiteUrl;
    @Column(name = "color_dot")
    private String colorDot;
    @Column(name = "chart_color")
    private String chartColor;
    @Column(name = "station_count")
    private Integer stationCount;
    @Column(name = "last_checked")
    private Instant lastChecked;
}
