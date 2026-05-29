<script setup lang="ts">
import { LMap, LMarker, LTileLayer } from "@maxel01/vue-leaflet";
</script>

<template>
    <section class="py-16 md:py-20 lg:py-24 bg-background-light dark:bg-background-dark" id="contacto">
        <div class="container mx-auto px-4 sm:px-6 lg:px-20">

            <div class="mb-12 md:mb-16 text-center lg:text-left">
                <h2 class="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary">
                    Cobertura y atención directa
                </h2>

                <h3 class="mt-2 text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white">
                    Estamos listos para ayudarte en tu hogar
                </h3>
            </div>

            <div class="grid gap-10 md:gap-12 lg:grid-cols-2">

                <!-- Contact Info -->
                <div class="space-y-6 md:space-y-8">

                    <div class="flex items-start gap-4 md:gap-6">
                        <div class="flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <i-material-symbols-phone-enabled-outline class="text-2xl md:text-3xl"/>
                        </div>

                        <div class="min-w-0">
                            <p class="text-xs md:text-sm font-bold text-slate-500 uppercase">
                                Llámanos ahora
                            </p>

                            <p class="text-xl md:text-2xl font-bold dark:text-white wrap-break-word">
                                +591 76999982
                            </p>

                            <p class="text-slate-500 text-xs md:text-sm">
                                Atención rápida, personalizada y soporte post-servicio
                            </p>
                        </div>
                    </div>

                    <div class="flex items-start gap-4 md:gap-6">
                        <div class="flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <i-material-symbols-mail class="text-2xl md:text-3xl"/>
                        </div>

                        <div class="min-w-0">
                            <p class="text-xs md:text-sm font-bold text-slate-500 uppercase">
                                Correo Electrónico
                            </p>

                            <p class="text-xl md:text-2xl font-bold dark:text-white break-all">
                                astomb2025@gmail.com
                            </p>

                            <p class="text-slate-500 text-xs md:text-sm">
                                Coordinamos cotizaciones y visitas técnicas de forma ágil
                            </p>
                        </div>
                    </div>

                    <div class="flex items-start gap-4 md:gap-6">
                        <div class="flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <i-material-symbols-location-on class="text-2xl md:text-3xl"/>
                        </div>

                        <div class="min-w-0">
                            <p class="text-xs md:text-sm font-bold text-slate-500 uppercase">
                                Nuestra Oficina
                            </p>

                            <p class="text-xl md:text-2xl font-bold dark:text-white">
                                Av. Humboldt #423, Cochabamba, Bolivia
                            </p>

                            <p class="text-slate-500 text-xs md:text-sm">
                                Cobertura en Cochabamba y municipios aledaños
                            </p>
                        </div>
                    </div>
                </div>
                <!-- Map -->
                <div class="overflow-hidden rounded-3xl border border-slate-200 dark:border-primary/20 shadow-2xl 
                        min-h-70 sm:min-h-85 md:min-h-105 lg:min-h-120 bg-slate-100 dark:bg-slate-800 relative">

                    <LMap ref="map" style="height:100%; width:100%" :zoom="18" :max-zoom="18" :center="[-17.389707, -66.166301]">
                        <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="&copy; OpenStreetMap contributors"/>

                        <LMarker :lat-lng="[-17.389707, -66.166301]"/>
                    </LMap>

                </div>

            </div>
        </div>
    </section>
</template>