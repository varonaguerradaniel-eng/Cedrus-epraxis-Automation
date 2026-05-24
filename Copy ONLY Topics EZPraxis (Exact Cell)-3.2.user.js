// ==UserScript==
// @name         Copy ONLY Topics EZPraxis (Exact Cell)
// @namespace    http://tampermonkey.net/
// @version      3.2
// @description  Copia exclusivamente el texto que sigue a <b>Topic:</b> en EZPraxis
// @author       Daniel
// @match        https://app.ezpraxis.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  /* =========================
     BOTÓN
  ========================= */
  const btn = document.createElement('button');
  btn.textContent = 'Copy Topics';
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: '#0d6efd',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    zIndex: '9999999',
    boxShadow: '0 4px 10px rgba(0,0,0,0.35)'
  });
  document.body.appendChild(btn);

  /* =========================
     TOAST
  ========================= */
  function showToast(msg) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '70px',
      right: '20px',
      background: 'rgba(0,0,0,0.85)',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '13px',
      whiteSpace: 'pre-line',
      zIndex: '9999999'
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  /* =========================
     FUNCIÓN PRINCIPAL
  ========================= */
  async function copyTopics() {

    // 🔒 SOLO <b> que digan EXACTAMENTE "Topic:"
    const topicBoldNodes = Array.from(document.querySelectorAll('b'))
      .filter(b => b.textContent.trim() === 'Topic:');

    if (topicBoldNodes.length === 0) {
      showToast('❌ No se encontraron Topics');
      return;
    }

    // 🧠 Extraer SOLO el texto inmediato después del <b>
    const topics = topicBoldNodes
      .map(b => {
        const next = b.nextSibling;
        return next && next.textContent
          ? next.textContent.trim()
          : null;
      })
      .filter(Boolean)
      .slice(0, 4);

    if (topics.length === 0) {
      showToast('❌ Topics vacíos');
      return;
    }

    const textToCopy = topics.join('\n');

    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast('✅ Topics copiados:\n\n' + textToCopy);
    } catch (err) {
      console.error(err);
      alert(textToCopy);
    }
  }

  btn.addEventListener('click', copyTopics);
})();
