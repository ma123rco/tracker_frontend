<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Api } from "@/api/connection.ts";
import type { CommentInterface, CommentsGet } from "@/types/CommentsInterface.ts";
import TestimonialsGrid from "@/components/TestimonialsGrid.vue";

const comments = ref<CommentInterface[]>([]);
const loading = ref(false);

const onGetComments = async() => {
	try {
		loading.value = true;
		const { response }: CommentsGet = await Api.Get({ route: "comments" });
		if (response?.status === 200) {
			comments.value = Array.isArray(response.data.data) ? response.data.data : [];
		}
	} catch (e) {
		console.error(e);
	} finally {
		loading.value = false;
	}
};

onMounted(async() => {
	await onGetComments();
});
</script>

<template>
	<section class="section-of-content" id="testimonios">
		<div class="section-container flex flex-col gap-12">
			<div class="flex flex-col gap-4 text-center max-w-2xl mx-auto">
				<h2 class="section-eyebrow">Experiencias reales</h2>
				<h3 class="section-title">Lo que dicen las familias que atendimos</h3>
				<p class="section-description">
					Cada comentario refleja nuestro compromiso con instalaciones seguras, atención personalizada y soporte técnico confiable
					para hogares en Cochabamba y municipios cercanos.
				</p>
				<div class="section-stats justify-center">
					<div class="avatar-group">
						<div v-for="i in 3" :key="i" class="avatar"/>
					</div>
					<p class="section-stats-text">Clientes atendidos con enfoque en seguridad y calidad</p>
				</div>
			</div>

			<TestimonialsGrid :comments="comments" :loading="loading"/>
		</div>
	</section>
</template>

<style scoped>
@reference "@/style.css";

	.section-of-content {
		@apply py-24;
		background-color: var(--color-bg-section);
	}

	.section-container {
		@apply container mx-auto px-6 lg:px-20;
	}

	.section-eyebrow {
		@apply text-sm font-bold uppercase tracking-widest;
		color: var(--color-primary);
	}

	.section-title {
		@apply mt-2 text-4xl md:text-5xl font-black leading-tight;
		color: var(--color-text-title);
	}

	.section-description {
		@apply mt-6 text-lg;
		color: var(--color-text-body);
	}


	.section-stats {
		@apply mt-10 flex items-center gap-4;
	}

	.section-stats-text {
		@apply text-sm font-bold;
		color: var(--color-text-title);
	}

	.avatar-group {
		@apply flex -space-x-3;
	}

	.avatar {
		@apply h-12 w-12 rounded-full border-4;
		background-color: var(--color-text-muted);
		border-color: var(--color-bg-section);
	}
</style>