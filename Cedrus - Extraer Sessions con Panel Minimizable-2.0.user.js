// ==UserScript==
// @name         Cedrus - Extraer Sessions con Panel Minimizable
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Abre todas las sesiones, copia Topic y Description y muestra panel con controles.
// @match        https://www.cedrusmed.com/cmhp/schedule/calendar
// @grant        GM_setClipboard
// ==/UserScript==

(function () {

    // ------------------------------------------
    // BOTÓN PRINCIPAL
    // ------------------------------------------
    const btn = document.createElement("button");
    btn.textContent = "Extraer Sessions";
    btn.style.position = "fixed";
    btn.style.bottom = "30px";
    btn.style.right = "30px";
    btn.style.padding = "12px 18px";
    btn.style.zIndex = "999999";
    btn.style.background = "#007bff";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.borderRadius = "8px";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "15px";
    document.body.appendChild(btn);

    btn.onclick = async () => {
        const result = await extractSessions();
        showResultPanel(result);
    };

    // ------------------------------------------
    // FUNCIÓN PARA EXTRAER
    // ------------------------------------------
    async function extractSessions() {
        const sessions = document.querySelectorAll(".mat-expansion-panel");
        let output = "";

        for (let i = 0; i < sessions.length; i++) {
            const session = sessions[i];

            // Abrir sesión si está cerrada
            const header = session.querySelector(".mat-expansion-panel-header");
            if (header && !session.classList.contains("mat-expanded")) {
                header.click();
                await wait(600);
            }

            const topicField = session.querySelector('input[formcontrolname="TopicField"]');
            const descField = session.querySelector('textarea[formcontrolname="DescriptionField"]');

            const topic = topicField ? topicField.value.trim() : "NO TOPIC ENCONTRADO";
            const description = descField ? descField.value.trim() : "NO DESCRIPTION ENCONTRADA";

            output +=
                `\n\n=== SESSION ${i + 1} ===\n` +
                `Topic: ${topic}\n` +
                `Description: ${description}\n`;

            // Cerrar sesión después
            if (header && session.classList.contains("mat-expanded")) {
                header.click();
                await wait(300);
            }
        }

        return output;
    }

    // ------------------------------------------
    // PANEL CON X Y MINIMIZAR
    // ------------------------------------------
    function showResultPanel(text) {
        const box = document.createElement("div");
        box.style.position = "fixed";
        box.style.top = "50px";
        box.style.right = "50px";
        box.style.width = "420px";
        box.style.height = "500px";
        box.style.background = "#ffffff";
        box.style.padding = "20px";
        box.style.border = "2px solid #444";
        box.style.borderRadius = "10px";
        box.style.zIndex = "999999";
        box.style.overflow = "hidden";
        box.style.transition = "all 0.3s ease";
        document.body.appendChild(box);

        // --- Barra superior con botones ---
        const topBar = document.createElement("div");
        topBar.style.display = "flex";
        topBar.style.justifyContent = "flex-end";
        topBar.style.marginBottom = "10px";
        box.appendChild(topBar);

        // Botón minimizar
        const minBtn = document.createElement("button");
        minBtn.textContent = "–";
        minBtn.style.marginRight = "10px";
        minBtn.style.fontSize = "20px";
        minBtn.style.fontWeight = "bold";
        minBtn.style.cursor = "pointer";
        minBtn.style.border = "none";
        minBtn.style.background = "transparent";
        topBar.appendChild(minBtn);

        // Botón cerrar
        const closeBtn = document.createElement("button");
        closeBtn.textContent = "✕";
        closeBtn.style.fontSize = "20px";
        closeBtn.style.cursor = "pointer";
        closeBtn.style.border = "none";
        closeBtn.style.background = "transparent";
        topBar.appendChild(closeBtn);

        // Contenido del panel
        const content = document.createElement("div");
        content.style.height = "430px";
        content.style.overflow = "auto";
        content.style.transition = "opacity 0.3s ease";
        box.appendChild(content);

        const area = document.createElement("textarea");
        area.style.width = "100%";
        area.style.height = "380px";
        area.value = text;
        content.appendChild(area);

        const copyBtn = document.createElement("button");
        copyBtn.textContent = "Copiar al portapapeles";
        copyBtn.style.marginTop = "10px";
        copyBtn.style.padding = "10px";
        copyBtn.style.width = "100%";
        copyBtn.style.background = "#28a745";
        copyBtn.style.color = "#fff";
        copyBtn.style.border = "none";
        copyBtn.style.borderRadius = "6px";
        copyBtn.style.cursor = "pointer";
        content.appendChild(copyBtn);

        // -------- FUNCIONES DE LOS BOTONES --------

        // Cerrar panel
        closeBtn.onclick = () => {
            box.remove();
        };

        // Minimizar o expandir
        let minimized = false;
        minBtn.onclick = () => {
            minimized = !minimized;

            if (minimized) {
                box.style.height = "60px";
                content.style.opacity = "0";
                content.style.pointerEvents = "none";
            } else {
                box.style.height = "500px";
                content.style.opacity = "1";
                content.style.pointerEvents = "auto";
            }
        };

        // Copiar texto
        copyBtn.onclick = () => {
            GM_setClipboard(text);
            alert("Copiado!");
        };
    }

    // ------------------------------------------
    // Utilidad esperar
    // ------------------------------------------
    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

})();

