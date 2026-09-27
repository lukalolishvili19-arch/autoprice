package ge.autoprice.repo;

import ge.autoprice.domain.FuelCompany;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FuelCompanyRepository extends JpaRepository<FuelCompany, Long> {
    Optional<FuelCompany> findBySlug(String slug);
}
