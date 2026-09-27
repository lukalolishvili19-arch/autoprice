package ge.autoprice.repo;

import ge.autoprice.domain.FuelStation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FuelStationRepository extends JpaRepository<FuelStation, Long> {
    List<FuelStation> findByCompanyId(Long companyId);

    List<FuelStation> findByLatitudeIsNotNullAndLongitudeIsNotNull();

    List<FuelStation> findByCompanyIdAndLatitudeIsNotNullAndLongitudeIsNotNull(Long companyId);

    List<FuelStation> findByCityIgnoreCaseAndLatitudeIsNotNullAndLongitudeIsNotNull(String city);

    List<FuelStation> findByCompanyIdAndCityIgnoreCaseAndLatitudeIsNotNullAndLongitudeIsNotNull(Long companyId, String city);
}
