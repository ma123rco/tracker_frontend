<script setup lang="ts">
import CommentsSection from "@/components/CommentsSection.vue";
</script>

<template>
	<main class="flex flex-col flex-1 px-6 lg:px-20 py-12 max-w-7xl mx-auto w-full">
		<section class="flex flex-col gap-6 mb-8">
			<div class="flex flex-col gap-3">
				<h1 class="text-slate-900 dark:text-white text-5xl font-black leading-tight tracking-tight">Lo que nuestros clientes
					dicen</h1>
				<p class="text-slate-600 dark:text-primary/70 text-lg font-medium max-w-2xl">La confianza de nuestros clientes es nuestro
					mayor orgullo. Conoce las experiencias reales con nuestro servicio de gas.</p>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
				<div class="flex flex-col gap-2 rounded-xl p-8 bg-primary/10 border border-primary/20">
					<i-material-symbols-groups-outline class="text-primary text-4xl mb-2"/>
					<p class="text-slate-600 dark:text-slate-300 text-base font-medium">Clientes Satisfechos</p>
					<p class="text-primary text-4xl font-black">+5000</p>
				</div>
				<div class="flex flex-col gap-2 rounded-xl p-8 bg-primary/10 border border-primary/20">
					<i-material-symbols-verified-outline-rounded class="text-primary text-4xl mb-2"/>
					<p class="text-slate-600 dark:text-slate-300 text-base font-medium">Certificaciones de Calidad</p>
					<p class="text-primary text-4xl font-black">ISO 9001:2015</p>
				</div>
			</div>
		</section>

		<CommentsSection/>
	</main>
</template>
