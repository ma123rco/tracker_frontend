<script setup lang="ts">
import AboutSection from "@/components/AboutSection.vue";
import CompanyHighlightsSection from "@/components/CompanyHighlightsSection.vue";
import HeroSection from "@/components/HeroSection.vue";
import PromoBanner from "@/components/PromoBanner.vue";
import ServicesSection from "@/components/ServicesSection.vue";
import TestimonialsSection from "@/components/TestimonialsSection.vue";
import ContactSection from "@/components/ContactSection.vue";
</script>

<template>
    <div>
        <main>
            <HeroSection v-reveal/>
            <PromoBanner v-reveal/>
            <AboutSection v-reveal/>
            <ServicesSection v-reveal/>
            <CompanyHighlightsSection v-reveal/>
            <TestimonialsSection v-reveal/>
            <ContactSection v-reveal/>
            <FooterBar v-reveal/>
        </main>
        <div class="fixed bottom-5 right-5" v-tooltip="'Escribenos y te atenderemos!!!'">
            <a href="https://wa.link/jwbw90" target="_blank" rel="noopener" aria-label="whatsApp media">
                <img src="https://images.icon-icons.com/2429/PNG/512/whatsapp_logo_icon_147205.png" class="text-lg h-20 w-20" alt="social"/>
            </a>
        </div>
    </div>
</template>
