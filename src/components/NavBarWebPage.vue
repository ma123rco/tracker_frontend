<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRoute } from "vue-router";

const mobileOpen = ref(false);
const route = useRoute();

const links = [
    { name: "Inicio", path: "/" },
    { name: "Misión y Visión", path: "/mision-y-vision" },
    { name: "Promociones", path: "/promociones" },
    { name: "Testimonios", path: "/testimonios" },
    { name: "Contacto", path: "/contacto" },
    { name: "Login", path: "/login" }
];

const toggleMenu = () => {
    mobileOpen.value = !mobileOpen.value;
};

const isActiveLink = (path: string): boolean => {
    if (path === "/") return route.path === "/";
    return route.path === path || route.path.startsWith(`${ path }/`);
};
</script>

<template>
    <header class="header">
        <div class="header-container">

            <!-- Logo -->
            <RouterLink to="/" class="logo">
                <div class="logo-icon">
                    <i-material-symbols-local-fire-department-rounded class="text-2xl sm:text-3xl"/>
                </div>

                <div>
                    <h1 class="logo-text">
                        AS-TOMGAS
                    </h1>
                    <span class="logo-sub">S.R.L.</span>
                </div>
            </RouterLink>

            <!-- Desktop navigation -->
            <nav class="nav-desktop">
                <RouterLink
                        v-for="link in links"
                        :key="link.name"
                        :to="link.path"
                        class="nav-link"
                        :class="{ 'nav-link-active': isActiveLink(link.path) }">
                    {{ link.name }}
                </RouterLink>
            </nav>

            <!-- Right section -->
            <div class="actions">

                <RouterLink to="/contacto" class="btn-primary">
                    <span class="hidden md:inline">Cotizar Ahora</span>
                    <span class="md:hidden">Cotizar</span>
                </RouterLink>

                <button @click="toggleMenu" class="mobile-toggle" :aria-label="mobileOpen ? 'Cerrar menú' : 'Abrir menú'">
                    <i-material-symbols-menu-rounded v-if="!mobileOpen" class="text-2xl sm:text-3xl"/>
                    <i-material-symbols-close-rounded v-else class="text-2xl sm:text-3xl"/>
                </button>

            </div>

        </div>

        <!-- Mobile menu -->
        <transition
                enter-active-class="transition duration-300 ease-out"
                enter-from-class="opacity-0 -translate-y-4 scale-95"
                enter-to-class="opacity-100 translate-y-0 scale-100"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 -translate-y-4 scale-95">
            <div v-if="mobileOpen" class="mobile-menu">
                <nav class="mobile-nav">

                    <RouterLink
                            v-for="link in links"
                            :key="link.name"
                            :to="link.path"
                            @click="mobileOpen = false"
                            class="mobile-link"
                            :class="{ 'mobile-link-active': isActiveLink(link.path) }">
                        {{ link.name }}
                    </RouterLink>

                    <RouterLink
                            to="/contacto"
                            @click="mobileOpen = false"
                            class="mobile-cta">
                        Cotizar Ahora
                    </RouterLink>

                </nav>
            </div>
        </transition>

    </header>
</template>

<style scoped>
@reference "@/style.css";

.header {
    @apply sticky top-0 z-50 w-full
    bg-linear-to-r from-white to-slate-50
    dark:bg-linear-to-r dark:from-surface-900 dark:to-surface-800
    border-b border-primary/10 dark:border-primary/20
    shadow-sm hover:shadow-md transition-shadow duration-300
    backdrop-blur-sm;
}

.header-container {
    @apply w-full max-w-7xl mx-auto
    flex h-16 md:h-20 items-center justify-between
    px-4 sm:px-6 lg:px-8;
}

.logo {
    @apply flex items-center gap-2 sm:gap-3 shrink-0
    hover:opacity-80 transition-opacity duration-200;
}

.logo-icon {
    @apply flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center
    rounded-lg bg-linear-to-br from-primary to-red-600
    text-surface-900 dark:text-surface-0
    shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105;
}

.logo-text {
    @apply text-base sm:text-lg md:text-xl font-black tracking-tight
    text-slate-900 dark:text-white leading-tight;
}

.logo-sub {
    @apply text-primary text-xs font-bold block leading-none;
}

.nav-desktop {
    @apply hidden lg:flex items-center gap-8 xl:gap-10
    mx-auto flex-1 justify-center;
}

.nav-link {
    @apply font-semibold text-slate-700 dark:text-slate-300
    hover:text-primary dark:hover:text-primary
    transition-all duration-300 text-base
    relative pb-1
    after:content-[''] after:absolute after:bottom-0 after:left-0
    after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300
    hover:after:w-full;
}

.nav-link-active {
    @apply text-primary dark:text-primary after:w-full;
}

.actions {
    @apply flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0;
}

.btn-primary {
    @apply hidden sm:inline-flex h-10 md:h-11 items-center justify-center
    rounded-lg bg-linear-to-r from-primary to-red-600
    px-4 md:px-6 text-xs md:text-sm font-bold text-surface-900 dark:text-surface-0
    shadow-md hover:shadow-lg transition-all duration-300
    hover:brightness-110 active:scale-95
    transform hover:scale-105;
}

.mobile-toggle {
    @apply lg:hidden inline-flex items-center justify-center
    h-10 w-10 rounded-lg
    text-slate-900 dark:text-white
    hover:bg-primary/10 dark:hover:bg-primary/20
    transition-colors duration-300;
}

.mobile-menu {
    @apply lg:hidden border-t border-primary/10 dark:border-primary/20
    bg-white dark:bg-surface-900
    shadow-lg;
}

.mobile-nav {
    @apply w-full max-w-7xl mx-auto
    px-4 sm:px-6 lg:px-8
    py-4 sm:py-6 flex flex-col gap-3 sm:gap-4;
}

.mobile-link {
    @apply text-base sm:text-lg font-semibold
    text-slate-800 dark:text-slate-200
    hover:text-primary dark:hover:text-primary
    transition-colors duration-300
    py-2 px-3 rounded-lg
    hover:bg-primary/10 dark:hover:bg-primary/20;
}

.mobile-link-active {
    @apply text-primary dark:text-primary bg-primary/10 dark:bg-primary/20;
}

.mobile-cta {
    @apply mt-2 sm:mt-4 flex items-center justify-center rounded-lg
    bg-linear-to-r from-primary to-red-600
    py-2.5 sm:py-3 px-4 font-bold
    text-surface-900 dark:text-surface-0
    shadow-md hover:shadow-lg
    transition-all duration-300
    hover:brightness-110 active:scale-95
    transform hover:scale-105;
}
</style>