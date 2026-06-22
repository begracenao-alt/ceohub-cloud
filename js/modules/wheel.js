/* ===== ⑩ Life Balance｜ライフバランス ===== */
(function () {
  "use strict";
  var S = BG.store, U = BG.ui;

  var AXES = [
    { key: "health", label: "健康" },
    { key: "beauty", label: "美容" },
    { key: "work", label: "仕事" },
    { key: "money", label: "お金" },
    { key: "family", label: "家族" },
    { key: "love", label: "恋愛" },
    { key: "learning", label: "学び" },
    { key: "play", label: "遊び" }
  ];

  var chart;

  function render(view) {
    var hist = S.list("wheel").slice().sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
    var latest = hist[0];
    var prev = hist[1];

    var html = '<p class="page-lead">事業だけに偏らず、人生全体の豊かさを見ます。各項目を10点満点で。</p>';
    html += '<div class="grid grid-2">';
    html += '<div class="card"><div class="card-title">バランスホイール</div><canvas id="wheelChart"></canvas></div>';
    html += '<div class="card"><div class="section-head"><h2 style="font-size:16px">今の状態を記録</h2>' +
      '<button class="btn btn-primary" id="recordWheel">記録する</button></div>';
    if (latest) {
      html += '<div class="hint">最新：' + U.esc(latest.date) + '</div>';
      AXES.forEach(function (a) {
        var v = U.num(latest[a.key]);
        var diff = prev ? v - U.num(prev[a.key]) : null;
        html += '<div style="display:flex;align-items:center;gap:10px;margin:7px 0">' +
          '<span style="min-width:48px;font-size:13px">' + a.label + '</span>' +
          '<div class="progress" style="flex:1"><span style="width:' + (v * 10) + '%"></span></div>' +
          '<span style="min-width:30px;text-align:right">' + v + '</span>' +
          (diff !== null && diff !== 0 ? '<span class="' + (diff > 0 ? 'pos' : 'neg') + '" style="font-size:11px;min-width:30px">' + (diff > 0 ? '+' : '') + diff + '</span>' : '<span style="min-width:30px"></span>') +
          '</div>';
      });
      if (latest.memo) html += '<div class="mt"><span class="muted">メモ：</span>' + U.esc(latest.memo) + '</div>';
    } else {
      html += '<p class="empty">まだ記録がありません。<br>「記録する」から今の状態を入れてみましょう。</p>';
    }
    html += '</div></div>';

    // 履歴
    if (hist.length) {
      html += '<div class="card mt"><div class="card-title">変化の記録</div><div class="table-wrap"><table><thead><tr>' +
        '<th>日付</th>' + AXES.map(function (a) { return '<th class="num">' + a.label + '</th>'; }).join("") + '<th class="num">合計</th><th></th></tr></thead><tbody>';
      hist.forEach(function (r) {
        var sum = AXES.reduce(function (s, a) { return s + U.num(r[a.key]); }, 0);
        html += '<tr><td>' + U.esc(r.date) + '</td>' +
          AXES.map(function (a) { return '<td class="num">' + (r[a.key] || 0) + '</td>'; }).join("") +
          '<td class="num">' + sum + '</td>' +
          '<td class="row-actions"><button class="btn btn-sm btn-danger" data-del="' + r.id + '">削除</button></td></tr>';
      });
      html += '</tbody></table></div></div>';
    }

    view.innerHTML = html;
    drawChart(latest, prev);

    document.getElementById("recordWheel").onclick = function () {
      var fields = [{ name: "date", label: "日付", type: "date", value: U.todayStr() }]
        .concat(AXES.map(function (a) { return { name: a.key, label: a.label + "（1〜10）", type: "number" }; }))
        .concat([{ name: "memo", label: "メモ", type: "textarea", full: true }]);
      var vals = { date: U.todayStr() };
      AXES.forEach(function (a) { vals[a.key] = latest ? latest[a.key] : 5; });
      U.recordModal({ title: "ライフバランスを記録", fields: fields, values: vals,
        onSave: function (v) { S.add("wheel", v); U.toast("記録しました"); render(view); } });
    };
    view.querySelectorAll("[data-del]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-del");
        U.confirmDelete("この記録を削除しますか？", function () { S.remove("wheel", id); U.toast("削除しました"); render(view); });
      };
    });
  }

  function drawChart(latest, prev) {
    var el = document.getElementById("wheelChart");
    if (!el || typeof Chart === "undefined") return;
    if (chart) chart.destroy();
    var datasets = [];
    if (latest) {
      datasets.push({
        label: "今回", data: AXES.map(function (a) { return U.num(latest[a.key]); }),
        borderColor: "#a6854a", backgroundColor: "rgba(194,163,107,0.25)", pointBackgroundColor: "#a6854a"
      });
    }
    if (prev) {
      datasets.push({
        label: "前回", data: AXES.map(function (a) { return U.num(prev[a.key]); }),
        borderColor: "#c89488", backgroundColor: "rgba(200,148,136,0.12)", pointBackgroundColor: "#c89488"
      });
    }
    if (!datasets.length) {
      datasets.push({ label: "—", data: AXES.map(function () { return 0; }), borderColor: "#ddd", backgroundColor: "rgba(0,0,0,0.02)" });
    }
    chart = new Chart(el, {
      type: "radar",
      data: { labels: AXES.map(function (a) { return a.label; }), datasets: datasets },
      options: {
        responsive: true,
        scales: { r: { min: 0, max: 10, ticks: { stepSize: 2, backdropColor: "transparent" }, pointLabels: { font: { family: "'Noto Sans JP'", size: 13 } } } },
        plugins: { legend: { labels: { font: { family: "'Noto Sans JP'" } } } }
      }
    });
  }

  BG.modules = BG.modules || {};
  BG.modules.wheel = { title: "LIFE BALANCE WHEEL", render: render };
})();
