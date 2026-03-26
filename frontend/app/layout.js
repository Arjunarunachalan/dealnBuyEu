import './globals.css'

export const metadata = {
  title: 'DealNBuy',
  description: 'DealNBuy Registration',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
