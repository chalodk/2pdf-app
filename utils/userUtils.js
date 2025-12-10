/**
 * Obtiene el nombre de visualización del usuario desde los metadatos de Supabase
 * @param {Object} user - Objeto de usuario de Supabase
 * @returns {string} - Nombre de visualización del usuario
 */
export function getUserDisplayName(user) {
  if (!user) return 'Usuario';
  
  return user?.user_metadata?.display_name || 
         user?.user_metadata?.full_name || 
         user?.user_metadata?.name ||
         user?.email?.split('@')[0] || 
         'Usuario';
}

