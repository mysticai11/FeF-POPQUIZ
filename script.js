let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let userAnswers = [];
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
let isMuted = false;

const harryPotterQuestions = [
    {
        question: "Who is known as 'The Boy Who Lived'?",
        answers: ["Ron Weasley", "Neville Longbottom", "Harry Potter", "Draco Malfoy"],
        correct: "Harry Potter"
    },
    {
        question: "What is the name of Harry Potter's owl?",
        answers: ["Hedwig", "Errol", "Pigwidgeon", "Crookshanks"],
        correct: "Hedwig"
    },
    {
        question: "What is the name of the school Harry Potter attends?",
        answers: ["Beauxbatons", "Durmstrang", "Ilvermorny", "Hogwarts"],
        correct: "Hogwarts"
    },
    {
        question: "Who is the Headmaster of Hogwarts for most of the series?",
        answers: ["Severus Snape", "Minerva McGonagall", "Albus Dumbledore", "Dolores Umbridge"],
        correct: "Albus Dumbledore"
    },
    {
        question: "What is the name of the dark wizard Harry must defeat?",
        answers: ["Gellert Grindelwald", "Bellatrix Lestrange", "Voldemort", "Lucius Malfoy"],
        correct: "Voldemort"
    },
    {
        question: "What is the name of Harry's best friend?",
        answers: ["Neville Longbottom", "Ron Weasley", "Hermione Granger", "Draco Malfoy"],
        correct: "Ron Weasley"
    },
    {
        question: "What is the name of the sport played on broomsticks?",
        answers: ["Quodpot", "Quidditch", "Quadball", "Quaffle"],
        correct: "Quidditch"
    },
    {
        question: "What is the name of the prison for wizards?",
        answers: ["Nurmengard", "Azkaban", "Gringotts", "The Ministry"],
        correct: "Azkaban"
    },
    {
        question: "What is Harry's Patronus?",
        answers: ["Doe", "Wolf", "Stag", "Phoenix"],
        correct: "Stag"
    },
    {
        question: "What is the name of the magical map that shows everyone's location in Hogwarts?",
        answers: ["The Marauder's Map", "The Hogwarts Atlas", "The Wizard's Compass", "The Magical Locator"],
        correct: "The Marauder's Map"
    }
];

function showAlert(message) {
    const alertElement = document.getElementById('customAlert');
    alertElement.textContent = message;
    alertElement.style.display = 'block';
    setTimeout(() => {
        alertElement.style.display = 'none';
    }, 3000);
}

function toggleDarkMode() {
    document.body.classList.toggle('light-mode');
    const icon = document.querySelector('#darkModeToggle i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
}

function toggleMute() {
    isMuted = !isMuted;
    const icon = document.querySelector('#muteToggle i');
    icon.classList.toggle('fa-volume-up');
    icon.classList.toggle('fa-volume-mute');
    
    // Mute or unmute your audio elements
    document.getElementById('correctSound').muted = isMuted;
    document.getElementById('incorrectSound').muted = isMuted;
}

function showHome() {
    document.getElementById('welcomeContainer').classList.remove('hidden');
    document.getElementById('categoryContainer').classList.add('hidden');
    document.getElementById('quiz').classList.add('hidden');
    document.getElementById('scoreContainer').classList.add('hidden');
    document.getElementById('reviewContainer').classList.add('hidden');
    document.getElementById('leaderboardContainer').classList.add('hidden');
}

function showCategories() {
    const playerName = document.getElementById('playerName').value.trim();
    if (!playerName) {
        showAlert('Please enter your name before starting the quiz!');
        return;
    }
    document.getElementById('welcomeContainer').classList.add('hidden');
    document.getElementById('categoryContainer').classList.remove('hidden');
}

async function startQuiz(category) {
    if (category === 'HarryPotter') {
        questions = harryPotterQuestions;
    } else {
        await fetchQuestions(category);
    }
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];

    document.getElementById('categoryContainer').classList.add('hidden');
    document.getElementById('quiz').classList.remove('hidden');
    showQuestion();
}

async function fetchQuestions(category) {
    let apiUrl;
    switch (category) {
        case 'Anime':
            apiUrl = 'https://opentdb.com/api.php?amount=10&category=31&type=multiple';
            break;
        case 'Comics':
            apiUrl = 'https://opentdb.com/api.php?amount=10&category=29&type=multiple';
            break;
        case 'ComputerScience':
            apiUrl = 'https://opentdb.com/api.php?amount=10&category=18&type=multiple';
            break;
        default:
            showAlert('Category not found!');
            return;
    }

    const response = await fetch(apiUrl);
    const data = await response.json();
    questions = data.results.map(question => ({
        question: question.question,
        answers: [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5),
        correct: question.correct_answer
    }));
}

function showQuestion() {
    const questionContainer = document.getElementById("questionContainer");
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.innerHTML = `<div class="progress" style="width: ${(currentQuestionIndex / questions.length) * 100}%"></div>`;
    
    questionContainer.innerHTML = `
        ${progressBar.outerHTML}
        <h3>${questions[currentQuestionIndex].question}</h3>
        <ul>
            ${questions[currentQuestionIndex].answers.map((answer, index) => `
                <li>
                    <button onclick="checkAnswer('${answer}')" style="animation: fadeIn 0.5s ease ${index * 0.1}s both;">
                        ${answer}
                    </button>
                </li>`).join('')}
        </ul>
    `;
    document.getElementById("currentQuestionNumber").innerText = currentQuestionIndex + 1;
    document.getElementById("totalQuestions").innerText = questions.length;
}

function checkAnswer(selectedAnswer) {
    const question = questions[currentQuestionIndex];
    userAnswers.push({ question: question.question, selected: selectedAnswer, correct: question.correct });
  
    const buttons = document.querySelectorAll("#questionContainer button");
    const feedbackMessage = document.querySelector(".feedback-message");
    
    buttons.forEach(button => {
      button.disabled = true;
      if (button.textContent === question.correct) {
        button.classList.add("correct");
      } 
      if (button.textContent === selectedAnswer && selectedAnswer !== question.correct) {
        button.classList.add("incorrect");
      }
    });
  
    if (selectedAnswer === question.correct) {
      score++;
      playSound("correctSound");
      feedbackMessage.textContent = "Correct! Well done!";
      feedbackMessage.style.color = "var(--correct-color)";
    } else {
      playSound("incorrectSound");
      feedbackMessage.textContent = `Incorrect. The correct answer is: ${question.correct}`;
      feedbackMessage.style.color = "var(--incorrect-color)";
    }
  
    feedbackMessage.classList.add("show");
  
    setTimeout(() => {
      feedbackMessage.classList.remove("show");
      currentQuestionIndex++;
      if (currentQuestionIndex < questions.length) {
        showQuestion();
      } else {
        showScore();
      }
    }, 2000);
}

function playSound(soundId) {
    if (!isMuted) {
        const sound = document.getElementById(soundId);
        sound.play();
    }
}

function showScore() {
    document.getElementById('quiz').classList.add('hidden');
    document.getElementById('scoreContainer').classList.remove('hidden');
    
    const finalScore = document.getElementById("finalScore");
    finalScore.innerText = `Your score is ${score} out of ${questions.length}!`;
    
    updateLeaderboard();
}

function reviewAnswers() {
    document.getElementById('scoreContainer').classList.add('hidden');
    document.getElementById('reviewContainer').classList.remove('hidden');
    
    const reviewList = document.getElementById('reviewList');
    reviewList.innerHTML = userAnswers.map((answer, index) => `
        <div class="review-item ${answer.selected === answer.correct ? 'correct' : 'incorrect'}">
            <h4>Question ${index + 1}: ${answer.question}</h4>
            <p>Your answer: ${answer.selected}</p>
            <p>Correct answer: ${answer.correct}</p>
        </div>
    `).join('');
}

function updateLeaderboard() {
    const playerName = document.getElementById('playerName').value.trim();
    const newEntry = { name: playerName, score: score };
    leaderboard.push(newEntry);
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10); // Keep only top 10
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function showLeaderboard() {
    document.getElementById('scoreContainer').classList.add('hidden');
    document.getElementById('leaderboardContainer').classList.remove('hidden');
    displayLeaderboard();
}

function displayLeaderboard() {
    const leaderboardList = document.getElementById("leaderboardList");
    leaderboardList.innerHTML = "";
    leaderboard.forEach((entry, index) => {
        const entryElement = document.createElement("div");
        entryElement.className = "leaderboard-entry";
        entryElement.innerHTML = `
            <span>${index + 1}. ${entry.name}</span>
            <span>${entry.score}</span>
        `;
        entryElement.style.animation = `fadeInRight 0.5s ease ${index * 0.1}s both`;
        leaderboardList.appendChild(entryElement);
    });
}

function clearLeaderboard() {
    leaderboard = [];
    localStorage.removeItem('leaderboard');
    displayLeaderboard();
    showAlert('Leaderboard cleared!');
}

// Particle.js configuration
particlesJS('particles-js', {
  particles: {
      number: {
          value: 20,
          density: {
              enable: true,
              value_area: 800
          }
      },
      color: {
          value: "#ffffff"
      },
      shape: {
          type: "circle",
          stroke: {
              width: 0,
              color: "#000000"
          },
      },
      opacity: {
          value: 0.2,
          random: true,
          anim: {
              enable: false,
              speed: 1,
              opacity_min: 0.1,
              sync: false
          }
      },
      size: {
          value: 3,
          random: true,
          anim: {
              enable: false,
              speed: 40,
              size_min: 0.1,
              sync: false
          }
      },
      line_linked: {
          enable: true,
          distance: 150,
          color: "#ffffff",
          opacity: 0.1,
          width: 1
      },
      move: {
          enable: true,
          speed: 1,
          direction: "none",
          random: false,
          straight: false,
          out_mode: "out",
          bounce: false,
          attract: {
              enable: false,
              rotateX: 600,
              rotateY: 1200
          }
      }
  },
  interactivity: {
      detect_on: "canvas",
      events: {
          onhover: {
              enable: true,
              mode: "grab"
          },
          onclick: {
              enable: false,
              mode: "push"
          },
          resize: true
      },
      modes: {
          grab: {
              distance: 140,
              line_linked: {
                  opacity: 0.3
              }
          },
          bubble: {
              distance: 400,
              size: 40,
              duration: 2,
              opacity: 8,
              speed: 3
          },
          repulse: {
              distance: 200,
              duration: 0.4
          },
          push: {
              particles_nb: 4
          },
          remove: {
              particles_nb: 2
          }
      }
  },
  retina_detect: true
});