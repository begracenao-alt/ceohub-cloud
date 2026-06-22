/* ===== ⑥ Team｜チーム・雇用準備 ===== */
(function () {
  "use strict";
  var S = BG.store, U = BG.ui;

  var fields = [
    { name: "name", label: "名前", type: "text" },
    { name: "role", label: "役割", type: "text" },
    { name: "type", label: "区分", type: "select", options: ["スタッフ", "外注", "候補", "未来メモ"] },
    { name: "workDays", label: "稼働日", type: "text" },
    { name: "tasks", label: "依頼している仕事", type: "textarea", full: true },
    { name: "strengths", label: "得意なこと", type: "textarea", full: true },
    { name: "futureTasks", label: "今後任せたいこと", type: "textarea", full: true },
    { name: "payMemo", label: "報酬／給与メモ", type: "text" },
    { name: "meetingMemo", label: "面談メモ", type: "textarea", full: true },
    { name: "issueMemo", label: "課題メモ", type: "textarea", full: true }
  ];

  function calc() {
    var t = S.list("team");
    var staff = 0, out = 0;
    t.forEach(function (m) {
      if (m.type === "外注") out++;
      else if (m.type === "スタッフ") staff++;
    });
    return { total: staff + out, staff: staff, out: out, all: t.length };
  }

  function render(view) {
    var c = calc();
    var html = '<p class="page-lead">ひとりで回す事業から、人と育てる事業へ。<br>' +
      '<span class="muted">今は「未来メモ」として使えます。スタッフが増えたら管理画面になります。</span></p>';
    html += '<div class="grid grid-3">' +
      U.stat("チーム人数", c.staff + "人", null, "accent") +
      U.stat("外注人数", c.out + "人") +
      U.stat("登録メモ", c.all + "件", "候補・未来メモ含む", "rose") +
      '</div>';

    html += '<div class="section-head mt"><h2>メンバー</h2><button class="btn btn-primary" id="addM">+ メンバーを追加</button></div>';
    var rows = S.list("team").slice().sort(function (a, b) { return (b.pin ? 1 : 0) - (a.pin ? 1 : 0); });
    if (!rows.length) {
      html += '<div class="card"><p class="empty">まだ登録がありません。<br>「今後こんな人に、こんな仕事を任せたい」という未来メモから始めてみましょう。</p></div>';
    } else {
      html += '<div style="max-height:62vh;overflow:auto"><div class="grid grid-2">';
      rows.forEach(function (r) {
        html += '<div class="card">' +
          '<div class="section-head"><h2 style="font-size:16px">' + (r.pin ? '📌 ' : '') + U.esc(r.name || "（名前未設定）") + '</h2>' +
          '<span class="badge gray">' + U.esc(r.type || "メモ") + '</span></div>' +
          line("役割", r.role) +
          line("稼働日", r.workDays) +
          line("依頼中の仕事", r.tasks) +
          line("得意なこと", r.strengths) +
          line("今後任せたい", r.futureTasks) +
          line("報酬メモ", r.payMemo) +
          line("課題", r.issueMemo) +
          '<div class="row-actions mt">' +
          '<button class="btn btn-sm" data-pin="' + r.id + '">' + (r.pin ? '📌 固定中' : '📌 上に固定') + '</button>' +
          '<button class="btn btn-sm" data-edit="' + r.id + '">編集</button>' +
          '<button class="btn btn-sm btn-danger" data-del="' + r.id + '">削除</button></div>' +
          '</div>';
      });
      html += '</div></div>';
    }

    view.innerHTML = html;
    document.getElementById("addM").onclick = function () {
      U.recordModal({ title: "メンバーを追加", fields: fields, values: { type: "未来メモ" },
        onSave: function (v) { S.add("team", v); U.toast("追加しました"); render(view); } });
    };
    view.querySelectorAll("[data-pin]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-pin");
        var rec = S.find("team", id);
        var np = !(rec && rec.pin);
        S.update("team", id, { pin: np });
        U.toast(np ? "上に固定しました" : "固定を外しました");
        render(view);
      };
    });
    view.querySelectorAll("[data-edit]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-edit");
        U.recordModal({ title: "メンバーを編集", fields: fields, values: S.find("team", id),
          onSave: function (v) { S.update("team", id, v); U.toast("更新しました"); render(view); } });
      };
    });
    view.querySelectorAll("[data-del]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-del");
        U.confirmDelete("このメンバーを削除しますか？", function () { S.remove("team", id); U.toast("削除しました"); render(view); });
      };
    });
  }

  function line(label, val) {
    if (!val) return "";
    return '<div style="margin-bottom:6px"><span class="muted" style="font-size:12px">' + U.esc(label) + '：</span> ' + U.esc(val) + '</div>';
  }

  BG.modules = BG.modules || {};
  BG.modules.team = { title: "TEAM｜チーム・雇用準備", render: render };
  BG.calc = BG.calc || {};
  BG.calc.team = calc;
})();
