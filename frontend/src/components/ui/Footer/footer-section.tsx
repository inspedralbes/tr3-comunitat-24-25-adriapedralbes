"use client";

import { Facebook, Instagram, Linkedin, Send, Twitter } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/Footer/button";
import { Input } from "@/components/ui/Footer/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Footer/tooltip";

function Footerdemo() {
  const [_isDarkMode, _setIsDarkMode] = React.useState(true);
  const [_isChatOpen, _setIsChatOpen] = React.useState(false);

  return (
    <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              Mantente Conectado
            </h2>
            <p className="mb-6 text-muted-foreground">
              Únete a nuestro boletín para recibir las últimas actualizaciones y
              ofertas exclusivas.
            </p>
            <form className="relative">
              <Input
                type="email"
                placeholder="Ingresa tu correo electrónico"
                className="pr-12 backdrop-blur-sm"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Suscribirse</span>
              </Button>
            </form>
            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Enlaces Rápidos</h3>
            <nav className="space-y-2 text-sm">
              <Link
                href="/home"
                className="block transition-colors hover:text-primary"
              >
                Inicio
              </Link>
              <Link
                href="/about"
                className="block transition-colors hover:text-primary"
              >
                Sobre Nosotros
              </Link>
              <Link
                href="/services"
                className="block transition-colors hover:text-primary"
              >
                Servicios
              </Link>
              <Link
                href="/products"
                className="block transition-colors hover:text-primary"
              >
                Productos
              </Link>
              <Link
                href="/contact"
                className="block transition-colors hover:text-primary"
              >
                Contacto
              </Link>
            </nav>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contáctanos</h3>
            <address className="space-y-2 text-sm not-italic">
              <p>Calle Innovación 123</p>
              <p>Ciudad Tecnológica, TC 12345</p>
              <p>Teléfono: (123) 456-7890</p>
              <p>Correo: hello@example.com</p>
            </address>
          </div>
          <div className="relative">
            <h3 className="mb-4 text-lg font-semibold">Síguenos</h3>
            <div className="mb-6 flex space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                    >
                      <Facebook className="h-4 w-4" />
                      <span className="sr-only">Facebook</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Síguenos en Facebook</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                    >
                      <Twitter className="h-4 w-4" />
                      <span className="sr-only">Twitter</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Síguenos en Twitter</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                    >
                      <Instagram className="h-4 w-4" />
                      <span className="sr-only">Instagram</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Síguenos en Instagram</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                    >
                      <Linkedin className="h-4 w-4" />
                      <span className="sr-only">LinkedIn</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Conéctate con nosotros en LinkedIn</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2024 Tu Empresa. Todos los derechos reservados.
          </p>
          <nav className="flex gap-4 text-sm">
            <Link
              href="/privacy"
              className="transition-colors hover:text-primary"
            >
              Política de Privacidad
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-primary"
            >
              Términos de Servicio
            </Link>
            <Link
              href="/cookies"
              className="transition-colors hover:text-primary"
            >
              Configuración de Cookies
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export { Footerdemo };
