import { AuthProvider } from '@/context/AuthProvider'
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Time Tracker',
  description: 'A tool for allowing freelancers to track how much time they have spent working on a project, client expense tracker.',
  favicon: "/favicon.ico",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        <meta property="og:title" content="Time Tracker" />
        <meta property="og:description" content="A tool for allowing freelancers to track how much time they have spent working on a project, client expense tracker." />
        <meta property="og:image" content="https://time-tracker-plus.vercel.app/preview.png" />
        <meta property="og:url" content="https://time-tracker-plus.vercel.app" />
      </head>
      <body className={inter.className} >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
