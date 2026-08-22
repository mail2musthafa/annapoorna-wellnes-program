import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import { MiniCartDrawer } from "@/components/cart/MiniCartDrawer";
import { AmmaraChatbot } from "@/components/chat/AmmaraChatbot";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Annapoorna Portal | Holistic Lifestyle Education & Community",
  description: "Evidence-informed holistic wellness, culinary medicine recipes, live coaching classes, and supportive community built on Six Lifestyle Pillars.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-sand-50 text-sage-900 antialiased selection:bg-annapoorna-200">
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <MiniCartDrawer />
          <AmmaraChatbot />
        </CartProvider>
      </body>
    </html>
  );
}
