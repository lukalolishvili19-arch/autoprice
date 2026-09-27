package ge.autoprice.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "scrape_runs")
public class ScrapeRun {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String collector;
    private String status;
    @Column(name = "started_at")
    private Instant startedAt;
    @Column(name = "finished_at")
    private Instant finishedAt;
    @Column(name = "items_ok")
    private int itemsOk;
    @Column(name = "items_failed")
    private int itemsFailed;
    private String message;
}
