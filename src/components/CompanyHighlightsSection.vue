<script setup lang="ts">
const values = [
    "Seguridad como prioridad en cada instalación.",
    "Responsabilidad y cumplimiento.",
    "Transparencia en los procesos.",
    "Innovación tecnológica aplicada al servicio.",
    "Compromiso con la satisfacción del cliente."
];

const reasons = [
    "Técnicos certificados.",
    "Atención rápida y personalizada.",
    "Garantía en instalaciones.",
    "Cumplimiento de normas de seguridad.",
    "Soporte técnico post-servicio."
];

const innovationItems = [
    "Implementamos sistemas digitales para mejorar la operación.",
    "Controlamos asistencia del personal con biometría.",
    "Monitoreamos personal técnico en campo.",
    "Optimizamos tiempos de servicio y seguimiento."
];
</script>

<template>
    <section class="bg-slate-50 py-20 dark:bg-surface-900/40">
        <div class="container mx-auto flex flex-col gap-10 px-6 lg:px-20">
            <div class="max-w-3xl">
                <p class="text-sm font-bold uppercase tracking-widest text-primary">Información corporativa</p>
                <h2 class="mt-3 text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">
                    Valores, calidad, cobertura e innovación que respaldan cada servicio
                </h2>
            </div>

            <div class="grid gap-6 lg:grid-cols-3">
                <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-surface-700 dark:bg-surface-950/80 lg:col-span-1">
                    <p class="text-sm font-bold uppercase tracking-widest text-primary">Valores</p>
                    <ul class="mt-5 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        <li v-for="value in values" :key="value" class="flex gap-3">
                            <i-material-symbols-check-circle-outline-rounded class="mt-1 shrink-0 text-lg text-primary"/>
                            <span>{{ value }}</span>
                        </li>
                    </ul>
                </article>

                <article class="rounded-3xl border border-primary/15 bg-primary/5 p-6 shadow-sm dark:bg-primary/10 lg:col-span-2">
                    <p class="text-sm font-bold uppercase tracking-widest text-primary">Política de calidad</p>
                    <p class="mt-5 text-base leading-8 text-slate-700 dark:text-slate-200">
                        ASTOM-GAS S.R.L. se compromete a brindar servicios de instalación y mantenimiento de sistemas de gas
                        domiciliario y calefones bajo estrictos estándares de seguridad, cumpliendo la normativa vigente y garantizando
                        la mejora continua de nuestros procesos.
                    </p>
                </article>
            </div>

            <div class="grid gap-6 lg:grid-cols-2">
                <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-surface-700 dark:bg-surface-950/80">
                    <p class="text-sm font-bold uppercase tracking-widest text-primary">Diferenciador tecnológico</p>
                    <p class="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300">
                        AS-TOMGAS integra herramientas tecnológicas para el monitoreo y control operativo del personal en campo,
                        permitiendo una gestión eficiente, trazabilidad de servicios y mayor transparencia en cada trabajo realizado.
                    </p>
                </article>

                <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-surface-700 dark:bg-surface-950/80">
                    <p class="text-sm font-bold uppercase tracking-widest text-primary">Cobertura geográfica</p>
                    <p class="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300">
                        Brindamos nuestros servicios en toda la ciudad de Cochabamba y municipios aledaños, coordinando visitas técnicas,
                        instalaciones y mantenimientos con atención oportuna para hogares.
                    </p>
                </article>
            </div>

            <div class="grid gap-6 lg:grid-cols-2">
                <article class="rounded-3xl bg-slate-900 p-6 text-white shadow-sm">
                    <p class="text-sm font-bold uppercase tracking-widest text-primary">¿Por qué elegirnos?</p>
                    <ul class="mt-5 space-y-3 text-sm leading-7 text-slate-300">
                        <li v-for="reason in reasons" :key="reason" class="flex gap-3">
                            <i-material-symbols-check-circle-outline-rounded class="mt-1 shrink-0 text-lg text-primary"/>
                            <span>{{ reason }}</span>
                        </li>
                    </ul>
                </article>

                <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-surface-700 dark:bg-surface-950/80">
                    <p class="text-sm font-bold uppercase tracking-widest text-primary">Innovación y tecnología</p>
                    <ul class="mt-5 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        <li v-for="item in innovationItems" :key="item" class="flex gap-3">
                            <i-material-symbols-check-circle-outline-rounded class="mt-1 shrink-0 text-lg text-primary"/>
                            <span>{{ item }}</span>
                        </li>
                    </ul>
                </article>
            </div>
        </div>
    </section>
</template>


