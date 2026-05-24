// ==UserScript==
// @name         CedrusMed - Relacionar Goals con Topics Siempre funcionando
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  Relaciona cada Topic con al menos un Goal, el más cercano si no hay coincidencias exactas
// @match        https://www.cedrusmed.com/cmhp/schedule/calendar
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const goalKeywords = {
    "Depressed/Anxious Mood": ["self-esteem", "stress", "relieving", "meditation", "breathing", "confidence", "coping", "emotional", "mental health"],
    "Levels of energy and Motivation": ["daily routines", "motivation", "low energy", "self-care", "balance", "enjoyable"],
    "Social Skills": ["social skills", "relationships", "communication", "assertiveness", "conflict", "respect", "empathy", "rapport"],
    "Self-Care behaviors (improving ADLs)": ["self-care", "daily routines", "transportation", "household tasks", "adl", "role in the family"],
    "Socialization": ["support groups", "community", "social events", "volunteer", "relationships"],
    "Isolation": ["social events", "volunteer", "family events", "confidence", "rapport", "withdrawal"],
    "Poor Personal Functioning": ["problem solving", "low energy", "stress", "self-care", "compliance"],
    "Activity of Daily Living": ["adl", "household tasks", "daily routines", "transportation"],
    "Independent Living Skills": ["independent", "daily routines", "self-care", "transportation"],
    "Medication Management": ["medication", "treatment", "compliance", "side effects", "chronic illness"],
    "Communication/Interpersonal skills": ["communication", "listening", "nonverbal", "empathy", "assertiveness", "confidence", "respect"],
    "Sleep Disorder": ["sleep", "stress", "routines", "mental health", "lifestyle"],
    "Better Coping Skills": ["coping", "decision making", "stress", "alternatives", "assertiveness", "problem solving", "emotional"],
    "Low Energy/Motivation": ["motivation", "energy", "balance", "accomplishment", "nutrition"]
  };

  function openAllSessions() {
    const buttons = [...document.querySelectorAll('button')].filter(btn =>
      btn.textContent.trim().toLowerCase().startsWith("session")
    );
    buttons.forEach(btn => btn.click());
  }

  function getTopicsFromInputs() {
    const topicInputs = document.querySelectorAll('input[formcontrolname="Topic"]');
    const uniqueTopics = new Set();
    topicInputs.forEach(input => {
      if (input && input.value) {
        uniqueTopics.add(input.value.toLowerCase().trim());
      }
    });
    return Array.from(uniqueTopics);
  }

  function findClosestGoal(topic) {
    let bestMatch = null;
    let highestScore = 0;

    for (const [goal, keywords] of Object.entries(goalKeywords)) {
      let score = 0;
      keywords.forEach(keyword => {
        if (topic.includes(keyword)) score += 1;
      });

      if (score > highestScore) {
        highestScore = score;
        bestMatch = goal;
      }
    }

    return bestMatch || "No Goal Found";
  }

  function getRecommendedGoals(topics) {
    const goalMatches = {};

    Object.keys(goalKeywords).forEach(goal => {
      goalMatches[goal] = false;
    });

    for (const goal in goalKeywords) {
      const keywords = goalKeywords[goal];
      for (const topic of topics) {
        if (keywords.some(keyword => topic.includes(keyword))) {
          goalMatches[goal] = true;
          break;
        }
      }
    }

    const relatedOrClosest = {};
    topics.forEach(topic => {
      const hasDirectMatch = Object.entries(goalMatches).some(([goal, match]) => match);
      if (!hasDirectMatch) {
        const closest = findClosestGoal(topic);
        relatedOrClosest[closest] = true;
      }
    });

    return Object.entries(goalMatches).map(([goal, matched]) => {
      if (matched || relatedOrClosest[goal]) {
        return { goal, related: true };
      } else {
        return { goal, related: false };
      }
    });
  }

  function checkGoalsAndMark() {
    const topics = getTopicsFromInputs();
    const results = getRecommendedGoals(topics);
    const goalLabels = document.querySelectorAll('.mat-mdc-checkbox label, .mat-mdc-checkbox span');

    goalLabels.forEach(label => {
      const text = label.textContent.trim();
      const result = results.find(r => r.goal === text);
      if (result) {
        const statusEl = document.createElement('div');
        statusEl.style.marginLeft = '25px';
        statusEl.style.fontSize = '18px';
        statusEl.textContent = result.related ? '✅ Related or Closest Match' : '';
        label.parentElement.parentElement.appendChild(statusEl);
      }
    });

    console.log("🧠 Topics detectados:", topics);
    console.log("📌 Resultados de análisis:", results);
  }

  function createFloatingButton() {
    if (document.getElementById('btn-verificar-goals')) return;

    const btn = document.createElement('button');
    btn.id = 'btn-verificar-goals';
    btn.textContent = "🔍 Verificar Goals";
    btn.style.position = 'fixed';
    btn.style.top = '100px';
    btn.style.left = '20px';
    btn.style.padding = '10px 15px';
    btn.style.background = '#1976d2';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '8px';
    btn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    btn.style.zIndex = 99999;
    btn.style.cursor = 'pointer';
    btn.onclick = () => {
      openAllSessions();
      setTimeout(() => checkGoalsAndMark(), 2000);
    };

    document.body.appendChild(btn);
    console.log("✅ Botón insertado correctamente");
  }

  const interval = setInterval(() => {
    if (document.body && !document.getElementById('btn-verificar-goals')) {
      createFloatingButton();
    }
  }, 1000);

})();

