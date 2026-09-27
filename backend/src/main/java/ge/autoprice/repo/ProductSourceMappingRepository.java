package ge.autoprice.repo;

import ge.autoprice.domain.ProductSourceMapping;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductSourceMappingRepository extends JpaRepository<ProductSourceMapping, Long> {
}
