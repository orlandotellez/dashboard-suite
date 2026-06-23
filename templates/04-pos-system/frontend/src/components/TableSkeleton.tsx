// ---------------------------------------------------------------------------
// TableSkeleton — pulsing rows that match exact column layout
// ---------------------------------------------------------------------------
// Cada columna se define con { width, align? } para que el skeleton se vea
// idéntico a la tabla real. Evita que la tabla "desaparezca" al recargar.
// ---------------------------------------------------------------------------

import s from "./Skeleton.module.css";

export interface SkeletonCol {
  width: string;    // ej: "60%", "80px"
  align?: "left" | "right" | "center";
}

interface Props {
  cols: SkeletonCol[];
  rows?: number;
}

export default function TableSkeleton({ cols, rows = 5 }: Props) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <tr key={i}>
          {cols.map((col, j) => (
            <td key={j} style={{ textAlign: col.align ?? "left", padding: "12px 16px" }}>
              <div
                className={s.bar}
                style={{
                  width: col.width,
                  marginLeft: col.align === "right" ? "auto" : undefined,
                  marginRight: col.align === "left" ? "auto" : undefined,
                  margin: col.align === "center" ? "0 auto" : undefined,
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
