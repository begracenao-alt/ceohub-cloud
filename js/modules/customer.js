/* ===== ② Customer｜顧客・取引先管理 ===== */
(function () {
  "use strict";
  var S = BG.store, U = BG.ui;

  var STATUSES = ["見込み", "相談前", "相談済", "提案済", "検討中", "契約済", "継続中", "卒業／終了", "紹介"];

  function badgeClass(st) {
    if (st === "契約済" || st === "継続中") return "ok";
    if (st === "相談済" || st === "提案済" || st === "検討中") return "warn";
    if (st === "見込み" || st === "相談前") return "hot";
    return "gray";
  }

  function calc() {
    var cs = S.list("customers");
    var lead = 0, consult = 0, contract = 0, keep = 0, refer = 0;
    cs.forEach(function (c) {
      if (c.status === "見込み" || c.status === "相談前") lead++;
      if (["相談済", "提案済", "検討中"].indexOf(c.status) >= 0) consult++;
      if (c.status === "契約済") contract++;
      if (c.status === "継続中") keep++;
      if (c.status === "紹介" || c.referrer) refer++;
    });
    var consultedTotal = consult + contract + keep; // 相談以降に進んだ人
    var rate = consultedTotal > 0 ? Math.round((contract + keep) / consultedTotal * 100) : 0;
    return { total: cs.length, lead: lead, consult: consult, contract: contract, keep: keep, refer: refer, rate: rate };
  }

  var fields = [
    { name: "name", label: "名前／会社名", type: "text" },
    { name: "contact", label: "LINE／メール", type: "text" },
    { name: "birthday", label: "お誕生日", type: "date" },
    { name: "status", label: "ステータス", type: "select", options: STATUSES },
    { name: "product", label: "商品／サービス名", type: "text" },
    { name: "firstContact", label: "初回接触日", type: "date" },
    { name: "consultDate", label: "相談／商談日", type: "date" },
    { name: "contractAmount", label: "契約金額", type: "number" },
    { name: "nextDate", label: "次回予定", type: "date" },
    { name: "nextTime", label: "次回予定の時間", type: "time" },
    { name: "referrer", label: "紹介者", type: "text" },
    { name: "memo", label: "メモ", type: "textarea", full: true }
  ];

  function render(view) {
    var c = calc();
    var html = '<p class="page-lead">お客様・受講生・取引先が今どの段階にいるかを見える化します。</p>';
    html += '<div class="grid grid-4">' +
      U.stat("見込み", c.lead + "人", null, "rose") +
      U.stat("相談／商談", c.consult + "人") +
      U.stat("契約／申込", c.contract + "人", null, "accent") +
      U.stat("継続中", c.keep + "人") +
      '</div>';
    html += '<div class="grid grid-2 mt">' +
      U.stat("紹介", c.refer + "人") +
      U.stat("相談→契約の割合", c.rate + "%", "相談した方のうち契約・継続に進んだ割合") +
      '</div>';

    // 今月お誕生日のお客様
    var mm = ("0" + (new Date().getMonth() + 1)).slice(-2);
    var bdays = S.list("customers").filter(function (r) { return r.birthday && r.birthday.slice(5, 7) === mm; })
      .sort(function (a, b) { return a.birthday.slice(8, 10).localeCompare(b.birthday.slice(8, 10)); });
    if (bdays.length) {
      html += '<div class="card mt" style="border-left:3px solid var(--gold)"><div class="card-title">今月、お誕生日のお客様</div>' +
        '<p class="hint" style="margin-bottom:8px">ひとこと贈ると、ご縁がふかまります。</p>' +
        '<ul style="margin:0 0 0 1.2em;font-size:13.5px;line-height:1.95">' +
        bdays.map(function (r) { return '<li>' + U.esc(r.name) + '（' + (+r.birthday.slice(5, 7)) + '月' + (+r.birthday.slice(8, 10)) + '日）</li>'; }).join("") +
        '</ul></div>';
    }

    html += '<div class="card mt">' + U.sectionHead("顧客リスト", "顧客を追加", "addC");
    var rows = S.list("customers");
    var body = rows.length ? rows.map(function (r) {
      return '<tr>' +
        '<td>' + U.esc(r.name) + '</td>' +
        '<td><span class="badge ' + badgeClass(r.status) + '">' + U.esc(r.status || "—") + '</span></td>' +
        '<td>' + U.esc(r.product) + '</td>' +
        '<td class="num">' + (r.contractAmount ? U.yen(r.contractAmount) : "—") + '</td>' +
        '<td>' + U.fmtDate(r.nextDate) + (r.nextTime ? " " + U.esc(r.nextTime) : "") + '</td>' +
        '<td>' + U.esc(r.referrer || "—") + '</td>' +
        '<td class="row-actions">' +
        '<button class="btn btn-sm" data-edit="' + r.id + '">編集</button>' +
        '<button class="btn btn-sm btn-danger" data-del="' + r.id + '">削除</button></td>' +
        '</tr>';
    }).join("") : U.emptyRow(7, "最初のお客様を追加してみましょう");
    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>名前</th><th>ステータス</th><th>商品</th><th class="num">契約金額</th><th>次回予定</th><th>紹介者</th><th></th>' +
      '</tr></thead><tbody>' + body + '</tbody></table></div></div>';

    view.innerHTML = html;
    document.getElementById("addC").onclick = function () {
      U.recordModal({ title: "顧客を追加", fields: fields, values: { status: "見込み" },
        onSave: function (v) { S.add("customers", v); U.toast("追加しました"); render(view); } });
    };
    view.querySelectorAll("[data-edit]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-edit");
        U.recordModal({ title: "顧客を編集", fields: fields, values: S.find("customers", id),
          onSave: function (v) { S.update("customers", id, v); U.toast("更新しました"); render(view); } });
      };
    });
    view.querySelectorAll("[data-del]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-del");
        U.confirmDelete("この顧客を削除しますか？", function () { S.remove("customers", id); U.toast("削除しました"); render(view); });
      };
    });
  }

  BG.modules = BG.modules || {};
  BG.modules.customer = { title: "CUSTOMER｜顧客・取引先管理", render: render };
  BG.calc = BG.calc || {};
  BG.calc.customer = calc;
})();
