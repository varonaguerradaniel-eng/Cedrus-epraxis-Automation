// ==UserScript==
// @name         codigo de agregar, mover y quitar clientes
// @namespace    http://tampermonkey.net/
// @version      2.5
// @description  Permite agregar, mover o eliminar pacientes de Minimal y Moderate Progress en Cedrusmed sin editar el código.
// @author       Daniel
// @match        https://www.cedrusmed.com/cmhp/schedule/calendar*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Recuperar listas guardadas o inicializar listas vacías
    let minimalProgressPatients = JSON.parse(localStorage.getItem("minimalProgressPatients")) || [
        "Maria Catalina Gonzalez", "Gabriel Rodriguez Gonzalez", "Irma Melo", "Carlos Gonzalez",
        "Yoandry Gomez Melo", "Maria Padron Oquendo", "Juan Rivero", "Bruno Carreras",
        "Emilia Daniel", "Orlando Castro Fernandez", "Albino Fernandez Urquiza", "Luis Pereira Nunez"
    ];

    let moderateProgressPatients = JSON.parse(localStorage.getItem("moderateProgressPatients")) || [
        "Delia Rodriguez", "Elvira Pena", "Jose Rodriguez", "Javier Pimentel Benitez",
        "Katya Acosta Roca", "Martina Roman Guerra", "Ulises Fonseca Aguilera", "Jesus Acevedo A.",
        "Carlos Iglesias Sanchez", "Teresa Castellano Urrutia", "Mateo Acevedos", "Luis Rodriguez Marzo"
    ];

    // Función para guardar listas en el almacenamiento local
    function saveLists() {
        localStorage.setItem("minimalProgressPatients", JSON.stringify(minimalProgressPatients));
        localStorage.setItem("moderateProgressPatients", JSON.stringify(moderateProgressPatients));
    }

    // Función para verificar pacientes en la página
    function checkForPatients() {
        let patientElements = document.querySelectorAll('input[placeholder="Client Name"], input[name="clientName"], div[data-name="client-name"], div');

        patientElements.forEach(patientElement => {
            let patientName = patientElement.value ? patientElement.value.trim() : patientElement.innerText.trim();

            let messageType = "";
            let messageColor = "";

            if (minimalProgressPatients.includes(patientName)) {
                messageType = "⚠️ Minimal Progress";
                messageColor = "red";
            } else if (moderateProgressPatients.includes(patientName)) {
                messageType = "⚠️ Moderate Progress";
                messageColor = "blue";
            }

            if (messageType) {
                let existingMessage = patientElement.parentNode.querySelector(".progress-warning");
                if (!existingMessage) {
                    let message = document.createElement("div");
                    message.className = "progress-warning";
                    message.textContent = messageType;
                    message.style.color = messageColor;
                    message.style.fontSize = "12px";
                    message.style.fontWeight = "bold";
                    message.style.marginTop = "3px";

                    let removeButton = document.createElement("button");
                    removeButton.textContent = "❌";
                    removeButton.style.marginLeft = "10px";
                    removeButton.style.cursor = "pointer";
                    removeButton.onclick = () => removePatient(patientName);

                    let moveButton = document.createElement("button");
                    moveButton.textContent = "🔄";
                    moveButton.style.marginLeft = "5px";
                    moveButton.style.cursor = "pointer";
                    moveButton.onclick = () => movePatient(patientName);

                    message.appendChild(removeButton);
                    message.appendChild(moveButton);

                    patientElement.parentNode.insertBefore(message, patientElement.nextSibling);
                }
            }
        });
    }

    // Función para agregar pacientes a la lista
    function addPatient(type) {
        let patientName = prompt(`Ingrese el nombre del paciente para agregar a ${type} Progress:`);

        if (patientName) {
            patientName = patientName.trim();

            if (type === "Minimal") {
                if (!minimalProgressPatients.includes(patientName)) {
                    minimalProgressPatients.push(patientName);
                    alert(`✅ ${patientName} ha sido agregado a Minimal Progress.`);
                } else {
                    alert(`⚠️ ${patientName} ya está en Minimal Progress.`);
                }
            } else if (type === "Moderate") {
                if (!moderateProgressPatients.includes(patientName)) {
                    moderateProgressPatients.push(patientName);
                    alert(`✅ ${patientName} ha sido agregado a Moderate Progress.`);
                } else {
                    alert(`⚠️ ${patientName} ya está en Moderate Progress.`);
                }
            }
            saveLists();
            checkForPatients();
        }
    }

    // Función para eliminar pacientes de la lista
    function removePatient(patientName) {
        minimalProgressPatients = minimalProgressPatients.filter(name => name !== patientName);
        moderateProgressPatients = moderateProgressPatients.filter(name => name !== patientName);
        saveLists();
        alert(`✅ ${patientName} ha sido eliminado.`);
        checkForPatients();
    }

    // Función para mover un paciente de Minimal a Moderate o viceversa
    function movePatient(patientName) {
        if (minimalProgressPatients.includes(patientName)) {
            minimalProgressPatients = minimalProgressPatients.filter(name => name !== patientName);
            moderateProgressPatients.push(patientName);
            alert(`🔄 ${patientName} ha sido movido a Moderate Progress.`);
        } else if (moderateProgressPatients.includes(patientName)) {
            moderateProgressPatients = moderateProgressPatients.filter(name => name !== patientName);
            minimalProgressPatients.push(patientName);
            alert(`🔄 ${patientName} ha sido movido a Minimal Progress.`);
        }
        saveLists();
        checkForPatients();
    }

    // Función para crear botones en la página
    function createButtons() {
        if (!document.getElementById("addMinimalButton")) {
            let buttonContainer = document.createElement("div");
            buttonContainer.style.position = "fixed";
            buttonContainer.style.bottom = "10px";
            buttonContainer.style.right = "10px";
            buttonContainer.style.display = "flex";
            buttonContainer.style.gap = "10px";
            buttonContainer.style.zIndex = "10000";

            let minimalButton = document.createElement("button");
            minimalButton.id = "addMinimalButton";
            minimalButton.textContent = "➕ Agregar Minimal Progress";
            minimalButton.style.backgroundColor = "red";
            minimalButton.onclick = () => addPatient("Minimal");

            let moderateButton = document.createElement("button");
            moderateButton.id = "addModerateButton";
            moderateButton.textContent = "➕ Agregar Moderate Progress";
            moderateButton.style.backgroundColor = "blue";
            moderateButton.onclick = () => addPatient("Moderate");

            buttonContainer.appendChild(minimalButton);
            buttonContainer.appendChild(moderateButton);
            document.body.appendChild(buttonContainer);
        }
    }

    setInterval(() => {
        checkForPatients();
        createButtons();
    }, 1000);
})();
