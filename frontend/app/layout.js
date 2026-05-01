import './globals.css'
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'DealNBuy',
  description: 'DealNBuy Registration',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  )
}
