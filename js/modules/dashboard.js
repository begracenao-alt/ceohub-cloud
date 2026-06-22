/* ===== CEOダッシュボード（ホーム） ===== */
(function () {
  "use strict";
  var S = BG.store, U = BG.ui;

  function render(view) {
    var s = S.settings();
    var m = BG.calc.money ? BG.calc.money() : {};
    var cust = BG.calc.customer ? BG.calc.customer() : {};
    var theme = BG.calc.todayTheme ? BG.calc.todayTheme() : null;
    var price = U.num(s.price);
    var monthGoal = U.num(S.future().monthly.salesGoal) || U.num(s.monthlyGoal);
    var toGoal = Math.max(0, monthGoal - (m.mSales || 0));
    var peopleLeft = price > 0 ? Math.ceil(toGoal / price) : null;

    var greet = "未来は今日の積み重ね";
    var dateStr = formatToday();

    var html = "";
    // はじめにガイド（基本情報がまだのときだけ表示）
    if (!s.repName && !s.bizName) {
      html += '<div class="card" style="border-left:3px solid var(--gold)">' +
        '<div class="card-title">はじめに</div>' +
        '<p style="font-size:13.5px;line-height:1.95">このアプリは、あなたの事業を“見える化”して、迷わず大きくしていくための場所です。今日からの小さな記録が、未来をつくります。</p>' +
        '<p style="font-size:13.5px;line-height:1.95;margin-top:10px">まずは、この3つから。</p>' +
        '<ol style="font-size:13.5px;line-height:1.95;margin:6px 0 14px 1.3em">' +
        '<li>基本情報を入れる（お名前・事業・目標）</li>' +
        '<li>今日の戦略（今の自分に合う動き方がわかります）</li>' +
        '<li>お金と顧客を、少しずつ記録する</li></ol>' +
        '<p class="hint" style="margin-bottom:14px">完璧じゃなくて大丈夫。続けることが、いちばんの力になります。</p>' +
        '<button class="btn btn-primary" id="goSetup">基本情報を入れる</button></div>';
    }
    // ごあいさつ
    html += '<div class="card" style="border-left:3px solid var(--gold)">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">' +
      '<div><div class="muted" style="font-size:13px">' + dateStr + '</div>' +
      '<div style="font-family:var(--serif);font-size:22px;color:var(--gold-deep);margin-top:4px">' +
      (s.repName ? U.esc(s.repName) + ' さん、' + greetWord() : greetWord()) + '</div>' +
      (s.monthTheme ? '<div style="margin-top:6px">今月のテーマ：<strong>' + U.esc(s.monthTheme) + '</strong></div>' : '') +
      '</div>' +
      '<div class="quote" style="max-width:280px">' + U.esc(s.todayWord || greet) + '</div>' +
      '</div></div>';

    // 📅 近日の予定（発信・締切を忘れない）
    html += upcomingHTML();

    // 整い度（めぐり指数）＝看板
    html += meguriCardHTML();

    // 今のステージ
    if (BG.calc && BG.calc.currentStage) {
      var cs = BG.calc.currentStage();
      html += '<div class="card mt" style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">' +
        '<div><div class="muted" style="font-size:11px;letter-spacing:.16em;text-transform:uppercase">Now Stage</div>' +
        '<div style="font-family:var(--serif);font-size:17px;margin-top:3px">Stage ' + cs.no + '｜' + U.esc(cs.name) + '</div></div>' +
        '<button class="btn" id="goStage">道のりを見る</button></div>';
    }

    // 主要数字
    html += '<div class="grid grid-4 mt">' +
      U.stat("今月売上", U.yen(m.mSales || 0), null, "accent") +
      U.stat("今月利益", U.yen(m.mProfit || 0), null, (m.mProfit || 0) >= 0 ? "" : "rose") +
      U.stat("相談／商談", (cust.consult || 0) + "件") +
      U.stat("契約／申込", (cust.contract || 0) + "件", null, "rose") +
      '</div>';

    html += '<div class="grid grid-2 mt">' +
      U.stat("目標まであと", peopleLeft !== null ? peopleLeft + "人" : U.yen(toGoal),
        monthGoal ? (m.rate || 0) + "% 達成 ・ あと" + U.yen(toGoal) : "初期設定で目標を入力", "accent") +
      U.stat("未入金", U.yen(m.unpaid || 0), "今月入金予定 " + U.yen(m.monthDue || 0)) +
      '</div>';

    // 今日やること TOP3 + 今日のエネルギー
    html += '<div class="grid grid-2 mt">';
    html += '<div class="card"><div class="card-title">今日やること TOP3</div><div class="todo" id="todoList"></div>' +
      '<button class="btn btn-sm mt" id="addTodo">+ 追加</button></div>';

    // 今日のエネルギー & 経営テーマ
    html += '<div class="card"><div class="card-title">今日の状態</div>';
    var todayLog = S.list("bodyLogs").filter(function (l) { return l.date === U.todayStr(); })[0];
    if (todayLog && todayLog.energy) {
      html += '<div style="font-size:14px;margin-bottom:8px">今日のエネルギー：<strong>' + U.esc(todayLog.energy) + ' / 10</strong></div>';
    } else {
      html += '<div class="hint" style="margin-bottom:8px">今日のエネルギー未記録（BODYで記録できます）</div>';
    }
    if (theme) {
      html += '<div class="result-box" style="padding:14px"><div style="font-family:var(--serif);font-size:16px;color:var(--gold-deep)">' +
        U.esc(theme.theme) + '</div><div style="font-size:13px;margin-top:6px">' + U.esc(theme.doIt) + '</div></div>';
    } else {
      html += '<div class="hint">「今日の戦略」で、今日の動き方が決まります。</div>';
    }
    html += '</div></div>';

    // わたしの理想（基本情報から）
    if (s.idealWork || s.idealTeam) {
      html += '<div class="card mt"><div class="card-title">わたしの理想</div>' +
        (s.idealWork ? '<div style="margin-bottom:6px"><span class="muted">理想の働き方：</span>' + U.esc(s.idealWork) + '</div>' : '') +
        (s.idealTeam ? '<div><span class="muted">理想のチーム像：</span>' + U.esc(s.idealTeam) + '</div>' : '') +
        '</div>';
    }

    // チーム/未来メモ
    var fy = S.future().yearly;
    if (fy.dream || fy.idealTeam) {
      html += '<div class="card mt"><div class="card-title">チーム／未来メモ</div>' +
        (fy.dream ? '<div style="margin-bottom:6px"><span class="muted">叶えたい未来：</span>' + U.esc(fy.dream) + '</div>' : '') +
        (fy.idealTeam ? '<div><span class="muted">理想のチーム：</span>' + U.esc(fy.idealTeam) + '</div>' : '') +
        '</div>';
    }

    // 流れ
    html += '<div class="card mt"><div class="flow">' +
      '<span class="step">カラダ</span><span class="arrow">→</span>' +
      '<span class="step">思考</span><span class="arrow">→</span>' +
      '<span class="step">行動</span><span class="arrow">→</span>' +
      '<span class="step">顧客</span><span class="arrow">→</span>' +
      '<span class="step">売上</span><span class="arrow">→</span>' +
      '<span class="step">チーム</span><span class="arrow">→</span>' +
      '<span class="step">社会への循環</span></div></div>';

    view.innerHTML = html;
    renderTodos();

    var gs = document.getElementById("goSetup");
    if (gs) gs.onclick = function () { BG.go("settings"); };
    var gst = document.getElementById("goStage");
    if (gst) gst.onclick = function () { BG.go("stage"); };

    view.querySelectorAll('[data-go]').forEach(function (b) {
      b.onclick = function () { BG.go(b.getAttribute("data-go")); };
    });
    var schedFields = [{ name: "date", label: "日付", type: "date" }, { name: "title", label: "内容（予約・アポ・イベント）", type: "text" }];
    var refresh = function () { render(view); };
    var asb = document.getElementById("addSched");
    if (asb) asb.onclick = function () {
      U.recordModal({ title: "予定を追加", fields: schedFields, values: { date: U.todayStr() }, onSave: function (v) { S.add("schedule", { date: v.date, title: v.title }); U.toast("追加しました"); refresh(); } });
    };
    view.querySelectorAll('[data-sched-edit]').forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-sched-edit");
        U.recordModal({ title: "予定を編集", fields: schedFields, values: S.find("schedule", id), onSave: function (v) { S.update("schedule", id, v); U.toast("更新しました"); refresh(); } });
      };
    });
    view.querySelectorAll('[data-sched-del]').forEach(function (b) {
      b.onclick = function () { var id = b.getAttribute("data-sched-del"); U.confirmDelete("この予定を削除しますか？", function () { S.remove("schedule", id); U.toast("削除しました"); refresh(); }); };
    });

    document.getElementById("addTodo").onclick = function () {
      var arr = S.todosFor(U.todayStr());
      arr.push({ text: "", done: false });
      S.saveTodos(U.todayStr(), arr);
      renderTodos(true);
    };

    function renderTodos(focusLast) {
      var box = document.getElementById("todoList");
      var arr = S.todosFor(U.todayStr());
      if (!arr.length) {
        // デフォルト3枠
        arr = [{ text: "", done: false }, { text: "", done: false }, { text: "", done: false }];
        S.saveTodos(U.todayStr(), arr);
      }
      box.innerHTML = arr.map(function (t, i) {
        return '<div class="todo-item' + (t.done ? ' done' : '') + '">' +
          '<input type="checkbox" data-i="' + i + '"' + (t.done ? ' checked' : '') + '>' +
          '<input type="text" class="todo-text" data-i="' + i + '" value="' + U.esc(t.text) + '" placeholder="ここに、やることを書く…" style="border:1px solid var(--line);background:var(--surface);border-radius:8px;flex:1;font-size:15px;padding:9px 11px">' +
          '<button class="btn btn-sm btn-ghost btn-danger" data-rm="' + i + '">×</button></div>';
      }).join("");
      box.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
        cb.onchange = function () {
          var i = +cb.getAttribute("data-i");
          arr[i].done = cb.checked; S.saveTodos(U.todayStr(), arr); renderTodos();
        };
      });
      box.querySelectorAll('.todo-text').forEach(function (inp) {
        inp.onchange = function () {
          var i = +inp.getAttribute("data-i");
          arr[i].text = inp.value; S.saveTodos(U.todayStr(), arr);
        };
      });
      box.querySelectorAll('[data-rm]').forEach(function (b) {
        b.onclick = function () {
          var i = +b.getAttribute("data-rm");
          arr.splice(i, 1); S.saveTodos(U.todayStr(), arr); renderTodos();
        };
      });
      if (focusLast) {
        var inputs = box.querySelectorAll('.todo-text');
        if (inputs.length) inputs[inputs.length - 1].focus();
      }
    }
  }

  // 整い度（めぐり指数）＝ わたしの整い × 事業のめぐり
  function meguriCardHTML() {
    var b = BG.calc && BG.calc.body ? BG.calc.body() : { energy: 0, sleep: 0, resetRate: 0, count: 0 };
    var iParts = [];
    if (b.count) {
      iParts.push(Math.min(U.num(b.energy) / 10, 1) * 100);
      if (U.num(b.sleep) > 0) iParts.push(Math.min(U.num(b.sleep) / 7, 1) * 100);
      iParts.push(b.resetRate || 0);
    }
    var iSub = iParts.length ? Math.round(iParts.reduce(function (a, x) { return a + x; }, 0) / iParts.length) : null;
    function cntMonth(col) { return S.list(col).filter(function (r) { return U.inThisMonth(r.date || r.scheduledDate); }).length; }
    var act = cntMonth("sales") + cntMonth("contents") + cntMonth("diagnosis");
    var mSub = Math.min(Math.round(act / 8 * 100), 100);
    var score = (iSub === null) ? mSub : Math.round((iSub + mSub) / 2);
    var msg;
    if (iSub === null) msg = "まず「BODY」で今日のカラダを記録すると、“わたしの整い”が入って、もっと正確になります。";
    else if (score >= 75) msg = "とても整っています。めぐりも巡っていますね。この心地よさを、味わって。";
    else if (score >= 50) msg = "いいバランス。あと少し自分を整えると、めぐりはもっと大きくなります。";
    else msg = "今は、整える時。自分を整えるほど、めぐりは自然と戻ってきます。あせらず、ひとつずつ。";
    var sub = '<div style="display:flex;gap:24px;justify-content:center;flex-wrap:wrap;margin-top:14px;font-size:12.5px;color:var(--ink-soft)">' +
      '<span>わたし（整い）　<strong style="color:var(--gold-deep)">' + (iSub === null ? '未記録' : iSub + '%') + '</strong></span>' +
      '<span>めぐり（事業）　<strong style="color:var(--gold-deep)">' + mSub + '%</strong></span></div>';
    return '<div class="card mt" style="text-align:center;border-top:3px solid var(--gold)">' +
      '<div style="font-family:var(--script);font-style:italic;font-size:15px;letter-spacing:.14em;color:var(--gold-deep)">Meguri Index</div>' +
      '<div style="font-family:var(--serif);font-size:46px;color:var(--ink);line-height:1.05;margin-top:2px">' + score + '<span style="font-size:18px;color:var(--muted)"> / 100</span></div>' +
      '<div style="font-size:12.5px;color:var(--muted);letter-spacing:.08em">整い度（めぐり指数）</div>' +
      '<div class="progress" style="max-width:380px;margin:14px auto 0"><span style="width:' + score + '%"></span></div>' +
      sub +
      '<p style="font-size:13px;line-height:1.9;color:var(--ink-soft);max-width:460px;margin:14px auto 0">' + msg + '</p>' +
      '<div style="font-family:var(--serif);font-size:13.5px;color:var(--gold-deep);margin-top:12px">整っている時ほど、めぐる。</div>' +
      '</div>';
  }

  // 📅 近日の予定：予約・アポ＋発信の投稿予定日＋タスクの締切を集約（2週間以内）
  function dayDiff(a, b) { return Math.round((Date.parse(b) - Date.parse(a)) / 86400000); }
  function relBadge(d, today) {
    if (d < today) return '<span class="badge hot">' + dayDiff(d, today) + '日過ぎ</span>';
    if (d === today) return '<span class="badge hot">今日</span>';
    if (dayDiff(today, d) === 1) return '<span class="badge warn">明日</span>';
    return '<span class="badge gray">' + dayDiff(today, d) + '日後</span>';
  }
  function upcomingHTML() {
    var today = U.todayStr();
    var h = new Date(); h.setDate(h.getDate() + 14);
    var hStr = h.getFullYear() + "-" + ("0" + (h.getMonth() + 1)).slice(-2) + "-" + ("0" + h.getDate()).slice(-2);
    var items = [];
    S.list("schedule").forEach(function (s) {
      if (s.date && s.date >= today && s.date <= hStr) items.push({ date: s.date, icon: "🗓", label: s.title || "(予定)", schedId: s.id });
    });
    S.list("contents").forEach(function (c) {
      if (c.posted || !c.scheduledDate) return;
      if (c.scheduledDate <= hStr) { var md = (c.media && c.media.length) ? c.media.join("・") : c.category; items.push({ date: c.scheduledDate, icon: "📣", label: (c.title || "(無題)") + (md ? "・" + md : ""), go: "sns" }); }
    });
    S.list("contents").forEach(function (c) {
      if (c.shot || !c.shootDate) return;
      if (c.shootDate >= today && c.shootDate <= hStr) items.push({ date: c.shootDate, icon: "🎬", label: (c.title || "(無題)") + "・撮影", go: "sns" });
    });
    S.list("projects").forEach(function (t) {
      if (t.status === "完了" || !t.due) return;
      if (t.due <= hStr) items.push({ date: t.due, icon: "✅", label: (t.task || t.project || "(無題)"), go: "project" });
    });
    S.list("customers").forEach(function (c) {
      if (c.nextDate && c.nextDate >= today && c.nextDate <= hStr) {
        items.push({ date: c.nextDate, icon: "🤝", label: (c.name || "(お客様)") + (c.nextTime ? " " + c.nextTime : "") + "・次回予定", go: "customer" });
      }
    });
    items.sort(function (a, b) { return (a.date || "").localeCompare(b.date || ""); });
    var inner;
    if (items.length) {
      inner = items.map(function (it) {
        var clickAttr = it.schedId ? ('data-sched-edit="' + it.schedId + '"') : ('data-go="' + it.go + '"');
        var del = it.schedId ? '<button class="btn btn-sm btn-danger" data-sched-del="' + it.schedId + '" style="margin-left:6px">×</button>' : '';
        return '<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--line-2)">' +
          '<span ' + clickAttr + ' style="display:flex;align-items:center;gap:10px;flex:1;cursor:pointer">' +
          '<span>' + it.icon + '</span><span style="flex:1;font-size:14px">' + U.esc(it.label) + '</span>' +
          '<span class="muted" style="font-size:12px">' + U.fmtDate(it.date) + '</span>' + relBadge(it.date, today) + '</span>' + del + '</div>';
      }).join("");
    } else {
      inner = '<div class="hint">2週間以内の予定はありません。<br>「＋ 予定」で予約・アポを、SNSで投稿予定、PROJECTで締切を入れると、ここに出ます。</div>';
    }
    return '<div class="card mt" style="border-left:3px solid var(--rose)">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><div class="card-title" style="margin:0">📅 近日の予定（2週間以内）</div>' +
      '<button class="btn btn-sm" id="addSched">＋ 予定</button></div>' +
      '<div style="max-height:48vh;overflow:auto">' + inner + '</div></div>';
  }

  function greetWord() {
    var hr = new Date().getHours();
    if (hr < 5) return "こんばんは";
    if (hr < 11) return "おはようございます";
    if (hr < 18) return "こんにちは";
    return "こんばんは";
  }

  function formatToday() {
    var d = new Date();
    var days = ["日", "月", "火", "水", "木", "金", "土"];
    return d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日（" + days[d.getDay()] + "）";
  }

  BG.modules = BG.modules || {};
  BG.modules.dashboard = { title: "CEOダッシュボード", render: render };
})();
