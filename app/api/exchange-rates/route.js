const currencies = ["TRY", "USD", "EUR", "RUB", "CNY"];

export const revalidate = 3600;

export async function GET() {
  const response = await fetch("https://open.er-api.com/v6/latest/TRY", {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return Response.json({ error: "Exchange rates are currently unavailable." }, { status: 502 });
  }

  const data = await response.json();
  const rates = Object.fromEntries(
    currencies.map((currency) => [currency, Number(data?.rates?.[currency])])
  );
  const hasValidRates = data?.result === "success" &&
    data.base_code === "TRY" &&
    currencies.every((currency) => Number.isFinite(rates[currency]) && rates[currency] > 0);

  if (!hasValidRates || typeof data.time_last_update_utc !== "string" || Number.isNaN(Date.parse(data.time_last_update_utc))) {
    return Response.json({ error: "The exchange-rate provider returned invalid data." }, { status: 502 });
  }

  return Response.json({
    base: data.base_code,
    rates,
    updatedAt: data.time_last_update_utc,
  });
}
