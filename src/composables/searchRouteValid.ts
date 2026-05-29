import type { PermissionsInfo } from "@/types/settings/DataPermissions.ts";

/**
 * Searches for a valid route within a permissions array by matching the provided option name.
 *
 * Each object represents a route and may contain nested children.
 * @return {{ name: string, children?: Array<any> } | undefined} - The first matching permission object that contains the specified option
 * name or undefined if no match is found.
 * @param routeName
 * @param permissions
 */
function SearchValidRoute(routeName: string, permissions: PermissionsInfo[] = []): boolean {
    return permissions.some(p =>
        p.name.toLowerCase() === routeName.toLowerCase() ||
        (p.children && SearchValidRoute(routeName, p.children))
    );
}

export default SearchValidRoute;
