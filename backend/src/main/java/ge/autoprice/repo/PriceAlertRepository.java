package ge.autoprice.repo;

import ge.autoprice.domain.PriceAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PriceAlertRepository extends JpaRepository<PriceAlert, Long> {
    List<PriceAlert> findByClientKeyOrderByCreatedAtDesc(String clientKey);
}
