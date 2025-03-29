import CommunityPage from '../page';

/**
 * Este componente simplemente re-exporta la página principal de comunidad.
 * El ID del post se extraerá de la URL en la página principal.
 * 
 * Nota: El formato esperado de la URL es:
 * /comunidad/[uuid]-[slug]
 * Donde:
 * - uuid es un identificador único de 36 caracteres (incluyendo guiones)
 * - slug es un texto derivado del título para hacer la URL más legible
 */
export default CommunityPage;
