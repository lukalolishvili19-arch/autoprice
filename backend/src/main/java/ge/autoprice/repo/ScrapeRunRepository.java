package ge.autoprice.repo;

import ge.autoprice.domain.ScrapeRun;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScrapeRunRepository extends JpaRepository<ScrapeRun, Long> {
    List<ScrapeRun> findTop50ByOrderByStartedAtDesc();
}
