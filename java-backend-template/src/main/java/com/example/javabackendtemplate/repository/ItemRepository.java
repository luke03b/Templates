/*
 * Contratto del layer di accesso ai dati per gli Item.
 * Il service dipende da questa interfaccia, non dall'implementazione: per passare a un database
 * basta creare una nuova classe che la implementa (es. con Spring Data JPA) e registrarla come bean.
 */
package com.example.javabackendtemplate.repository;

import com.example.javabackendtemplate.domain.Item;
import java.util.List;
import java.util.Optional;

public interface ItemRepository {

    /** Tutti gli item ordinati per data di creazione crescente. */
    List<Item> findAll();

    /** {@link Optional} vuoto se l'id non esiste (invece di restituire null). */
    Optional<Item> findById(String id);

    /** Inserisce o sostituisce l'item con lo stesso id e lo restituisce. */
    Item save(Item item);

    /** Elimina l'item; restituisce {@code true} se esisteva. */
    boolean deleteById(String id);
}
