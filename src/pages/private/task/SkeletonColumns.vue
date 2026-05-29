<template>
    <div class="shrink-0 rounded-xl border border-surface-300 dark:border-surface-700 bg-surface-100 dark:bg-surface-800 p-3 animate-pulse">
        <div class="h-4 w-1/2 bg-surface-300 dark:bg-surface-600 rounded mb-2"/>
        <div class="h-3 w-3/4 bg-surface-200 dark:bg-surface-700 rounded mb-4"/>

        <div class="space-y-3">
            <div v-for="i in 3" :key="i" class="h-20 rounded bg-surface-200 dark:bg-surface-700"></div>
        </div>
    </div>
</template>
