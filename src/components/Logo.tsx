"use client"
import Link from "next/link"
import { motion } from "framer-motion"

export default function Logo() {
  return (
    <Link href="/" style={{ textDecoration: 'none' }}>
      <motion.div
        style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
        whileHover="hover"
      >
        {/* Diamond icon — pure SVG */}
        <motion.svg
          width="28" height="28" viewBox="0 0 28 28"
          style={{ 
            filter: "drop-shadow(0 0 8px rgba(124,106,247,0.3))"
          }}
          variants={{ 
            hover: { 
              rotate: 180, 
              scale: 1.1,
              filter: "drop-shadow(0 0 16px rgba(124,106,247,0.6))",
              transition: { duration: 0.6, ease: "easeInOut" } 
            } 
          }}
        >
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c6af7" />
              <stop offset="100%" stopColor="#d4537e" />
            </linearGradient>
          </defs>
          {/* Outer diamond */}
          <rect x="4" y="4" width="20" height="20" rx="3"
            transform="rotate(45 14 14)"
            fill="url(#logoGrad)"
          />
          {/* Inner cutout diamond */}
          <rect x="8" y="8" width="12" height="12" rx="2"
            transform="rotate(45 14 14)"
            fill="#07080f"
          />
          {/* Center dot */}
          <circle cx="14" cy="14" r="2" fill="url(#logoGrad)" />
        </motion.svg>

        {/* Wordmark */}
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "5px" }}>
            <span style={{
              fontFamily: "var(--font-syne), sans-serif",
              fontWeight: 800,
              fontSize: "18px",
              background: "linear-gradient(135deg, #7c6af7, #d4537e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "0.05em"
            }}>
              Dream2Reality
            </span>
            <span style={{
              fontFamily: "var(--font-syne), sans-serif",
              fontWeight: 400,
              fontSize: "18px",
              color: "rgba(255,255,255,0.75)",
            }}>
              AI
            </span>
          </div>
          {/* Tagline — hide on mobile */}
          <span 
            className="hidden sm:block"
            style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: "9px",
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginTop: "2px"
            }}
          >
            by JSDK Coders
          </span>
        </div>
      </motion.div>
    </Link>
  )
}
