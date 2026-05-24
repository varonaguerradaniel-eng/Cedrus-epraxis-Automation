// ==UserScript==
// @name         CedrusMed - Múltiples Topics con advertencia automática
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Guarda múltiples Topics en CedrusMed, con alertas automáticas, campos en rojo si se repiten, y menú flotante ✅📂🧠
// @author       Daniel
// @match        https://www.cedrusmed.com/cmhp/schedule/calendar
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
    'use strict';

    const fieldSelector = '[formcontrolname="TopicField"]';

    function getStoredTopics() {
        const data = GM_getValue("cedrus_topics", "[]");
        return JSON.parse(data);
    }

    function saveTopicsFromFields() {
        const inputs = document.querySelectorAll(fieldSelector);
        const topicsToSave = [];
        const topicsAlready = getStoredTopics();
        let repetidos = [];

        inputs.forEach(input => {
            const topic = input.value.trim();
            if (topic) {
                if (!topicsToSave.includes(topic)) {
                    topicsToSave.push(topic);
                }
                // Marcar el campo si está repetido
                if (topicsAlready.includes(topic)) {
                    input.style.border = "2px solid red";
                    input.style.backgroundColor = "#ffe6e6";
                    input.title = "⚠️ Este Topic ya fue usado antes.";
                    repetidos.push(topic);
                } else {
                    input.style.border = "2px solid green";
                    input.style.backgroundColor = "#e6ffe6";
                    input.title = "";
                }
            }
        });

        // Guardar solo los nuevos
        const nuevos = topicsToSave.filter(t => !topicsAlready.includes(t));
        const updated = [...new Set([...topicsAlready, ...nuevos])];
        GM_setValue("cedrus_topics", JSON.stringify(updated));

        if (repetidos.length > 0) {
            alert("⚠️ Ya usaste uno o más Topics:\n" + repetidos.join("\n"));
        } else {
            alert("✅ Topics guardados:\n" + nuevos.join("\n"));
        }
    }

    function showStoredTopics() {
        const topics = getStoredTopics();
        alert("📋 Topics usados:\n\n" + topics.join("\n"));
    }

    function clearTopics() {
        GM_setValue("cedrus_topics", "[]");
        alert("🗑️ Lista de Topics reiniciada.");
    }

    function watchAllTopicFields() {
        const inputs = document.querySelectorAll(fieldSelector);
        inputs.forEach(input => {
            input.addEventListener("input", () => {
                const topic = input.value.trim();
                const stored = getStoredTopics();

                if (topic && stored.includes(topic)) {
                    input.style.border = "2px solid red";
                    input.style.backgroundColor = "#ffe6e6";
                    input.title = "⚠️ Este Topic ya fue usado antes.";
                } else {
                    input.style.border = "2px solid green";
                    input.style.backgroundColor = "#e6ffe6";
                    input.title = "";
                }
            });
        });
    }

    // Esperar que cargue el DOM de Cedrus
    const waitInterval = setInterval(() => {
        const inputs = document.querySelectorAll(fieldSelector);
        if (inputs.length > 0) {
            clearInterval(waitInterval);
            watchAllTopicFields();
        }
    }, 1000);

    // Crear botón flotante
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "10px";
    container.style.right = "10px";
    container.style.zIndex = "9999";
    container.style.fontFamily = "sans-serif";

    const mainBtn = document.createElement("button");
    mainBtn.textContent = "📂 Topics";
    mainBtn.style.padding = "10px";
    mainBtn.style.backgroundColor = "#4CAF50";
    mainBtn.style.color = "white";
    mainBtn.style.border = "none";
    mainBtn.style.borderRadius = "8px";
    mainBtn.style.cursor = "pointer";
    mainBtn.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";

    const menu = document.createElement("div");
    menu.style.display = "none";
    menu.style.marginTop = "5px";
    menu.style.flexDirection = "column";
    menu.style.gap = "5px";

    const createBtn = (label, color, action) => {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.style.padding = "8px";
        btn.style.backgroundColor = color;
        btn.style.color = "white";
        btn.style.border = "none";
        btn.style.borderRadius = "6px";
        btn.style.cursor = "pointer";
        btn.onclick = action;
        return btn;
    };

    const guardarBtn = createBtn("💾 Guardar Topics", "#2196F3", saveTopicsFromFields);
    const verBtn = createBtn("📋 Ver Topics", "#9C27B0", showStoredTopics);
    const borrarBtn = createBtn("🗑️ Borrar Topics", "#f44336", clearTopics);

    menu.appendChild(guardarBtn);
    menu.appendChild(verBtn);
    menu.appendChild(borrarBtn);

    mainBtn.onclick = () => {
        menu.style.display = menu.style.display === "none" ? "flex" : "none";
    };

    container.appendChild(mainBtn);
    container.appendChild(menu);
    document.body.appendChild(container);
})();
