"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Kita pakai cara pintar: Ambil tipe langsung dari komponennya (ComponentProps)
// Jadi gak perlu import manual dari folder 'dist/types' yang suka ganti-ganti.
export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}