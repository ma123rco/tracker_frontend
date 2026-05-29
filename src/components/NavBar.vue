<script setup lang="ts">
import { ref } from "vue";
import { useDark, useToggle } from "@vueuse/core";

const isDark = useDark({ disableTransition: false, initialValue: "light" });
const toggleDark = useToggle(isDark);

const items = ref([
    {
        label: "Configuración",
        icon: "pi pi-palette",
        items: [
            {
                label: "Test 1",
                route: "/test1"
            },
            {
                label: "Users",
                route: "/users"
            }
        ]
    }
]);
</script>

<template>
    <Menubar :model="items" class="sticky top-0 bottom-2 z-50 mx-2" breakpoint="840px">
        <template #start>
            <i-material-symbols-star-outline-rounded class="text-2xl"/>
        </template>
        <template #item="{ item, props, hasSubmenu }">
            <RouterLink v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
                <a v-ripple :href="href" v-bind="props.action" @click="navigate">
                    <span :class="item.icon"/>
                    <span>{{ item.label }}</span>
                </a>
            </RouterLink>
            <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
                <span :class="item.icon"/>
                <span>{{ item.label }}</span>
                <i-material-symbols-expand-more v-if="hasSubmenu"/>
            </a>
        </template>
        <template #end>
            <div class="flex items-center gap-2">
                <InputText size="small"/>
                <Button size="small" rounded @click="toggleDark()" #icon>
                    <i-material-symbols-clear-day-rounded v-if="isDark"/>
                    <i-material-symbols-partly-cloudy-night v-else/>
                </Button>
                <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" shape="circle"/>
            </div>
        </template>
    </Menubar>
</template>
