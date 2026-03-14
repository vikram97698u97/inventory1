export function predictStockout(product, movements) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // 1. Filter movement records for the last 7 days
  // 2. Only count records where type = "DELIVERY"
  const recentDeliveries = movements.filter(tx => {
    if (tx.productId !== product.id) return false;
    if (tx.type !== 'DELIVERY' && tx.type !== 'delivery') return false;
    
    const txDate = tx.date?.toDate ? tx.date.toDate() : new Date(tx.date);
    return txDate >= sevenDaysAgo;
  });

  // 3. Calculate total units sold in last 7 days
  const totalSold = recentDeliveries.reduce((sum, tx) => sum + Number(tx.quantity), 0);
  
  // 4. Calculate average daily sales
  const avgDailyRate = totalSold / 7;

  let status = "no_data";
  let bufferedDays = null;
  let estimatedStockoutDate = null;
  let result = {};

  if (avgDailyRate > 0) {
    // 5. Predict how many days the current stock will last
    const daysLeft = product.stock / avgDailyRate;
    
    // 6. Add a 15% safety buffer
    bufferedDays = daysLeft * 0.85;

    // 7. Predict stockout date
    estimatedStockoutDate = new Date(now.getTime() + bufferedDays * 24 * 60 * 60 * 1000);

    // STATUS LOGIC
    if (bufferedDays > 14) status = "safe";
    else if (bufferedDays >= 8) status = "low";
    else if (bufferedDays >= 4) status = "warning";
    else status = "critical";
  }

  result = {
    avgDailyRate: avgDailyRate.toFixed(2),
    daysRemaining: bufferedDays !== null ? Math.floor(bufferedDays) : null,
    estimatedStockoutDate,
    status
  };

  if (status !== "no_data") {
    // SUPPLY TYPE LOGIC
    if (product.supplyType === "sourced") {
      result.quantityNeeded = Math.ceil(avgDailyRate * 30);
      result.vendorName = product.vendorName || "Unknown Vendor";
      result.vendorEmail = product.vendorEmail || "";
      result.vendorPhone = product.vendorPhone || "";
      // Base suggested order date a bit before it runs out
      let suggested = new Date(estimatedStockoutDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (suggested < now) suggested = now;
      result.suggestedOrderDate = suggested;
    } else if (product.supplyType === "manufactured") {
      // Start production before stock runs out
      let startBy = new Date(estimatedStockoutDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (startBy < now) startBy = now;
      result.startProductionBy = startBy;
    }
  }

  return result;
}
