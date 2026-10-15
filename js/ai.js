
/*
 * JeevanCare AI Assistant
 * Local health assistant + OpenAI + Google Gemini
 * File: js/ai.js
 */

(() => {
  "use strict";

  // -----------------------------------------
  // HTML ELEMENTS
  // -----------------------------------------

  const form = document.getElementById("aiForm");
  const input = document.getElementById("aiInput");
  const sendButton = document.getElementById("sendAiBtn");
  const messages = document.getElementById("chatMessages");
  const providerSelect = document.getElementById("aiProvider");
  const quickQuestions = document.querySelectorAll(".quick-question");
  const historyBox = document.getElementById("chatHistory");
  const refreshHistory = document.getElementById("refreshHistory");

  const STORAGE_KEY = "jeevancare_ai_history_v1";
  const MAX_HISTORY = 30;

  let apiConversation = [];
  let isSending = false;

  // -----------------------------------------
  // SAFE TEXT HELPERS
  // -----------------------------------------

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  }

  // -----------------------------------------
  // LOCAL HEALTH ASSISTANT
  // Works without an API key
  // -----------------------------------------

  function generateHealthResponse(question) {
    const text = normalizeText(question);

    const emergencyPattern =
      /can't breathe|cannot breathe|difficulty breathing|severe chest pain|crushing chest pain|face drooping|slurred speech|unconscious|vomiting blood|heavy bleeding|want to kill myself|suicide plan/;

    if (emergencyPattern.test(text)) {
      return {
        response:
          "This may be an emergency. Please do not rely on AI. " +
          "Call India's emergency number 112 or go to the nearest " +
          "emergency department now. Ask someone nearby to help.",
        emergency: true,
        needsDoctor: false
      };
    }

    if (/\b(hello|hi|hey|namaste|namaskar)\b/.test(text)) {
      return {
        response:
          "Hello! 💙 I'm JeevanCare AI. I can share general health " +
          "information, common symptoms and prevention tips. " +
          "You can ask your question in English or Hinglish.",
        needsDoctor: false
      };
    }

    if (/who are you|what can you do|tum kaun ho|help me/.test(text)) {
      return {
        response:
          "I'm JeevanCare AI, a health-information assistant. " +
          "I can explain common health conditions and general care. " +
          "I cannot confirm a diagnosis or replace a qualified doctor.",
        needsDoctor: false
      };
    }

    const topics = [
      {
        keywords: ["fever", "bukhar", "temperature"],
        title: "Fever",
        response:
          "Fever can occur with infections and other conditions. " +
          "Rest, drink fluids and monitor your temperature. " +
          "Seek medical advice if it persists or worsens. " +
          "Confusion, breathing difficulty or a seizure needs urgent care."
      },
      {
        keywords: ["cough", "khansi", "sore throat", "gala dard"],
        title: "Cough and sore throat",
        response:
          "Cough and throat pain can have several causes, including " +
          "viral infections, allergies and irritation. Rest, drink fluids " +
          "and avoid smoke. Seek medical care if symptoms worsen. " +
          "Breathing difficulty or coughing blood needs urgent assessment."
      },
      {
        keywords: ["headache", "sir dard", "sar dard"],
        title: "Headache",
        response:
          "Headaches can be associated with dehydration, poor sleep, " +
          "stress, migraine or other causes. Rest somewhere quiet and " +
          "drink water if appropriate. A sudden, extremely severe headache, " +
          "weakness or confusion needs urgent medical care."
      },
      {
        keywords: ["pet dard", "stomach pain", "abdominal pain", "belly pain"],
        title: "Stomach pain",
        response:
          "Stomach pain can have many causes. Its location, duration and " +
          "severity matter. Severe or worsening pain, repeated vomiting, " +
          "blood in vomit or stool, fainting or a rigid abdomen needs urgent care."
      },
      {
        keywords: ["acidity", "acid reflux", "heartburn", "seene me jalan"],
        title: "Acidity and acid reflux",
        response:
          "Acid reflux may cause burning in the chest or a sour taste. " +
          "Try smaller meals and avoid lying down for about three hours " +
          "after eating. Seek medical advice if symptoms are frequent. " +
          "New or severe chest pain should not automatically be assumed to be acidity."
      },
      {
        keywords: ["diabetes", "blood sugar", "sugar level"],
        title: "Diabetes",
        response:
          "Diabetes affects how the body regulates blood glucose. " +
          "Testing is needed to diagnose it. Follow your clinician's advice " +
          "on monitoring, food, activity and medication. Do not change " +
          "medication doses without medical guidance."
      },
      {
        keywords: ["dengue"],
        title: "Dengue",
        response:
          "Dengue may cause fever, headache, severe body aches, nausea " +
          "or rash. If dengue is suspected, seek medical assessment. " +
          "Avoid aspirin or ibuprofen unless a clinician advises them. " +
          "Bleeding, severe abdominal pain, persistent vomiting or drowsiness " +
          "needs urgent medical care."
      },
      {
        keywords: ["malaria"],
        title: "Malaria",
        response:
          "Malaria can cause fever, chills, sweating and weakness. " +
          "Prompt testing and prescribed treatment are important if it is " +
          "suspected. Confusion or severe weakness needs urgent care."
      },
      {
        keywords: ["constipation", "kabz", "hard stool"],
        title: "Constipation",
        response:
          "Constipation may cause hard stools or straining. Gradually " +
          "increase fibre, drink fluids if appropriate and stay active. " +
          "Severe abdominal pain, vomiting or a swollen abdomen needs urgent assessment."
      },
      {
        keywords: ["diarrhea", "diarrhoea", "loose motion"],
        title: "Diarrhoea",
        response:
          "Diarrhoea can cause dehydration. Take frequent small sips of " +
          "fluids; oral rehydration solution can replace lost salts. " +
          "Seek medical help for blood in stool, confusion, very little urine " +
          "or inability to keep fluids down."
      },
      {
        keywords: ["asthma", "wheezing", "saans lene me dikkat"],
        title: "Asthma and breathing",
        response:
          "Asthma can cause wheezing, coughing, chest tightness or breathlessness. " +
          "Follow your prescribed asthma action plan. Severe breathlessness, " +
          "blue lips or difficulty speaking is an emergency. Call 112."
      },
      {
        keywords: ["anemia", "anaemia", "low hemoglobin", "low hb"],
        title: "Anaemia",
        response:
          "Anaemia can cause tiredness, weakness, dizziness or breathlessness. " +
          "A blood test and medical assessment can help identify the cause. " +
          "Lentils, beans and leafy greens contain iron, but food alone may not " +
          "correct significant anaemia."
      },
      {
        keywords: ["stress", "anxiety", "overthinking", "depression", "sad"],
        title: "Mental wellbeing",
        response:
          "Stress and low mood can affect sleep, energy and everyday life. " +
          "Consider talking with someone you trust, maintaining a regular " +
          "routine and seeking professional support if these feelings persist. " +
          "If you may harm yourself or feel unsafe, contact emergency services " +
          "or a trusted person nearby immediately."
      },
      {
        keywords: ["weight gain", "underweight", "nutrition", "protein", "diet"],
        title: "Nutrition",
        response:
          "Nutrition needs depend on your age, activity, health and goals. " +
          "Balanced meals can include grains, vegetables, fruit, lentils, " +
          "beans, eggs, dairy or other suitable protein sources. " +
          "Unexplained weight changes or persistent appetite loss need medical assessment."
      },
      {
        keywords: ["healthy lifestyle", "stay healthy", "general health"],
        title: "Healthy lifestyle",
        response:
          "Helpful everyday habits include balanced meals, regular physical " +
          "activity, adequate sleep, hydration, avoiding tobacco and " +
          "appropriate health check-ups. Build habits gradually and seek " +
          "personalised advice if you have a medical condition."
      }
    ];

    // Match the most specific keyword first.
    let bestMatch = null;
    let bestLength = 0;

    for (const topic of topics) {
      for (const keyword of topic.keywords) {
        if (text.includes(keyword) && keyword.length > bestLength) {
          bestMatch = topic;
          bestLength = keyword.length;
        }
      }
    }

    if (bestMatch) {
      return {
        response:
          bestMatch.title + "\n\n" + bestMatch.response +
          "\n\nThis is general information, not a diagnosis or prescription.",
        needsDoctor: true
      };
    }

    if (/pain|ache|dard|dukh raha/.test(text)) {
      return {
        response:
          "I can share general information. Where are you feeling the pain: " +
          "stomach, head, chest, back, joints or somewhere else? " +
          "Tell me how long it has been happening and how severe it is. " +
          "Severe or sudden pain needs urgent medical assessment.",
        needsDoctor: true
      };
    }

    return {
      response:
        "I don't have a reliable specific answer for that question yet, " +
        "and I don't want to guess. Try asking about a particular condition, " +
        "for example: 'Dengue symptoms', 'Diabetes prevention' or " +
        "'What should I eat during fever?' For personal medical advice, " +
        "please consult a qualified healthcare professional.",
      needsDoctor: true
    };
  }

  // -----------------------------------------
  // CHAT DISPLAY
  // -----------------------------------------

  function addMessage(text, type, options = {}) {
    if (!messages) {
      console.error("JeevanCare: #chatMessages element not found.");
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = type === "user"
      ? "message user-message"
      : "message ai-message";

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = type === "user" ? "U" : "✦";

    const content = document.createElement("div");
    content.className = "message-content";

    const name = document.createElement("span");
    name.className = "message-name";
    name.textContent = type === "user" ? "You" : "JeevanCare AI";

    const paragraph = document.createElement("p");
    paragraph.innerHTML = escapeHtml(text).replace(/\n/g, "<br>");

    content.append(name, paragraph);
    wrapper.append(avatar, content);

    if (type !== "user" && options.needsDoctor) {
      const doctorLink = document.createElement("a");
      doctorLink.className = "ai-doctor-link";
      doctorLink.href = "doctor.html";
      doctorLink.textContent = "🩺 Consult a Doctor";
      content.appendChild(doctorLink);
    }

    if (type !== "user" && options.emergency) {
      const emergencyLink = document.createElement("a");
      emergencyLink.className = "ai-doctor-link ai-emergency-link";
      emergencyLink.href = "tel:112";
      emergencyLink.textContent = "Call 112";
      content.appendChild(emergencyLink);
    }

    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    hideTyping();

    if (!messages) return;

    const typing = document.createElement("div");
    typing.className = "message ai-message";
    typing.id = "typingMessage";

    typing.innerHTML = `
      <div class="message-avatar">✦</div>
      <div class="message-content">
        <span class="message-name">JeevanCare AI</span>
        <p>Thinking...</p>
      </div>
    `;

    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
  }

  function hideTyping() {
    document.getElementById("typingMessage")?.remove();
  }

  // -----------------------------------------
  // CHAT HISTORY
  // -----------------------------------------

  function readHistory() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }

  function saveHistory(question, response) {
    try {
      const history = readHistory();

      history.unshift({
        question,
        response,
        created_at: new Date().toISOString()
      });

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(history.slice(0, MAX_HISTORY))
      );

      renderHistory();
    } catch (error) {
      console.warn("JeevanCare: Could not save chat history.");
    }
  }

  function renderHistory() {
    if (!historyBox) return;

    const history = readHistory();

    if (!history.length) {
      historyBox.innerHTML =
        '<div class="history-empty">' +
        "No conversations yet. Ask your first question." +
        "</div>";
      return;
    }

    historyBox.innerHTML = history.map((item) => {
      const date = new Date(item.created_at);

      const formatted = Number.isNaN(date.getTime())
        ? ""
        : date.toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short"
          });

      return `
        <div class="history-item">
          <div class="history-question">
            <div class="history-question-icon">?</div>
            <div>${escapeHtml(item.question)}</div>
          </div>
          <div class="history-date">${escapeHtml(formatted)}</div>
        </div>
      `;
    }).join("");
  }

  // -----------------------------------------
  // SEND MESSAGE
  // -----------------------------------------

  async function handleMessage(raw) {
    const question = String(raw || "").trim();

    if (!question || isSending) return;

    isSending = true;

    if (sendButton) sendButton.disabled = true;

    addMessage(question, "user");

    if (input) {
      input.value = "";
      input.style.height = "auto";
    }

    showTyping();

    try {
      const provider = providerSelect?.value || "local";
      let result;

      if (provider === "local") {
        result = generateHealthResponse(question);
      } else if (provider === "openai" || provider === "gemini") {
        const response = await fetch(
          "http://localhost:3000/api/chat",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              provider,
              message: question,
              history: apiConversation.slice(-8)
            })
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.error || `Request failed (${response.status}).`
          );
        }

        if (typeof data.reply !== "string" || !data.reply.trim()) {
          throw new Error("The AI returned an empty response.");
        }

        result = {
          response: data.reply.trim(),
          needsDoctor: true,
          emergency: false
        };

        apiConversation.push(
          { role: "user", content: question },
          { role: "assistant", content: data.reply.trim() }
        );

        apiConversation = apiConversation.slice(-8);
      } else {
        throw new Error("Please select a valid AI provider.");
      }

      hideTyping();

      addMessage(result.response, "ai", {
        needsDoctor: result.needsDoctor,
        emergency: result.emergency
      });

      saveHistory(question, result.response);
    } catch (error) {
      hideTyping();

      addMessage(
        "Sorry, I couldn't process that message.\n\n" +
        (error.message || "Please try again.") +
        "\n\nYou can select JeevanCare AI to use the local assistant.",
        "ai"
      );

      console.error("JeevanCare chat error:", error.message);
    } finally {
      hideTyping();
      isSending = false;

      if (sendButton) sendButton.disabled = false;

      input?.focus();
    }
  }

  // -----------------------------------------
  // IMPORTANT: PREVENT PAGE RELOAD
  // -----------------------------------------

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      handleMessage(input?.value || "");
    });
  } else {
    console.error(
      'JeevanCare: Form with id="aiForm" was not found.'
    );
  }

  // -----------------------------------------
  // QUICK QUESTIONS
  // -----------------------------------------

  quickQuestions.forEach((button) => {
    button.addEventListener("click", () => {
      if (!input || isSending) return;

      input.value =
        button.dataset.question || button.textContent.trim();

      input.focus();
      input.style.height = "auto";
      input.style.height =
        Math.min(input.scrollHeight, 130) + "px";
    });
  });

  // -----------------------------------------
  // TEXTAREA AUTO-RESIZE AND ENTER KEY
  // -----------------------------------------

  if (input) {
    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height =
        Math.min(input.scrollHeight, 130) + "px";
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();

        if (typeof form?.requestSubmit === "function") {
          form.requestSubmit();
        } else {
          handleMessage(input.value);
        }
      }
    });
  }

  // -----------------------------------------
  // PROVIDER CHANGE
  // -----------------------------------------

  providerSelect?.addEventListener("change", () => {
    apiConversation = [];
  });

  // -----------------------------------------
  // HISTORY REFRESH
  // -----------------------------------------

  refreshHistory?.addEventListener("click", renderHistory);

  // Initial setup
  renderHistory();

  console.log("JeevanCare AI Assistant loaded successfully.");
})();
