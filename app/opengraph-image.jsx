import { ImageResponse } from "next/og";

export const alt = "Min Arbeidsplass — hvordan det er å jobbe i norske bedrifter";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#1b3a2f",
          color: "#f6f1e7",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 18, height: 18, backgroundColor: "#c45c26" }} />
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Min Arbeidsplass
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 62,
              lineHeight: 1.05,
              fontFamily: "Georgia, serif",
              maxWidth: 980,
            }}
          >
            Hvordan det faktisk er å jobbe et sted.
          </div>
          <div style={{ fontSize: 28, color: "#efe8d8", maxWidth: 800 }}>
            Arbeidsplassundersøkelse, sladder og kåringen av Norges beste arbeidsplass.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
