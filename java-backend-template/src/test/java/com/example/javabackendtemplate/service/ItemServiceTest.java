/*
 * Unit test di ItemService: niente Spring, solo il service con un repository in memoria reale e un orologio
 * controllabile, così i test sono veloci e deterministici.
 */
package com.example.javabackendtemplate.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.example.javabackendtemplate.dto.ItemInput;
import com.example.javabackendtemplate.dto.ItemResponse;
import com.example.javabackendtemplate.exception.ResourceNotFoundException;
import com.example.javabackendtemplate.repository.InMemoryItemRepository;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ItemServiceTest {

    private static final Instant START = Instant.parse("2026-11-03T18:00:00Z");

    private MutableClock clock;
    private ItemService service;

    @BeforeEach
    void setUp() {
        clock = new MutableClock(START);
        service = new ItemService(new InMemoryItemRepository(), clock);
    }

    @Test
    void createAssignsIdAndTimestamps() {
        ItemResponse created = service.create(input("Lamp", "LED", "10.50"));

        assertThat(created.id()).matches("[0-9a-f-]{36}");
        assertThat(created.name()).isEqualTo("Lamp");
        assertThat(created.description()).isEqualTo("LED");
        assertThat(created.price()).isEqualByComparingTo("10.50");
        assertThat(created.createdAt()).isEqualTo(START);
        assertThat(created.updatedAt()).isEqualTo(START);
    }

    @Test
    void findAllReturnsItemsOrderedByCreatedAt() {
        service.create(input("First", null, "1"));
        clock.advance(Duration.ofSeconds(1));
        service.create(input("Second", null, "2"));

        assertThat(service.findAll()).extracting(ItemResponse::name).containsExactly("First", "Second");
    }

    @Test
    void findByIdThrowsWhenMissing() {
        assertThatThrownBy(() -> service.findById("missing"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("missing");
    }

    @Test
    void updateKeepsCreatedAtAndRefreshesUpdatedAt() {
        ItemResponse created = service.create(input("Lamp", null, "10"));
        clock.advance(Duration.ofMinutes(5));

        ItemResponse updated = service.update(created.id(), input("Lamp XL", "Bigger", "12"));

        assertThat(updated.id()).isEqualTo(created.id());
        assertThat(updated.name()).isEqualTo("Lamp XL");
        assertThat(updated.createdAt()).isEqualTo(START);
        assertThat(updated.updatedAt()).isEqualTo(START.plus(Duration.ofMinutes(5)));
        assertThat(service.findById(created.id())).isEqualTo(updated);
    }

    @Test
    void updateThrowsWhenMissing() {
        assertThatThrownBy(() -> service.update("missing", input("X", null, "1")))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deleteRemovesItem() {
        ItemResponse created = service.create(input("Lamp", null, "10"));

        service.delete(created.id());

        assertThat(service.findAll()).isEmpty();
    }

    @Test
    void deleteThrowsWhenMissing() {
        assertThatThrownBy(() -> service.delete("missing")).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void inputTrimsName() {
        assertThat(input("  Lamp  ", null, "1").name()).isEqualTo("Lamp");
    }

    private static ItemInput input(String name, String description, String price) {
        return new ItemInput(name, description, new BigDecimal(price));
    }

    /** Orologio di test che si può far avanzare a mano. */
    private static final class MutableClock extends Clock {
        private Instant now;

        MutableClock(Instant now) {
            this.now = now;
        }

        void advance(Duration duration) {
            now = now.plus(duration);
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return now;
        }
    }
}
