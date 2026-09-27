package ge.autoprice.service;

import ge.autoprice.domain.Offer;
import ge.autoprice.dto.Dto.PriceStats;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

public final class PriceEngine {
    private PriceEngine() {}

    public static PriceStats fromOffers(List<Offer> offers) {
        var priced = offers.stream()
                .filter(o -> o.isAvailable() && o.getPrice() != null)
                .map(Offer::getPrice)
                .toList();
        if (priced.isEmpty()) {
            return new PriceStats(null, null, null, null, 0);
        }
        BigDecimal cheapest = priced.stream().min(BigDecimal::compareTo).orElse(null);
        BigDecimal highest = priced.stream().max(BigDecimal::compareTo).orElse(null);
        BigDecimal sum = priced.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal average = sum.divide(BigDecimal.valueOf(priced.size()), 2, RoundingMode.HALF_UP);
        BigDecimal savings = highest.subtract(cheapest);
        return new PriceStats(cheapest, highest, average, savings, priced.size());
    }
}
