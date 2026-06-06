import { ImageResponse } from "next/og"

export const contentType = "image/png"
export const size = { width: 1200, height: 630 }
export const alt = "STORE — Modern Essentials"

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "#fafafa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: 700,
              color: "#09090b",
            }}
          >
            S
          </div>
        </div>
        <h1
          style={{
            fontSize: "64px",
            fontWeight: 700,
            color: "#fafafa",
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          STORE
        </h1>
        <p
          style={{
            fontSize: "24px",
            color: "#a1a1aa",
            marginTop: "16px",
            marginBottom: 0,
          }}
        >
          Modern Essentials
        </p>
      </div>
    ),
    {
      ...size,
    }
  )
}
