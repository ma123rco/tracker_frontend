<script setup lang="ts">
const services = [
    {
        title: "Instalación de gas domiciliario",
        icon: IconMaterialSymbolsEngineeringOutlineRounded,
        description: "Diseñamos e instalamos redes internas para hogares bajo criterios técnicos, materiales certificados y estricto cumplimiento de normas de seguridad.",
        items: [ "Redes internas", "Adecuación de puntos de consumo", "Instalaciones certificadas" ]
    },
    {
        title: "Mantenimiento y reparación",
        icon: IconMaterialSymbolsShieldOutlineRounded,
        description: "Realizamos mantenimiento preventivo y correctivo de redes de gas para prolongar la vida útil del sistema y responder con rapidez ante fallas.",
        items: [ "Detección de fugas", "Reparación de redes", "Servicio técnico preventivo" ]
    },
    {
        title: "Calefones a gas",
        icon: IconMaterialSymbolsShoppingCartOutlineRounded,
        description: "Comercializamos calefones certificados e incluimos instalación profesional, puesta en marcha y recomendaciones de uso seguro.",
        items: [ "Venta de calefones", "Instalación profesional", "Mantenimiento preventivo" ]
    }
];

</script>

<template>
    <section id="servicios" class="py-20 lg:py-24 bg-background-light dark:bg-background-dark">
        <div class="container mx-auto px-6 lg:px-20">
            <!-- Header -->
            <div class="text-center mb-14">
                <h2 class="text-sm font-bold uppercase tracking-widest text-primary">
                    Servicios para el hogar
                </h2>
                <h3 class="mt-2 text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white">
                    Nuestros Servicios
                </h3>
                <div class="mx-auto mt-4 h-1.5 w-20 rounded-full bg-primary"></div>
            </div>

            <!-- Cards -->
            <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div v-for="service in services" :key="service.title" v-reveal
                     class="group flex flex-col rounded-2xl border border-slate-200 dark:border-primary/10 bg-white dark:bg-primary/5 p-7 transition-all duration-300  hover:shadow-xl hover:border-primary/40">

                    <!-- Icon -->
                    <div class="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <component :is="service.icon" class="text-3xl"/>
                    </div>

                    <!-- Title -->
                    <h4 class="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                        {{ service.title }}
                    </h4>

                    <!-- Description -->
                    <p class="mb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {{ service.description }}
                    </p>

                    <!-- Features -->
                    <ul class="mt-auto space-y-2 text-sm font-medium">
                        <li v-for="item in service.items" :key="item" class="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <i-material-symbols-check-circle-outline-rounded class="text-primary text-lg"/>
                            {{ item }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
</template>