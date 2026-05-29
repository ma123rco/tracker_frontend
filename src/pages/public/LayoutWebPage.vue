<template>
    <div class="min-h-screen bg-slate-50 dark:bg-surface-950 flex flex-col">
        <header class="shrink-0">
            <NavBarWebPage/>
        </header>

        <main class="flex-1 min-h-0">
            <RouterView v-slot="{ Component, route }">
                <Transition name="web-page-route" mode="out-in">
                    <div :key="route.fullPath" class="min-h-full">
                        <component :is="Component"/>
                    </div>
                </Transition>
            </RouterView>
        </main>
    </div>
</template>

<style scoped>
.web-page-route-enter-active,
.web-page-route-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.web-page-route-enter-from,
.web-page-route-leave-to {
    opacity: 0;
    transform: translateY(6px);
}
</style>

