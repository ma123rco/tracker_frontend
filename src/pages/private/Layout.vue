<script setup lang="ts">
import NavBar from "@/components/NavBar.vue";

</script>

<template>
    <div class="flex h-screen flex-col bg-slate-200 dark:bg-surface-950">
        <header class="shrink-0 my-2">
            <NavBar/>
        </header>
        <main class="w-full flex-1 overflow-y-auto min-h-0 px-2 sm:px-4 md:px-8 lg:px-12">
            <RouterView v-slot="{ Component }">
                <transition mode="out-in">
                    <component :is="Component"/>
                </transition>
            </RouterView>
        </main>
    </div>
</template>
