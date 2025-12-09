import "./globals.css";
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';
import ClientProviders from './ClientProviders';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans bg-[#ffffff] dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] transition-colors duration-200">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
