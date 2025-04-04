/**
 * Utilidades para crear transiciones visuales suaves
 */

/**
 * Aplica una transición de fade (oscurecimiento) antes de navegar a una nueva URL
 * @param targetUrl URL a la que navegar después de la transición
 * @param duration Duración de la transición en milisegundos
 * @param maxOpacity Opacidad máxima del overlay (0-1)
 */
export const fadeTransition = (
  targetUrl: string,
  duration: number = 400,
  maxOpacity: number = 0.5
): void => {
  // Crear overlay de transición
  const transitionOverlay = document.createElement('div');
  transitionOverlay.style.position = 'fixed';
  transitionOverlay.style.top = '0';
  transitionOverlay.style.left = '0';
  transitionOverlay.style.width = '100%';
  transitionOverlay.style.height = '100%';
  transitionOverlay.style.backgroundColor = '#000';
  transitionOverlay.style.opacity = '0';
  transitionOverlay.style.transition = `opacity ${duration/2}ms ease`;
  transitionOverlay.style.zIndex = '9999';
  document.body.appendChild(transitionOverlay);
  
  // Aplicar fade in
  setTimeout(() => {
    transitionOverlay.style.opacity = maxOpacity.toString();
  }, 10);
  
  // Navegar después de la mitad del tiempo
  setTimeout(() => {
    window.location.href = targetUrl;
  }, duration / 2);
};

/**
 * Aplica una transición de fade para el proceso de inicio de sesión
 * Optimizada específicamente para el flujo de autenticación
 */
export const authTransition = (targetUrl: string = '/'): void => {
  fadeTransition(targetUrl, 500, 0.6);
};

/**
 * Aplica una transición de fade para el proceso de cierre de sesión
 */
export const logoutTransition = (targetUrl: string = '/'): void => {
  fadeTransition(targetUrl, 400, 0.5);
};
