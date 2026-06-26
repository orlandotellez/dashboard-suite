export const money = (n: number | string | null | undefined, currency: string = "NIO") => {
  const v = Number(n ?? 0);
  return v.toLocaleString("es-MX", { style: "currency", currency, minimumFractionDigits: 2 });
};

