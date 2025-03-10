"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ConfirmPage() {
  const params = useParams();
  const token = params.token as string;
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const confirmSubscription = async () => {
      try {
        const response = await fetch(
          `https://api.futurprive.com/api/newsletter/confirm/${token}/`
        );
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message || "Ha ocurrido un error en la confirmación.");
        }
      } catch (error) {
        console.error("Error:", error);
        setStatus("error");
        setMessage(
          "Ha ocurrido un error al conectar con el servidor. Por favor, inténtalo de nuevo más tarde."
        );
      }
    };

    confirmSubscription();
  }, [token]); // Dependencia correcta

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full bg-[#111] p-8 rounded-xl border border-gray-800">
        {status === "loading" && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C9A880]"></div>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="inline-flex h-16 w-16 rounded-full bg-green-500/20 items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4">¡Suscripción confirmada!</h1>
            <p className="mb-6">
              Ahora vas a recibir un correo titulado &quot;Las Sorpresas de Adrià Estévez&quot; donde tendrás acceso a lo prometido.
            </p>
            <p className="text-gray-400 mb-8">
              Pasa un gran día,<br />
              Adrià Estévez
            </p>

            <Link
              href="/"
              className="inline-block px-6 py-3 bg-[#C9A880] text-white rounded-lg font-medium hover:bg-[#B89770] transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="inline-flex h-16 w-16 rounded-full bg-red-500/20 items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4">Error en la confirmación</h1>
            <p className="text-lg text-red-500 font-medium mb-6">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
