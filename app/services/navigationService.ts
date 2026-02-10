/**
 * Navigation Service
 * Fetches dynamic navigation items from the API
 * Adapted for Stocks App
 */

export interface NavigationItem {
    id: number;
    label: string;
    url: string;
    icon: string;
    parent_id: number | null;
    section: string;
    link_type: string;
    badge_text: string | null;
    css_class: string | null;
    order_index: number;
    is_active: boolean;
    requires_auth: boolean;
    roles_allowed: string[] | null;
    country_code: string | null;
}

export interface NavigationResponse {
    navigation: Record<string, NavigationItem[]>;
    items: NavigationItem[];
}

// Cache to avoid repeated fetches
let navigationCache: NavigationResponse | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute cache

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://apipearto.ashlya.com/api').replace(/\/$/, '');

/**
 * Fetch all navigation items from API
 */
export async function fetchNavigation(): Promise<NavigationResponse> {
    const now = Date.now();

    // Return cached if still valid
    if (navigationCache && (now - lastFetchTime) < CACHE_DURATION) {
        return navigationCache;
    }

    try {
        // Construct URL - handle potential double slash if API_BASE ends with /api and endpoint starts with /api
        // The frontend service requests '/navigation' which likely maps to '/api/navigation'
        // If API_BASE is .../api, we append /navigation

        let url = `${API_BASE}/navigation`;

        // If API_BASE doesn't end in /api, we might need to add it, but based on utils/api.ts 
        // it seems API_BASE usually includes /api or logic handles it. 
        // Let's assume standard endpoint structure.

        console.log('[NavigationService] Fetching:', url);

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors',
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Navigation fetch failed: ${response.status}`);
        }

        const data = await response.json();
        navigationCache = data;
        lastFetchTime = now;
        return data;
    } catch (error) {
        console.error('Failed to fetch navigation:', error);
        // Return empty structure on error
        return { navigation: {}, items: [] };
    }
}

/**
 * Get items for a specific section
 */
export function getSection(navigation: NavigationResponse, section: string): NavigationItem[] {
    return navigation?.navigation?.[section] || [];
}

export default {
    fetchNavigation,
    getSection,
};
