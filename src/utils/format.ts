/**
 * Format a price from cents to dollars
 * @param cents Price in cents
 * @returns Formatted price in dollars
 */
export function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2);
}