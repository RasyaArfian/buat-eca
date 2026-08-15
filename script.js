(function () {
  "use strict";

  /* ---------- Background floating hearts ---------- */
  const bgHearts = document.getElementById("bgHearts");
  const heartEmojis = ["💗", "💕", "💖", "💓", "🌸"];
  for (let i = 0; i < 14; i++) {
    const h = document.createElement("span");
    h.className = "floating-heart";
    h.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    h.style.left = Math.random() * 100 + "%";
    h.style.animationDuration = 8 + Math.random() * 10 + "s";
    h.style.animationDelay = Math.random() * 10 + "s";
    h.style.fontSize = 1 + Math.random() * 1.5 + "rem";
    bgHearts.appendChild(h);
  }

  /* ---------- Mood meter ---------- */
  let mood = 100;
  const meterFill = document.getElementById("meterFill");
  const meterValue = document.getElementById("meterValue");
  const meterLabel = document.getElementById("meterLabel");
  const celebrationCard = document.getElementById("celebrationCard");

  const moodLabels = [
    { min: 80, text: "Lagi Marah Besar 😡", color: "#ff4d4d" },
    { min: 55, text: "Masih Kesel Banget 😤", color: "#ff7043" },
    { min: 30, text: "Mulai Adem Dikit 😕", color: "#ffb300" },
    { min: 10, text: "Udah Mendingan 🙂", color: "#9ccc65" },
    { min: 0, text: "Baikan! 🥰", color: "#4caf50" },
  ];

  function updateMeter() {
    meterFill.style.width = mood + "%";
    meterValue.textContent = Math.round(mood);
    const level = moodLabels.find((l) => mood >= l.min) || moodLabels[moodLabels.length - 1];
    meterLabel.textContent = level.text;
    meterLabel.style.color = level.color;
    meterFill.style.background = `linear-gradient(90deg, ${level.color}, #ff9ac1)`;

    if (mood <= 0) {
      mood = 0;
      celebrationCard.hidden = false;
      celebrationCard.scrollIntoView({ behavior: "smooth", block: "center" });
      launchConfetti();
    }
    updateSummary();
  }

  function reduceMood(amount) {
    if (mood <= 0) return;
    mood = Math.max(0, mood - amount);
    updateMeter();
  }

  /* ---------- Score summary ---------- */
  const sumMoodEl = document.getElementById("sumMood");
  const sumHeartEl = document.getElementById("sumHeart");
  const sumMemoryEl = document.getElementById("sumMemory");
  const sumActionEl = document.getElementById("sumWord");

  const sumCampusEl = document.getElementById("sumCampus");

  function updateSummary() {
    sumMoodEl.textContent = Math.round(mood) + "%";
    sumHeartEl.textContent = gameScore;
    sumMemoryEl.textContent = memoryMatches + "/4";
    sumActionEl.textContent = wordScore + "/" + wordList.length;
    sumCampusEl.textContent = campusCheckedCount + "/6";
  }

  /* ---------- Mini game: Susun Kata Cinta (word scramble) ---------- */
  const wordAnswer = document.getElementById("wordAnswer");
  const wordLetters = document.getElementById("wordLetters");
  const wordResetBtn = document.getElementById("wordResetBtn");
  const wordCheckBtn = document.getElementById("wordCheckBtn");
  const wordMsg = document.getElementById("wordMsg");
  const wordScoreEl = document.getElementById("wordScore");
  const wordRoundEl = document.getElementById("wordRound");

  const wordList = [
    "SAYANG",
    "COKLAT",
    "SEBLAK",
    "PELUK",
    "RINDU",
    "MATCHA",
    "ASYA GANTENG",
    "ASYA BAIK HATI",
    "ECA CANTIK",
    "ECA LUCU",
  ];
  const wordTotalEl = document.getElementById("wordTotal");
  let wordRound = 0;
  let wordScore = 0;
  let currentWord = "";
  let currentTarget = "";
  // Each entry in answerLetters is a reference to the SAME object stored in
  // letterTilesState, not a copy of the character. That way removing a tile
  // from the answer can flip that exact entry's `used` flag back to false —
  // fixing the old bug where undoing a letter (especially a repeated one
  // like the two "A"s/"C"s in ECACANTIK) permanently lost it from the pool.
  let answerLetters = [];

  function shuffleWord(word) {
    const letters = word.split("");
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    if (letters.join("") === word && word.length > 1) return shuffleWord(word);
    return letters;
  }

  function renderWordAnswer() {
    wordAnswer.innerHTML = "";
    answerLetters.forEach((entry, idx) => {
      const tile = document.createElement("button");
      tile.className = "letter-tile answer-tile";
      tile.textContent = entry.letter;
      tile.addEventListener("click", () => {
        entry.used = false;
        answerLetters.splice(idx, 1);
        renderWordAnswer();
        renderWordLetters();
      });
      wordAnswer.appendChild(tile);
    });
  }

  let letterTilesState = [];

  function renderWordLetters() {
    wordLetters.innerHTML = "";
    letterTilesState.forEach((entry) => {
      const tile = document.createElement("button");
      tile.className = "letter-tile";
      tile.textContent = entry.letter;
      tile.disabled = entry.used;
      tile.addEventListener("click", () => {
        if (entry.used) return;
        entry.used = true;
        answerLetters.push(entry);
        renderWordLetters();
        renderWordAnswer();
      });
      wordLetters.appendChild(tile);
    });
  }

  function loadWord() {
    if (wordRound >= wordList.length) {
      wordMsg.textContent = `Semua kata beres! Kamu bener ${wordScore} dari ${wordList.length} kata. Makasih udah main ya 💗`;
      wordAnswer.innerHTML = "";
      wordLetters.innerHTML = "";
      wordCheckBtn.disabled = true;
      wordResetBtn.disabled = true;
      return;
    }
    currentWord = wordList[wordRound];
    currentTarget = currentWord.replaceAll(" ", "");
    answerLetters = [];
    letterTilesState = shuffleWord(currentTarget).map((letter) => ({ letter, used: false }));
    wordRoundEl.textContent = wordRound + 1;
    wordTotalEl.textContent = wordList.length;
    wordMsg.textContent = "Ayo susun kata di atas ya! (spasi nggak usah dipikirin)";
    renderWordAnswer();
    renderWordLetters();
  }

  wordResetBtn.addEventListener("click", () => {
    answerLetters = [];
    letterTilesState.forEach((entry) => (entry.used = false));
    renderWordAnswer();
    renderWordLetters();
  });

  wordCheckBtn.addEventListener("click", () => {
    const guess = answerLetters.map((entry) => entry.letter).join("");
    if (guess === currentTarget) {
      wordScore++;
      wordScoreEl.textContent = wordScore;
      wordMsg.textContent = `Bener! "${currentWord}" — mantap 🎉`;
      reduceMood(8);
      wordRound++;
      setTimeout(loadWord, 900);
    } else {
      wordMsg.textContent = "Belum tepat nih, coba susun ulang ya 😅";
    }
  });

  loadWord();

  /* ---------- Campus schedule: pickup/dropoff commitment ---------- */
  const campusChecklist = document.getElementById("campusChecklist");
  const campusCheckedCountEl = document.getElementById("campusCheckedCount");
  const campusCheckboxes = Array.from(campusChecklist.querySelectorAll('input[type="checkbox"]'));
  const noCampusCheckbox = document.getElementById("noCampusCheckbox");
  let campusCheckedCount = 0;

  campusCheckboxes.forEach((box) => {
    box.addEventListener("change", () => {
      campusCheckedCount = campusCheckboxes.filter((b) => b.checked).length;
      campusCheckedCountEl.textContent = campusCheckedCount;
      if (box.checked) {
        noCampusCheckbox.checked = false;
      }
      updateSummary();
    });
  });

  noCampusCheckbox.addEventListener("change", () => {
    if (noCampusCheckbox.checked) {
      campusCheckboxes.forEach((box) => {
        box.checked = false;
      });
      campusCheckedCount = 0;
      campusCheckedCountEl.textContent = "0";
    }
    updateSummary();
  });

  /* ---------- Mini game: Tangkap Cinta ---------- */
  const gameArea = document.getElementById("gameArea");
  const gamePlaceholder = document.getElementById("gamePlaceholder");
  const startGameBtn = document.getElementById("startGameBtn");
  const gameScoreEl = document.getElementById("gameScore");
  const gameTimeEl = document.getElementById("gameTime");

  let gameRunning = false;
  let gameScore = 0;
  let gameTimeLeft = 15;
  let spawnInterval = null;
  let timerInterval = null;

  function spawnHeart() {
    if (!gameRunning) return;
    const heart = document.createElement("button");
    heart.className = "game-heart";
    heart.textContent = ["💗", "💖", "💕", "💓"][Math.floor(Math.random() * 4)];
    const areaW = gameArea.clientWidth;
    const areaH = gameArea.clientHeight;
    const x = Math.random() * (areaW - 40);
    const y = Math.random() * (areaH - 40);
    heart.style.left = x + "px";
    heart.style.top = y + "px";

    const lifetime = setTimeout(() => {
      if (heart.parentNode) heart.remove();
    }, 1400);

    heart.addEventListener(
      "click",
      () => {
        clearTimeout(lifetime);
        heart.remove();
        gameScore++;
        gameScoreEl.textContent = gameScore;
        reduceMood(4);
      },
      { once: true }
    );

    gameArea.appendChild(heart);
  }

  function startGame() {
    if (gameRunning) return;
    gameRunning = true;
    gameScore = 0;
    gameTimeLeft = 15;
    gameScoreEl.textContent = "0";
    gameTimeEl.textContent = "15";
    gamePlaceholder.style.display = "none";
    startGameBtn.textContent = "⏳ Sedang Main...";
    startGameBtn.disabled = true;

    spawnInterval = setInterval(spawnHeart, 650);
    timerInterval = setInterval(() => {
      gameTimeLeft--;
      gameTimeEl.textContent = gameTimeLeft;
      if (gameTimeLeft <= 0) {
        endGame();
      }
    }, 1000);
  }

  function endGame() {
    gameRunning = false;
    clearInterval(spawnInterval);
    clearInterval(timerInterval);
    gameArea.querySelectorAll(".game-heart").forEach((h) => h.remove());
    gamePlaceholder.style.display = "flex";
    gamePlaceholder.textContent = `Selesai! Kamu dapet ${gameScore} hati 💗 — marah Eca makin turun. Main lagi?`;
    startGameBtn.textContent = "▶️ Main Lagi";
    startGameBtn.disabled = false;
  }

  startGameBtn.addEventListener("click", startGame);

  /* ---------- Mini game: Memory Match ---------- */
  const memoryGrid = document.getElementById("memoryGrid");
  const memoryMovesEl = document.getElementById("memoryMoves");
  const memoryMatchesEl = document.getElementById("memoryMatches");
  const restartMemoryBtn = document.getElementById("restartMemoryBtn");
  const memoryEmojis = ["💗", "😘", "🌹", "🎁"];

  let memoryMoves = 0;
  let memoryMatches = 0;
  let memoryFlipped = [];
  let memoryLocked = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildMemoryGrid() {
    memoryGrid.innerHTML = "";
    memoryMoves = 0;
    memoryMatches = 0;
    memoryFlipped = [];
    memoryLocked = false;
    memoryMovesEl.textContent = "0";
    memoryMatchesEl.textContent = "0";

    const deck = shuffle([...memoryEmojis, ...memoryEmojis]);
    deck.forEach((emoji) => {
      const card = document.createElement("button");
      card.className = "memory-card";
      card.textContent = "❓";
      card.dataset.emoji = emoji;
      card.dataset.state = "hidden";
      card.addEventListener("click", () => onMemoryCardClick(card));
      memoryGrid.appendChild(card);
    });
  }

  function onMemoryCardClick(card) {
    if (memoryLocked) return;
    if (card.dataset.state !== "hidden") return;
    if (memoryFlipped.length === 2) return;

    card.dataset.state = "flipped";
    card.classList.add("flipped");
    card.textContent = card.dataset.emoji;
    memoryFlipped.push(card);

    if (memoryFlipped.length === 2) {
      memoryMoves++;
      memoryMovesEl.textContent = memoryMoves;
      const [a, b] = memoryFlipped;
      if (a.dataset.emoji === b.dataset.emoji) {
        a.dataset.state = "matched";
        b.dataset.state = "matched";
        a.classList.add("matched");
        b.classList.add("matched");
        memoryFlipped = [];
        memoryMatches++;
        memoryMatchesEl.textContent = memoryMatches;
        reduceMood(6);
      } else {
        memoryLocked = true;
        setTimeout(() => {
          a.dataset.state = "hidden";
          b.dataset.state = "hidden";
          a.classList.remove("flipped");
          b.classList.remove("flipped");
          a.textContent = "❓";
          b.textContent = "❓";
          memoryFlipped = [];
          memoryLocked = false;
        }, 800);
      }
    }
  }

  restartMemoryBtn.addEventListener("click", buildMemoryGrid);
  buildMemoryGrid();

  /* ---------- Mini game: Roda Keberuntungan ---------- */
  const wheel = document.getElementById("wheel");
  const spinWheelBtn = document.getElementById("spinWheelBtn");
  const wheelResult = document.getElementById("wheelResult");
  const wheelPrizes = [
    "Pelukan gratis kapan aja kamu mau 🤗",
    "Satu lagu request buat kamu 🎵",
    "Jajan gratis, kamu yang pilih tempatnya 🍡",
    "Pijitan kepala, punggung, kaki 10 menit 💆",
    "Nonton film pilihanmu, aku ikut aja 🎬",
    "Pesan cinta ekstra manis dariku 💌",
  ];
  let wheelRotation = 0;

  spinWheelBtn.addEventListener("click", () => {
    spinWheelBtn.disabled = true;
    const extraSpins = 4 + Math.floor(Math.random() * 3);
    const randomOffset = Math.floor(Math.random() * 360);
    wheelRotation += extraSpins * 360 + randomOffset;
    wheel.style.transform = `rotate(${wheelRotation}deg)`;

    setTimeout(() => {
      const prize = wheelPrizes[Math.floor(Math.random() * wheelPrizes.length)];
      wheelResult.textContent = `Kamu dapet: ${prize}`;
      reduceMood(7);
      spinWheelBtn.disabled = false;
    }, 4000);
  });

  /* ---------- Quiz ---------- */
  const quizData = [
    {
      q: "Sejujurnya, gimana perasaanmu ke aku sekarang?",
      report: "Perasaanku ke kamu sekarang",
      options: ["Masih kesel banget", "Mulai adem dikit", "Udah lumayan baikan"],
    },
    {
      q: "Apa yang paling kamu butuhin dariku sekarang?",
      report: "Yang paling aku butuhin dari kamu sekarang",
      options: ["Didengerin dulu", "Dipeluk", "Dikasih waktu sendiri dulu"],
    },
    {
      q: "Kalau aku mau ketemu kamu nanti, maunya gimana?",
      report: "Kalau kamu mau ketemu aku nanti, aku maunya",
      options: ["Quality Time yang banyak", "Sambil makan-makan", "Jalan santai aja, nggak usah banyak ngobrol"],
    },
  ];

  const quizContainer = document.getElementById("quizContainer");
  const quizResult = document.getElementById("quizResult");
  let quizAnswered = 0;
  const quizAnswersText = new Array(quizData.length).fill(null);

  quizData.forEach((item, qIndex) => {
    const qDiv = document.createElement("div");
    qDiv.className = "quiz-question";

    const qText = document.createElement("p");
    qText.textContent = `${qIndex + 1}. ${item.q}`;
    qDiv.appendChild(qText);

    const optsDiv = document.createElement("div");
    optsDiv.className = "quiz-options";

    item.options.forEach((opt) => {
      const optBtn = document.createElement("button");
      optBtn.className = "quiz-option";
      optBtn.textContent = opt;

      optBtn.addEventListener("click", () => {
        if (optsDiv.dataset.locked === "true") return;
        optsDiv.dataset.locked = "true";
        optBtn.classList.add("selected");
        quizAnswered++;
        quizAnswersText[qIndex] = opt;
        reduceMood(5);
        if (quizAnswered === quizData.length) {
          showQuizResult();
        }
      });

      optsDiv.appendChild(optBtn);
    });

    qDiv.appendChild(optsDiv);
    quizContainer.appendChild(qDiv);
  });

  function showQuizResult() {
    quizResult.textContent = "Makasih ya udah jujur cerita perasaanmu. Aku bakal coba sesuai yang kamu butuhin 💗";
  }

  /* ---------- Send story to WhatsApp (Eca decides & taps send herself) ---------- */
  const sendWaBtn = document.getElementById("sendWaBtn");
  const copySummaryBtn = document.getElementById("copySummaryBtn");
  const waHint = document.getElementById("waHint");
  const partnerPhone = "6281289979099";

  // Keep the text plain and free of "%", "(", ")", "->" and emoji: these
  // reserved/special characters are what trigger the character corruption
  // seen on some Android + WhatsApp versions when pre-filling via wa.me.
  function stripEmoji(str) {
    return str
      .normalize("NFC")
      .replace(/[\u{1F1E6}-\u{1FFFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, "")
      .replace(/[ \t]+/g, " ")
      .trim();
  }

  function buildSummaryMessage() {
    const level = moodLabels.find((l) => mood >= l.min) || moodLabels[moodLabels.length - 1];
    const lines = [
      "Hai, ini aku Eca. Ini hasil dari halaman yang kamu buat buat aku:",
      `Mood aku sekarang: ${Math.round(mood)} dari 100, ${stripEmoji(level.text)}`,
      `Skor Tangkap Cinta: ${gameScore}`,
      `Pasangan Kartu Ditemukan: ${memoryMatches} dari 4`,
      `Susun Kata Benar: ${wordScore} dari ${wordList.length}`,
    ];
    const campusDays = campusCheckboxes.filter((b) => b.checked).map((b) => b.dataset.day);
    if (noCampusCheckbox.checked) {
      lines.push("Minggu ini aku nggak ada jadwal ke kampus sama sekali");
    } else if (campusDays.length) {
      lines.push(`Jadwal kampus, kamu anter jemput aku: ${campusDays.join(", ")}`);
    } else {
      lines.push("Belum ada tanggal kampus yang aku centang");
    }
    quizData.forEach((item, i) => {
      if (quizAnswersText[i]) {
        lines.push(`${stripEmoji(item.report)}: ${stripEmoji(quizAnswersText[i])}`);
      }
    });
    return lines.join("\n");
  }

  sendWaBtn.addEventListener("click", () => {
    const message = buildSummaryMessage();
    const url = `https://api.whatsapp.com/send?phone=${partnerPhone}&text=${encodeURIComponent(message)}`;
    waHint.hidden = false;
    window.location.href = url;
  });

  copySummaryBtn.addEventListener("click", async () => {
    const message = buildSummaryMessage();
    try {
      await navigator.clipboard.writeText(message);
      copySummaryBtn.textContent = "✅ Pesan Tersalin!";
    } catch (clipboardError) {
      console.warn("Clipboard write failed", clipboardError);
      copySummaryBtn.textContent = "⚠️ Salin manual ya";
    }
    setTimeout(() => {
      copySummaryBtn.textContent = "📋 Salin Pesan (Kalau di WA Berantakan)";
    }, 1800);
  });

  /* ---------- Confetti ---------- */
  const confettiLayer = document.getElementById("confettiLayer");
  const confettiColors = ["#ff6fa5", "#ff9ac1", "#ffd1e3", "#d6336c", "#ffe066", "#4caf50"];

  function launchConfetti() {
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = Math.random() * 100 + "%";
      piece.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      piece.style.animationDuration = 2.5 + Math.random() * 2 + "s";
      piece.style.animationDelay = Math.random() * 0.6 + "s";
      confettiLayer.appendChild(piece);
      setTimeout(() => piece.remove(), 5500);
    }
  }

  /* ---------- Restart ---------- */
  document.getElementById("restartBtn").addEventListener("click", () => {
    mood = 100;
    celebrationCard.hidden = true;
    wordRound = 0;
    wordScore = 0;
    wordScoreEl.textContent = "0";
    wordCheckBtn.disabled = false;
    wordResetBtn.disabled = false;
    loadWord();
    campusCheckedCount = 0;
    campusCheckedCountEl.textContent = "0";
    campusCheckboxes.forEach((box) => {
      box.checked = false;
    });
    noCampusCheckbox.checked = false;
    gameScore = 0;
    gameScoreEl.textContent = "0";
    gamePlaceholder.style.display = "flex";
    gamePlaceholder.textContent = 'Tekan "Mulai Main" ya 👇';
    quizAnswered = 0;
    quizAnswersText.fill(null);
    quizResult.textContent = "";
    quizContainer.querySelectorAll(".quiz-options").forEach((o) => {
      o.dataset.locked = "false";
    });
    quizContainer.querySelectorAll(".quiz-option").forEach((o) => o.classList.remove("selected"));
    buildMemoryGrid();
    wheelRotation = 0;
    wheel.style.transform = "rotate(0deg)";
    wheelResult.textContent = "Hasil putaranmu bakal muncul di sini ya...";
    waHint.hidden = true;
    updateMeter();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  updateMeter();
})();
