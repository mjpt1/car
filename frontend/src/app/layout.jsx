import './globals.css'; // Tailwind CSS
import { Inter } from 'next/font/google'; // Example font
import { AuthProvider } from '../contexts/AuthContext';
// import Navbar from '../components/navigation/Navbar'; // Optional: if you have a global Navbar
// import Footer from '../components/navigation/Footer'; // Optional: if you have a global Footer

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Car Booking System', // Replace with your app name
  description: 'Online platform for booking car rides.', // Replace with your app description
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl"> {/* Assuming Persian language and RTL direction */}
      <body className={`${inter.className} bg-brand-background text-brand-secondary`}>
        <AuthProvider>
          {/* <Navbar /> */}
          <main className="min-h-screen"> {/* Ensure content pushes footer down */}
            {children}
          </main>
          {/* <Footer /> */}
        </AuthProvider>
      </body>
    </html>
  );
}
