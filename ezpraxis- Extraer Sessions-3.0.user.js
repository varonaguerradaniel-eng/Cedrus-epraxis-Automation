// ==UserScript==
// @name         ezpraxis- Extraer Sessions
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Abre sesiones tipo accordion y extrae Topic + Intervention con panel minimizable.
// @match        https://app.ezpraxis.com/*
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
    'use strict';

    // ------------------------------------------
    // BOTÓN PRINCIPAL
    // ------------------------------------------
    const btn = document.createElement("button");
    btn.textContent = "Extraer Sessions";
    Object.assign(btn.style, {
        position: "fixed",
        bottom: "30px",
        right: "30px",
        padding: "12px 18px",
        zIndex: "999999",
        background: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "15px"
    });
    document.body.appendChild(btn);

    btn.onclick = async () => {
        const result = await extractSessions();
        showResultPanel(result);
    };

    // ------------------------------------------
    // FUNCIÓN PRINCIPAL DE EXTRACCIÓN
    // ------------------------------------------
    async function extractSessions() {
        const sessionButtons = document.querySelectorAll(
            'button[ngbaccordionbutton]'
        );

        let output = "";

        for (let i = 0; i < sessionButtons.length; i++) {
            const btn = sessionButtons[i];

            // Abrir sesión
            if (btn.getAttribute("aria-expanded") === "false") {
                btn.click();
                await wait(700);
            }

            const container = btn.closest('.accordion-item') || document;

            const topicField = container.querySelector(
                'textarea[formcontrolname="topic"]'
            );

            const interventionField = container.querySelector(
                'textarea[formcontrolname="intervention"]'
            );

            const topic = topicField?.value.trim() || "NO TOPIC ENCONTRADO";
            const intervention = interventionField?.value.trim() || "NO INTERVENTION ENCONTRADA";

            output +=
                `\n\n=== SESSION ${i + 1} ===\n` +
                `Topic:\n${topic}\n\n` +
                `Therapy Intervention:\n${intervention}\n`;

            // Cerrar sesión
            if (btn.getAttribute("aria-expanded") === "true") {
                btn.click();
                await wait(400);
            }
        }

        return output.trim();
    }

    // ------------------------------------------
    // PANEL DE RESULTADOS (MISMO DISEÑO)
    // ------------------------------------------
    function showResultPanel(text) {
        const box = document.createElement("div");
        Object.assign(box.style, {
            position: "fixed",
            top: "50px",
            right: "50px",
            width: "420px",
            height: "500px",
            background: "#ffffff",
            padding: "20px",
            border: "2px solid #444",
            borderRadius: "10px",
            zIndex: "999999",
            overflow: "hidden",
            transition: "all 0.3s ease"
        });
        document.body.appendChild(box);

        const topBar = document.createElement("div");
        topBar.style.display = "flex";
        topBar.style.justifyContent = "flex-end";
        topBar.style.marginBottom = "10px";
        box.appendChild(topBar);

        const minBtn = document.createElement("button");
        minBtn.textContent = "–";
        Object.assign(minBtn.style, {
            marginRight: "10px",
            fontSize: "20px",
            fontWeight: "bold",
            cursor: "pointer",
            border: "none",
            background: "transparent"
        });
        topBar.appendChild(minBtn);

        const closeBtn = document.createElement("button");
        closeBtn.textContent = "✕";
        Object.assign(closeBtn.style, {
            fontSize: "20px",
            cursor: "pointer",
            border: "none",
            background: "transparent"
        });
        topBar.appendChild(closeBtn);

        const content = document.createElement("div");
        Object.assign(content.style, {
            height: "430px",
            overflow: "auto",
            transition: "opacity 0.3s ease"
        });
        box.appendChild(content);

        const area = document.createElement("textarea");
        area.style.width = "100%";
        area.style.height = "380px";
        area.value = text;
        content.appendChild(area);

        const copyBtn = document.createElement("button");
        copyBtn.textContent = "Copiar al portapapeles";
        Object.assign(copyBtn.style, {
            marginTop: "10px",
            padding: "10px",
            width: "100%",
            background: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
        });
        content.appendChild(copyBtn);

        closeBtn.onclick = () => box.remove();

        let minimized = false;
        minBtn.onclick = () => {
            minimized = !minimized;
            box.style.height = minimized ? "60px" : "500px";
            content.style.opacity = minimized ? "0" : "1";
            content.style.pointerEvents = minimized ? "none" : "auto";
        };

        copyBtn.onclick = () => {
            GM_setClipboard(text);
            alert("Copiado!");
        };
    }

    // ------------------------------------------
    // UTILIDAD ESPERA
    // ------------------------------------------
    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

})();
