"use client";

import Link from "next/link";
import { AnimatedButton } from "@/components/animatedButton";
import { useState, useEffect } from "react";

// Testimonios compactos inspirados en la imagen de referencia
const testimonials = [
  {
    name: "Carlos",
    username: "@carlosfinanzas",
    body: "Implementación perfecta. Ahora procesamos datos en minutos, no días.",
    img: "https://i.pravatar.cc/150?img=12"
  },
  {
    name: "Elena",
    username: "@elenamarketing",
    body: "Incrementamos conversiones un 32% con su sistema de recomendación.",
    img: "https://i.pravatar.cc/150?img=9"
  },
  {
    name: "David",
    username: "@davidempresa",
    body: "Automatizamos procesos clave y liberamos tiempo para innovar.",
    img: "https://i.pravatar.cc/150?img=8"
  },
  {
    name: "Laura",
    username: "@laurarrhh",
    body: "La mejor inversión tecnológica que hemos hecho en años.",
    img: "https://i.pravatar.cc/150?img=25"
  },
  {
    name