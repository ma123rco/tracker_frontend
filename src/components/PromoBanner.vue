<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const goToMissionVision = () => {
    void router.push({ name: "mission-vision" });
};
</script>

<template>
    <div class="container mx-auto -mt-12 relative z-20 px-6 lg:px-20">
        <div class="flex flex-col items-center justify-between gap-6 rounded-2xl border border-primary/30 bg-primary p-6 shadow-2xl md:flex-row md:p-10">
            <div class="flex items-center gap-6">
                <div class="hidden md:flex h-16 w-16 items-center justify-center rounded-full bg-background-dark text-primary">
                    <i-material-symbols-verified-outline-rounded class="text-4xl"/>
                </div>
                <div>
                    <p class="text-2xl font-black text-background-dark uppercase">Política de calidad</p>
                    <p class="text-background-dark/80 font-medium max-w-3xl">
                        Trabajamos bajo estrictos estándares de seguridad, cumpliendo la normativa vigente y promoviendo la mejora
                        continua en cada instalación, mantenimiento o servicio técnico de gas domiciliario.
                    </p>
                </div>
            </div>
            <Button class="w-full md:w-auto" label="Conocer misión y visión" severity="contrast" @click="goToMissionVision"/>
        </div>
    </div>
</template>
