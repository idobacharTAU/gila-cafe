/* מדידת המרות לגוגל אדס: לחיצה על טלפון / וואטסאפ.
   לא פעיל עד שממלאים את AW_ID ו-LABELS (נוצרים בגוגל אדס, יעדים > המרות). */
(function () {
  var CFG = { AW_ID: "", LABEL_CALL: "", LABEL_WA: "" };
  if (!CFG.AW_ID) return;
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + CFG.AW_ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag("js", new Date());
  gtag("config", CFG.AW_ID);
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a");
    if (!a) return;
    var h = a.getAttribute("href") || "";
    var label = h.indexOf("tel:") === 0 ? CFG.LABEL_CALL : h.indexOf("wa.me") > -1 ? CFG.LABEL_WA : "";
    if (label) gtag("event", "conversion", { send_to: CFG.AW_ID + "/" + label });
  }, true);
})();
