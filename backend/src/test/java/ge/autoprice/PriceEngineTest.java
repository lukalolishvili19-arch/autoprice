package ge.autoprice;

import ge.autoprice.domain.Offer;
import ge.autoprice.service.PriceEngine;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PriceEngineTest {
    @Test
    void computesStatsFromAvailableOffersOnly() {
        Offer a = offer(true, "145.00");
        Offer b = offer(true, "155.00");
        Offer c = offer(false, "99.00");
        var stats = PriceEngine.fromOffers(List.of(a, b, c));
        assertEquals(new BigDecimal("145.00"), stats.cheapest());
        assertEquals(new BigDecimal("155.00"), stats.highest());
        assertEquals(new BigDecimal("150.00"), stats.average());
        assertEquals(new BigDecimal("10.00"), stats.savings());
        assertEquals(2, stats.availableStoreCount());
    }

    @Test
    void emptyWhenNothingAvailable() {
        var stats = PriceEngine.fromOffers(List.of(offer(false, "10")));
        assertNull(stats.cheapest());
        assertEquals(0, stats.availableStoreCount());
    }

    private static Offer offer(boolean available, String price) {
        Offer o = new Offer();
        o.setAvailable(available);
        o.setPrice(new BigDecimal(price));
        return o;
    }
}
