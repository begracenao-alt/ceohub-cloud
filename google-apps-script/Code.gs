/**
 * Be Grace CEO Hub — Googleスプレッドシート連携バックエンド
 * --------------------------------------------------------
 * このコードを Googleスプレッドシートの「拡張機能 → Apps Script」に貼り付け、
 * ウェブアプリとして公開してください（詳しい手順は SETUP.md）。
 *
 * アプリから送られてきたデータを、シートのタブに自動で書き出します。
 * （バックアップ＆閲覧用。アプリ→スプレッドシートの一方向同期です）
 */

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.action === "save" && body.payload) {
      saveAll(body.payload);
      return json({ ok: true });
    }
    return json({ ok: false, error: "unknown action" });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  return json({ ok: true, message: "Be Grace CEO Hub backend is running." });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function saveAll(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 各コレクション → シート（タブ）
  writeRows(ss, "売上", data.sales, ["date", "customer", "product", "amount", "dueDate", "paid", "payMethod", "memo"],
    ["日付", "顧客名", "商品", "売上金額", "入金予定日", "入金済", "支払方法", "メモ"]);
  writeRows(ss, "経費", data.expenses, ["date", "content", "amount", "category", "memo"],
    ["日付", "内容", "金額", "カテゴリー", "メモ"]);
  writeRows(ss, "顧客", data.customers, ["name", "status", "contact", "product", "contractAmount", "firstContact", "consultDate", "nextDate", "referrer", "memo"],
    ["名前", "ステータス", "連絡先", "商品", "契約金額", "初回接触日", "相談日", "次回予定", "紹介者", "メモ"]);
  writeRows(ss, "プロジェクト", data.projects, ["project", "task", "priority", "status", "due", "assignee", "memo"],
    ["プロジェクト", "タスク", "優先順位", "ステータス", "締切", "担当者", "メモ"]);
  writeRows(ss, "発信", data.contents, ["title", "category", "scheduledDate", "shot", "edited", "posted", "ledInquiry", "ledConsult", "reactionMemo"],
    ["タイトル", "カテゴリー", "予定日", "撮影済", "編集済", "投稿済", "問合せ", "相談誘導", "反応メモ"]);
  writeRows(ss, "カラダ", data.bodyLogs, ["date", "sleep", "energy", "pillow", "yoga", "walk", "resetTime", "conditionMemo", "emotionMemo"],
    ["日付", "睡眠", "エネルギー", "枕運動", "ヨガ", "散歩", "リセット", "体調メモ", "感情メモ"]);
  writeRows(ss, "チーム", data.team, ["name", "role", "type", "workDays", "tasks", "strengths", "futureTasks", "payMemo", "issueMemo"],
    ["名前", "役割", "区分", "稼働日", "依頼中", "得意", "今後任せたい", "報酬メモ", "課題"]);
  writeRows(ss, "マニュアル", data.manuals, ["name", "category", "assignee", "tools", "steps", "notes", "updated"],
    ["業務名", "カテゴリー", "担当", "ツール", "手順", "注意点", "更新日"]);
  writeRows(ss, "ホイール", data.wheel, ["date", "health", "beauty", "work", "money", "family", "love", "learning", "play", "memo"],
    ["日付", "健康", "美容", "仕事", "お金", "家族", "恋愛", "学び", "遊び", "メモ"]);
  writeRows(ss, "週次", data.weekly, ["weekOf", "sales", "consults", "contracts", "done", "stopped", "bodyState", "nextTop", "letGo", "delegate"],
    ["週", "売上", "相談", "契約", "できたこと", "止まったこと", "カラダ", "来週やること", "手放す", "任せたい"]);
}

function writeRows(ss, sheetName, rows, keys, headers) {
  rows = rows || [];
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);
  sheet.clearContents();
  var out = [headers];
  rows.forEach(function (r) {
    out.push(keys.map(function (k) {
      var v = r[k];
      if (v === true) return "✓";
      if (v === false) return "";
      return v === undefined || v === null ? "" : v;
    }));
  });
  sheet.getRange(1, 1, out.length, headers.length).setValues(out);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
}
