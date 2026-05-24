// ==UserScript==
// @name         ezpraxis code
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  Normalize PSR output using ONLY quoted sentences and Progress blocks
// @match        https://chatgpt.com/*
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
    'use strict';

    const PROGRESS_HEADER_REGEX =
        /(facilitator\s*(progress|summary)|therapist\s*progress|intervention\s*progress):\s*/i;

    function normalizePSR() {
        const paragraphs = document.querySelectorAll(
            'div[data-message-author-role="assistant"] p'
        );

        paragraphs.forEach(p => {
            if (p.dataset.psrProcessed) return;

            const text = p.innerText.trim();
            if (!text) return;

            const hasQuote = text.includes('"');
            const hasProgress = /\b(minimal|moderate)\b/i.test(text);

            if (!hasQuote && !hasProgress) return;

            p.dataset.psrProcessed = "true";
            p.innerHTML = '';

            const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

            lines.forEach(line => {

                /* =========================
                   CLIENT RESPONSE (QUOTES)
                ========================= */
                const quoteMatches = [...line.matchAll(/"([^"]+)"/g)];
                if (quoteMatches.length) {
                    quoteMatches.forEach(match => {
                        const quote = `"${match[1]}"`;

                        const cr = document.createElement('div');
                        cr.innerText = quote;
                        cr.style.marginLeft = '14px';
                        cr.style.marginTop = '6px';
                        cr.style.padding = '4px 6px';
                        cr.style.cursor = 'pointer';
                        cr.style.userSelect = 'none';
                        cr.style.borderLeft = '3px solid #4CAF50';
                        cr.style.background = 'rgba(76,175,80,0.08)';

                        cr.addEventListener('mouseenter', () => {
                            cr.style.background = 'rgba(76,175,80,0.16)';
                        });
                        cr.addEventListener('mouseleave', () => {
                            cr.style.background = 'rgba(76,175,80,0.08)';
                        });
                        cr.addEventListener('click', () => {
                            GM_setClipboard(quote);
                            showBadge(cr, 'Copied');
                        });

                        p.appendChild(cr);
                    });
                    return;
                }

                /* =========================
                   PROGRESS (MINIMAL / MODERATE)
                ========================= */
                if (/\b(minimal|moderate)\b/i.test(line)) {

                    // 🔹 LIMPIAR encabezados sin tocar el contenido
                    const cleanedProgress = line.replace(
                        PROGRESS_HEADER_REGEX,
                        ''
                    ).trim();

                    if (!cleanedProgress) return;

                    const prog = document.createElement('div');
                    prog.innerText = cleanedProgress;
                    prog.style.marginLeft = '14px';
                    prog.style.marginTop = '8px';
                    prog.style.padding = '8px 10px';
                    prog.style.cursor = 'pointer';
                    prog.style.userSelect = 'none';
                    prog.style.border = '2px dashed #2196F3';
                    prog.style.background = 'rgba(33,150,243,0.08)';

                    prog.addEventListener('mouseenter', () => {
                        prog.style.background = 'rgba(33,150,243,0.16)';
                    });
                    prog.addEventListener('mouseleave', () => {
                        prog.style.background = 'rgba(33,150,243,0.08)';
                    });
                    prog.addEventListener('click', () => {
                        GM_setClipboard(cleanedProgress);
                        showBadge(prog, 'Progress Copied');
                    });

                    p.appendChild(prog);
                    return;
                }

                /* =========================
                   OTHER TEXT
                ========================= */
                const normal = document.createElement('div');
                normal.innerText = line;
                p.appendChild(normal);
            });
        });
    }

    function showBadge(target, text) {
        const badge = document.createElement('span');
        badge.innerText = text;
        badge.style.marginLeft = '8px';
        badge.style.fontSize = '12px';
        badge.style.fontWeight = 'bold';
        badge.style.color = '#555';

        target.appendChild(badge);
        setTimeout(() => badge.remove(), 900);
    }

    setInterval(normalizePSR, 1200);
})();
