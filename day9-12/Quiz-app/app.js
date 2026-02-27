/* Quiz App - single JS file: storage + all screens */
(function () {
  'use strict';

  var KEYS = { COURSES: 'quiz_courses', LEADERBOARDS: 'quiz_leaderboards', RECENT: 'quiz_recent', PREFERENCES: 'quiz_preferences', ADMIN_USER: 'quiz_admin_user', QUESTIONS: 'quiz_questions' };
  function getJson(k, def) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function setJson(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function getCourses() {
    var c = getJson(KEYS.COURSES, []);
    if (c.length === 0) {
      c = [
        { id: 'js-basics', title: 'JavaScript Basics', description: 'Variables, functions, control flow.' },
        { id: 'html-css', title: 'HTML & CSS', description: 'Structure and styling.' },
        { id: 'web-dev', title: 'Web Development', description: 'APIs and tools.' }
      ];
      setJson(KEYS.COURSES, c);
    }
    return c;
  }
  function saveCourses(c) { return setJson(KEYS.COURSES, c); }
  function getLeaderboards() { return getJson(KEYS.LEADERBOARDS, {}); }
  function getLeaderboard(cid) { var all = getLeaderboards(); return all[cid] || []; }
  function saveLeaderboard(cid, entries) { var all = getLeaderboards(); all[cid] = entries; return setJson(KEYS.LEADERBOARDS, all); }
  function addLeaderboardEntry(cid, userName, score, total) {
    var entries = getLeaderboard(cid);
    entries.push({ userName: userName, score: score, total: total, date: new Date().toISOString().slice(0, 10) });
    entries.sort(function (a, b) { return (b.score / b.total) - (a.score / a.total); });
    return saveLeaderboard(cid, entries);
  }
  function getRecentQuizzes() { return getJson(KEYS.RECENT, []); }
  function addRecentQuiz(cid, title, userName) {
    var r = getRecentQuizzes();
    r = [{ courseId: cid, courseTitle: title, userName: userName, date: new Date().toISOString() }].concat(r).slice(0, 10);
    return setJson(KEYS.RECENT, r);
  }
  function getPreferences() { return getJson(KEYS.PREFERENCES, { theme: 'light' }); }
  function getTheme() { return getPreferences().theme || 'light'; }
  function setTheme(theme) { var p = getPreferences(); p.theme = theme; setJson(KEYS.PREFERENCES, p); document.documentElement.setAttribute('data-theme', theme); }
  var DEFAULT_QS = {
    'js-basics': [{ id: 'q1', text: 'Which keyword declares a variable?', options: ['var', 'variable', 'new'], correctIndex: 0 }, { id: 'q2', text: 'typeof null is?', options: ['"null"', '"object"', 'null'], correctIndex: 1 }],
    'html-css': [{ id: 'q1', text: 'Largest heading tag?', options: ['<h6>', '<h1>', '<head>'], correctIndex: 1 }, { id: 'q2', text: 'CSS text color property?', options: ['font-color', 'color', 'text-color'], correctIndex: 1 }],
    'web-dev': [{ id: 'q1', text: 'API stands for?', options: ['Application Program Interface', 'Application Programming Interface'], correctIndex: 1 }, { id: 'q2', text: 'Create resource HTTP method?', options: ['GET', 'POST', 'PUT'], correctIndex: 1 }]
  };
  function getQuestions(cid) { var all = getJson(KEYS.QUESTIONS, {}); if (all[cid] && all[cid].length > 0) return all[cid]; return DEFAULT_QS[cid] || []; }
  function saveQuestions(cid, qs) { var all = getJson(KEYS.QUESTIONS, {}); all[cid] = qs; return setJson(KEYS.QUESTIONS, all); }
  function getAdminUser() { return getJson(KEYS.ADMIN_USER, null); }
  function setAdminUser(u) { return setJson(KEYS.ADMIN_USER, u); }
  function isAdmin() { return !!getAdminUser(); }
  function logoutAdmin() { localStorage.removeItem(KEYS.ADMIN_USER); }
  function escapeHtml(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  var currentScreen = 'home';
  var quizState = { courseId: '', courseTitle: '', userName: '', questions: [], currentIndex: 0, answers: [], timerId: null, totalSeconds: 0, remaining: 0 };
  var resultState = { score: 0, total: 0, breakdown: [] };

  function showScreen(id) {
    currentScreen = id;
    document.querySelectorAll('.screen').forEach(function (el) { el.style.display = 'none'; });
    var el = document.getElementById('screen-' + id);
    if (el) el.style.display = 'block';
    document.getElementById('headerAdmin').style.display = isAdmin() ? 'none' : 'inline-flex';
    document.getElementById('headerLogout').style.display = isAdmin() ? 'inline-flex' : 'none';
  }

  function startQuiz(courseId, courseTitle, userName) {
    var questions = getQuestions(courseId);
    if (questions.length === 0) { alert('No questions for this course.'); return; }
    quizState.courseId = courseId;
    quizState.courseTitle = courseTitle;
    quizState.userName = userName;
    quizState.questions = questions;
    quizState.currentIndex = 0;
    quizState.answers = [];
    for (var i = 0; i < questions.length; i++) quizState.answers[i] = -1;
    if (quizState.timerId) clearInterval(quizState.timerId);
    quizState.totalSeconds = questions.length * 30;
    quizState.remaining = quizState.totalSeconds;
    showScreen('quiz');
    renderQuizQuestion();
    startQuizTimer();
  }

  function startQuizTimer() {
    var timerDisplay = document.getElementById('timerDisplay');
    var timerWrap = document.getElementById('timerWrap');
    function tick() {
      quizState.remaining--;
      timerDisplay.textContent = Math.floor(quizState.remaining / 60) + ':' + (quizState.remaining % 60 < 10 ? '0' : '') + (quizState.remaining % 60);
      if (quizState.remaining <= 60) timerWrap.classList.add('warning');
      if (quizState.remaining <= 0) { clearInterval(quizState.timerId); finishQuiz(); }
    }
    timerDisplay.textContent = Math.floor(quizState.remaining / 60) + ':' + (quizState.remaining % 60 < 10 ? '0' : '') + (quizState.remaining % 60);
    if (quizState.timerId) clearInterval(quizState.timerId);
    quizState.timerId = setInterval(tick, 1000);
  }

  function renderQuizQuestion() {
    var q = quizState.questions[quizState.currentIndex];
    var total = quizState.questions.length;
    document.getElementById('quizCourseName').textContent = quizState.courseTitle;
    document.getElementById('quizUserName').textContent = quizState.userName;
    document.getElementById('progressBar').style.width = (quizState.currentIndex / total * 100) + '%';
    document.getElementById('questionNumber').textContent = 'Question ' + (quizState.currentIndex + 1) + ' of ' + total;
    document.getElementById('questionText').textContent = q.text;
    var list = document.getElementById('optionsList');
    list.innerHTML = '';
    var sel = quizState.answers[quizState.currentIndex];
    q.options.forEach(function (opt, i) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn' + (sel === i ? ' selected' : '');
      btn.textContent = opt;
      btn.dataset.index = i;
      btn.onclick = function () {
        quizState.answers[quizState.currentIndex] = i;
        list.querySelectorAll('.option-btn').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
      };
      li.appendChild(btn);
      list.appendChild(li);
    });
    document.getElementById('backBtn').style.visibility = quizState.currentIndex === 0 ? 'hidden' : 'visible';
    document.getElementById('nextBtn').textContent = quizState.currentIndex === total - 1 ? 'Finish' : 'Next';
  }
  
  function finishQuiz() {
    if (quizState.timerId) clearInterval(quizState.timerId);
    var correct = 0;
    var breakdown = quizState.questions.map(function (q, i) {
      var choice = quizState.answers[i];
      var ok = choice === q.correctIndex;
      if (ok) correct++;
      return { question: q.text, userAnswer: choice >= 0 ? q.options[choice] : '(Skipped)', correctAnswer: q.options[q.correctIndex], correct: ok };
    });
    resultState.score = correct;
    resultState.total = quizState.questions.length;
    resultState.breakdown = breakdown;
    addLeaderboardEntry(quizState.courseId, quizState.userName, correct, quizState.questions.length);
    addRecentQuiz(quizState.courseId, quizState.courseTitle, quizState.userName);
    showResults();
  }

  function showResults() {
    showScreen('results');
    document.getElementById('resultsHeader').textContent = quizState.courseTitle + ' – ' + quizState.userName;
    document.getElementById('scoreDisplay').textContent = resultState.score + ' / ' + resultState.total;
    document.getElementById('percentageDisplay').textContent = (resultState.total ? Math.round(resultState.score / resultState.total * 100) : 0) + '%';
    var bl = document.getElementById('breakdownList');
    bl.innerHTML = '';
    resultState.breakdown.forEach(function (b, i) {
      var li = document.createElement('li');
      li.innerHTML = '<span><strong>Q' + (i + 1) + ':</strong> ' + escapeHtml(b.question) + '</span><span class="' + (b.correct ? 'correct' : 'incorrect') + '">Your answer: ' + escapeHtml(b.userAnswer) + '</span>' + (b.correct ? '' : '<span>Correct: ' + escapeHtml(b.correctAnswer) + '</span>');
      bl.appendChild(li);
    });
    var entries = getLeaderboard(quizState.courseId);
    var tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';
    entries.slice(0, 10).forEach(function (e, i) {
      var tr = document.createElement('tr');
      if (e.userName === quizState.userName && e.score === resultState.score && e.total === resultState.total) tr.classList.add('highlight');
      tr.innerHTML = '<td>' + (i + 1) + '</td><td>' + escapeHtml(e.userName) + '</td><td>' + e.score + '/' + e.total + '</td><td>' + escapeHtml(e.date) + '</td>';
      tbody.appendChild(tr);
    });
  }

  document.documentElement.setAttribute('data-theme', getTheme());

  var grid = document.getElementById('coursesGrid');
  getCourses().forEach(function (course) {
    var card = document.createElement('article');
    card.className = 'course-card';
    card.innerHTML = '<h3>' + escapeHtml(course.title) + '</h3><p class="description">' + escapeHtml(course.description || '') + '</p><div class="form-group"><label>Your name</label><input type="text" class="course-name-input" placeholder="Enter your name" data-course-id="' + escapeHtml(course.id) + '"><p class="error-message course-err" hidden></p></div><button type="button" class="btn start-btn" data-course-id="' + escapeHtml(course.id) + '" data-course-title="' + escapeHtml(course.title) + '">Start Quiz</button>';
    var inp = card.querySelector('.course-name-input');
    var err = card.querySelector('.course-err');
    card.querySelector('.start-btn').onclick = function () {
      var name = (inp.value || '').trim();
      err.hidden = true;
      if (!name) { err.textContent = 'Please enter your name.'; err.hidden = false; return; }
      startQuiz(course.id, course.title, name);
    };
    grid.appendChild(card);
  });

  var recentCards = document.getElementById('recentCards');
  var recentSection = document.getElementById('recentSection');
  var recent = getRecentQuizzes();
  if (recent.length === 0) recentSection.style.display = 'none';
  else recent.forEach(function (r) {
    var div = document.createElement('div');
    div.className = 'recent-card';
    div.innerHTML = '<span>' + escapeHtml(r.courseTitle) + ' – ' + escapeHtml(r.userName) + '</span><button type="button" class="btn" data-cid="' + escapeHtml(r.courseId) + '" data-title="' + escapeHtml(r.courseTitle) + '" data-name="' + escapeHtml(r.userName) + '">Start again</button>';
    div.querySelector('button').onclick = function () { startQuiz(r.courseId, r.courseTitle, r.userName); };
    recentCards.appendChild(div);
  });

  document.getElementById('backBtn').onclick = function () {
    if (quizState.currentIndex > 0) { quizState.currentIndex--; renderQuizQuestion(); }
  };
  document.getElementById('nextBtn').onclick = function () {
    if (quizState.currentIndex < quizState.questions.length - 1) { quizState.currentIndex++; renderQuizQuestion(); } else finishQuiz();
  };
  document.getElementById('retakeBtn').onclick = function () {
    quizState.currentIndex = 0;
    for (var i = 0; i < quizState.questions.length; i++) quizState.answers[i] = -1;
    quizState.remaining = quizState.totalSeconds = quizState.questions.length * 30;
    showScreen('quiz');
    renderQuizQuestion();
    startQuizTimer();
  };
  document.getElementById('anotherCourseBtn').onclick = function () { showScreen('home'); };

  document.getElementById('loginForm').onsubmit = function (e) {
    e.preventDefault();
    var user = document.getElementById('loginUser').value.trim();
    var pass = document.getElementById('loginPass').value;
    var errEl = document.getElementById('loginError');
    if (user === 'admin' && pass === 'admin123') { setAdminUser({ username: user }); showScreen('admin-dashboard'); renderAdminDashboard(); } else { errEl.textContent = 'Invalid credentials.'; errEl.hidden = false; }
  };

  function renderAdminDashboard() {
    var courses = getCourses();
    var boards = getLeaderboards();
    var totalScores = 0;
    for (var cid in boards) totalScores += (boards[cid] || []).length;
    document.getElementById('dashboardCards').innerHTML = '<div class="dashboard-card"><span class="value">' + courses.length + '</span><span class="label">Courses</span></div><div class="dashboard-card"><span class="value">' + totalScores + '</span><span class="label">Total Scores</span></div>';
  }

  function renderAdminLeaderboard() {
    var sel = document.getElementById('adminCourseSelect');
    sel.innerHTML = '<option value="">-- Select course --</option>';
    getCourses().forEach(function (c) {
      var opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.title;
      sel.appendChild(opt);
    });
    var cid = sel.value;
    var tbody = document.getElementById('adminScoresBody');
    tbody.innerHTML = '';
    if (cid) {
      getLeaderboard(cid).forEach(function (e, i) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + (i + 1) + '</td><td>' + escapeHtml(e.userName) + '</td><td>' + e.score + '/' + e.total + '</td><td>' + escapeHtml(e.date) + '</td><td class="actions"><button type="button" class="btn secondary admin-edit-score" data-i="' + i + '">Edit</button><button type="button" class="btn danger admin-del-score" data-i="' + i + '">Delete</button></td>';
        tr.querySelector('.admin-del-score').onclick = function () {
          var entries = getLeaderboard(cid);
          entries.splice(parseInt(this.dataset.i, 10), 1);
          saveLeaderboard(cid, entries);
          renderAdminLeaderboard();
        };
        tr.querySelector('.admin-edit-score').onclick = function () {
          var entries = getLeaderboard(cid);
          var e = entries[parseInt(this.dataset.i, 10)];
          document.getElementById('addUserName').value = e.userName;
          document.getElementById('addScore').value = e.score;
          document.getElementById('addTotal').value = e.total;
          document.getElementById('addDate').value = e.date;
          entries.splice(parseInt(this.dataset.i, 10), 1);
          saveLeaderboard(cid, entries);
          renderAdminLeaderboard();
        };
        tbody.appendChild(tr);
      });
    }
  }

  document.getElementById('adminCourseSelect').onchange = renderAdminLeaderboard;
  document.getElementById('addScoreForm').onsubmit = function (e) {
    e.preventDefault();
    var cid = document.getElementById('adminCourseSelect').value;
    if (!cid) { alert('Select a course.'); return; }
    var userName = document.getElementById('addUserName').value.trim();
    var score = parseInt(document.getElementById('addScore').value, 10);
    var total = parseInt(document.getElementById('addTotal').value, 10);
    var date = document.getElementById('addDate').value;
    if (total <= 0 || score < 0 || score > total) { alert('Invalid score.'); return; }
    var entries = getLeaderboard(cid);
    entries.push({ userName: userName, score: score, total: total, date: date });
    entries.sort(function (a, b) { return (b.score / b.total) - (a.score / a.total); });
    saveLeaderboard(cid, entries);
    this.reset();
    document.getElementById('addDate').value = new Date().toISOString().slice(0, 10);
    renderAdminLeaderboard();
  };
  document.getElementById('addDate').value = new Date().toISOString().slice(0, 10);

  var adminCurrentQuestions = [];
  var adminCurrentCourseId = '';
  function renderAdminQuizzes() {
    var sel = document.getElementById('quizSelect');
    sel.innerHTML = '<option value="">-- Create new --</option>';
    getCourses().forEach(function (c) {
      var opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.title;
      sel.appendChild(opt);
    });
    adminCurrentCourseId = sel.value || '';
    document.getElementById('newQuizForm').style.display = adminCurrentCourseId ? 'none' : 'block';
    adminCurrentQuestions = adminCurrentCourseId ? getQuestions(adminCurrentCourseId).slice() : [];
    var ul = document.getElementById('questionList');
    ul.innerHTML = '';
    if (adminCurrentQuestions.length === 0) ul.innerHTML = '<li style="color:var(--text-secondary)">No questions. Add below.</li>';
    else adminCurrentQuestions.forEach(function (q, i) {
      var li = document.createElement('li');
      li.innerHTML = '<strong>Q' + (i + 1) + ':</strong> ' + escapeHtml(q.text) + ' (Correct: ' + escapeHtml((q.options || [])[q.correctIndex] || '') + ') <button type="button" class="btn secondary admin-edit-q" data-i="' + i + '">Edit</button> <button type="button" class="btn danger admin-del-q" data-i="' + i + '">Delete</button>';
      li.querySelector('.admin-del-q').onclick = function () { adminCurrentQuestions.splice(parseInt(this.dataset.i, 10), 1); renderAdminQuizzes(); };
      li.querySelector('.admin-edit-q').onclick = function () {
        var qq = adminCurrentQuestions[parseInt(this.dataset.i, 10)];
        document.getElementById('questionText').value = qq.text;
        document.getElementById('questionOptions').value = (qq.options || []).join('\n');
        document.getElementById('correctIndex').value = String(qq.correctIndex);
        adminCurrentQuestions.splice(parseInt(this.dataset.i, 10), 1);
        renderAdminQuizzes();
      };
      ul.appendChild(li);
    });
  }
  document.getElementById('quizSelect').onchange = function () {
    adminCurrentCourseId = this.value || '';
    document.getElementById('newQuizForm').style.display = adminCurrentCourseId ? 'none' : 'block';
    adminCurrentQuestions = adminCurrentCourseId ? getQuestions(adminCurrentCourseId).slice() : [];
    var ul = document.getElementById('questionList');
    ul.innerHTML = adminCurrentQuestions.length === 0 ? '<li style="color:var(--text-secondary)">No questions.</li>' : '';
    adminCurrentQuestions.forEach(function (q, i) {
      var li = document.createElement('li');
      li.innerHTML = '<strong>Q' + (i + 1) + ':</strong> ' + escapeHtml(q.text) + ' <button type="button" class="btn secondary admin-edit-q" data-i="' + i + '">Edit</button> <button type="button" class="btn danger admin-del-q" data-i="' + i + '">Delete</button>';
      li.querySelector('.admin-del-q').onclick = function () { adminCurrentQuestions.splice(parseInt(this.dataset.i, 10), 1); renderAdminQuizzes(); };
      li.querySelector('.admin-edit-q').onclick = function () {
        var qq = adminCurrentQuestions[parseInt(this.dataset.i, 10)];
        document.getElementById('questionText').value = qq.text;
        document.getElementById('questionOptions').value = (qq.options || []).join('\n');
        document.getElementById('correctIndex').value = String(qq.correctIndex);
        adminCurrentQuestions.splice(parseInt(this.dataset.i, 10), 1);
        renderAdminQuizzes();
      };
      ul.appendChild(li);
    });
  };
  document.getElementById('createQuizForm').onsubmit = function (e) {
    e.preventDefault();
    var title = document.getElementById('newQuizTitle').value.trim();
    if (!title) { alert('Enter title.'); return; }
    var id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || ('quiz-' + Date.now());
    var courses = getCourses();
    if (courses.some(function (c) { return c.id === id; })) { alert('Title exists.'); return; }
    courses.push({ id: id, title: title, description: document.getElementById('newQuizDesc').value.trim() });
    saveCourses(courses);
    document.getElementById('quizSelect').innerHTML = '<option value="">-- Create new --</option>';
    courses.forEach(function (c) {
      var o = document.createElement('option');
      o.value = c.id;
      o.textContent = c.title;
      document.getElementById('quizSelect').appendChild(o);
    });
    document.getElementById('quizSelect').value = id;
    adminCurrentCourseId = id;
    adminCurrentQuestions = [];
    document.getElementById('newQuizForm').style.display = 'none';
    document.getElementById('newQuizTitle').value = '';
    document.getElementById('newQuizDesc').value = '';
    renderAdminQuizzes();
  };
  document.getElementById('addQuestionForm').onsubmit = function (e) {
    e.preventDefault();
    if (!adminCurrentCourseId) { alert('Select or create a quiz first.'); return; }
    var text = document.getElementById('questionText').value.trim();
    var opts = document.getElementById('questionOptions').value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    var correctIndex = parseInt(document.getElementById('correctIndex').value, 10);
    if (opts.length < 2) { alert('At least 2 options.'); return; }
    if (correctIndex < 0 || correctIndex >= opts.length) correctIndex = 0;
    adminCurrentQuestions.push({ id: 'q' + Date.now(), text: text, options: opts, correctIndex: correctIndex });
    this.reset();
    document.getElementById('correctIndex').value = '0';
    renderAdminQuizzes();
  };
  document.getElementById('saveQuizBtn').onclick = function () {
    if (!adminCurrentCourseId) { alert('Select a quiz.'); return; }
    saveQuestions(adminCurrentCourseId, adminCurrentQuestions);
    alert('Quiz saved.');
  };
  
  document.getElementById('headerHome').onclick = function (e) { e.preventDefault(); showScreen('home'); };
  document.getElementById('footerHome').onclick = function (e) { e.preventDefault(); showScreen('home'); };
  document.getElementById('headerAdmin').onclick = function (e) {
    e.preventDefault();
    if (isAdmin()) { showScreen('admin-dashboard'); renderAdminDashboard(); } else { showScreen('admin-login'); }
  };
  document.getElementById('headerLogout').onclick = function () { logoutAdmin(); showScreen('home'); };
  document.querySelectorAll('.admin-nav a[data-screen]').forEach(function (a) {
    a.onclick = function (e) { e.preventDefault(); var s = this.getAttribute('data-screen'); showScreen(s); if (s === 'admin-dashboard') renderAdminDashboard(); else if (s === 'admin-leaderboard') renderAdminLeaderboard(); else if (s === 'admin-quizzes') renderAdminQuizzes(); };
  });

  function updateThemeLabels() {
    var label = getTheme() === 'dark' ? 'Light mode' : 'Dark mode';
    document.querySelectorAll('.theme-toggle').forEach(function (b) { b.textContent = label; });
  }
  document.getElementById('themeToggle').onclick = function () { setTheme(getTheme() === 'dark' ? 'light' : 'dark'); updateThemeLabels(); };
  document.getElementById('themeToggleFooter').onclick = function () { setTheme(getTheme() === 'dark' ? 'light' : 'dark'); updateThemeLabels(); };
  updateThemeLabels();
})();
