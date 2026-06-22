/* ===== 🔗 Links｜リンク集（貼って・コピーできる） ===== */
(function () {
  "use strict";
  var S = BG.store, U = BG.ui;

  var fields = [
    { name: "name", label: "名前（何のリンクか）", type: "text", full: true, placeholder: "例：セルフケアLP" },
    { name: "url", label: "リンク（URL）", type: "text", full: true, placeholder: "例：https://begracenao.com/care/" }
  ];

  function copyText(text) {
    function done() { U.toast("コピーしました ✓"); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.focus(); ta.select();
      try { document.execCommand("copy"); done(); } catch (e2) { U.toast("コピーできませんでした"); }
      document.body.removeChild(ta);
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else { fallback(); }
    } catch (e) { fallback(); }
  }

  function render(view) {
    var rows = S.list("links");
    var html = '<p class="page-lead">よく使うリンクを置いておく場所です。「📋 コピー」を押すと、その場でコピーできます（インスタのプロフィールやLINEに、すぐ貼れます）。</p>';
    html += '<div class="grid grid-2">' + U.stat("登録リンク", rows.length + "件", null, "accent") + '</div>';

    html += '<div class="section-head mt"><h2>リンク</h2><button class="btn btn-primary" id="addLink">+ リンクを追加</button></div>';

    if (!rows.length) {
      html += '<div class="card"><p class="empty">まだリンクがありません。<br>「+ リンクを追加」で、名前とURLを入れてください。</p></div>';
    } else {
      html += '<div style="max-height:64vh;overflow:auto">';
      rows.forEach(function (r) {
        html += '<div class="card" style="margin-bottom:12px">' +
          '<div class="section-head"><h2 style="font-size:16px">🔗 ' + U.esc(r.name || "（名前なし）") + '</h2></div>' +
          '<div style="word-break:break-all;font-size:13px;background:#f4f7fb;border-radius:8px;padding:8px 10px;margin-bottom:10px">' + U.esc(r.url || "") + '</div>' +
          '<div class="row-actions">' +
          '<button class="btn btn-sm btn-primary" data-copy="' + r.id + '">📋 コピー</button>' +
          '<a class="btn btn-sm" href="' + U.esc(r.url || "#") + '" target="_blank" rel="noopener">開く</a>' +
          '<button class="btn btn-sm" data-edit="' + r.id + '">編集</button>' +
          '<button class="btn btn-sm btn-danger" data-del="' + r.id + '">削除</button>' +
          '</div></div>';
      });
      html += '</div>';
    }

    view.innerHTML = html;

    document.getElementById("addLink").onclick = function () {
      U.recordModal({ title: "リンクを追加", fields: fields, values: {},
        onSave: function (v) { S.add("links", v); U.toast("追加しました"); render(view); } });
    };
    view.querySelectorAll("[data-copy]").forEach(function (b) {
      b.onclick = function () {
        var r = S.find("links", b.getAttribute("data-copy"));
        if (r) copyText(r.url || "");
      };
    });
    view.querySelectorAll("[data-edit]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-edit");
        U.recordModal({ title: "リンクを編集", fields: fields, values: S.find("links", id),
          onSave: function (v) { S.update("links", id, v); U.toast("更新しました"); render(view); } });
      };
    });
    view.querySelectorAll("[data-del]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-del");
        U.confirmDelete("このリンクを削除しますか？", function () { S.remove("links", id); U.toast("削除しました"); render(view); });
      };
    });
  }

  BG.modules = BG.modules || {};
  BG.modules.links = { title: "LINKS｜リンク集", render: render };
})();
