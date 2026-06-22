/* ===== 📱 SNS｜発信・フォロワー（発信・フォロワー・マイSNS） ===== */
(function () {
  "use strict";
  var S = BG.store, U = BG.ui;
  var tab = "post"; // post | followers | links

  var snsFields = [
    { name: "name", label: "SNSの名前", type: "text", full: true, placeholder: "例：Instagram" },
    { name: "url", label: "リンク（URL）", type: "text", full: true, placeholder: "例：https://www.instagram.com/＿＿＿/" }
  ];

  /* 住所をかしこく整える：前後の空白や、URLでない文字を取り除き、https:// を補う */
  function normUrl(u) {
    u = (u || "").trim();
    var m = u.match(/https?:\/\/[^\s\]\[()<>"']+/i); // 文中のURL部分だけを取り出す（[ ] ( ) などの記号で囲まれていてもOK）
    if (m) return m[0];
    if (!u) return "#";
    return "https://" + u.replace(/^[\s/]+/, ""); // https:// が無ければ補う
  }

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

  /* 🔗 マイSNS：自分のSNSをすぐ開いて数字を確認する場所 */
  function renderMyLinks(view) {
    var rows = S.list("snsLinks");
    var html = '<p class="page-lead">自分のSNSを置いておく場所です。「開く」を押すと、すぐにそのSNSを開いて、数字（フォロワーなど）を確認できます。</p>';
    html += '<div class="section-head mt"><h2>マイSNS</h2><button class="btn btn-primary" id="addSnsLink">+ SNSを追加</button></div>';

    if (!rows.length) {
      html += '<div class="card"><p class="empty">まだ登録がありません。<br>「+ SNSを追加」で、SNSの名前とURLを入れてください。</p></div>';
    } else {
      rows.forEach(function (r) {
        html += '<div class="card" style="margin-bottom:12px">' +
          '<div class="section-head"><h2 style="font-size:16px">🔗 ' + U.esc(r.name || "（名前なし）") + '</h2></div>' +
          '<div style="word-break:break-all;font-size:13px;background:#f4f7fb;border-radius:8px;padding:8px 10px;margin-bottom:10px">' + U.esc(r.url || "") + '</div>' +
          '<div class="row-actions">' +
          '<a class="btn btn-sm btn-primary" href="' + U.esc(normUrl(r.url)) + '" target="_blank" rel="noopener">開く（数字を見る）</a>' +
          '<button class="btn btn-sm" data-copy="' + r.id + '">📋 コピー</button>' +
          '<button class="btn btn-sm" data-edit="' + r.id + '">編集</button>' +
          '<button class="btn btn-sm btn-danger" data-del="' + r.id + '">削除</button>' +
          '</div></div>';
      });
    }

    view.innerHTML = html;

    document.getElementById("addSnsLink").onclick = function () {
      U.recordModal({ title: "SNSを追加", fields: snsFields, values: {},
        onSave: function (v) { S.add("snsLinks", v); U.toast("追加しました"); renderMyLinks(view); } });
    };
    view.querySelectorAll("[data-copy]").forEach(function (b) {
      b.onclick = function () {
        var r = S.find("snsLinks", b.getAttribute("data-copy"));
        if (r) copyText(normUrl(r.url));
      };
    });
    view.querySelectorAll("[data-edit]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-edit");
        U.recordModal({ title: "SNSを編集", fields: snsFields, values: S.find("snsLinks", id),
          onSave: function (v) { S.update("snsLinks", id, v); U.toast("更新しました"); renderMyLinks(view); } });
      };
    });
    view.querySelectorAll("[data-del]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-del");
        U.confirmDelete("このSNSリンクを削除しますか？", function () { S.remove("snsLinks", id); U.toast("削除しました"); renderMyLinks(view); });
      };
    });
  }

  function render(view) {
    var html = '<div style="display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap">' +
      '<button class="btn' + (tab === "post" ? " btn-primary" : "") + '" data-tab="post">📢 発信</button>' +
      '<button class="btn' + (tab === "followers" ? " btn-primary" : "") + '" data-tab="followers">📈 フォロワー</button>' +
      '<button class="btn' + (tab === "links" ? " btn-primary" : "") + '" data-tab="links">🔗 マイSNS</button>' +
      '</div><div id="snsSub"></div>';
    view.innerHTML = html;
    var sub = view.querySelector("#snsSub");
    if (tab === "post") BG.modules.content.render(sub);
    else if (tab === "followers") BG.modules.snsfollowers.render(sub);
    else renderMyLinks(sub);
    view.querySelectorAll("[data-tab]").forEach(function (b) {
      b.onclick = function () { tab = b.getAttribute("data-tab"); render(view); };
    });
  }

  BG.modules = BG.modules || {};
  BG.modules.sns = { title: "SNS｜発信・フォロワー", render: render };
})();
