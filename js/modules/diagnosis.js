/* ===== ⑨ 今日の戦略 ===== */
(function () {
  "use strict";
  var S = BG.store, U = BG.ui;

  var RESULTS = {
    "集中している": {
      theme: "作る日", emoji: "🛠",
      doIt: "ひとつの大事なものを最後まで仕上げる。資料・商品・仕組みづくりに集中。",
      dont: "新しいことを始める／予定を詰め込みすぎる",
      word: "今日のあなたは、形にする日。"
    },
    "ワクワクしている": {
      theme: "広げる日", emoji: "✨",
      doIt: "発信する・人に会う・案内を出す。エネルギーを外に向ける。",
      dont: "細かい事務作業にこもる",
      word: "そのワクワクが、いちばんの広告。"
    },
    "疲れている": {
      theme: "休む日", emoji: "🌿",
      doIt: "しっかり休む。睡眠・お風呂・自然・好きなこと。回復が最優先。",
      dont: "大事な決断をする／無理に数字を追う",
      word: "休むことも、経営。枯れない人が続けられる。"
    },
    "モヤモヤしている": {
      theme: "整理する日", emoji: "📝",
      doIt: "頭の中を全部書き出す。タスク・気持ち・優先順位を整理する。",
      dont: "勢いで人に連絡する／衝動的に決める",
      word: "モヤモヤは、整理を待っているサイン。"
    },
    "停滞している": {
      theme: "行動する日", emoji: "🚶‍♀️",
      doIt: "小さくていいから、ひとつ動く。連絡する・投稿する・5分やる。",
      dont: "考えすぎて止まる／完璧を求める",
      word: "完璧じゃなくていい。動けば景色が変わる。"
    }
  };

  function render(view) {
    var states = Object.keys(RESULTS);
    var last = S.list("diagnosis")[0];
    var html = '<p class="page-lead">今の状態に合わせて、今日の動き方を決めましょう。</p>';
    html += '<div class="card"><div class="card-title">今の状態は？</div><div class="choices" id="choices">';
    states.forEach(function (s) {
      html += '<button class="choice" data-state="' + U.esc(s) + '">' + U.esc(s) + '</button>';
    });
    html += '</div></div>';
    html += '<div id="diagResult"></div>';

    if (last && last.date === U.todayStr()) {
      html = html.replace('id="diagResult"></div>', 'id="diagResult">' + resultHTML(last.state) + '</div>');
    }

    view.innerHTML = html;
    view.querySelectorAll("[data-state]").forEach(function (b) {
      b.onclick = function () {
        view.querySelectorAll(".choice").forEach(function (x) { x.classList.remove("sel"); });
        b.classList.add("sel");
        var st = b.getAttribute("data-state");
        S.addDiagnosis({ date: U.todayStr(), state: st });
        document.getElementById("diagResult").innerHTML = resultHTML(st);
      };
    });
    // 既存選択を反映
    if (last && last.date === U.todayStr()) {
      var btn = view.querySelector('[data-state="' + last.state + '"]');
      if (btn) btn.classList.add("sel");
    }
  }

  function resultHTML(state) {
    var r = RESULTS[state];
    if (!r) return "";
    return '<div class="result-box mt">' +
      '<div class="big">今日のテーマ：' + U.esc(r.theme) + '</div>' +
      '<div style="margin:12px 0"><strong>おすすめ行動</strong><br>' + U.esc(r.doIt) + '</div>' +
      '<div style="margin:12px 0"><strong>今日はやらない方がいいこと</strong><br>' + U.esc(r.dont) + '</div>' +
      '<div class="quote">「' + U.esc(r.word) + '」</div></div>';
  }

  // ダッシュボード用：今日のテーマ取得
  function todayTheme() {
    var last = S.list("diagnosis")[0];
    if (last && last.date === U.todayStr()) return RESULTS[last.state];
    return null;
  }

  BG.modules = BG.modules || {};
  BG.modules.diagnosis = { title: "Strategy｜今日の戦略", render: render };
  BG.calc = BG.calc || {};
  BG.calc.todayTheme = todayTheme;
})();
