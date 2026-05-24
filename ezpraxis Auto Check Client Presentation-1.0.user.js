// ==UserScript==
// @name         ezpraxis Auto Check Client Presentation
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Auto-marks Cooperative, Appropriate, Clean and Depressed after clicking Edit
// @match        https://app.ezpraxis.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const TARGET_LABELS = [
        'cooperative',
        'appropriate',
        'clean',
        'depressed',
        'assertive'
    ];

    function normalize(text) {
        return text
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .trim();
    }

    function markCheckboxes() {
        const inputs = document.querySelectorAll(
            'input[type="checkbox"][formcontrolname="selected"]'
        );

        inputs.forEach(input => {
            const label = input.closest('label') || input.parentElement;
            if (!label) return;

            const text = normalize(label.innerText);

            if (TARGET_LABELS.includes(text)) {
                if (!input.checked) {
                    input.click(); // Angular-safe
                }
            }
        });
    }

    function waitForEditMode() {
        const observer = new MutationObserver(() => {
            const checkboxes = document.querySelectorAll(
                'input[type="checkbox"][formcontrolname="selected"]'
            );

            if (checkboxes.length > 0) {
                markCheckboxes();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    waitForEditMode();
})();