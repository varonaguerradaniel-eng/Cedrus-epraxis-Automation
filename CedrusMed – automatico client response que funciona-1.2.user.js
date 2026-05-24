// ==UserScript==
// @name         CedrusMed – automatico client response que funciona
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Client Response con base de datos persistente, Clear y disparo de evento input para que Cedrus guarde el valor.
// @match        https://www.cedrusmed.com/cmhp/schedule/calendar
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  const FIELD_SELECTOR = 'textarea[formcontrolname="ClientResponse"]';

  function insertarUI(campo, idx) {
    if (campo.parentNode.querySelector(`.db-wrapper-client-${idx}`)) return;

    const key = `dbClient_${idx}`;
    const wrapper = document.createElement('div');
    wrapper.className = `db-wrapper-client-${idx}`;
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'flex-end';
    wrapper.style.marginTop = '5px';
    wrapper.style.zIndex = '1000';

    // Botón Clear
    const btnClear = document.createElement('button');
    btnClear.textContent = 'Clear DB';
    Object.assign(btnClear.style, {
      margin: '0 0 4px 0',
      padding: '2px 6px',
      cursor: 'pointer',
      background: 'transparent',
      color: '#f44336'
    });
    btnClear.onclick = () => {
      localStorage.removeItem(key);
      db.value = '';
    };

    // Botón Client Response
    const btn = document.createElement('button');
    btn.textContent = 'Client Response';
    Object.assign(btn.style, {
      background: 'transparent',
      color: '#e91e63',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 'bold',
      marginBottom: '4px'
    });
    btn.onclick = () => {
      const text = db.value;
      const regex = /(['"“”])([^'"“”]+?)\1/g;
      let m, entries = [];
      while (m = regex.exec(text)) entries.push(m[0]);
      if (!entries.length) return alert('❌ No se encontraron frases entre comillas.');
      const entry = entries.shift();

      // Pegamos en el textarea de Cedrus…
      campo.value = entry;
      // …y disparamos el evento para Angular/Cedrus detecte el cambio
      campo.dispatchEvent(new Event('input', { bubbles: true }));

      // Actualizamos la DB
      db.value = text.replace(entry, '').trim();
      localStorage.setItem(key, db.value);
    };

    // Textarea de base de datos
    const db = document.createElement('textarea');
    db.rows = 4;
    db.placeholder = 'Base de datos';
    Object.assign(db.style, {
      width: '100%',
      border: '1px solid #ccc',
      color: '#8bc34a'
    });
    db.value = localStorage.getItem(key) || '';
    db.oninput = () => localStorage.setItem(key, db.value);

    // Montaje
    wrapper.appendChild(btnClear);
    wrapper.appendChild(btn);
    wrapper.appendChild(db);
    campo.parentNode.insertBefore(wrapper, campo.nextSibling);
  }

  // Repetir cada segundo, para cada uno de los múltiples campos de ClientResponse
  setInterval(() => {
    document.querySelectorAll(FIELD_SELECTOR)
      .forEach((campo, idx) => insertarUI(campo, idx));
  }, 1000);
})();

