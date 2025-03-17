# TR3 Comunitat - Frontend

Este repositorio contiene el frontend del proyecto TR3 Comunitat, desarrollado con Next.js 15, React 19 y TypeScript.

## Requisitos

- Node.js 20 o superior
- pnpm 10.5.1 o superior

## Instalación

```bash
# Instalar dependencias
pnpm install
```

## Desarrollo

```bash
# Iniciar servidor de desarrollo
pnpm dev
```

## Build

```bash
# Realizar build estándar
pnpm build

# Realizar build ignorando errores de ESLint
pnpm build:force

# Utilizar script de build automatizado
chmod +x ./auto-build.sh
./auto-build.sh
```

## Problemas conocidos de build

- Existen problemas de formateo relacionados con ESLint que han sido configurados como warnings para no bloquear el build.
- Se ha corregido el problema de casing de los archivos `avatar.tsx` y `Avatar.tsx`.
- La página de comunidad utiliza un Suspense boundary para resolver problemas con `useSearchParams()`.

## Solución de problemas

Si encuentras errores durante el build, puedes intentar algunas de estas soluciones:

1. Limpia la caché:
   ```bash
   rm -rf .next
   rm -rf node_modules/.cache
   ```

2. Actualiza las dependencias:
   ```bash
   pnpm install
   ```

3. Utiliza el script automatizado de build:
   ```bash
   ./auto-build.sh
   ```

4. Lanza el build con las variables de entorno para ignorar verificaciones TypeScript:
   ```bash
   NEXT_TELEMETRY_DISABLED=1 NEXT_TYPESCRIPT_CHECK=0 pnpm build
   ```
