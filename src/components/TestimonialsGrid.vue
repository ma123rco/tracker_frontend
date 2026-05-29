<script setup lang="ts">
import type { CommentInterface } from "@/types/CommentsInterface.ts";
import { safeParseToDate, formatDateToString } from "@/composables/convertDates.ts";

interface Props {
	comments: CommentInterface[];
	loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	loading: false
});

const getInitials = (fullName: string): string => {
	return fullName.trim().split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
};
</script>

<template>
	<div v-if="loading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<div v-for="n in 4" :key="n" class="testimonial-card animate-pulse">
			<div class="flex items-center gap-4 mb-4">
				<div class="h-14 w-14 rounded-full bg-primary/20"/>
				<div class="flex-1 space-y-2">
					<div class="h-4 bg-primary/20 rounded w-3/4"/>
					<div class="h-3 bg-primary/10 rounded w-1/2"/>
				</div>
			</div>
			<div class="flex gap-1 mb-4">
				<div v-for="s in 5" :key="s" class="h-5 w-5 rounded bg-primary/20"/>
			</div>
			<div class="space-y-2">
				<div class="h-3 bg-primary/10 rounded w-full"/>
				<div class="h-3 bg-primary/10 rounded w-5/6"/>
				<div class="h-3 bg-primary/10 rounded w-4/6"/>
			</div>
		</div>
	</div>

	<div v-else-if="comments.length" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<div v-for="c in comments" :key="c.id" class="testimonial-card">
			<div class="stars mb-4">
				<i-material-symbols-kid-star-outline v-for="star in c.rating" :key="star"/>
				<i-material-symbols-kid-star-outline v-for="empty in (5 - c.rating)" :key="`e${empty}`"
				                                     class="opacity-25"/>
			</div>

			<p class="testimonial-message">"{{ c.comment }}"</p>

			<div class="testimonial-user">
				<div class="avatar-initials">{{ getInitials(c.full_name) }}</div>
				<div>
					<p class="user-name">{{ c.full_name }}</p>
					<p v-if="c.created_at && safeParseToDate(c.created_at)" class="user-role">
						{{ formatDateToString(safeParseToDate(c.created_at) as Date, "dd MMM yyyy") }}
					</p>
				</div>
			</div>
		</div>
	</div>

	<div v-else class="col-span-2 flex flex-col items-center gap-3 py-12 text-center">
		<i-material-symbols-kid-star-outline class="text-5xl opacity-30" style="color: var(--color-primary)"/>
		<p class="text-lg font-medium opacity-50" style="color: var(--color-text-title)">Aún no hay comentarios aprobados</p>
	</div>
</template>

<style scoped>
@reference "@/style.css";

	.testimonial-card {
		@apply rounded-2xl p-8 shadow-lg border;
		background-color: var(--color-card);
		border-color: color-mix(in oklab, var(--color-primary) 10%, transparent);
	}

	.stars {
		@apply flex gap-1;
		color: var(--color-primary);
	}

	.testimonial-message {
		@apply mb-6 italic text-lg;
		color: var(--color-text-body);
	}

	.testimonial-user {
		@apply flex items-center gap-4;
	}

	.avatar-initials {
		@apply h-12 w-12 rounded-full flex items-center justify-center font-bold shrink-0;
		background-color: color-mix(in oklab, var(--color-primary) 20%, transparent);
		color: var(--color-primary);
	}

	.user-name {
		@apply font-bold;
		color: var(--color-text-title);
	}


	.user-role {
		@apply text-sm;
		color: var(--color-text-muted);
	}
</style>

