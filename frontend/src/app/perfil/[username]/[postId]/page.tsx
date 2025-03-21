"use client";

import UserProfilePage from '../page';

/**
 * Este componente simplemente re-exporta la página de perfil del usuario.
 * El ID del post se extraerá de la URL en la página de perfil.
 * 
 * Nota: El formato esperado de la URL es:
 * /perfil/[username]/[uuid]-[slug]
 * Donde:
 * - username es el nombre de usuario
 * - uuid es un identificador único de 36 caracteres (incluyendo guiones)
 * - slug es un texto derivado del título para hacer la URL más legible
 */
export default UserProfilePage;