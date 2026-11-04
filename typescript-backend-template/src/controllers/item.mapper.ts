/** Conversione dal modello di dominio (Date) al DTO pubblico (stringhe ISO 8601 UTC). */
import type { Item } from '../repositories/item.repository.ts';
import type { ItemDto } from '../schemas/item.schema.ts';

export function toItemDto(item: Item): ItemDto {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}
