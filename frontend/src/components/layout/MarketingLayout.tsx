// src/layouts/MarketingLayout.tsx
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Footer from "@/components/nav/Footer";
import Header from "@/components/nav/Header";

type Props = { headerVariant?: "transparent" | "solid"; withFooter?: boolean };

export default function MarketingLayout({ headerVariant = "transparent", withFooter = true }: Props) {
  const location = useLocation();

  // 🔹 Maneja el scroll cuando hay un hash en la URL
  useEffect(() => {
    
    if (location.hash) {
      const id = location.hash.replace("#", "");
      
      // Función para hacer scroll al elemento
      const scrollToElement = () => {
        const el = document.getElementById(id);
        if (el) {
          const headerOffset = 90; // Compensa el header fijo
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      };
      
      // Intenta múltiples veces porque el DOM puede tardar en cargar
      setTimeout(scrollToElement, 100);
      setTimeout(scrollToElement, 400);
      setTimeout(scrollToElement, 700);
      
    } else {
      // Sin hash, vuelve arriba

      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location]);

  return (
    <main
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        backgroundColor: "#ffffff",
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.08) 1px, transparent 0)",
        backgroundSize: "20px 20px",
      }}
    >

      {/* Header fijo */}
      <div className="absolute top-0 left-0 w-full z-50">
        <Header variant={headerVariant} />
      </div>

      {/* Contenido de la página */}
      <Outlet />

      {/* Footer opcional */}
      {withFooter && <Footer />}
    </main>
  );
}