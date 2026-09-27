package ge.autoprice.repo;

import ge.autoprice.domain.ScrapeError;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScrapeErrorRepository extends JpaRepository<ScrapeError, Long> {
    List<ScrapeError> findTop100ByOrderByCreatedAtDesc();
}
