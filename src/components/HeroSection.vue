<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const images = ref<string[]>([]);
const currentIndex = ref(0);
const isTransitioning = ref(false);
const router = useRouter();

let interval: ReturnType<typeof setInterval> | null = null;


const changeImage = (newIndex: number) => {
    if ( !images.value.length || isTransitioning.value) return;

    isTransitioning.value = true;

    // fade out rápido
    setTimeout(() => {
        currentIndex.value = newIndex;

        // fade in
        setTimeout(() => {
            isTransitioning.value = false;
        }, 50); // pequeño delay para que el DOM aplique el cambio
    }, 150); // duración fade-out
};

const nextImage = () => {
    const next = (currentIndex.value + 1) % images.value.length;
    changeImage(next);
};

const prevImage = () => {
    const prev =
        (currentIndex.value - 1 + images.value.length) % images.value.length;
    changeImage(prev);
};

const startAutoplay = () => {
    stopAutoplay();
    interval = setInterval(nextImage, 4000);
};

const stopAutoplay = () => {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
};

const preloadImages = async(src: string[]) => {
    await Promise.all(src.map((src) => new Promise<void>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve();
        img.onerror = () => resolve();
    })));
};

const goToContact = () => {
    void router.push({ name: "contact" });
};

const goToMissionVision = () => {
    void router.push({ name: "mission-vision" });
};

onMounted(async() => {
    const modules = import.meta.glob("@/assets/astomgas/*.{png,jpg,jpeg,webp}", { eager: true });

    const loaded = Object.values(modules).map((mod: any) => mod.default);
    await preloadImages(loaded);
    images.value = loaded;
    startAutoplay();
});

onUnmounted(() => stopAutoplay());

</script>

<template>
    <section class="section-hero" @mouseenter="stopAutoplay" @mouseleave="startAutoplay">
        <div class="hero-bg">
            <!-- Imagen actual -->
            <img v-if="images.length" :src="images[currentIndex]" class="hero-image transition-opacity duration-300"
                 :class="{ 'opacity-90': isTransitioning, 'opacity-100': !isTransitioning }" alt=""/>
            <div class="hero-overlay"></div>
        </div>

        <Button @click="prevImage" class="absolute! left-4 z-20 text-white text-3xl" rounded #icon>
            <i-material-symbols-arrow-back-ios-new-rounded/>
        </Button>

        <Button @click="nextImage" class="absolute! right-4 z-20 text-white text-3xl" rounded #icon>
            <i-material-symbols-arrow-forward-ios-rounded/>
        </Button>

        <!-- Content -->
        <div class="hero-container">
            <div class="mx-auto max-w-4xl">
                <span class="hero-badge"> Seguridad, calidad y eficiencia en cada proyecto </span>
                <h1 class="hero-title">
                    Soluciones integrales para
                    <span class="hero-highlight">
                    redes de gas domiciliario
                    </span>
                </h1>

                <p class="hero-description">
                    Instalamos, mantenemos y optimizamos sistemas de gas para hogares, además de vender e instalar calefones
                    certificados con respaldo técnico, personal capacitado y control operativo apoyado por tecnología.
                </p>

                <div class="hero-actions">
                    <Button label="Solicitar Cotización" unstyled class="hero-btn-primary" @click="goToContact"/>
                    <Button label="Misión y Visión" unstyled class="hero-btn-secondary" @click="goToMissionVision"/>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
@reference "@/style.css";


    .section-hero {
        @apply relative flex min-h-[85vh] items-center justify-center overflow-hidden;
    }

    .hero-bg {
        @apply absolute inset-0 z-0;
    }

    .hero-image {
        @apply h-full w-full object-cover;
        backface-visibility: hidden;
        filter: var(--hero-image-filter);
        transform: translateZ(0);
    }

    .hero-overlay {
        @apply absolute inset-0;
        background: linear-gradient(to top, var(--color-hero-overlay), transparent);
    }


    .hero-container {
        @apply container mx-auto px-6 lg:px-20 text-center relative z-10;
    }

    .hero-badge {
        @apply mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-widest border;
        color: var(--color-primary);
        background-color: color-mix(in oklab, var(--color-primary) 20%, transparent);
        border-color: color-mix(in oklab, var(--color-primary) 30%, transparent);
    }

    .hero-title {
        @apply mb-6 text-5xl md:text-7xl font-black leading-tight tracking-tight;
        color: var(--color-text-hero);
    }

    .hero-highlight {
        @apply italic;
        color: var(--color-primary);
    }

    .hero-description {
        @apply mb-10 text-lg md:text-xl md:leading-relaxed max-w-2xl mx-auto;
        color: var(--color-text-hero-muted);
    }

    .hero-actions {
        @apply flex flex-col gap-4 sm:flex-row sm:justify-center;
    }

    .hero-btn-primary {
        @apply flex h-14 items-center justify-center rounded-xl px-10 text-lg font-black transition-transform;
        background-color: var(--color-primary);
        color: black;
    }

    .hero-btn-primary:hover {
        transform: scale(1.05);
    }

    .hero-btn-secondary {
        @apply flex h-14 items-center justify-center rounded-xl border-2 px-10 text-lg font-bold backdrop-blur-sm transition-all;
        border-color: rgba(255, 255, 255, 0.3);
        color: white;
        background-color: rgba(255, 255, 255, 0.1);
    }

    .hero-btn-secondary:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }
</style>