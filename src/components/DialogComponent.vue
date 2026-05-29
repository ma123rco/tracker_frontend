<script setup lang="ts">
import { useModal } from "@/composables/useModal";
import Dialog from "primevue/dialog";
import router from "@/router";
import { onMounted, onUnmounted } from "vue";

const { stack, closeModal } = useModal();

router.beforeEach((to, from) => {
    if (to.path !== from.path) {
        closeModal(true);
    }
    return true;
});

onMounted(() => {
    window.addEventListener("keydown", handleEsc);
});

onUnmounted(() => {
    window.removeEventListener("keydown", handleEsc);
});

const handleEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
        if (stack.value.length > 0) {
            e.preventDefault();
            e.stopImmediatePropagation();
            closeModal();
        }
    }
};

</script>

<template>
    <Dialog v-for="(mdo, index) in stack" :key="index" v-model:visible="mdo.visible" :modal="mdo.modal" closable :closeOnEscape="false"
            :dismissableMask="mdo.dismissableMask" :header="mdo.header" :style="`width: ${mdo.width}`" :baseZIndex="mdo.zIndex"
            :breakpoints="mdo.breakpoints ?? { '1100px': '70vw', '950px': '90vw', '640px': '95vw' }" :position="mdo.position ?? 'center'">
        <template #closeicon="scope">
            <component :is="mdo.slots?.closeicon" v-bind="scope" v-if="mdo.slots?.closeicon"/>
            <i-material-symbols-close-rounded class="text-surface-800 dark:text-surface-100 text-2xl" v-else/>
        </template>

        <template #header>
            <component :is="mdo.slots?.header ?? null" v-if="mdo.slots?.header"/>
            <slot name="header" v-else/>
        </template>

        <template #footer v-if="mdo.slots?.footer || mdo.withTeleport">
            <component :is="mdo.slots?.footer ?? null" v-if="mdo.slots?.footer"/>
            <slot name="footer" v-else/>
        </template>

        <template #closebutton="scope">
            <component :is="mdo.slots?.closebutton ?? null" v-bind="scope" v-if="mdo.slots?.closebutton"/>
            <slot name="closebutton" v-bind="scope" v-else/>
        </template>

        <template #maximizebutton="scope">
            <component :is="mdo.slots?.maximizebutton ?? null" v-bind="scope" v-if="mdo.slots?.maximizebutton"/>
            <slot name="maximizebutton" v-bind="scope" v-else/>
        </template>

        <template #maximizeicon="scope">
            <component :is="mdo.slots?.maximizeicon ?? null" v-bind="scope" v-if="mdo.slots?.maximizeicon"/>
            <slot name="maximizeicon" v-bind="scope" v-else/>
        </template>

        <component :is="mdo.component"/>
    </Dialog>
</template>
