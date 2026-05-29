<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const goToMissionVision = () => {
    void router.push({ name: "mission-vision" });
};
</script>

<template>
    <section id="sobre-nosotros" class="bg-white py-20 dark:bg-surface-950">
        <div class="container mx-auto grid gap-10 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-20">
            <div class="flex flex-col gap-6">
                <div>
                    <p class="text-sm font-bold uppercase tracking-widest text-primary">Sobre nosotros</p>
                    <h2 class="mt-3 text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">
                        AS-TOMGAS S.R.L. combina seguridad técnica con gestión moderna del servicio
                    </h2>
                </div>

                <div class="space-y-4 text-base leading-8 text-slate-600 dark:text-slate-300">
                    <p>
                        ASTOM-GAS S.R.L. es una empresa especializada en la instalación y mantenimiento de redes de gas domiciliario,
                        así como en la venta, instalación y servicio técnico de calefones a gas.
                    </p>
                    <p>
                        Nuestro equipo técnico cuenta con experiencia y capacitación constante para garantizar trabajos seguros y
                        certificados, cumpliendo con las normativas vigentes.
                    </p>
                    <p>
                        Además, incorporamos herramientas tecnológicas para optimizar la gestión operativa y el control del personal en
                        campo, asegurando eficiencia, trazabilidad y transparencia en cada servicio realizado.
                    </p>
                </div>

                <div class="grid gap-4 sm:grid-cols-2">
                    <div class="rounded-2xl border border-primary/15 bg-primary/5 p-5 dark:bg-primary/10">
                        <p class="text-sm font-bold uppercase tracking-widest text-primary">Misión</p>
                        <p class="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
                            Brindar servicios integrales de instalación, mantenimiento y comercialización de sistemas de gas
                            domiciliario, garantizando seguridad, calidad y eficiencia.
                        </p>
                    </div>
                    <div class="rounded-2xl border border-primary/15 bg-slate-50 p-5 dark:bg-surface-900">
                        <p class="text-sm font-bold uppercase tracking-widest text-primary">Visión</p>
                        <p class="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
                            Consolidarnos como una empresa líder en instalaciones y soluciones de gas a nivel regional y nacional,
                            destacándonos por innovación tecnológica y excelencia en el servicio.
                        </p>
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-surface-700 dark:bg-surface-900/80 md:p-8">
                <div class="flex items-start gap-4 rounded-2xl border border-primary/15 bg-white p-5 dark:border-primary/10 dark:bg-surface-950/60">
                    <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <i-material-symbols-verified-outline-rounded class="text-3xl"/>
                    </div>
                    <div>
                        <h3 class="text-xl font-black text-slate-900 dark:text-white">Compromiso con la seguridad</h3>
                        <p class="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                            Priorizamos instalaciones seguras, revisión técnica rigurosa y cumplimiento de normas vigentes en cada hogar.
                        </p>
                    </div>
                </div>

                <div class="flex items-start gap-4 rounded-2xl border border-primary/15 bg-white p-5 dark:border-primary/10 dark:bg-surface-950/60">
                    <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <i-material-symbols-check-circle-outline-rounded class="text-3xl"/>
                    </div>
                    <div>
                        <h3 class="text-xl font-black text-slate-900 dark:text-white">Diferenciador tecnológico</h3>
                        <p class="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                            Monitoreamos operación de campo, controlamos trazabilidad del servicio y mejoramos tiempos de atención mediante herramientas digitales.
                        </p>
                    </div>
                </div>

                <div class="rounded-2xl bg-slate-900 p-6 text-white">
                    <p class="text-sm font-bold uppercase tracking-widest text-primary">Conoce más</p>
                    <h3 class="mt-3 text-2xl font-black">Misión, visión y valores corporativos</h3>
                    <p class="mt-3 text-sm leading-7 text-slate-300">
                        Descubre cómo trabajamos, qué principios nos guían y por qué combinamos atención técnica con innovación aplicada al servicio.
                    </p>
                    <Button class="mt-5" label="Ir a misión y visión" severity="contrast" @click="goToMissionVision"/>
                </div>
            </div>
        </div>
    </section>
</template>


