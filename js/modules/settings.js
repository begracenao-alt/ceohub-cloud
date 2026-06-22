/* ===== 初期設定・バックアップ・同期 ===== */
(function () {
  "use strict";
  var S = BG.store, U = BG.ui;

  var fields = [
    { name: "repName", label: "お名前", type: "text" },
    { name: "bizName", label: "屋号／会社名", type: "text" },
    { name: "bizType", label: "事業形態", type: "select", options: ["個人事業主", "法人"] },
    { name: "mainBiz", label: "メイン事業", type: "text" },
    { name: "mainProduct", label: "メイン商品／サービス", type: "text" },
    { name: "price", label: "商品価格", type: "money" },
    { name: "monthlyGoal", label: "月商目標", type: "money" },
    { name: "yearlyGoal", label: "年商目標", type: "money" },
    { name: "idealWork", label: "理想の働き方", type: "textarea", full: true },
    { name: "idealTeam", label: "理想のチーム像", type: "textarea", full: true },
    { name: "monthTheme", label: "今月のテーマ", type: "text", full: true },
    { name: "todayWord", label: "今日の一言（ホームに表示）", type: "text", full: true }
  ];

  function render(view) {
    var s = S.settings();
    var sync = S.sync();
    var html = '<p class="page-lead">アプリの基本設定と、データのバックアップ・同期です。</p>';

    // 基本情報
    html += '<div class="card"><div class="section-head"><h2>基本情報</h2><button class="btn btn-primary" id="editBasic">編集</button></div>' +
      kv("お名前", s.repName) + kv("屋号／会社名", s.bizName) + kv("事業形態", s.bizType) +
      kv("メイン事業", s.mainBiz) + kv("メイン商品", s.mainProduct) +
      kv("商品価格", s.price && U.yen(s.price)) + kv("月商目標", s.monthlyGoal && U.yen(s.monthlyGoal)) +
      kv("年商目標", s.yearlyGoal && U.yen(s.yearlyGoal)) +
      kv("理想の働き方", s.idealWork) + kv("理想のチーム像", s.idealTeam) +
      kv("今月のテーマ", s.monthTheme) + '</div>';

    // バックアップ
    html += '<div class="card"><div class="card-title">データのバックアップ</div>' +
      '<p class="hint" style="margin-bottom:14px">データはこのブラウザの中に保存されています。<strong>大切なデータを守るため、ときどきファイルに保存しておきましょう。</strong>パソコンを変えるときや、もしもの時に復元できます。</p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
      '<button class="btn btn-primary" id="dl">バックアップを保存（ファイル）</button>' +
      '<button class="btn" id="up">バックアップから復元</button>' +
      '<input type="file" id="upFile" accept="application/json" hidden>' +
      '</div></div>';

    // Googleスプレッドシート同期
    html += '<div class="card"><div class="card-title">Googleスプレッドシート連携（任意）</div>' +
      '<p class="hint" style="margin-bottom:14px">記録を自動でGoogleスプレッドシートに送れます。税理士さん・チームとの数字共有や、クラウドバックアップに。共有だけなら「確定申告まとめ → CSV書き出し」でも。設定は同梱の「Googleスプレッドシート連携の手順.md」を参照。</p>';
    if (sync.enabled) {
      html += '<p class="badge ok">連携オン</p>' +
        '<div class="hint" style="margin:8px 0">送信先：' + U.esc(sync.url.slice(0, 50)) + '…</div>' +
        '<div style="display:flex;gap:10px"><button class="btn" id="syncNow">今すぐ送信</button>' +
        '<button class="btn btn-danger" id="syncOff">連携をオフ</button></div>';
    } else {
      html += '<div class="field full"><label>ウェブアプリのURL（手順書で取得したもの）</label>' +
        '<input type="text" id="syncUrl" placeholder="https://script.google.com/macros/s/.../exec"></div>' +
        '<button class="btn btn-primary mt" id="syncOn">連携をオンにする</button>';
    }
    html += '</div>';

    // データ初期化
    html += '<div class="card"><div class="card-title">すべて消去</div>' +
      '<p class="hint" style="margin-bottom:12px">すべてのデータを消して最初からやり直します。元に戻せません。</p>' +
      '<button class="btn btn-danger" id="resetAll">すべてのデータを消去</button></div>';

    view.innerHTML = html;

    document.getElementById("editBasic").onclick = function () {
      U.recordModal({ title: "基本情報を編集", fields: fields, values: s,
        onSave: function (v) { S.saveSettings(v); U.toast("保存しました"); render(view); if (BG.refreshHeader) BG.refreshHeader(); } });
    };
    document.getElementById("dl").onclick = function () { S.download(); U.toast("バックアップを保存しました"); };
    document.getElementById("up").onclick = function () { document.getElementById("upFile").click(); };
    document.getElementById("upFile").onchange = function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try { S.importJSON(reader.result); U.toast("復元しました"); render(view); }
        catch (err) { alert("ファイルを読み込めませんでした。正しいバックアップファイルか確認してください。"); }
      };
      reader.readAsText(file);
    };

    if (sync.enabled) {
      document.getElementById("syncNow").onclick = function () { S.pushToSheet(); U.toast("送信しました"); };
      document.getElementById("syncOff").onclick = function () { S.disableSync(); U.toast("連携をオフにしました"); render(view); };
    } else {
      document.getElementById("syncOn").onclick = function () {
        var url = document.getElementById("syncUrl").value.trim();
        if (!/^https:\/\/script\.google\.com\//.test(url)) { alert("正しいウェブアプリのURLを貼ってください。"); return; }
        S.enableSync(url); S.pushToSheet(); U.toast("連携をオンにしました"); render(view);
      };
    }

    document.getElementById("resetAll").onclick = function () {
      U.confirmDelete("本当にすべてのデータを消去しますか？元に戻せません。先にバックアップをおすすめします。", function () {
        S.resetAll(); U.toast("初期化しました"); render(view); if (BG.refreshHeader) BG.refreshHeader();
      });
    };
  }

  function kv(label, val) {
    return '<div style="margin-bottom:8px;display:flex;gap:10px">' +
      '<span class="muted" style="min-width:120px;font-size:12.5px">' + U.esc(label) + '</span>' +
      '<span style="white-space:pre-wrap">' + (val ? U.esc(val) : '<span class="muted">—</span>') + '</span></div>';
  }

  BG.modules = BG.modules || {};
  BG.modules.settings = { title: "初期設定・バックアップ", render: render };
  BG.settingsFields = fields;
})();
