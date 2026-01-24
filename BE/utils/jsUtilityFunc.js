// Helper function to compare values
export function isEqual(oldValue, newValue) {
      // Handle null/undefined
      if (oldValue === null && newValue === null) return true;
      if (oldValue === undefined && newValue === undefined) return true;
      if (oldValue === null || oldValue === undefined) return false;
      if (newValue === null || newValue === undefined) return false;

      // Convert to string for comparison (handles numbers, decimals, etc.)
      return String(oldValue) === String(newValue);
}