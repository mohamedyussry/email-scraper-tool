// وظيفة لاستخراج جميع الإيميلات من نص الصفحة
function extractEmailsFromPage() {
    const bodyText = document.body.innerText; // الحصول على النص الكامل للصفحة
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = bodyText.match(emailPattern);
    return emails ? Array.from(new Set(emails)) : []; // إزالة التكرارات
  }
  
  // الاستماع للرسالة القادمة من الخلفية لبدء استخراج الإيميلات
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrapeEmails") {
      const emails = extractEmailsFromPage();
      sendResponse({ emails });
    }
  });
  