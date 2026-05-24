// ==UserScript==
// @name         Copy Topics atrasadasd notas ezpraxis
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Crea un botón para copiar los 4 Topics visibles de EZPraxis correctamente detectando el formato <b>Topic:</b> texto
// @author       Daniel
// @match        https://app.ezpraxis.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
  'use strict';

  // Crear el botón flotante
  const btn = document.createElement('button');
  btn.textContent = 'Copy Topics';
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    zIndex: '9999999',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
  });
  document.body.appendChild(btn);

  // Mostrar notificación
  function showToast(msg) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '70px',
      right: '20px',
      background: 'rgba(0,0,0,0.8)',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '13px',
      zIndex: '9999999'
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  // Función principal
  async function copyTopics() {
    // Buscar todos los <div> que tengan un <b> con el texto "Topic:"
    const divs = Array.from(document.querySelectorAll('div')).filter(div => {
      const bold = div.querySelector('b');
      return bold && bold.textContent.trim() === 'Topic:';
    });

    if (divs.length === 0) {
      showToast('No se encontraron Topics en la página ❌');
      return;
    }

    // Extraer el texto que está después del <b>
    const topics = divs.slice(0, 4).map(div => {
      // El texto después del <b> (nodo siguiente)
      const node = Array.from(div.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
      return node ? node.textContent.trim() : '(sin texto)';
    });

    // Copiar al portapapeles
    const textToCopy = topics.join('\n');
    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast('✅ Copiado:\n' + textToCopy);
    } catch (err) {
      console.error(err);
      alert('Topics encontrados:\n\n' + textToCopy);
    }
  }

  btn.addEventListener('click', copyTopics);
})();

