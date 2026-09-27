package ge.autoprice.service;

import ge.autoprice.domain.FuelCompany;
import ge.autoprice.domain.FuelPrice;
import ge.autoprice.domain.FuelPriceHistory;
import ge.autoprice.domain.FuelStation;
import ge.autoprice.dto.Dto.*;
import ge.autoprice.repo.FuelCompanyRepository;
import ge.autoprice.repo.FuelPriceHistoryRepository;
import ge.autoprice.repo.FuelPriceRepository;
import ge.autoprice.repo.FuelStationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FuelService {
    private final FuelCompanyRepository companies;
    private final FuelPriceRepository prices;
    private final FuelPriceHistoryRepository history;
    private final FuelStationRepository stations;

    public List<FuelCompanyDto> companies() {
        Map<Long, Map<String, BigDecimal>> byCompany = new HashMap<>();
        for (FuelPrice p : prices.findByStationIsNull()) {
            byCompany.computeIfAbsent(p.getCompany().getId(), k -> new LinkedHashMap<>())
                    .put(p.getFuelType(), p.getPrice());
        }
        return companies.findAll().stream().map(c -> new FuelCompanyDto(
                c.getId(), c.getSlug(), c.getName(), c.getLogoUrl(), c.getWebsiteUrl(),
                c.getColorDot(), c.getChartColor(), c.getStationCount(), c.getLastChecked(),
                byCompany.getOrDefault(c.getId(), Map.of())
        )).toList();
    }

    public FuelCompanyDto company(String slug) {
        return companies().stream().filter(c -> c.slug().equals(slug)).findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    public FuelSummaryDto prices(String fuelType, String sort) {
        String type = fuelType == null ? "regular" : fuelType;
        List<FuelPrice> rows = prices.findByFuelTypeAndStationIsNull(type);
        List<FuelPriceRowDto> mapped = rows.stream().map(p -> new FuelPriceRowDto(
                p.getCompany().getId(), p.getCompany().getSlug(), p.getCompany().getName(),
                p.getCompany().getColorDot(), p.getCompany().getChartColor(),
                p.getPrice(), p.getLastChecked(), p.getCompany().getStationCount(), p.getSourceUrl()
        )).collect(Collectors.toCollection(ArrayList::new));

        Comparator<FuelPriceRowDto> cmp = Comparator.comparing(FuelPriceRowDto::price);
        mapped.sort(switch (sort == null ? "cheapest" : sort) {
            case "highest" -> cmp.reversed();
            case "updated" -> Comparator.comparing(FuelPriceRowDto::lastChecked, Comparator.nullsLast(Instant::compareTo)).reversed();
            default -> cmp;
        });

        if (mapped.isEmpty()) {
            return new FuelSummaryDto(type, null, null, null, null, null, mapped);
        }
        FuelPriceRowDto cheapest = mapped.stream().min(Comparator.comparing(FuelPriceRowDto::price)).orElse(null);
        FuelPriceRowDto highest = mapped.stream().max(Comparator.comparing(FuelPriceRowDto::price)).orElse(null);
        BigDecimal avg = mapped.stream().map(FuelPriceRowDto::price).reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(mapped.size()), 3, RoundingMode.HALF_UP);
        BigDecimal diff = highest.price().subtract(cheapest.price());
        BigDecimal change = change30d(type, avg);
        if ("decrease".equals(sort)) {
            mapped.sort(Comparator.comparing(FuelPriceRowDto::price));
        } else if ("increase".equals(sort)) {
            mapped.sort(Comparator.comparing(FuelPriceRowDto::price).reversed());
        }
        return new FuelSummaryDto(type, cheapest, highest, avg, diff, change, mapped);
    }

    public List<FuelHistoryPointDto> history(String fuelType, String range) {
        Instant from = switch (range == null ? "30d" : range) {
            case "7d" -> Instant.now().minus(7, ChronoUnit.DAYS);
            case "3m" -> Instant.now().minus(90, ChronoUnit.DAYS);
            case "6m" -> Instant.now().minus(180, ChronoUnit.DAYS);
            case "1y" -> Instant.now().minus(365, ChronoUnit.DAYS);
            case "All", "all" -> null;
            default -> Instant.now().minus(30, ChronoUnit.DAYS);
        };
        String type = fuelType == null ? "regular" : fuelType;
        Map<Long, String> slugs = companies.findAll().stream()
                .collect(Collectors.toMap(FuelCompany::getId, FuelCompany::getSlug));
        return fetchHistory(type, from).stream()
                .map(h -> new FuelHistoryPointDto(h.getObservedAt(), slugs.getOrDefault(h.getCompanyId(), "?"), h.getPrice()))
                .toList();
    }

    public List<FuelStationDto> stations(Long companyId, String city, String fuelType) {
        List<FuelStation> list = filterStations(companyId, city);
        return list.stream().map(this::toStation).toList();
    }

    private List<FuelStation> filterStations(Long companyId, String city) {
        boolean hasCity = city != null && !city.isBlank();
        if (companyId != null && hasCity) {
            return stations.findByCompanyIdAndCityIgnoreCaseAndLatitudeIsNotNullAndLongitudeIsNotNull(companyId, city);
        }
        if (companyId != null) {
            return stations.findByCompanyIdAndLatitudeIsNotNullAndLongitudeIsNotNull(companyId);
        }
        if (hasCity) {
            return stations.findByCityIgnoreCaseAndLatitudeIsNotNullAndLongitudeIsNotNull(city);
        }
        return stations.findByLatitudeIsNotNullAndLongitudeIsNotNull();
    }

    public FuelStationDto station(Long id) {
        FuelStation s = stations.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return toStation(s);
    }

    private FuelStationDto toStation(FuelStation s) {
        Map<String, BigDecimal> p = new LinkedHashMap<>();
        for (FuelPrice fp : prices.findByStationId(s.getId())) {
            p.put(fp.getFuelType(), fp.getPrice());
        }
        return new FuelStationDto(s.getId(), s.getCompany().getId(), s.getCompany().getSlug(),
                s.getCompany().getName(), s.getName(), s.getCity(), s.getAddress(),
                s.getLatitude(), s.getLongitude(), s.getLastChecked(), p);
    }

    private BigDecimal change30d(String type, BigDecimal currentAvg) {
        Instant from = Instant.now().minus(30, ChronoUnit.DAYS);
        List<FuelPriceHistory> pts = history.historySince(type, from);
        if (pts.isEmpty()) return BigDecimal.ZERO;
        BigDecimal old = pts.getFirst().getPrice();
        return currentAvg.subtract(old);
    }

    private List<FuelPriceHistory> fetchHistory(String fuelType, Instant from) {
        if (from == null) {
            return history.historyAll(fuelType);
        }
        return history.historySince(fuelType, from);
    }
}
