// ==UserScript==
// @name         Copiar Temas de CedrusMed "NO TOCAR"
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Fuerza la aparición del botón para copiar los temas de CedrusMed sin importar el tiempo de carga de la página.
// @author       Daniel
// @match        *://www.cedrusmed.com/cmhp/schedule/calendar*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    console.log("✅ Script de Tampermonkey cargado en CedrusMed.");

    function agregarBotonCopiarTemas() {
        if (document.getElementById("btnCopiarTemasCedrus")) return; // Evita agregar múltiples botones

        console.log("✅ Agregando botón de copiar temas...");
        const boton = document.createElement("button");
        boton.id = "btnCopiarTemasCedrus";
        boton.innerText = "Copiar Temas de Cedrus";
        boton.style.position = "fixed";
        boton.style.bottom = "20px";
        boton.style.right = "20px";
        boton.style.padding = "10px";
        boton.style.background = "#007bff";
        boton.style.color = "#fff";
        boton.style.border = "none";
        boton.style.borderRadius = "5px";
        boton.style.cursor = "pointer";
        boton.style.zIndex = "9999";

        boton.addEventListener("click", copiarTemasCedrus);
        document.body.appendChild(boton);
    }

    function copiarTemasCedrus() {
        const titulos = document.querySelectorAll('input[formcontrolname="TopicField"]'); // Encuentra los temas
        if (titulos.length === 0) {
            alert("⚠️ No se encontraron temas en CedrusMed.");
            return;
        }

        let temasTexto = Array.from(titulos).map(titulo => titulo.value.trim()).join("\n");

        navigator.clipboard.writeText(temasTexto).then(() => {
            alert("✅ Temas copiados al portapapeles.");
            console.log("📋 Temas copiados:", temasTexto);
        }).catch(err => {
            console.error("❌ Error al copiar los temas:", err);
            alert("❌ Error al copiar los temas. Revisa la consola (F12).");
        });
    }

    // 🔹 Método 1: Usar MutationObserver para detectar cambios en la página
    const observer = new MutationObserver((mutations, obs) => {
        if (document.querySelectorAll('input[formcontrolname="TopicField"]').length > 0) {
            console.log("✅ Temas detectados con MutationObserver. Agregando botón...");
            agregarBotonCopiarTemas();
            obs.disconnect(); // Detiene la observación después de encontrar los temas
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 🔹 Método 2: Si en 5 segundos no se detecta nada, forzar la creación del botón
    setTimeout(() => {
        if (!document.getElementById("btnCopiarTemasCedrus")) {
            console.log("⏳ No se detectaron temas automáticamente. Forzando el botón...");
            agregarBotonCopiarTemas();
        }
    }, 5000);
})();

