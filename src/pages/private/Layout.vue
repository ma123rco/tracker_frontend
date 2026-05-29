<script setup lang="ts">
import NavBar from "@/components/NavBar.vue";

</script>

<template>
    <div class="flex h-screen flex-col bg-slate-200 dark:bg-surface-950">
        <header class="shrink-0 mt-2">
            <NavBar/>
        </header>
        <RouterView v-slot="{ Component, route }">
            <Transition mode="out-in">
                <main :key="route.name" class="mt-4 flex-1 overflow-y-auto min-h-0 w-full px-2 sm:px-4 md:px-8 lg:px-12">
                    <component :is="Component"/>
                </main>
            </Transition>
        </RouterView>
    </div>
</template>
