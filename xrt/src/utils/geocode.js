/**
 * Geocode an address string using OpenStreetMap Nominatim (free, no API key).
 * @param {string} address - Full address or "address1, city, state zipcode"
 * @returns {Promise<{ lat: number, lng: number } | null>}
 */
export async function geocodeAddress(address) {
  if (!address || typeof address !== 'string' || !address.trim()) return null;
  try {
    const encoded = encodeURIComponent(address.trim());
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
      { headers: { Accept: 'application/json' } }
    );
    const data = await res.json();
    const first = data?.[0];
    if (first?.lat != null && first?.lon != null) {
      return { lat: Number(first.lat), lng: Number(first.lon) };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Build address string from delivery details for geocoding.
 * @param {{ address1?: string, city?: string, state?: string, zipcode?: string }} details
 * @returns {string}
 */
export function buildAddressString(details) {
  if (!details || typeof details !== 'object') return '';
  const parts = [
    details.address1,
    details.apt,
    details.city,
    [details.state, details.zipcode].filter(Boolean).join(' '),
  ].filter(Boolean);
  return parts.join(', ');
}
