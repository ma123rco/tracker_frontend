<script setup lang="ts">

import { LMap, LMarker, LTileLayer } from "@maxel01/vue-leaflet";

defineProps<{ location: { lat: number, lng: number } }>();

</script>

<template>
    <div style="height: 60vh; width: 100%;">
        <LMap ref="map" style="height:100%; width:100%" :zoom="15" :max-zoom="18" :center="[location.lat, location.lng]">
            <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors"/>
            <LMarker draggable :lat-lng="[location.lat, location.lng]"/>
        </LMap>
    </div>
</template>
