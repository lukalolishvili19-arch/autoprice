package ge.autoprice.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "scrape_errors")
public class ScrapeError {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "run_id")
    private Long runId;
    private String collector;
    @Column(name = "source_url")
    private String sourceUrl;
    @Column(name = "error_message")
    private String errorMessage;
    @Column(name = "created_at")
    private Instant createdAt;
}
