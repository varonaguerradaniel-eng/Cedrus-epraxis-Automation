// ==UserScript==
// @name         Cedrus Auto Check Client Presentation
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Auto-marks checklist items in Cedrus using MDC structure
// @match        *://www.cedrusmed.com/cmhp/schedule/calendar*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const EXACT_LABELS = [
        'cooperative',
        'appropriate',
        'clean',
        'depressed'

        ];



     // 🔹 Labels de severidad / progreso (PARCIALES controlados)
    const PARTIAL_LABELS = [
        'moderate progress'
    ];

    function normalize(text) {
        return text
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .trim();
    }

    function shouldMark(text) {
        // Exactos (evita uncooperative, inappropriate, etc.)
        if (EXACT_LABELS.includes(text)) {
            return true;
        }

        // Parciales controlados (moderate, moderate progress, etc.)
        return PARTIAL_LABELS.some(p =>
            text === p || text.startsWith(p + ' ')
        );
    }

    function markCheckboxes() {
        const inputs = document.querySelectorAll(
            'input.mdc-checkbox__native-control'
        );

        if (!inputs.length) return;

        inputs.forEach(input => {
            const id = input.id;
            if (!id) return;

            const label = document.querySelector(
                `label.mdc-label[for="${id}"]`
            );
            if (!label) return;

            const text = normalize(label.innerText);

            // 🔹 Marca SOLO si corresponde y está desmarcado
            if (shouldMark(text) && !input.checked) {
                input.click(); // Angular Material safe
            }
        });
    }

    // 🔹 Observa render dinámico de Cedrus
    const observer = new MutationObserver(() => {
        markCheckboxes();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();