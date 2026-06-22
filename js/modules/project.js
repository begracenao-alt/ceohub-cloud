/* ===== ③ Project｜事業プロジェクト管理 ===== */
(function () {
  "use strict";
  var S = BG.store, U = BG.ui;

  var PROJECTS = ["講座", "アプリ", "HP", "会員サイト", "Instagram", "YouTube", "LINE", "商品開発", "採用", "チーム化", "法人化準備", "その他"];
  var PRIORITY = ["A：売上直結", "B：仕組み化", "C：未来投資", "D：後回しでいい"];
  var STATUS = ["未着手", "進行中", "確認中", "完了"];

  function pBadge(p) { return (p || "D")[0]; }

  function calc() {
    var ts = S.list("projects");
    var today = U.todayStr();
    var done = 0, undone = 0, overdue = 0, todayN = 0, weekN = 0;
    var weekEnd = new Date(); weekEnd.setDate(weekEnd.getDate() + 7);
    var weekEndStr = weekEnd.toISOString().slice(0, 10);
    ts.forEach(function (t) {
      if (t.status === "完了") { done++; return; }
      undone++;
      if (t.due) {
        if (t.due < today) overdue++;
        if (t.due === today) todayN++;
        if (t.due >= today && t.due <= weekEndStr) weekN++;
      }
    });
    return { done: done, undone: undone, overdue: overdue, today: todayN, week: weekN };
  }

  var fields = [
    { name: "project", label: "プロジェクト名", type: "select", options: PROJECTS },
    { name: "task", label: "タスク名", type: "text" },
    { name: "due", label: "締切", type: "date" },
    { name: "assignee", label: "担当者", type: "text", value: "自分" },
    { name: "priority", label: "優先順位", type: "select", options: PRIORITY },
    { name: "status", label: "ステータス", type: "select", options: STATUS },
    { name: "memo", label: "メモ", type: "textarea", full: true }
  ];

  function render(view) {
    var c = calc();
    var html = '<p class="page-lead">思いつきで動くのではなく、事業を育てる順番で進めます。<br>' +
      '<span class="muted">A：売上直結／B：仕組み化／C：未来投資／D：後回しでいい</span></p>';
    html += '<div class="grid grid-4">' +
      U.stat("今日やること", c.today + "件", null, "accent") +
      U.stat("今週やること", c.week + "件") +
      U.stat("完了", c.done + "件") +
      U.stat("期限切れ", c.overdue + "件", null, c.overdue ? "rose" : "") +
      '</div>';

    html += '<div class="card mt">' + U.sectionHead("タスク一覧", "タスクを追加", "addT");
    var rows = S.list("projects").slice().sort(function (a, b) {
      return (a.priority || "D").localeCompare(b.priority || "D") || (a.due || "9999").localeCompare(b.due || "9999");
    });
    var today = U.todayStr();
    var body = rows.length ? rows.map(function (r) {
      var over = r.status !== "完了" && r.due && r.due < today;
      return '<tr>' +
        '<td><span class="badge ' + pBadge(r.priority) + '">' + U.esc((r.priority || "—").slice(0, 1)) + '</span></td>' +
        '<td>' + U.esc(r.project) + '</td>' +
        '<td>' + U.esc(r.task) + '</td>' +
        '<td>' + (r.status === "完了" ? '<span class="badge ok">完了</span>' :
                  r.status === "進行中" ? '<span class="badge warn">進行中</span>' :
                  r.status === "確認中" ? '<span class="badge hot">確認中</span>' :
                  '<span class="badge gray">未着手</span>') + '</td>' +
        '<td' + (over ? ' class="neg"' : '') + '>' + U.fmtDate(r.due) + (over ? ' <span class="badge hot">超過</span>' : '') + '</td>' +
        '<td>' + U.esc(r.assignee || "—") + '</td>' +
        '<td class="row-actions">' +
        '<button class="btn btn-sm" data-edit="' + r.id + '">編集</button>' +
        '<button class="btn btn-sm btn-danger" data-del="' + r.id + '">削除</button></td>' +
        '</tr>';
    }).join("") : U.emptyRow(7, "最初のタスクを追加してみましょう");
    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>優先</th><th>プロジェクト</th><th>タスク</th><th>状態</th><th>締切</th><th>担当</th><th></th>' +
      '</tr></thead><tbody>' + body + '</tbody></table></div></div>';

    view.innerHTML = html;
    document.getElementById("addT").onclick = function () {
      U.recordModal({ title: "タスクを追加", fields: fields, values: { project: "講座", priority: "A：売上直結", status: "未着手", assignee: "自分" },
        onSave: function (v) { S.add("projects", v); U.toast("追加しました"); render(view); } });
    };
    view.querySelectorAll("[data-edit]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-edit");
        U.recordModal({ title: "タスクを編集", fields: fields, values: S.find("projects", id),
          onSave: function (v) { S.update("projects", id, v); U.toast("更新しました"); render(view); } });
      };
    });
    view.querySelectorAll("[data-del]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-del");
        U.confirmDelete("このタスクを削除しますか？", function () { S.remove("projects", id); U.toast("削除しました"); render(view); });
      };
    });
  }

  BG.modules = BG.modules || {};
  BG.modules.project = { title: "PROJECT｜事業プロジェクト管理", render: render };
  BG.calc = BG.calc || {};
  BG.calc.project = calc;
})();
