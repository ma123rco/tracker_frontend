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
</script>

<template>
    <div class="min-h-screen bg-slate-50 dark:bg-surface-950">

        <main class="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-10 lg:px-8">
            <section class="overflow-hidden rounded-3xl border border-primary/15 bg-white shadow-sm dark:bg-surface-900/80">
                <div class="bg-linear-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-12 text-white md:px-10">
                    <span class="mb-4 inline-flex rounded-full border border-primary/25 bg-primary/15 px-4 py-1.5 text-xs font-black uppercase tracking-[0.22em] text-primary">
                        AS-TOMGAS S.R.L.
                    </span>
                    <h1 class="max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-5xl">
                        Misión, visión y principios que respaldan nuestros servicios de gas domiciliario
                    </h1>
                    <p class="mt-5 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                        Compartimos la base estratégica de nuestra empresa para que cada familia conozca cómo trabajamos, qué buscamos y
                        por qué priorizamos seguridad, calidad, innovación y confianza en cada instalación o mantenimiento.
                    </p>
                </div>
            </section>

            <section class="grid gap-6 lg:grid-cols-2">
                <article class="rounded-3xl border border-primary/15 bg-primary/5 p-6 shadow-sm dark:bg-primary/10">
                    <p class="text-sm font-bold uppercase tracking-widest text-primary">Misión</p>
                    <p class="mt-4 text-base leading-8 text-slate-700 dark:text-slate-200">
                        Brindar servicios integrales de instalación, mantenimiento y comercialización de sistemas de gas domiciliario,
                        así como la venta e instalación de calefones a gas, garantizando seguridad, calidad y eficiencia en cada proyecto.
                        Nos comprometemos a utilizar tecnología innovadora y personal altamente capacitado para ofrecer soluciones
                        confiables que satisfagan las necesidades de nuestros clientes.
                    </p>
                </article>

                <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-surface-700 dark:bg-surface-900/80">
                    <p class="text-sm font-bold uppercase tracking-widest text-primary">Visión</p>
                    <p class="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
                        Consolidarnos como una empresa líder en el sector de instalaciones y soluciones de gas a nivel regional y nacional,
                        destacándonos por nuestra innovación tecnológica, la excelencia en el servicio y el compromiso con la seguridad y
                        el desarrollo sostenible.
                    </p>
                </article>
            </section>

            <section class="grid gap-6 lg:grid-cols-[1fr_1fr_1fr]">
                <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-surface-700 dark:bg-surface-900/80 lg:col-span-1">
                    <p class="text-sm font-bold uppercase tracking-widest text-primary">Valores</p>
                    <ul class="mt-5 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        <li v-for="value in values" :key="value" class="flex gap-3">
                            <i-material-symbols-check-circle-outline-rounded class="mt-1 shrink-0 text-lg text-primary"/>
                            <span>{{ value }}</span>
                        </li>
                    </ul>
                </article>

                <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-surface-700 dark:bg-surface-900/80 lg:col-span-2">
                    <p class="text-sm font-bold uppercase tracking-widest text-primary">Política de calidad</p>
                    <p class="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300">
                        ASTOM-GAS S.R.L. se compromete a brindar servicios de instalación y mantenimiento de sistemas de gas domiciliario y
                        calefones bajo estrictos estándares de seguridad, cumpliendo la normativa vigente y garantizando la mejora continua
                        de nuestros procesos.
                    </p>
                </article>
            </section>

            <section class="grid gap-6 lg:grid-cols-2">
                <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-surface-700 dark:bg-surface-900/80">
                    <p class="text-sm font-bold uppercase tracking-widest text-primary">Diferenciador tecnológico</p>
                    <p class="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300">
                        ASTOM-GAS integra herramientas tecnológicas para el monitoreo y control operativo del personal en campo,
                        permitiendo una gestión eficiente, trazabilidad de servicios y mayor transparencia en cada trabajo realizado.
                    </p>
                </article>

                <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-surface-700 dark:bg-surface-900/80">
                    <p class="text-sm font-bold uppercase tracking-widest text-primary">Cobertura geográfica</p>
                    <p class="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300">
                        Brindamos nuestros servicios en toda la ciudad de Cochabamba y municipios aledaños, coordinando atención técnica
                        para instalaciones, mantenimiento y soporte especializado en hogares.
                    </p>
                </article>
            </section>

            <section class="grid gap-6 lg:grid-cols-2">
                <article class="rounded-3xl bg-slate-900 p-6 text-white shadow-sm">
                    <p class="text-sm font-bold uppercase tracking-widest text-primary">¿Por qué elegirnos?</p>
                    <ul class="mt-5 space-y-3 text-sm leading-7 text-slate-300">
                        <li v-for="reason in reasons" :key="reason" class="flex gap-3">
                            <i-material-symbols-check-circle-outline-rounded class="mt-1 shrink-0 text-lg text-primary"/>
                            <span>{{ reason }}</span>
                        </li>
                    </ul>
                </article>

                <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-surface-700 dark:bg-surface-900/80">
                    <p class="text-sm font-bold uppercase tracking-widest text-primary">Innovación y tecnología</p>
                    <ul class="mt-5 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        <li class="flex gap-3">
                            <i-material-symbols-check-circle-outline-rounded class="mt-1 shrink-0 text-lg text-primary"/>
                            <span>La empresa implementa sistemas digitales para mejorar la operación y el seguimiento.</span>
                        </li>
                        <li class="flex gap-3">
                            <i-material-symbols-check-circle-outline-rounded class="mt-1 shrink-0 text-lg text-primary"/>
                            <span>Controla asistencia con biometría para una gestión más confiable del personal.</span>
                        </li>
                        <li class="flex gap-3">
                            <i-material-symbols-check-circle-outline-rounded class="mt-1 shrink-0 text-lg text-primary"/>
                            <span>Monitorea personal en campo para mantener trazabilidad en cada servicio.</span>
                        </li>
                        <li class="flex gap-3">
                            <i-material-symbols-check-circle-outline-rounded class="mt-1 shrink-0 text-lg text-primary"/>
                            <span>Optimiza tiempos de servicio y atención al cliente mediante herramientas de control operativo.</span>
                        </li>
                    </ul>
                </article>
            </section>
        </main>

        <FooterBar/>
    </div>
</template>


