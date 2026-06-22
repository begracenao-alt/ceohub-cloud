/* ===== 📈 SNS フォロワー記録（SNSページの「フォロワー」タブ） ===== */
(function () {
  "use strict";
  var S = BG.store, U = BG.ui;
  var DEFAULT_ACCOUNTS = ["Instagram", "スレッズ", "LINE公式", "YouTube", "メルマガ"];
  function uniq(a) { var o = {}, r = []; a.forEach(function (x) { if (x && !o[x]) { o[x] = 1; r.push(x); } }); return r; }
  function accountList() { var s = S.list("snsAccounts"); return (s && s.length) ? s.slice() : DEFAULT_ACCOUNTS.slice(); }
  function snaps() { return S.list("snsStats").slice().sort(function (a, b) { return (a.date || "").localeCompare(b.date || ""); }); }
  var chart, showAll = false;

  function render(view) {
    var accounts = accountList();
    var list = snaps(); // 古い→新しい
    var latest = list[list.length - 1], prev = list[list.length - 2];

    var html = '<p class="page-lead">各アカウントの「フォロワー・友だち・登録者数」を記録して、伸びを見える化します。<br>' +
      '<span class="muted">数が増える＝届く力が育っているサイン。月1回でもOK。（リール・ストーリーズの再生数は1本ごとの成績なので、ここではなく投稿側で見ます）</span></p>';

    html += '<div style="text-align:right;margin:0 0 10px"><button class="btn btn-sm" id="mgAcc">⚙️ アカウントを編集（追加・削除・並び替え）</button></div>';

    // 現在の規模＋前回比
    html += '<div class="grid grid-4">';
    accounts.forEach(function (a) {
      var cur = latest && latest.counts ? U.num(latest.counts[a]) : 0;
      var pv = (prev && prev.counts && prev.counts[a] !== undefined) ? U.num(prev.counts[a]) : null;
      var sub, cls = "accent";
      if (!latest) sub = "未記録";
      else if (pv === null) sub = "前回なし";
      else { var d = cur - pv; sub = (d >= 0 ? "▲ +" + d : "▼ " + d) + "（前回比）"; if (d < 0) cls = "rose"; }
      html += U.stat(a, latest ? cur.toLocaleString() : "—", sub, cls);
    });
    html += '</div>';

    // 伸びグラフ
    html += '<div class="card mt"><div class="card-title">フォロワーの伸び</div><canvas id="snsChart" height="100"></canvas></div>';

    // 記録一覧
    html += '<div class="card mt">' + U.sectionHead(showAll ? "記録（すべて）" : "記録（今月）", "記録する", "addS");
    var allRows = list.slice().reverse();
    var rows = showAll ? allRows : allRows.filter(function (r) { return U.inThisMonth(r.date); });
    var head = '<th>日付</th>' + accounts.map(function (a) { return '<th class="num">' + U.esc(a) + '</th>'; }).join("") + '<th></th>';
    var bodyRows = rows.length ? rows.map(function (r) {
      return '<tr><td>' + U.fmtDate(r.date) + '</td>' +
        accounts.map(function (a) {
          var has = r.counts && r.counts[a] !== undefined && r.counts[a] !== "";
          return '<td class="num">' + (has ? U.num(r.counts[a]).toLocaleString() : "—") + '</td>';
        }).join("") +
        '<td class="row-actions"><button class="btn btn-sm" data-edit="' + r.id + '">編集</button>' +
        '<button class="btn btn-sm btn-danger" data-del="' + r.id + '">削除</button></td></tr>';
    }).join("") : U.emptyRow(accounts.length + 2, showAll ? "記録がありません" : "今月の記録はまだありません。「記録する」から。");
    html += '<div class="table-wrap"><table><thead><tr>' + head + '</tr></thead><tbody>' + bodyRows + '</tbody></table></div>' +
      '<div style="text-align:center;margin-top:12px"><button class="btn btn-sm" id="toggleAll">' +
      (showAll ? '今月だけ表示にもどす' : '過去の記録も見る（全' + allRows.length + '件）') + '</button></div></div>';

    view.innerHTML = html;
    drawChart(accounts, list);

    document.getElementById("mgAcc").onclick = function () { manageAccounts(view); };
    document.getElementById("addS").onclick = function () { openForm(); };
    document.getElementById("toggleAll").onclick = function () { showAll = !showAll; render(view); };
    view.querySelectorAll("[data-edit]").forEach(function (b) {
      b.onclick = function () { openForm(S.find("snsStats", b.getAttribute("data-edit"))); };
    });
    view.querySelectorAll("[data-del]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-del");
        U.confirmDelete("この記録を削除しますか？", function () { S.remove("snsStats", id); U.toast("削除しました"); render(view); });
      };
    });

    function openForm(rec) {
      var accs = accountList();
      var flds = [{ name: "date", label: "日付", type: "date", value: U.todayStr() }];
      accs.forEach(function (a, i) { flds.push({ name: "a" + i, label: a + " の数（フォロワー・友だち・登録者など）", type: "number" }); });
      var vals = { date: rec ? rec.date : U.todayStr() };
      if (rec && rec.counts) accs.forEach(function (a, i) { if (rec.counts[a] !== undefined) vals["a" + i] = rec.counts[a]; });
      U.recordModal({
        title: rec ? "記録を編集" : "フォロワーを記録", fields: flds, values: vals,
        onSave: function (v) {
          var counts = {};
          accs.forEach(function (a, i) { counts[a] = v["a" + i]; });
          if (rec) S.update("snsStats", rec.id, { date: v.date, counts: counts });
          else S.add("snsStats", { date: v.date, counts: counts });
          U.toast("記録しました"); render(view);
        }
      });
    }
  }

  // アカウントの追加・削除・並び替え
  function manageAccounts(view) {
    function open() {
      var accs = accountList();
      var body = '<p class="hint">フォロワー数を記録したいアカウントを整えます。▲▼で並び替え、削除もできます。</p>' +
        '<div>' + (accs.length ? accs.map(function (a, i) {
          return '<div class="check-row" style="justify-content:space-between;border-bottom:1px solid var(--line-2);padding:9px 2px">' +
            '<span>' + U.esc(a) + '</span><span style="display:flex;gap:6px">' +
            '<button class="btn btn-sm" data-up="' + i + '"' + (i === 0 ? ' disabled' : '') + '>▲</button>' +
            '<button class="btn btn-sm" data-down="' + i + '"' + (i === accs.length - 1 ? ' disabled' : '') + '>▼</button>' +
            '<button class="btn btn-sm btn-danger" data-rmacc="' + U.esc(a) + '">削除</button></span></div>';
        }).join("") : '<p class="hint">アカウントがありません。下から追加してください。</p>') + '</div>' +
        '<div class="field" style="margin-top:14px"><label for="newAcc">新しいアカウントを追加</label>' +
        '<input type="text" id="newAcc" placeholder="例：X（旧Twitter）・note・TikTok など"></div>' +
        '<div class="modal-foot"><button class="btn" data-close2>閉じる</button>' +
        '<button class="btn btn-primary" id="addAcc">追加</button></div>';
      U.openModal("アカウントの管理", body, function (m) {
        m.querySelector("[data-close2]").onclick = function () { U.closeModal(); render(view); };
        m.querySelector("#addAcc").onclick = function () {
          var val = m.querySelector("#newAcc").value.trim();
          if (!val) return;
          var arr = accountList();
          if (arr.indexOf(val) < 0) arr.push(val);
          S.setSnsAccounts(arr); U.toast("追加しました"); open();
        };
        m.querySelectorAll("[data-rmacc]").forEach(function (b) {
          b.onclick = function () {
            S.setSnsAccounts(accountList().filter(function (x) { return x !== b.getAttribute("data-rmacc"); }));
            U.toast("削除しました"); open();
          };
        });
        m.querySelectorAll("[data-up]").forEach(function (b) {
          b.onclick = function () { var i = +b.getAttribute("data-up"); var arr = accountList(); var t = arr[i - 1]; arr[i - 1] = arr[i]; arr[i] = t; S.setSnsAccounts(arr); open(); };
        });
        m.querySelectorAll("[data-down]").forEach(function (b) {
          b.onclick = function () { var i = +b.getAttribute("data-down"); var arr = accountList(); var t = arr[i + 1]; arr[i + 1] = arr[i]; arr[i] = t; S.setSnsAccounts(arr); open(); };
        });
      });
    }
    open();
  }

  function drawChart(accounts, list) {
    var el = document.getElementById("snsChart");
    if (!el || typeof Chart === "undefined") return;
    var labels = list.map(function (r) { return U.fmtDate(r.date); });
    var palette = ["#3a96bf", "#dd7d93", "#74a8a4", "#c2a36b", "#5aa8ca", "#a6dcef", "#c89488", "#9b8cc4"];
    var datasets = accounts.map(function (a, i) {
      return { label: a, data: list.map(function (r) { return r.counts && r.counts[a] !== undefined ? U.num(r.counts[a]) : null; }), borderColor: palette[i % palette.length], backgroundColor: "transparent", tension: 0.3, spanGaps: true };
    });
    if (chart) chart.destroy();
    chart = new Chart(el, {
      type: "line",
      data: { labels: labels, datasets: datasets },
      options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { labels: { font: { family: "'Noto Sans JP'" } } } }, scales: { y: { beginAtZero: false } } }
    });
  }

  BG.modules = BG.modules || {};
  BG.modules.snsfollowers = { title: "SNS｜フォロワー記録", render: render };
})();
