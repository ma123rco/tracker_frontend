<script setup lang="ts">

/**
 * Props for the FormItem component.
 */
interface FormItemProps {
    /** The default text to display inside the label. */
    label?: string;
    /** Number of grid columns to span this item across (e.g. "1", "2"). */
    span?: string;
    /** Hide the label if true. */
    hideLabel?: boolean;
    /** The `for` attribute to link the label to an input's id. */
    forLabel?: string;
    /** Show an asterisk (*) after the label when true. */
    mark?: boolean;
    /** Hide the error text if true. */
    hideError?: boolean;
    /** The error message to display below the slot. */
    error?: string | null;
    /** Custom classes for column sizing (overrides `span`). */
    colsPro?: string;
}

const props = withDefaults(defineProps<FormItemProps>(), {
    label: "",
    span: "1",
    hideLabel: false,
    forLabel: "",
    mark: false,
    hideError: false,
    error: null,
    colsPro: ""
});
</script>

<template>
    <div :class="colsPro || `max-cols-${props.span}`">
        <!-- Label wrapper: hidden if `hideLabel` -->
        <label v-if="!hideLabel" :for="forLabel" class="label-size flex items-center">
            <!-- Custom label slot; falls back to `label` + optional `mark` -->
            <slot name="label">
                <span>{{ label }}</span>
                <span v-if="mark" class="ml-1 text-red-500">*</span>
            </slot>
        </label>
        <slot/>
        <small class="error-required" v-if="!hideError">{{ error }}</small>
    </div>
</template>
