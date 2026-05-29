<script setup lang="ts">
import { ref } from "vue";
import ValidateFormItem from "@/components/formItem/ValidateFormItem.vue";

const refPassword = ref();
const loading = ref(false);

</script>

<template>

    <div class="flex min-h-screen items-center justify-center p-2 bg-primary-100 dark:bg-slate-900 overflow-hidden">
        <div class="z-10 w-full max-w-md rounded-2xl bg-white/70 dark:bg-gray-900/70  backdrop-blur-2xl backdrop-saturate-150 border border-white/20 dark:border-white/10 p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)]">

            <div class="mb-6 flex justify-center">
                <img src="@/assets/logo.svg" class="h-16 sm:h-20 object-contain" alt="logo" />
            </div>

            <h2 class="text-center text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                Iniciar sesión
            </h2>

            <p class="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
                Ingresa tus credenciales
            </p>

            <div class="align-items-form mt-6" v-focustrap>

                <ValidateFormItem name="username" span="12" label="Usuario" mark v-slot="{ value, handleBlur, handleChange, error }">
                    <InputText :model-value="value" fluid placeholder="Ingrese su usuario" id="username" autofocus aria-label="Usuario"
                               :invalid="!!error" @blur="handleBlur"/>
                </ValidateFormItem>

                <ValidateFormItem name="password" span="12" label="Contraseña" mark v-slot="{ value, handleBlur, handleChange, error }">
                    <Password inputClass="w-full" :feedback="false" :model-value="value" :invalid="!!error" fluid ref="refPassword"
                              id="password" aria-label="Contraseña" @blur="handleBlur" toggleMask input-id="password" panel-id="password"
                              @update:model-value="handleChange" placeholder="********"/>
                </ValidateFormItem>
                <div class="max-cols-12">
                    <Button label="Iniciar Sesión" fluid :disabled="loading" :loading>
                        <template #icon>
                            <i-ic-baseline-log-in class="absolute right-2 order-1 h-7 w-7"/>
                        </template>
                        <template #loadingicon>
                            <i-svg-spinners-ring-resize class="absolute right-2 order-1 h-7 w-7"/>
                        </template>
                    </Button>
                </div>
            </div>
        </div>
    </div>

    <svg viewBox="0 0 1600 800" class="pointer-events-none fixed inset-0 h-screen w-screen" preserveAspectRatio="none">

        <rect class="fill-primary-500 dark:fill-surface-900" fill="var(--p-primary-500)" width="1600" height="800"/>
        <path class="fill-primary-400 dark:fill-surface-800" fill="var(--p-primary-400)"
              d="M478.4 581c3.2 0.8 6.4 1.7 9.5 2.5c196.2 52.5 388.7 133.5 593.5 176.6c174.2 36.6 349.5 29.2 518.6-10.2V0H0v574.9c52.3-17.6 106.5-27.7 161.1-30.9C268.4 537.4 375.7 554.2 478.4 581z"/>
        <path class="fill-primary-300 dark:fill-surface-700" fill="var(--p-primary-300)"
              d="M181.8 259.4c98.2 6 191.9 35.2 281.3 72.1c2.8 1.1 5.5 2.3 8.3 3.4c171 71.6 342.7 158.5 531.3 207.7c198.8 51.8 403.4 40.8 597.3-14.8V0H0v283.2C59 263.6 120.6 255.7 181.8 259.4z"/>
        <path class="fill-primary-200 dark:fill-surface-600" fill="var(--p-primary-200)"
              d="M454.9 86.3C600.7 177 751.6 269.3 924.1 325c208.6 67.4 431.3 60.8 637.9-5.3c12.8-4.1 25.4-8.4 38.1-12.9V0H288.1c56 21.3 108.7 50.6 159.7 82C450.2 83.4 452.5 84.9 454.9 86.3z"/>
        <path class="fill-primary-100 dark:fill-surface-500" fill="var(--p-primary-100)"
              d="M1397.5 154.8c47.2-10.6 93.6-25.3 138.6-43.8c21.7-8.9 43-18.8 63.9-29.5V0H643.4c62.9 41.7 129.7 78.2 202.1 107.4C1020.4 178.1 1214.2 196.1 1397.5 154.8z"/>
    </svg>
</template>
