import toastEventBus from "primevue/toasteventbus";

export const castFormErrors = (errors: any) => {
    const messages = Object.entries(errors).map(([ field, message ]) => {
        const indexMatch = field.match(/\[(\d+)]/);
        if (indexMatch) {
            return `Detalle ${ Number(indexMatch[1]) + 1 }: ${ message }.`;
        }
        return message;
    });

    toastEventBus.emit("add", {
        detail: `Complete los siguientes campos:\n\n${ messages.join("\n") }`,
        life: 10000,
        severity: "warn",
        summary: "Formulario requerido"
    });
};
