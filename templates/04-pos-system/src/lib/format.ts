export const money = (n: number | string | null | undefined) => {
  const v = Number(n ?? 0);
  return v.toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2 });
};

export const num = (n: number | string | null | undefined) =>
  Number(n ?? 0).toLocaleString("es-MX");
