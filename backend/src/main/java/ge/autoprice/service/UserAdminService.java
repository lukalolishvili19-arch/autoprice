package ge.autoprice.service;

import ge.autoprice.domain.Favorite;
import ge.autoprice.domain.PriceAlert;
import ge.autoprice.domain.ScrapeError;
import ge.autoprice.domain.ScrapeRun;
import ge.autoprice.dto.Dto.AlertDto;
import ge.autoprice.dto.Dto.FavoriteDto;
import ge.autoprice.dto.Dto.ScrapeRunDto;
import ge.autoprice.repo.FavoriteRepository;
import ge.autoprice.repo.PriceAlertRepository;
import ge.autoprice.repo.ProductSourceMappingRepository;
import ge.autoprice.repo.ScrapeErrorRepository;
import ge.autoprice.repo.ScrapeRunRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserAdminService {
    private final FavoriteRepository favorites;
    private final PriceAlertRepository alerts;
    private final ScrapeRunRepository runs;
    private final ScrapeErrorRepository errors;
    private final ProductSourceMappingRepository mappings;
    private final RestClient.Builder rest;

    @Value("${app.collector-url}")
    private String collectorUrl;

    @Transactional(readOnly = true)
    public List<FavoriteDto> listFavorites(String clientKey) {
        return favorites.findByClientKeyOrderByCreatedAtDesc(clientKey).stream()
                .map(f -> new FavoriteDto(f.getId(), f.getItemType(), f.getItemId())).toList();
    }

    @Transactional
    public FavoriteDto addFavorite(String clientKey, String type, Long itemId) {
        return favorites.findByClientKeyAndItemTypeAndItemId(clientKey, type, itemId)
                .map(f -> new FavoriteDto(f.getId(), f.getItemType(), f.getItemId()))
                .orElseGet(() -> {
                    Favorite f = new Favorite();
                    f.setClientKey(clientKey);
                    f.setItemType(type);
                    f.setItemId(itemId);
                    f.setCreatedAt(Instant.now());
                    f = favorites.save(f);
                    return new FavoriteDto(f.getId(), f.getItemType(), f.getItemId());
                });
    }

    @Transactional
    public void removeFavorite(String clientKey, String type, Long itemId) {
        favorites.deleteByClientKeyAndItemTypeAndItemId(clientKey, type, itemId);
    }

    @Transactional(readOnly = true)
    public List<AlertDto> listAlerts(String clientKey) {
        return alerts.findByClientKeyOrderByCreatedAtDesc(clientKey).stream().map(this::toAlert).toList();
    }

    @Transactional
    public AlertDto createAlert(String clientKey, String alertType, Long productId, String fuelType,
                                Long companyId, String city, BigDecimal target) {
        PriceAlert a = new PriceAlert();
        a.setClientKey(clientKey);
        a.setAlertType(alertType);
        a.setProductId(productId);
        a.setFuelType(fuelType);
        a.setCompanyId(companyId);
        a.setCity(city);
        a.setTargetPrice(target);
        a.setActive(true);
        a.setCreatedAt(Instant.now());
        return toAlert(alerts.save(a));
    }

    @Transactional
    public void deleteAlert(Long id, String clientKey) {
        PriceAlert a = alerts.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!a.getClientKey().equals(clientKey)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        alerts.delete(a);
    }

    public List<ScrapeRunDto> runs() {
        return runs.findTop50ByOrderByStartedAtDesc().stream()
                .map(r -> new ScrapeRunDto(r.getId(), r.getCollector(), r.getStatus(), r.getStartedAt(),
                        r.getFinishedAt(), r.getItemsOk(), r.getItemsFailed(), r.getMessage()))
                .toList();
    }

    public List<ScrapeError> errors() {
        return errors.findTop100ByOrderByCreatedAtDesc();
    }

    public Object mappings() {
        return mappings.findAll();
    }

    public Map<String, Object> trigger(String collector) {
        try {
            var client = rest.build();
            return client.post()
                    .uri(collectorUrl + "/collect/" + collector)
                    .retrieve()
                    .body(Map.class);
        } catch (Exception e) {
            ScrapeRun run = new ScrapeRun();
            run.setCollector(collector);
            run.setStatus("FAILED");
            run.setStartedAt(Instant.now());
            run.setFinishedAt(Instant.now());
            run.setMessage("Collector unreachable: " + e.getMessage());
            runs.save(run);
            return Map.of("status", "FAILED", "message", e.getMessage());
        }
    }

    private AlertDto toAlert(PriceAlert a) {
        return new AlertDto(a.getId(), a.getAlertType(), a.getProductId(), a.getFuelType(),
                a.getCompanyId(), a.getCity(), a.getTargetPrice(), a.isActive());
    }
}
