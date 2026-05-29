import type { PermissionsInfo } from "@/types/settings/DataPermissions.ts";

/**
 * Encuentra el primer nombre de ruta disponible en la lista de permisos del usuario.
 * @param permissions Lista de rutas con permisos (posiblemente anidados).
 * @returns Nombre de la primera ruta permitida.
 */
export function getFirstValidRouteName(permissions: PermissionsInfo[]): string | null {
    for (const p of permissions) {
        if (p.children?.length) {
            const childLeaf = getFirstValidRouteName(p.children);
            if (childLeaf) return childLeaf;
        } else if (p.name) {
            return p.name;
        }
    }
    return null;
}
