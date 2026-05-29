export default {
    mounted(el: HTMLElement) {
        el.classList.add("reveal");
        const observer = new IntersectionObserver(([ entry ]) => {
            if (entry.isIntersecting) el.classList.add("reveal-active");
            else el.classList.remove("reveal-active");
        }, { threshold: 0.2 });
        observer.observe(el);
    }
};
