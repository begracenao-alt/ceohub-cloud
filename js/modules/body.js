/* ===== ⑤ Body & Energy｜あなたの状態 ===== */
(function () {
  "use strict";
  var S = BG.store, U = BG.ui;

  var DEFAULT_MOVES = ["枕運動", "ヨガ", "散歩"];
  function uniq(a) { var o = {}, r = []; a.forEach(function (x) { if (x && !o[x]) { o[x] = 1; r.push(x); } }); return r; }
  function moveList() { var s = S.list("bodyMoves"); return (s && s.length) ? s.slice() : DEFAULT_MOVES.slice(); }
  // 過去データ互換：moves配列が無ければ旧チェック(pillow/yoga/walk)から組み立て
  function movesOf(r) {
    if (r.moves && r.moves.length) return r.moves;
    var a = [];
    if (r.pillow) a.push("枕運動");
    if (r.yoga) a.push("ヨガ");
    if (r.walk) a.push("散歩");
    return a;
  }
  function usedMoves() { var a = []; S.list("bodyLogs").forEach(function (l) { movesOf(l).forEach(function (m) { a.push(m); }); }); return a; }
  function moveOptions() { return uniq(moveList().concat(usedMoves())); }
  function setMoveOptions(extra) { fields.filter(function (f) { return f.name === "moves"; })[0].options = uniq(moveList().concat(extra || [])); }

  function calc() {
    var logs = S.list("bodyLogs").filter(function (l) { return U.inThisMonth(l.date); });
    if (!logs.length) return { sleep: 0, energy: 0, moves: 0, resetRate: 0, count: 0 };
    var sleepSum = 0, energySum = 0, moves = 0, resetDays = 0;
    logs.forEach(function (l) {
      sleepSum += U.num(l.sleep);
      energySum += U.num(l.energy);
      moves += movesOf(l).length;
      if (l.resetTime) resetDays++;
    });
    return {
      sleep: (sleepSum / logs.length).toFixed(1),
      energy: (energySum / logs.length).toFixed(1),
      moves: moves,
      resetRate: Math.round(resetDays / logs.length * 100),
      count: logs.length
    };
  }

  var fields = [
    { name: "date", label: "日付", type: "date", value: U.todayStr() },
    { name: "sleep", label: "睡眠時間（時間）", type: "number" },
    { name: "energy", label: "今日のエネルギー（1〜10）", type: "number" },
    { name: "moves", label: "今日の運動（複数えらべます）", type: "checks", options: [], full: true },
    { name: "moveNew", label: "新しい運動を追加（任意・ここに打つと運動に増えます）", type: "text", placeholder: "例：筋トレ・ストレッチ・ランニング", full: true },
    { name: "resetTime", label: "リセット時間をとった", type: "checkbox" },
    { name: "conditionMemo", label: "体調メモ", type: "textarea", full: true },
    { name: "emotionMemo", label: "感情メモ", type: "textarea", full: true }
  ];

  function normalize(v) {
    v.moves = v.moves || [];
    if (v.moveNew && v.moveNew.trim()) {
      var nm = v.moveNew.trim();
      var list = moveList();
      if (list.indexOf(nm) < 0) { list.push(nm); S.setBodyMoves(list); }
      if (v.moves.indexOf(nm) < 0) v.moves.push(nm);
    }
    delete v.moveNew;
    return v;
  }

  var chart;
  var showAll = false;

  function render(view) {
    var c = calc();
    setMoveOptions();
    var html = '<p class="page-lead">あなたが倒れず、枯れず、いい状態で事業を育てるために。<br>' +
      '<span class="flow"><span class="step">睡眠</span><span class="arrow">→</span><span class="step">エネルギー</span>' +
      '<span class="arrow">→</span><span class="step">判断力</span><span class="arrow">→</span><span class="step">行動量</span>' +
      '<span class="arrow">→</span><span class="step">売上</span><span class="arrow">→</span><span class="step">チーム</span></span></p>';

    html += '<div class="grid grid-4">' +
      U.stat("睡眠平均", c.sleep + "h", "今月" + c.count + "日記録", "accent") +
      U.stat("エネルギー平均", c.energy + " /10", null, "rose") +
      U.stat("運動回数", c.moves + "回", "今月の合計") +
      U.stat("リセット率", c.resetRate + "%") +
      '</div>';

    html += '<div class="card mt"><div class="card-title">エネルギー & 睡眠の流れ</div>' +
      '<canvas id="bodyChart" height="90"></canvas></div>';

    html += '<div style="text-align:right;margin:6px 0 10px"><button class="btn btn-sm" id="mgMove">⚙️ 運動の項目を編集（追加・削除）</button></div>';

    html += '<div class="card">' + U.sectionHead(showAll ? "毎日の記録（すべて）" : "毎日の記録（今月）", "今日を記録", "addB");
    var allRows = S.list("bodyLogs").slice().sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
    var rows = showAll ? allRows : allRows.filter(function (r) { return U.inThisMonth(r.date); });
    var body = rows.length ? rows.map(function (r) {
      var mv = movesOf(r);
      return '<tr>' +
        '<td>' + U.fmtDate(r.date) + '</td>' +
        '<td class="num">' + (r.sleep || "—") + 'h</td>' +
        '<td class="num">' + (r.energy || "—") + '</td>' +
        '<td>' + (mv.length ? U.esc(mv.join("・")) : "—") + '</td>' +
        '<td style="text-align:center">' + (r.resetTime ? '✓' : '—') + '</td>' +
        '<td>' + U.esc((r.conditionMemo || r.emotionMemo || "").slice(0, 24)) + '</td>' +
        '<td class="row-actions">' +
        '<button class="btn btn-sm" data-edit="' + r.id + '">編集</button>' +
        '<button class="btn btn-sm btn-danger" data-del="' + r.id + '">削除</button></td>' +
        '</tr>';
    }).join("") : U.emptyRow(7, showAll ? "記録がありません" : "今月の記録はまだありません。「今日を記録」から。");
    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>日付</th><th class="num">睡眠</th><th class="num">活力</th><th>運動</th><th>リセット</th><th>メモ</th><th></th>' +
      '</tr></thead><tbody>' + body + '</tbody></table></div>' +
      '<div style="text-align:center;margin-top:12px"><button class="btn btn-sm" id="toggleAll">' + (showAll ? '今月だけ表示にもどす' : '過去の記録も見る（全' + allRows.length + '件）') + '</button></div></div>';

    view.innerHTML = html;
    drawChart();

    document.getElementById("mgMove").onclick = function () { manageMoves(view); };
    document.getElementById("toggleAll").onclick = function () { showAll = !showAll; render(view); };
    document.getElementById("addB").onclick = function () {
      setMoveOptions();
      U.recordModal({ title: "今日のカラダを記録", fields: fields, values: { date: U.todayStr() },
        onSave: function (v) { S.add("bodyLogs", normalize(v)); U.toast("記録しました"); render(view); } });
    };
    view.querySelectorAll("[data-edit]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-edit");
        var rec = Object.assign({}, S.find("bodyLogs", id));
        if (!rec.moves) rec.moves = movesOf(rec);
        setMoveOptions(rec.moves);
        U.recordModal({ title: "記録を編集", fields: fields, values: rec,
          onSave: function (v) { S.update("bodyLogs", id, normalize(v)); U.toast("更新しました"); render(view); } });
      };
    });
    view.querySelectorAll("[data-del]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-del");
        U.confirmDelete("この記録を削除しますか？", function () { S.remove("bodyLogs", id); U.toast("削除しました"); render(view); });
      };
    });
  }

  // 運動の項目を追加・削除
  function manageMoves(view) {
    function open() {
      var moves = moveList();
      var body = '<p class="hint">▲▼で並び替え、削除もできます。削除しても、過去の記録は残ります。</p>' +
        '<div>' + (moves.length ? moves.map(function (mv, i) {
          return '<div class="check-row" style="justify-content:space-between;border-bottom:1px solid var(--line-2);padding:9px 2px">' +
            '<span>' + U.esc(mv) + '</span><span style="display:flex;gap:6px">' +
            '<button class="btn btn-sm" data-up="' + i + '"' + (i === 0 ? ' disabled' : '') + '>▲</button>' +
            '<button class="btn btn-sm" data-down="' + i + '"' + (i === moves.length - 1 ? ' disabled' : '') + '>▼</button>' +
            '<button class="btn btn-sm btn-danger" data-rmmove="' + U.esc(mv) + '">削除</button></span></div>';
        }).join("") : '<p class="hint">項目がありません。下から追加してください。</p>') + '</div>' +
        '<div class="field" style="margin-top:14px"><label for="newMove">新しい運動を追加</label>' +
        '<input type="text" id="newMove" placeholder="例：筋トレ・ストレッチ・ランニング など"></div>' +
        '<div class="modal-foot"><button class="btn" data-close2>閉じる</button>' +
        '<button class="btn btn-primary" id="addMove">追加</button></div>';
      U.openModal("運動の項目", body, function (m) {
        m.querySelector("[data-close2]").onclick = function () { U.closeModal(); render(view); };
        m.querySelector("#addMove").onclick = function () {
          var val = m.querySelector("#newMove").value.trim();
          if (!val) return;
          var arr = moveList();
          if (arr.indexOf(val) < 0) arr.push(val);
          S.setBodyMoves(arr); U.toast("追加しました"); open();
        };
        m.querySelectorAll("[data-rmmove]").forEach(function (b) {
          b.onclick = function () {
            var mv = b.getAttribute("data-rmmove");
            S.setBodyMoves(moveList().filter(function (x) { return x !== mv; }));
            U.toast("削除しました"); open();
          };
        });
        m.querySelectorAll("[data-up]").forEach(function (b) {
          b.onclick = function () { var i = +b.getAttribute("data-up"); var arr = moveList(); var t = arr[i - 1]; arr[i - 1] = arr[i]; arr[i] = t; S.setBodyMoves(arr); open(); };
        });
        m.querySelectorAll("[data-down]").forEach(function (b) {
          b.onclick = function () { var i = +b.getAttribute("data-down"); var arr = moveList(); var t = arr[i + 1]; arr[i + 1] = arr[i]; arr[i] = t; S.setBodyMoves(arr); open(); };
        });
      });
    }
    open();
  }

  function drawChart() {
    var el = document.getElementById("bodyChart");
    if (!el || typeof Chart === "undefined") return;
    var rows = S.list("bodyLogs").slice().sort(function (a, b) { return (a.date || "").localeCompare(b.date || ""); }).slice(-21);
    var labels = rows.map(function (r) { return U.fmtDate(r.date); });
    if (chart) chart.destroy();
    chart = new Chart(el, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          { label: "エネルギー", data: rows.map(function (r) { return U.num(r.energy); }), borderColor: "#c89488", backgroundColor: "rgba(200,148,136,0.1)", tension: 0.35, fill: true, yAxisID: "y" },
          { label: "睡眠(h)", data: rows.map(function (r) { return U.num(r.sleep); }), borderColor: "#c2a36b", backgroundColor: "rgba(194,163,107,0.08)", tension: 0.35, fill: true, yAxisID: "y" }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { labels: { font: { family: "'Noto Sans JP'" } } } },
        scales: { y: { beginAtZero: true, suggestedMax: 10 } }
      }
    });
  }

  BG.modules = BG.modules || {};
  BG.modules.body = { title: "BODY & ENERGY｜あなたの状態", render: render };
  BG.calc = BG.calc || {};
  BG.calc.body = calc;
})();
