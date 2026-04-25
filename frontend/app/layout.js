import './globals.css'

export const metadata = {
  title: 'DealNBuy',
  description: 'DealNBuy Registration',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
