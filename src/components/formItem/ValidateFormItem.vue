<script setup lang="ts">

import { Field } from "vee-validate";

interface FormItemProps {
    colsPro?: string;
    forLabel?: string;
    helpText?: string;
    hideError?: boolean;
    hideLabel?: boolean;
    label?: string;
    labelClass?: string;
    mark?: boolean;
    name?: string;
    span?: string;
}

const props = withDefaults(defineProps<FormItemProps>(), { hideError: false, hideLabel: false, label: "", mark: false, name: "" });

</script>

<template>
    <div :class="[ colsPro || '', span ? `max-cols-${props.span}` : '' ]">
        <Field :name="name" v-slot="field">
            <!-- Label -->
            <label v-if="!hideLabel && label.length" :for="forLabel || name" class="relative flex items-center gap-1 label-size">
                <slot name="label">
                    <span :class="labelClass">{{ label }}</span>
                    <span v-if="field.meta.required && label.length || mark" class="ml-1 text-red-500">*</span>
                    <span v-if="props.helpText" class="ml-2 inline-flex items-center" v-tooltip="props.helpText">
                        <i-material-symbols-help-outline class="text-[15px]"/>
                    </span>
                </slot>
            </label>

            <!-- Input slot with unified props -->
            <slot v-bind="{ ...field, error: field.errorMessage, id: props.forLabel || name }" @blur="field.handleBlur($event, true)"/>
            <!-- Error Message -->
            <small v-if="!hideError" class="error-required text-red-500 text-"> {{ field.errorMessage }} </small>
        </Field>
    </div>
</template>
