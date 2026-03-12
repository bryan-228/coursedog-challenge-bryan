// Helper functions

// Adds up the prices of the items in the cart and returns the total as a string.
// This is used to verify product totals in checkout without hardcording values.
export function addPrices(...prices: string[]): string {
    const cents = prices.reduce((sum, p) => {
      return sum + Math.round(parseFloat(p.replace('$', '')) * 100);
    }, 0);
    return `$${(cents / 100).toFixed(2)}`;
  }  