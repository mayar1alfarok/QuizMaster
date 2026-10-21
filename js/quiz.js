/**
 * ============================================
 * QUIZ CLASS
 * ============================================
 * 
 * This class manages the entire quiz game state.
 * 
 * PROPERTIES TO CREATE:
 * - category (string) - The selected category ID
 * - difficulty (string) - easy, medium, or hard
 * - numberOfQuestions (number) - How many questions
 * - playerName (string) - The player's name
 * - score (number) - Current score, starts at 0
 * - questions (array) - Questions from API, starts empty
 * - currentQuestionIndex (number) - Which question we're on, starts at 0
 * 
 * METHODS TO IMPLEMENT:
 * - constructor(category, difficulty, numberOfQuestions, playerName)
 * - async getQuestions() - Fetch questions from API
 * - buildApiUrl() - Create the API URL with parameters
 * - incrementScore() - Add 1 to score
 * - getCurrentQuestion() - Get the current question object
 * - nextQuestion() - Move to next question, return true/false
 * - isComplete() - Check if quiz is finished
 * - getScorePercentage() - Calculate percentage (0-100)
 * - saveHighScore() - Save to localStorage
 * - getHighScores() - Load from localStorage
 * - isHighScore() - Check if current score qualifies
 * - endQuiz() - Generate results screen HTML
 * 
 */


//export default class Quiz {
  
  // TODO: Create constructor
  // Initialize all properties mentioned above
  
  
  // TODO: Create async getQuestions() method
  // 1. Build the API URL using buildApiUrl()
  // 2. Use fetch() to get data
  // 3. Check if response.ok, throw error if not
  // 4. Parse JSON: const data = await response.json()
  // 5. Check if data.response_code === 0 (success)
  // 6. Store data.results in this.questions
  // 7. Return this.questions
  
  
  // TODO: Create buildApiUrl() method
  // Use URLSearchParams to build query string
  // Example result: "https://opentdb.com/api.php?amount=10&difficulty=easy"
  
  
  // TODO: Create incrementScore() method
  // Simply add 1 to this.score
  
  
  // TODO: Create getCurrentQuestion() method
  // Return this.questions[this.currentQuestionIndex]
  // Return null if index is out of bounds
  
  
  // TODO: Create nextQuestion() method
  // Increment currentQuestionIndex
  // Return true if there are more questions
  // Return false if quiz is complete
  
  
  // TODO: Create isComplete() method
  // Return true if currentQuestionIndex >= questions.length
  
  
  // TODO: Create getScorePercentage() method
  // Calculate: (score / numberOfQuestions) * 100
  // Round to whole number using Math.round()
  
  
  // TODO: Create saveHighScore() method
  // 1. Get existing high scores using getHighScores()
  // 2. Create new score object: { name, score, total, percentage, difficulty, date }
  // 3. Push to array
  // 4. Sort by percentage (highest first)
  // 5. Keep only top 10
  // 6. Save to localStorage using JSON.stringify()
  
  
  // TODO: Create getHighScores() method
  // 1. Get from localStorage using 'quizHighScores' key
  // 2. Parse JSON
  // 3. Return array (or empty array if nothing saved)
  // Wrap in try/catch for safety
  
  
  // TODO: Create isHighScore() method
  // Return true if:
  // - Less than 10 saved, OR
  // - Current percentage beats the lowest saved score
  
  
  // TODO: Create endQuiz() method
  // 1. Calculate percentage
  // 2. Check if it's a high score
  // 3. If yes, save it (BEFORE getting high scores for display)
  // 4. Get high scores (AFTER saving)
  // 5. Return HTML string for results screen
  //    (See index.html for the HTML structure to use)
  
//}


/**
 * QUIZ CLASS - manages the whole quiz game state
 */

export default class Quiz {
  constructor(category, difficulty, numberOfQuestions, playerName) {
    this.category = category;
    this.difficulty = difficulty;
    this.numberOfQuestions = numberOfQuestions;
    this.playerName = playerName;

    this.score = 0;
    this.questions = [];
    this.currentQuestionIndex = 0;
  }

  // Build the API url using URLSearchParams
  buildApiUrl() {
    const params = new URLSearchParams({
      amount: this.numberOfQuestions,
      difficulty: this.difficulty,
      type: "multiple",
    });

    // empty category = random, so we only add it when the user picked one
    if (this.category) {
      params.append("category", this.category);
    }

    return `https://opentdb.com/api.php?${params.toString()}`;
  }

  // Fetch questions from the API
  async getQuestions() {
    const url = this.buildApiUrl();

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.response_code !== 0) {
      throw new Error("Could not get questions. Try different settings.");
    }

    this.questions = data.results;
    return this.questions;
  }

  incrementScore() {
    this.score++;
  }

  getCurrentQuestion() {
    // null if the index is out of bounds
    return this.questions[this.currentQuestionIndex] ?? null;
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    return this.currentQuestionIndex < this.questions.length;
  }

  isComplete() {
    return this.currentQuestionIndex >= this.questions.length;
  }

  getScorePercentage() {
    return Math.round((this.score / this.numberOfQuestions) * 100);
  }

  // ===== localStorage =====
  getHighScores() {
    try {
      const saved = localStorage.getItem("quizHighScores");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  }

  saveHighScore() {
    const scores = this.getHighScores();

    scores.push({
      name: this.playerName,
      score: this.score,
      total: this.numberOfQuestions,
      percentage: this.getScorePercentage(),
      difficulty: this.difficulty,
      date: new Date().toISOString(),
    });

    // highest first, keep only the top 10
    scores.sort((a, b) => b.percentage - a.percentage);
    const top10 = scores.slice(0, 10);

    try {
      localStorage.setItem("quizHighScores", JSON.stringify(top10));
    } catch (error) {
      console.error("Could not save high score", error);
    }
  }

  isHighScore() {
    const scores = this.getHighScores();
    if (scores.length < 10) return true;

    const lowest = scores[scores.length - 1].percentage;
    return this.getScorePercentage() > lowest;
  }

  // Prevent names from breaking the HTML
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Build the results screen HTML
  endQuiz() {
    const percentage = this.getScorePercentage();

    // check BEFORE saving, save, then read the list for display
    const isNewRecord = this.isHighScore();
    if (isNewRecord) {
      this.saveHighScore();
    }
    const highScores = this.getHighScores();

    const ranks = ["gold", "silver", "bronze"];
    const leaderboardItems = highScores
      .map(
        (item, i) => `
        <li class="leaderboard-item ${ranks[i] ?? ""}">
          <span class="leaderboard-rank">#${i + 1}</span>
          <span class="leaderboard-name">${this.escapeHtml(item.name)}</span>
          <span class="leaderboard-score">${item.percentage}%</span>
        </li>`
      )
      .join("");

    return `
      <div class="game-card results-card">
        <h2 class="results-title">Quiz Complete!</h2>
        <p class="results-score-display">${this.score}/${this.numberOfQuestions}</p>
        <p class="results-percentage">${percentage}% Accuracy</p>

        ${
          isNewRecord
            ? `<div class="new-record-badge">
                 <i class="fa-solid fa-star"></i> New High Score!
               </div>`
            : ""
        }

        <div class="leaderboard">
          <h4 class="leaderboard-title">
            <i class="fa-solid fa-trophy"></i> Leaderboard
          </h4>
          <ul class="leaderboard-list">${leaderboardItems}</ul>
        </div>

        <div class="action-buttons">
          <button class="btn-restart">
            <i class="fa-solid fa-rotate-right"></i> Play Again
          </button>
        </div>
      </div>
    `;
  }
}