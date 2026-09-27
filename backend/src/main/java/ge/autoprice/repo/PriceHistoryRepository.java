package ge.autoprice.repo;

import ge.autoprice.domain.PriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long> {
    List<PriceHistory> findByProductIdOrderByObservedAtAsc(Long productId);
}
