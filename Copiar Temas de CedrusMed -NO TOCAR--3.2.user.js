// ==UserScript==
// @name         Copiar Temas de CedrusMed "NO TOCAR"
// @namespace    http://tampermonkey.net/
// @version      3.2
// @description  Copia Topics desde TODOS los modales (Topic y TopicField) sin disparar Save.
// @author       Daniel
// @match        *://www.cedrusmed.com/cmhp/schedule/calendar*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function insertarBotonesEnTodosLosSave() {
        const saveLabels = document.querySelectorAll(
            '.cdk-overlay-pane button .mdc-button__label'
        );

        saveLabels.forEach(label => {
            if (!label.textContent.trim().toLowerCase().includes('save')) return;

            const saveButton = label.closest('button');
            if (!saveButton) return;

            const container = saveButton.parentElement;
            if (!container) return;

            if (container.querySelector('.btn-copiar-temas-cedrus')) return;

            const boton = document.createElement('button');
            boton.className = 'btn-copiar-temas-cedrus';
            boton.textContent = 'Copiar Temas de Cedrus';

            // 🔥 CLAVE ABSOLUTA
            boton.type = 'button';

            Object.assign(boton.style, {
                marginRight: '8px',
                padding: '8px 12px',
                background: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: '500'
            });

            boton.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                copiarTemasCedrus();
            });

            container.insertBefore(boton, saveButton);
        });
    }

    function copiarTemasCedrus() {
        const topicsSesion = document.querySelectorAll(
            'input[formcontrolname="Topic"]'
        );

        const topicsModal = document.querySelectorAll(
            'input[formcontrolname="TopicField"]'
        );

        const todos = [...topicsSesion, ...topicsModal];

        const valores = todos
            .map(input => input.value.trim())
            .filter(v => v.length > 0);

        if (!valores.length) {
            alert("⚠️ No se encontraron temas en los modales.");
            return;
        }

        const texto = valores.join("\n");

        navigator.clipboard.writeText(texto)
            .then(() => alert("✅ Temas copiados desde TODOS los modales."))
            .catch(() => alert("❌ Error al copiar los temas."));
    }

    const observer = new MutationObserver(insertarBotonesEnTodosLosSave);
    observer.observe(document.body, { childList: true, subtree: true });

})();

