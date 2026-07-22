/**
 * Construye la ruta de un recurso estático agregando el basePath '/LGB' si es necesario.
 * Evita la duplicación del prefijo en caso de que ya esté presente.
 * 
 * @param path Ruta del asset (ej. '/data/ReportLGB.xlsx')
 * @returns Ruta completa normalizada (ej. '/LGB/data/ReportLGB.xlsx')
 */
export function getAssetPath(path: string): string {
  if (!path) return '';
  
  // Normalizar la ruta de entrada para asegurar que comience con '/'
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Si la ruta ya incluye el basePath '/LGB', no duplicarlo
  if (cleanPath.startsWith('/LGB/')) {
    return cleanPath;
  }
  
  return `/LGB${cleanPath}`;
}
