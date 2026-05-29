<script setup lang="ts">
import router from "@/router/index.ts";
</script>
<template>
    <main class="flex-1 max-w-300 mx-auto w-full px-6 py-10">
        <div class="flex flex-col gap-4 mb-12">
            <h1 class="text-slate-900 dark:text-white text-5xl md:text-6xl font-black leading-tight tracking-tighter">
                Nuestras <span class="text-primary">Promociones</span>
            </h1>
            <p class="text-slate-600 dark:text-slate-400 text-lg max-w-2xl font-medium">
                Aprovecha nuestras ofertas exclusivas diseñadas para optimizar tu consumo de gas y garantizar la seguridad de tus
                instalaciones industriales y residenciales.
            </p>
        </div>

        <div class="mb-16">
            <div class="group relative overflow-hidden rounded-xl bg-slate-900 min-h-100 flex flex-col justify-end">
                <div class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60"
                     style="background-image: linear-gradient(to top, #231a0f 0%, rgba(35, 26, 15, 0.4) 60%, transparent 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuBbwoIT8QbSq2IzjnUH3GiqOsT4_0kzeoXu3cqbBw41X2LjHFY9s-KS8P2JHyNHXFQIAqo2y-3hN1FjEwZfFIA2HBBIV_CirUeevy93xhgYqGImfsFtQtEV8FSDuvV2ayL8t1iqbwYP629ah7HBJXX9SU_zA_Q_xqHbawp_fr2wzYwFlDFOQiDpZP78hMomLfE0PLmwEktWtHNtnfLosWluN-9GUPP4Z8rhUwoZpO03XKzDaBZx7ZhzkuhQR_sw4hJY_4QLjWN1iQ');"></div>
                <div class="relative p-8 md:p-12 max-w-3xl">
                    <span class="inline-block px-4 py-1 bg-primary text-background-dark text-xs font-black uppercase tracking-widest rounded-full mb-4">Oferta Limitada</span>
                    <h2 class="text-white text-3xl md:text-5xl font-black leading-tight mb-6">
                        Oferta de Lanzamiento: 20% de descuento en tu primera instalación
                    </h2>
                    <button class="bg-primary text-background-dark px-8 py-4 rounded-lg font-black text-lg hover:bg-white transition-all shadow-xl shadow-primary/20" 
                            @click="router.push({ name: 'contact' })">
                        Solicitar Presupuesto Gratis
                    </button>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="flex flex-col rounded-xl overflow-hidden border border-primary/10 bg-white dark:bg-slate-900/50 shadow-sm hover:shadow-primary/10 hover:border-primary/30 transition-all">
                <div class="h-64 bg-cover bg-center"
                     style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBQ9vvkLZZWQUExlOyu-meT_kfQYBOCt2SES9GKwame1XYKZa64v9iQ_rrGtQ_JF-I7_Yxtw0ydwLr2OeNXPMVTYP8YsiAa9UnpW4UxXyhpkdMi59rRrIwMBfWTAWBHAVHCjeQgCaMHNT1hzZH7m_TGQX2nWVdA9AIr1juL7fpdNDyHMO4h-KM6_P1pgIUHObF_0KLIGj8-a5bcOfRpOXy02jPwVnFHNFxRoL3CJKOiE_tFAiYD3NoNBwkwghwTF2ekyG88eIHvnw');"></div>
                <div class="p-8 flex flex-col h-full">
                    <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-3">Revisión de Fugas de Gas GRATIS</h3>
                    <p class="text-slate-600 dark:text-slate-400 mb-6 flex-1">
                        Tu seguridad es nuestra prioridad. Por la contratación de cualquier servicio de mantenimiento, incluimos una
                        revisión completa de fugas sin costo adicional.
                    </p>
                    <div class="flex items-center justify-between mt-auto">
                        <button @click="router.push({name: 'contact'})"
	                        class="bg-slate-900 dark:bg-primary text-white dark:text-background-dark px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity">
                            Agendar Cita
                        </button>
                    </div>
                </div>
            </div>
            <div class="flex flex-col rounded-xl overflow-hidden border border-primary/10 bg-white dark:bg-slate-900/50 shadow-sm hover:shadow-primary/10 hover:border-primary/30 transition-all">
                <div class="h-64 bg-cover bg-center"
                     style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCmm1CtqCgSeS87ApBPNRnSuV9-xopUZgmOsxHOWzsZSsUAdeiX3OQlWkSdO6CmLQEKOUymt8lwT0YqPrVUFc4yq9Zd0TaJD_C4G6mMBirJy6dKJ1kNKeDqnSOuhi7IkXCoP0nsUJijtLT4aqoNycp3SBnlw0nAE8Zurt8NMUiskaGZBq_HId4dvvrE1FV4Mmy8eZB8g5OScRD7wmAV2rdxiB6FO8SnNx17GONjzrXF2SL6UA3vbovPw4als_3Lre8RsthO8tBm6A');"></div>
                <div class="p-8 flex flex-col h-full">
                    <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-3">15% de descuento en Mantenimiento Industrial</h3>
                    <p class="text-slate-600 dark:text-slate-400 mb-6 flex-1">
                        Optimiza el rendimiento de tu planta. Descuento especial en contratos semestrales de mantenimiento preventivo para
                        calderas y hornos industriales.
                    </p>
                    <div class="flex items-center justify-between mt-auto">
                        <button @click="router.push({name: 'contact'})"
	                        class="bg-slate-900 dark:bg-primary text-white dark:text-background-dark px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity">
	                        Agendar Cita
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>
