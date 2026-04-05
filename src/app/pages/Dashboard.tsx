import type { CSSProperties } from 'react';
import { useAppData } from '../store/AppContext';
import { mockGigWorker } from '../data/mockData';
import { FinancialHealthScore } from '../components/dashboard/FinancialHealthScore';
import { AIInsights } from '../components/dashboard/AIInsights';
import { CashRunway } from '../components/dashboard/CashRunway';
import { IncomeStabilityCard } from '../components/dashboard/IncomeStabilityCard';
import { SafeBudgetIndicator } from '../components/dashboard/SafeBudgetIndicator';
import { SpendingAnalysis } from '../components/dashboard/SpendingAnalysis';

// ── INPUT DATA (seed for now, replace with parsed PDF data later) ──
const USER_PROFILE = {
  income_worst_month: 1900,
  income_typical_month: 2800,
  income_best_month: 4200,
  monthly_essential_expenses: 1700,
  liquid_savings_now: 140,
  monthly_debt_payments: 220,
  has_income_protection: false,
};

// ── FORMULA 1: Buffer target (JP Morgan Chase Institute — 14% of annual take-home) ──
function calcBufferTarget(typicalMonthly: number) {
  return Math.round(typicalMonthly * 12 * 0.14);
}

// ── FORMULA 2: Weekly essential burn ──
function calcWeeklyBurn(monthlyExpenses: number) {
  return Math.round(monthlyExpenses / 4.33);
}

// ── FORMULA 3: Liquidity in weeks ──
function calcLiquidityWeeks(savings: number, monthlyExpenses: number) {
  const weeklyBurn = calcWeeklyBurn(monthlyExpenses);
  return weeklyBurn > 0 ? Math.round((savings / weeklyBurn) * 10) / 10 : 0;
}

// ── FORMULA 4: Income volatility CV (simplified JPMCI method) ──
function calcVolatilityCV(low: number, avg: number, high: number) {
  if (avg === 0) return 0;
  return Math.round(((high - low) / avg) * 0.5 * 100) / 100;
}

// ── FORMULA 5: Worst month surplus ──
function calcWorstMonthSurplus(worstIncome: number, expenses: number, debtPayments: number) {
  return worstIncome - expenses - debtPayments;
}

// ── FORMULA 6: Dynamic fragility threshold (1 week of avg income) ──
function calcFragilityThreshold(typicalMonthly: number) {
  return Math.round(typicalMonthly / 4.33);
}

// ── FORMULA 7: Weekly gap (what user is short this week) ──
function calcWeeklyGap(savings: number, monthlyExpenses: number) {
  const weeklyBurn = calcWeeklyBurn(monthlyExpenses);
  const gap = weeklyBurn - savings;
  return gap > 0 ? gap : 0;
}

// ── FORMULA 8: Financial state label ──
function calcState(savings: number, bufferTarget: number, liquidityWeeks: number, cv: number) {
  if (savings < calcFragilityThreshold(USER_PROFILE.income_typical_month)) {
    return "Distressed";
  }
  if (savings < bufferTarget * 0.25 || cv > 0.55) return "Fragile";
  if (savings < bufferTarget) return "Building";
  return "Resilient";
}

// ── FORMULA 9: Score 0–100 ──
function calcScore(savings: number, bufferTarget: number, cv: number, hasProtection: boolean, worstSurplus: number) {
  const bufferScore = Math.min((savings / bufferTarget), 1.0) * 35;
  const cvCritical = 0.75;
  const volatilityScore = Math.max((1 - cv / cvCritical), 0) * 25;
  const surplusScore = worstSurplus > 0
    ? Math.min(worstSurplus / USER_PROFILE.monthly_essential_expenses, 1.0) * 20
    : 0;
  const protectionScore = hasProtection ? 20 : 0;
  return Math.min(Math.round(bufferScore + volatilityScore + surplusScore + protectionScore), 100);
}

// ── FORMULA 10: Income trend from weekly data ──
function calcTrend(weeklyAmounts: number[]) {
  if (weeklyAmounts.length < 2) return "flat";
  const first = weeklyAmounts[0];
  const last = weeklyAmounts[weeklyAmounts.length - 1];
  if (last > first * 1.05) return "up";
  if (last < first * 0.95) return "down";
  return "flat";
}

// ── FORMULA 11: Buffer gap ──
function calcBufferGap(savings: number, bufferTarget: number) {
  return Math.max(0, bufferTarget - savings);
}

// ── FORMULA 12: Weeks to buffer target at 10% savings rate ──
function calcWeeksToTarget(gap: number, typicalMonthly: number) {
  const weeklySavings = (typicalMonthly * 0.10) / 4.33;
  return weeklySavings > 0 ? Math.round(gap / weeklySavings) : 0;
}

// ── Colors used by new cards ──
const C = {
  amber: "#92400e",
  amberLight: "#fffbeb",
  amberBorder: "#fde68a",
  green: "#065f46",
  greenLight: "#ecfdf5",
  muted: "#6b7280",
  pill: "#f3f4f6",
};

const card: CSSProperties = {
  borderRadius: 16,
  padding: "16px 20px",
  border: "1px solid",
};

export function Dashboard() {
  const { userData } = useAppData();
  const data = userData ?? mockGigWorker;

  // ── Computed values ──
  const weeklyAmounts = [540, 420, 710, 640];

  const bufferTarget = calcBufferTarget(USER_PROFILE.income_typical_month);
  const weeklyBurn = calcWeeklyBurn(USER_PROFILE.monthly_essential_expenses);
  const liquidityWeeks = calcLiquidityWeeks(
    USER_PROFILE.liquid_savings_now,
    USER_PROFILE.monthly_essential_expenses
  );
  const cv = calcVolatilityCV(
    USER_PROFILE.income_worst_month,
    USER_PROFILE.income_typical_month,
    USER_PROFILE.income_best_month
  );
  const worstSurplus = calcWorstMonthSurplus(
    USER_PROFILE.income_worst_month,
    USER_PROFILE.monthly_essential_expenses,
    USER_PROFILE.monthly_debt_payments
  );
  const fragThreshold = calcFragilityThreshold(USER_PROFILE.income_typical_month);
  const weeklyGap = calcWeeklyGap(
    USER_PROFILE.liquid_savings_now,
    USER_PROFILE.monthly_essential_expenses
  );
  const financialState = calcState(
    USER_PROFILE.liquid_savings_now,
    bufferTarget,
    liquidityWeeks,
    cv
  );
  const score = calcScore(
    USER_PROFILE.liquid_savings_now,
    bufferTarget,
    cv,
    USER_PROFILE.has_income_protection,
    worstSurplus
  );
  const trend = calcTrend(weeklyAmounts);
  const bufferGap = calcBufferGap(USER_PROFILE.liquid_savings_now, bufferTarget);
  const weeksToTarget = calcWeeksToTarget(bufferGap, USER_PROFILE.income_typical_month);
  const bufferPct = Math.min(
    (USER_PROFILE.liquid_savings_now / bufferTarget) * 100,
    100
  ).toFixed(1);

  const computed = {
    // Score and state
    score,
    financialState,

    // Liquidity
    liquidSavings: USER_PROFILE.liquid_savings_now,
    bufferTarget,
    bufferPct: Number(bufferPct),
    bufferGap,
    liquidityWeeks,
    weeksToTarget,

    // Weekly
    weeklyBurn,
    weeklyGap,
    fragThreshold,

    // Income
    worstSurplus,
    cv,
    trend,
    weeklyAmounts,
    avgWeekly: Math.round(
      weeklyAmounts.reduce((a, b) => a + b, 0) / weeklyAmounts.length
    ),
    bestWeek: Math.max(...weeklyAmounts),

    // Profile passthrough
    hasProtection: USER_PROFILE.has_income_protection,
    typicalMonthly: USER_PROFILE.income_typical_month,
    worstMonthly: USER_PROFILE.income_worst_month,
    bestMonthly: USER_PROFILE.income_best_month,
    monthlyExpenses: USER_PROFILE.monthly_essential_expenses,
    monthlyDebt: USER_PROFILE.monthly_debt_payments,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <FinancialHealthScore data={data} computed={computed} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashRunway data={data} computed={computed} />
        <IncomeStabilityCard data={data} computed={computed} />
      </div>

      <SafeBudgetIndicator data={data} computed={computed} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <SpendingAnalysis data={data} computed={computed} />
        <AIInsights data={data} computed={computed} />
      </div>

      {/* Insurance warning — only shown when user has no income protection */}
      {!USER_PROFILE.has_income_protection && (
        <div style={{
          ...card,
          background: "#fffbeb",
          borderColor: "#fde68a",
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 18 }}>🛡️</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.amber, margin: "0 0 4px" }}>
                You're not covered while working
              </p>
              <p style={{ fontSize: 13, color: C.amber, margin: 0, opacity: 0.8, lineHeight: 1.5 }}>
                You have no income protection insurance. One bad week or getting cut off from an app
                puts your bills at risk immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Worst month alert — only shown when worst month is cash-flow negative */}
      {worstSurplus < 0 && (
        <div style={{
          ...card,
          background: C.amberLight,
          borderColor: C.amberBorder,
          marginTop: 0,
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 18 }}>⚠</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.amber, margin: "0 0 4px" }}>
                Slow months are risky
              </p>
              <p style={{ fontSize: 13, color: C.amber, margin: 0, opacity: 0.8, lineHeight: 1.5 }}>
                In your slowest month your bills are more than you earn
                by ${Math.abs(worstSurplus).toLocaleString()}.
                One bad week and you fall behind.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
