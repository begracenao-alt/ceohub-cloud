/* ===== ⑦ Manual｜仕組み・引き継ぎ ===== */
(function () {
  "use strict";
  var S = BG.store, U = BG.ui;

  var CATS = ["顧客対応", "発信", "講座運営", "入金確認", "資料作成", "アプリ管理", "会員サイト管理", "採用", "その他"];

  var fields = [
    { name: "name", label: "業務名", type: "text" },
    { name: "category", label: "カテゴリー", type: "select", options: CATS },
    { name: "assignee", label: "担当者", type: "text", value: "自分" },
    { name: "tools", label: "使用ツール", type: "text" },
    { name: "steps", label: "手順", type: "textarea", full: true, placeholder: "1. …\n2. …\n3. …" },
    { name: "refLink", label: "参考リンク", type: "text", full: true },
    { name: "videoLink", label: "動画リンク", type: "text", full: true },
    { name: "notes", label: "注意点", type: "textarea", full: true },
    { name: "updated", label: "更新日", type: "date", value: U.todayStr() }
  ];

  function calc() {
    var m = S.list("manuals");
    var today = new Date();
    var stale = 0;
    m.forEach(function (x) {
      if (x.updated) {
        var d = new Date(x.updated);
        var days = (today - d) / 86400000;
        if (days > 90) stale++;
      } else stale++;
    });
    return { count: m.length, stale: stale };
  }

  function render(view) {
    var c = calc();
    var html = '<p class="page-lead">人が増えても事業の質が落ちないように、業務を見える化します。</p>';
    html += '<div class="grid grid-2">' +
      U.stat("作成済マニュアル", c.count + "件", null, "accent") +
      U.stat("更新が必要かも", c.stale + "件", "90日以上更新なし", "rose") +
      '</div>';

    html += '<div class="section-head mt"><h2>マニュアル</h2><button class="btn btn-primary" id="addMa">+ マニュアルを追加</button></div>';
    var rows = S.list("manuals").slice().sort(function (a, b) { return (b.pin ? 1 : 0) - (a.pin ? 1 : 0); });
    if (!rows.length) {
      html += '<div class="card"><p class="empty">まだマニュアルがありません。<br>毎日やっている業務をひとつ書き出すことから始めましょう。</p></div>';
    } else {
      html += '<div style="max-height:62vh;overflow:auto"><div class="grid grid-2">';
      rows.forEach(function (r) {
        html += '<div class="card">' +
          '<div class="section-head"><h2 style="font-size:16px">' + (r.pin ? '📌 ' : '') + U.esc(r.name) + '</h2>' +
          '<span class="badge gray">' + U.esc(r.category) + '</span></div>' +
          (r.steps ? '<div style="white-space:pre-wrap;font-size:13px;margin-bottom:8px">' + U.esc(r.steps) + '</div>' : '') +
          line("担当", r.assignee) + line("ツール", r.tools) + line("注意点", r.notes) +
          (r.refLink ? '<div style="margin-bottom:6px"><a href="' + U.esc(r.refLink) + '" target="_blank">参考リンク</a></div>' : '') +
          (r.videoLink ? '<div style="margin-bottom:6px"><a href="' + U.esc(r.videoLink) + '" target="_blank">動画リンク</a></div>' : '') +
          '<div class="muted" style="font-size:11px">更新日：' + U.esc(r.updated || "—") + '</div>' +
          '<div class="row-actions mt">' +
          '<button class="btn btn-sm" data-pin="' + r.id + '">' + (r.pin ? '📌 固定中' : '📌 上に固定') + '</button>' +
          '<button class="btn btn-sm" data-edit="' + r.id + '">編集</button>' +
          '<button class="btn btn-sm btn-danger" data-del="' + r.id + '">削除</button></div>' +
          '</div>';
      });
      html += '</div></div>';
    }

    view.innerHTML = html;
    document.getElementById("addMa").onclick = function () {
      U.recordModal({ title: "マニュアルを追加", fields: fields, values: { category: "顧客対応", assignee: "自分", updated: U.todayStr() },
        onSave: function (v) { S.add("manuals", v); U.toast("追加しました"); render(view); } });
    };
    view.querySelectorAll("[data-pin]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-pin");
        var rec = S.find("manuals", id);
        var np = !(rec && rec.pin);
        S.update("manuals", id, { pin: np });
        U.toast(np ? "上に固定しました" : "固定を外しました");
        render(view);
      };
    });
    view.querySelectorAll("[data-edit]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-edit");
        U.recordModal({ title: "マニュアルを編集", fields: fields, values: S.find("manuals", id),
          onSave: function (v) { S.update("manuals", id, v); U.toast("更新しました"); render(view); } });
      };
    });
    view.querySelectorAll("[data-del]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-del");
        U.confirmDelete("このマニュアルを削除しますか？", function () { S.remove("manuals", id); U.toast("削除しました"); render(view); });
      };
    });
  }

  function line(label, val) {
    if (!val) return "";
    return '<div style="margin-bottom:6px"><span class="muted" style="font-size:12px">' + U.esc(label) + '：</span> ' + U.esc(val) + '</div>';
  }

  BG.modules = BG.modules || {};
  BG.modules.manual = { title: "MANUAL｜仕組み・引き継ぎ", render: render };
  BG.calc = BG.calc || {};
  BG.calc.manual = calc;
})();
