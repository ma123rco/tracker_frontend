<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { format } from "date-fns";

const timer = ref(getFormattedTime());

function getFormattedTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const nameDays = format(now, "EEEE");
    const numberDay = format(now, "do");
    const month = format(now, "MMMM");
    const meridiem = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${ minutes }` : minutes;
    const formattedSeconds = seconds < 10 ? `0${ seconds }` : seconds;
    const timer = `${ formattedHours }:${ formattedMinutes }:${ formattedSeconds } ${ meridiem }`;
    return { nameDays, formattedHours, formattedMinutes, formattedSeconds, numberDay, hours, meridiem, minutes, month, seconds, timer };
}

let interval: number;

onMounted(() => {
    interval = window.setInterval(() => {
        timer.value = getFormattedTime();
    }, 1000);
});

onBeforeUnmount(() => {
    clearInterval(interval);
});

</script>

<template>
    <div class="grid h-full! items-center justify-center gap-4">
        <Card class="mx-auto border-none card dark:text-surface-900! text-surface-100!" #content>
            <img src="@/assets/Working.svg" alt="working" class="mx-auto max-h-64 max-w-64">
            <p class="mx-3 text-center text-4xl">
                <span>{{ timer.timer }}</span>
            </p>
            <p class="mx-3 text-center text-xl">{{ timer.nameDays }}, {{ timer.month }} {{ timer.numberDay }}</p>
            <p class="mt-4 flex items-center justify-center gap-2 text-center italic">
                <i-material-symbols-code-blocks-outline-rounded/>
                En desarrollo...
            </p>
        </Card>
    </div>
</template>

<style scoped>
.card {
    background: linear-gradient(to right, rgb(20, 30, 48), rgb(36, 59, 85));
    cursor: pointer;
    transition: all 0.3s ease-in-out;
}

.card:hover {
    box-shadow: rgb(54, 64, 156) 5px 10px 10px, rgb(94, 182, 241) 5px 0 50px;
}

</style>
