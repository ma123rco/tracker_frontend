<script setup lang="ts">
import { useRouter } from "vue-router";

interface QuickLink {
	label: string;
	href?: string;
	url?: string;
	externalUrl?: string;
}

const router = useRouter();

const quickLinks: QuickLink[] = [
	{ href: "/#sobre-nosotros", label: "Sobre Nosotros" },
	{ href: "/#servicios", label: "Servicios Técnicos" },
	{ label: "Misión y Visión", url: "mision-y-vision" },
	{ label: "Promociones", url: "promociones" }
];

const getQuickLinkHref = (link: QuickLink): string => {
	if (link.externalUrl) return link.externalUrl;
	return link.url ? "#" : (link.href ?? "#");
};

const getQuickLinkTarget = (link: QuickLink): string | undefined => {
	return link.externalUrl ? "_blank" : undefined;
};

const onQuickLinkClick = (link: QuickLink, event: MouseEvent): void => {
	if (link.externalUrl || !link.url) return;

	event.preventDefault();
	const targetRoute = link.url.startsWith("/") ? link.url : `/${ link.url }`;
	void router.push(targetRoute);
};

const legalLinks: QuickLink[] = [
	{ label: "Política de Privacidad", url: "politicas-de-privacidad" },
	{ label: "Reclamaciones", externalUrl: "https://wa.me/59176999982" }
];

const socialLinks = [
	{
		href: "https://www.facebook.com/profile.php?id=100054572164244",
		icon: "https://images.icon-icons.com/2429/PNG/512/facebook_logo_icon_147291.png",
		label: "Facebook"
	},
	{
		href: "https://www.instagram.com/intra_prod",
		icon: "https://images.icon-icons.com/1826/PNG/512/4202090instagramlogosocialsocialmedia-115598_115703.png",
		label: "Instagram"
	},
	{
		href: "https://wa.link/jwbw90",
		icon: "https://images.icon-icons.com/2429/PNG/512/whatsapp_logo_icon_147205.png",
		label: "WhatsApp"
	}
];

</script>

<template>
	<footer class="bg-slate-900 text-slate-400 mt-auto">
		<div class="container mx-auto px-6 lg:px-20 py-16">
			<div class="grid gap-12 lg:grid-cols-4">

				<div class="lg:col-span-2">
					<div class="mb-6 flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
							<i-material-symbols-local-fire-department-rounded class="text-2xl text-black"/>
						</div>
						<p class="text-2xl font-black tracking-tight text-white"> AS-TOMGAS S.R.L. </p>
					</div>

					<p class="max-w-md text-lg leading-relaxed">
						Especialistas en instalación y mantenimiento de redes de gas domiciliario, calefones certificados y atención técnica
						con trazabilidad, seguridad y compromiso con cada hogar.
					</p>

					<!-- Redes Sociales -->
					<div class="mt-8 flex gap-4">
						<a v-for="social in socialLinks" :key="social.label" :href="social.href" target="_blank" rel="noopener"
						   :aria-label="social.label" class="flex items-center justify-center rounded-full">
							<img :src="social.icon" class="text-lg object-cover w-14 h-14" alt="social"/>
						</a>
					</div>
				</div>

				<!-- Quick Links -->
				<nav aria-label="Enlaces rápidos">
					<p class="mb-6 text-lg font-bold text-white"> Enlaces Rápidos </p>
					<ul class="space-y-4">
						<li v-for="link in quickLinks" :key="link.label">
							<a :href="getQuickLinkHref(link)" class="transition-colors hover:text-primary"
							   :target="getQuickLinkTarget(link)" :rel="link.externalUrl ? 'noopener noreferrer' : undefined"
							   @click="onQuickLinkClick(link, $event)"> {{ link.label }} </a>
						</li>
					</ul>
				</nav>

				<!-- Legal -->
				<nav aria-label="Información legal">
					<h5 class="mb-6 text-lg font-bold text-white"> Legal </h5>

					<ul class="space-y-4">
						<li v-for="link in legalLinks" :key="link.label">
							<a :href="getQuickLinkHref(link)" class="transition-colors hover:text-primary"
							   :target="getQuickLinkTarget(link)" :rel="link.externalUrl ? 'noopener noreferrer' : undefined"
							   @click="onQuickLinkClick(link, $event)"> {{ link.label }} </a>
						</li>
					</ul>
				</nav>
			</div>

			<!-- Bottom -->
			<div class="mt-16 border-t border-white/10 pt-8 text-center text-sm">
				<p> © {{ new Date().getFullYear() }} AS-TOMGAS S.R.L. Todos los derechos reservados. </p>
			</div>
		</div>
	</footer>
</template>
