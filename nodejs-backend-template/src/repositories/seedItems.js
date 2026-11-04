// Dati di esempio caricati all'avvio, cosi' i frontend mostrano subito qualcosa.
// Gli id sono fissi (UUID v4 validi) per poterli usare comodamente in curl e nei test.

/**
 * Crea i 3 item iniziali con date di creazione distanziate di un minuto, nell'ordine dell'array.
 * @param {Date} [now]
 * @returns {import('../schemas/itemSchemas.js').Item[]}
 */
export function createSeedItems(now = new Date()) {
  const seeds = [
    {
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      name: 'Mechanical keyboard',
      description: 'Compact keyboard with hot-swappable switches.',
      price: 89.9,
    },
    {
      id: '16fd2706-8baf-433b-82eb-8c7fada847da',
      name: 'Wireless mouse',
      description: null,
      price: 24.5,
    },
    {
      id: 'a3bb189e-8bf9-4888-9912-ace4e6543002',
      name: 'USB-C hub',
      description: '7-in-1 hub with HDMI, USB-A and SD card reader.',
      price: 39,
    },
  ];

  return seeds.map((seed, index) => {
    const timestamp = new Date(now.getTime() - (seeds.length - index) * 60_000).toISOString();
    return { ...seed, createdAt: timestamp, updatedAt: timestamp };
  });
}
