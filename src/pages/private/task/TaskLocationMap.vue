<script setup lang="ts">
import { computed } from "vue";
import { LMap, LMarker, LTileLayer } from "@maxel01/vue-leaflet";

interface Location {
    lat: number;
    lng: number;
}

const props = withDefaults(
    defineProps<{ 
        location: Location;
        title?: string;
        zoom?: number;
    }>(),
    { 
        title: "Ubicación",
        zoom: 15
    }
);

const center = computed<[number, number]>(() => [ props.location.lat, props.location.lng ]);
</script>

<template>
    <div class="location-container">
        <div class="map-container">
            <LMap ref="map" style="height:100%; width:100%" :zoom="zoom" :max-zoom="18" :center="center">
                <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors"/>
                <LMarker :lat-lng="center"/>
            </LMap>
        </div>
        
        <div class="location-info">
            <p class="text-xs text-slate-600 dark:text-slate-400 mb-1">Coordenadas</p>
            <div class="coordinates">
                <span>Lat: {{ location.lat.toFixed(6) }}</span>
                <span>Lng: {{ location.lng.toFixed(6) }}</span>
            </div>
            <a 
                :href="`https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}#map=16/${location.lat}/${location.lng}`"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-semibold">
                <i-material-symbols-open-in-new-rounded/>
                Abrir en OpenStreetMap
            </a>
        </div>
    </div>
</template>

<style scoped>
@reference "@/style.css";

.location-container {
    @apply space-y-3;
}

.map-container {
    @apply w-full h-64 rounded-lg shadow-md border border-slate-200 dark:border-slate-700;
}

.location-info {
    @apply bg-white dark:bg-slate-800 p-3 rounded-lg;
}

.coordinates {
    @apply flex gap-4 text-sm font-mono text-slate-700 dark:text-slate-300;
}
</style>

