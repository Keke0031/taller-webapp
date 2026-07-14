import "./globals.css";

export const metadata = {
  title: "Talleron — Taller mecánico",
  description: "Prototipo de gestión para talleres mecánicos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
