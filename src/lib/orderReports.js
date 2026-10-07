export const isSale = (order) => ['confirmed', 'delivered'].includes(order.status);
export function summarizeOrders(orders) {
  const sales = orders.filter(isSale);
  const totalRevenue = sales.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const productStats = {};
  const daily = {};
  for (const order of orders) {
    const day = new Date(order.created_at).toLocaleDateString('en-CA', { timeZone: 'Asia/Dubai' });
    daily[day] ||= { day, orders: 0, revenue: 0 };
    daily[day].orders += 1;
    if (!isSale(order)) continue;
    daily[day].revenue += Number(order.total || 0);
    for (const item of order.items || []) {
      productStats[item.name] ||= { name: item.name, quantity: 0, revenue: 0 };
      productStats[item.name].quantity += item.quantity;
      productStats[item.name].revenue += item.quantity * Number(item.price);
    }
  }
  return {
    totalRevenue, totalOrders: orders.length,
    averageOrderValue: sales.length ? totalRevenue / sales.length : 0,
    totalCustomers: new Set(orders.map((order) => order.customer_phone).filter(Boolean)).size,
    topProducts: Object.values(productStats).sort((a, b) => b.quantity - a.quantity).slice(0, 5),
    recentOrders: orders.slice(0, 5),
    ordersByDay: Object.values(daily).sort((a, b) => a.day.localeCompare(b.day)),
  };
}
export function csvCell(value) {
  let text = String(value ?? '');
  if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export function exportCsv(filename, headers, rows) {
  const csv = '\uFEFF' + [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
