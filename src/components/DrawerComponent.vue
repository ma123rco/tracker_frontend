<script setup lang="ts">
import { useDrawer } from "@/composables/useDrawer";
import { useRouter } from "vue-router";

const router = useRouter();
const { drawerOptions, closeDrawer } = useDrawer();
router.afterEach(() => closeDrawer());

</script>

<template>
    <Drawer v-model:visible="drawerOptions.show" :header="drawerOptions.header" :class="drawerOptions.size" :modal="drawerOptions.modal"
            @after-hide="drawerOptions.onAfterHide" @after-show="drawerOptions.onAfterShow" @before-hide="drawerOptions.onBeforeHide"
            :position="drawerOptions.position" show-close-icon>
        <component :is="drawerOptions.component"/>
    </Drawer>
</template>
