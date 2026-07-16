export type Property = {
  id: string;
  address: string;
  purchase_price: number;
  current_value: number;
  down_payment: number;
  loan_balance: number;
  interest_rate: number;
  loan_term_years: number;
  monthly_rent: number;
  monthly_expenses: number;
};

export type Debt = {
  id: string;
  name: string;
  lender: string | null;
  balance: number;
  interest_rate: number;
  monthly_payment: number;
};

export type StockHolding = {
  id: string;
  ticker: string;
  shares: number;
  avg_cost: number;
};

/** Standard amortizing mortgage payment formula. */
export function monthlyMortgagePayment(property: Property): number {
  const principal = property.loan_balance;
  const monthlyRate = property.interest_rate / 100 / 12;
  const n = property.loan_term_years * 12;
  if (principal <= 0) return 0;
  if (monthlyRate === 0) return principal / n;
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) /
    (Math.pow(1 + monthlyRate, n) - 1)
  );
}

export function propertyMonthlyCashFlow(property: Property): number {
  const mortgage = monthlyMortgagePayment(property);
  return property.monthly_rent - property.monthly_expenses - mortgage;
}

/** Net Operating Income based cap rate - excludes mortgage, industry standard. */
export function capRate(property: Property): number {
  if (property.current_value <= 0) return 0;
  const annualNOI = (property.monthly_rent - property.monthly_expenses) * 12;
  return (annualNOI / property.current_value) * 100;
}

/** Cash-on-cash return - annual cash flow relative to actual cash invested. */
export function cashOnCashReturn(property: Property): number {
  if (property.down_payment <= 0) return 0;
  const annualCashFlow = propertyMonthlyCashFlow(property) * 12;
  return (annualCashFlow / property.down_payment) * 100;
}

export function propertyEquity(property: Property): number {
  return property.current_value - property.loan_balance;
}

export function totalStockValue(
  holdings: StockHolding[],
  livePrices: Record<string, number>
): number {
  return holdings.reduce((sum, h) => {
    const price = livePrices[h.ticker.toUpperCase()] ?? h.avg_cost;
    return sum + h.shares * price;
  }, 0);
}

export function totalStockCostBasis(holdings: StockHolding[]): number {
  return holdings.reduce((sum, h) => sum + h.shares * h.avg_cost, 0);
}

export function totalRealEstateEquity(properties: Property[]): number {
  return properties.reduce((sum, p) => sum + propertyEquity(p), 0);
}

export function totalOtherDebt(debts: Debt[]): number {
  return debts.reduce((sum, d) => sum + d.balance, 0);
}

export function netWorth(
  stockValue: number,
  realEstateEquity: number,
  otherDebt: number
): number {
  return stockValue + realEstateEquity - otherDebt;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
