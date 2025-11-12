const symptoms = [
  'fever','cough','sore_throat','nasal_congestion','headache','body_pain','chills',
  'nausea','vomiting','diarrhea','abdominal_pain','burning_urination',
  'frequent_urination','fatigue','rash','joint_pain','bleeding_gums','retro_orbital_pain'
];

const form = document.getElementById('symptomForm');
const list = document.getElementById('symptomList');
const result = document.getElementById('result');
const resetBtn = document.getElementById('resetBtn');

// ✅ Dynamically add symptoms
symptoms.forEach(sym => {
  const label = document.createElement('label');
  label.innerHTML = `<input type='checkbox' name='${sym}'> ${sym.replace('_',' ')}`;
  list.appendChild(label);
});

// ✅ Predict form logic
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const checked = document.querySelectorAll('input[type="checkbox"]:checked');
  if (checked.length < 2) {
    result.innerHTML = `<p style="color:red; font-weight:bold;">⚠️ Please select at least 2 symptoms before predicting.</p>`;
    return;
  }

  const data = {};
  checked.forEach(c => data[c.name] = 1);
  const age = document.getElementById('age').value;
  const gender = document.getElementById('gender').value;

  const res = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms: data, age, gender })
  });

  const json = await res.json();
  const disease = json.prediction;
  const confidence = json.confidence;

  result.innerHTML = `
    <h3>Predicted Disease: ${disease}</h3>
    <p>Confidence: <strong>${confidence}</strong></p>
    <button id="tipsBtn" class="btn">See Health Tips & Precautions</button>
  `;

  document.getElementById('tipsBtn').addEventListener('click', () => {
    window.location.href = `/tips/${encodeURIComponent(disease)}`;
  });
});

// ✅ Reset button
resetBtn.addEventListener('click', () => {
  form.reset();
  result.innerHTML = '';
  const checkboxes = document.querySelectorAll('#symptomList input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = false);
});

// ✅ Chatbot Assistant
document.addEventListener("DOMContentLoaded", () => {
  const chatbot = document.getElementById("chatbot");
  const toggleBtn = document.getElementById("chatbot-toggle");
  const messages = document.getElementById("chatbot-messages");
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");

  toggleBtn.addEventListener("click", () => {
    chatbot.style.display = chatbot.style.display === "flex" ? "none" : "flex";
  });

  function addMessage(text, sender) {
    const msg = document.createElement("div");
    msg.classList.add(sender);
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  const conversation = [
    { q: "Hi there! 👋 I'm your Health Assistant. Do you have a fever?", yes: "Oh no! Do you also have a cough or sore throat?", no: "Alright! Do you feel tired or have a headache?" },
    { q: "Do you have fatigue or body pain?", yes: "I see. Any nausea or vomiting?", no: "Okay, how about chills or shivering?" },
    { q: "How long have you had these symptoms?", yes: "Got it! Please select your symptoms above.", no: "Got it! Please select your symptoms above." }
  ];

  let step = 0;
  addMessage(conversation[step].q, "bot");

  sendBtn.addEventListener("click", () => {
    const userText = input.value.trim().toLowerCase();
    if (!userText) return;
    addMessage(userText, "user");
    input.value = "";

    setTimeout(() => {
      if (userText.includes("yes")) {
        addMessage(conversation[step].yes, "bot");
      } else if (userText.includes("no")) {
        addMessage(conversation[step].no, "bot");
      } else {
        addMessage("Please reply with 'yes' or 'no'.", "bot");
        return;
      }

      if (step < conversation.length - 1) {
        step++;
        setTimeout(() => addMessage(conversation[step].q, "bot"), 1200);
      } else {
        setTimeout(() => addMessage("You're all set! Go ahead and fill the form above. 😊", "bot"), 1500);
      }
    }, 800);
  });
});
