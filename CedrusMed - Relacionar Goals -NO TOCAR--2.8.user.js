// ==UserScript==
// @name         CedrusMed - Relacionar Goals "NO TOCAR"
// @namespace    http://tampermonkey.net/
// @version      2.8
// @description  Siempre asigna y marca al menos un Goal visible por cada Topic
// @match        https://www.cedrusmed.com/cmhp/schedule/calendar
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const goalKeywords = {
    "Depressed/Anxious Mood": ["self-esteem", "stress", "relieving", "meditation", "breathing", "confidence", "coping", "emotional", "mental health", "triggers that low self-esteem", "positive self talking", "accept compliments", "accept ourselves", "finding own strengths"],
    "Levels of energy and Motivation": ["daily routines", "motivation", "low energy", "self-care", "balance", "enjoyable", "list of daily accomplishments", "keep motivation level"],
    "Social Skills": ["social skills", "relationships", "communication", "assertiveness", "conflict", "respect", "empathy", "rapport", "approach others", "boundaries", "improving social life", "understanding social rules", "healthy relationships", "assertiveness vs aggressiveness", "flexible", "disclose personal information", "agreements calmly"],
    "Self-Care behaviors (improving ADLs)": ["self-care", "adl", "appearance", "hygiene", "mouth", "hair", "skin", "household tasks", "cleaning", "organizing", "environment", "safety measures at home", "daily routines at home", "prioritize chores"],
    "Socialization": ["support groups", "community", "social events", "volunteer", "relationships", "participation in community activities", "cultural activities", "parks and recreation"],
    "Isolation": ["family events", "confidence", "rapport", "withdrawal", "support system", "companionship", "spending time with others"],
    "Poor Personal Functioning": ["problem solving", "low energy", "stress", "self-care", "compliance", "medication", "motivation"],
    "Activity of Daily Living": ["adl", "household tasks", "daily routines", "transportation", "appearance", "hygiene", "completing adl’s"],
    "Independent Living Skills": ["independent", "daily routines", "self-care", "transportation", "use of transportation", "organizes errands", "budget", "checking account", "save money"],
    "Medication Management": ["medication", "treatment", "compliance", "side effects", "chronic illness", "use medications as prescribed"],
    "Communication/Interpersonal skills": ["communication", "listening", "nonverbal", "empathy", "assertiveness", "confidence", "respect", "active listening", "verbal", "family", "emotional connections", "learning to say no"],
    "Sleep Disorder": ["sleep", "stress", "routines", "mental health", "lifestyle", "improve eating and sleeping habits"],
    "Better Coping Skills": ["coping", "decision making", "stress", "alternatives", "assertiveness", "problem solving", "emotional", "ways to cope", "learn to schedule", "positive", "limitations and abilities"],
    "Low Energy/Motivation": ["motivation", "energy", "balance", "accomplishment", "nutrition", "keep motivation level"],
    "Stress Management": ["time management", "priorities", "consequences of stress", "deal with stressful situation", "breathing exercises", "stress awareness", "triggers", "plan time", "focusing", "relieve stress", "imagery"],
    "Healthy Living": ["healthy eating", "live with limitations", "outdoor activities", "read labels", "healthy products", "preventive medicine", "goals regarding our health"],
    "Symptom Management": ["motivation", "medications", "environment clean", "adl’s", "eating", "sleeping", "talk openly", "recognizing triggers", "self monitoring symptoms"],
    "Relaxation Training": ["managing stress", "relieving stress", "breathing", "music", "exercises", "meditation", "visualization", "relaxing", "focusing", "difficult situation"]
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

  function getVisibleGoals() {
    const spans = document.querySelectorAll('.mat-mdc-checkbox span');
    return [...spans].map(span => span.textContent.trim()).filter(text => text.length > 0);
  }

  function findBestMatch(topic, visibleGoals) {
    let bestGoal = null;
    let highestScore = -1;

    for (const goal of visibleGoals) {
      const keywords = goalKeywords[goal] || [];
      let score = 0;
      keywords.forEach(keyword => {
        if (topic.includes(keyword)) score++;
      });
      if (score > highestScore) {
        highestScore = score;
        bestGoal = goal;
      }
    }

    return bestGoal;
  }

  function checkGoalsAndMark() {
    const topics = getTopicsFromInputs();
    const visibleGoals = getVisibleGoals();
    const goalLabels = document.querySelectorAll('.mat-mdc-checkbox');
    const matchedGoals = new Set();

    topics.forEach(topic => {
      const bestMatch = findBestMatch(topic, visibleGoals);
      if (bestMatch) matchedGoals.add(bestMatch);
    });

    goalLabels.forEach(label => {
      const span = label.querySelector('label span') || label.querySelector('span');
      const goalText = span?.textContent.trim();
      if (!goalText) return;

      if (matchedGoals.has(goalText) && !label.querySelector('.goal-result')) {
        const mark = document.createElement('div');
        mark.className = 'goal-result';
        mark.textContent = '✅ Goal found';
        mark.style.fontSize = '13px';
        mark.style.color = '#388e3c';
        mark.style.marginTop = '4px';
        label.appendChild(mark);
      }
    });
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

