<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
	photo1?: string | null;
	photo2?: string | null;
}>();

const slots = computed(() => [
	{ key: "photo1" as const, label: "Foto 1", url: props.photo1 ?? null },
	{ key: "photo2" as const, label: "Foto 2", url: props.photo2 ?? null }
]);

const hasAnyPhoto = computed(() => !!props.photo1 || !!props.photo2);

</script>

<template>
	<div>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			<article v-for="slot in slots" :key="slot.key" class="slot-card">
				<div class="slot-header">
					<p class="slot-title">{{ slot.label }}</p>
				</div>

				<Image v-if="slot.url" :src="slot.url" :alt="slot.label" class="h-96 w-full"
				       imageClass="h-96 w-full rounded-xl object-cover bg-primary-200 dark:bg-surface-950" preview/>

				<div v-else class="empty-frame">
					<i-material-symbols-image-not-supported-rounded class="text-2xl opacity-60"/>
					<p class="text-xs">Sin imagen</p>
				</div>
			</article>
		</div>

		<p v-if="!hasAnyPhoto" class="empty-message">Aun no hay fotos cargadas.</p>
	</div>
</template>

<style scoped>
@reference "@/style.css";

.slot-card {
	@apply rounded-lg border border-surface-300 dark:border-surface-700 p-2 bg-surface-50 dark:bg-surface-800;
}

.slot-header {
	@apply mb-2 flex items-center justify-between;
}

.slot-title {
	@apply text-xs font-semibold text-surface-600 dark:text-surface-300;
}

.empty-frame {
	@apply h-32 w-full rounded-md border border-dashed border-surface-300 dark:border-surface-700
	flex flex-col items-center justify-center gap-1 text-surface-500 dark:text-surface-400;
}

.empty-message {
	@apply mt-2 text-xs text-surface-500;
}
</style>


