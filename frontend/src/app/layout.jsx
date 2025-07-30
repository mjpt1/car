import './globals.css'; // Tailwind CSS
import 'leaflet/dist/leaflet.css'; // Leaflet CSS for map rendering
import 'react-toastify/dist/ReactToastify.css'; // Toastify CSS
import { Vazirmatn } from 'next/font/google'; // Using Vazirmatn from Google Fonts
import { AuthProvider } from '../contexts/AuthContext';
import { SocketProvider } from '../contexts/SocketContext';
import { ToastContainer } from 'react-toastify';
import NotificationHandler from '../components/notifications/NotificationHandler';
// import Navbar from '../components/navigation/Navbar'; // Optional: if you have a global Navbar
// import Footer from '../components/navigation/Footer'; // Optional: if you have a global Footer

const vazirmatn = Vazirmatn({ subsets: ['arabic', 'latin'] });

export const metadata = {
  title: 'Car Booking System', // Replace with your app name
  description: 'Online platform for booking car rides.', // Replace with your app description
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl"> {/* Assuming Persian language and RTL direction */}
      <body className={`${vazirmatn.className} bg-brand-background text-brand-secondary`}>
        <AuthProvider>
          <SocketProvider>
            <NotificationHandler />
            {/* <Navbar /> */}
            <main className="min-h-screen"> {/* Ensure content pushes footer down */}
              {children}
            </main>
            {/* <Footer /> */}
            <ToastContainer
              position="bottom-left"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={true}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
