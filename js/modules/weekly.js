/* ===== ⑪ Weekly｜週1振り返り ===== */
(function () {
  "use strict";
  var S = BG.store, U = BG.ui;

  var fields = [
    { name: "weekOf", label: "週の始まり（日付）", type: "date", value: U.todayStr() },
    { name: "sales", label: "今週の売上", type: "number" },
    { name: "consults", label: "今週の相談／商談数", type: "number" },
    { name: "contracts", label: "今週の契約／申込数", type: "number" },
    { name: "done", label: "今週できたこと", type: "textarea", full: true },
    { name: "stopped", label: "今週止まったこと", type: "textarea", full: true },
    { name: "bodyState", label: "今週のカラダの状態", type: "text", full: true },
    { name: "nextTop", label: "来週いちばんやること", type: "textarea", full: true },
    { name: "letGo", label: "来週手放すこと", type: "textarea", full: true },
    { name: "delegate", label: "誰かに任せたいこと", type: "textarea", full: true }
  ];

  var chart;

  function render(view) {
    var rows = S.list("weekly").slice().sort(function (a, b) { return (b.weekOf || "").localeCompare(a.weekOf || ""); });
    var html = '<p class="page-lead">数字を責めるためではなく、次の一手を決めるために振り返ります。</p>';
    html += '<div class="card"><div class="card-title">売上・行動の流れ</div><canvas id="weeklyChart" height="90"></canvas></div>';
    html += '<div class="section-head mt"><h2>週次の振り返り</h2><button class="btn btn-primary" id="addW">+ 今週を振り返る</button></div>';

    if (!rows.length) {
      html += '<div class="card"><p class="empty">まだ振り返りがありません。<br>週の終わりに、5分だけ自分とミーティングしてみましょう。</p></div>';
    } else {
      html += '<div style="max-height:62vh;overflow:auto">';
      rows.forEach(function (r) {
        html += '<div class="card">' +
          '<div class="section-head"><h2 style="font-size:16px">' + U.esc(r.weekOf) + ' の週</h2>' +
          '<div class="row-actions"><button class="btn btn-sm" data-edit="' + r.id + '">編集</button>' +
          '<button class="btn btn-sm btn-danger" data-del="' + r.id + '">削除</button></div></div>' +
          '<div class="grid grid-3" style="margin-bottom:14px">' +
          U.stat("売上", U.yen(r.sales)) + U.stat("相談", (r.consults || 0) + "件") + U.stat("契約", (r.contracts || 0) + "件") +
          '</div>' +
          line("できたこと", r.done) + line("止まったこと", r.stopped) + line("カラダ", r.bodyState) +
          line("来週やること", r.nextTop) + line("手放すこと", r.letGo) + line("任せたいこと", r.delegate) +
          '</div>';
      });
      html += '</div>';
    }

    view.innerHTML = html;
    drawChart(rows);

    document.getElementById("addW").onclick = function () {
      U.recordModal({ title: "今週を振り返る", fields: fields, values: { weekOf: U.todayStr() },
        onSave: function (v) { S.add("weekly", v); U.toast("記録しました"); render(view); } });
    };
    view.querySelectorAll("[data-edit]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-edit");
        U.recordModal({ title: "振り返りを編集", fields: fields, values: S.find("weekly", id),
          onSave: function (v) { S.update("weekly", id, v); U.toast("更新しました"); render(view); } });
      };
    });
    view.querySelectorAll("[data-del]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-del");
        U.confirmDelete("この振り返りを削除しますか？", function () { S.remove("weekly", id); U.toast("削除しました"); render(view); });
      };
    });
  }

  function line(label, val) {
    if (!val) return "";
    return '<div style="margin-bottom:8px"><span class="muted" style="font-size:12px">' + U.esc(label) + '：</span><br><span style="white-space:pre-wrap">' + U.esc(val) + '</span></div>';
  }

  function drawChart(rows) {
    var el = document.getElementById("weeklyChart");
    if (!el || typeof Chart === "undefined") return;
    var asc = rows.slice().reverse();
    if (chart) chart.destroy();
    chart = new Chart(el, {
      type: "bar",
      data: {
        labels: asc.map(function (r) { return U.fmtDate(r.weekOf); }),
        datasets: [
          { type: "line", label: "売上", data: asc.map(function (r) { return U.num(r.sales); }), borderColor: "#a6854a", backgroundColor: "rgba(194,163,107,0.1)", tension: 0.3, yAxisID: "y", fill: true },
          { type: "bar", label: "相談", data: asc.map(function (r) { return U.num(r.consults); }), backgroundColor: "rgba(200,148,136,0.5)", yAxisID: "y1" },
          { type: "bar", label: "契約", data: asc.map(function (r) { return U.num(r.contracts); }), backgroundColor: "rgba(139,168,136,0.6)", yAxisID: "y1" }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { font: { family: "'Noto Sans JP'" } } } },
        scales: {
          y: { position: "left", beginAtZero: true, title: { display: true, text: "売上" } },
          y1: { position: "right", beginAtZero: true, grid: { drawOnChartArea: false }, title: { display: true, text: "件数" } }
        }
      }
    });
  }

  BG.modules = BG.modules || {};
  BG.modules.weekly = { title: "WEEKLY CEO MEETING｜週1振り返り", render: render };
})();
