// تحميل ملف اللغة
fetch('lang.json')
  .then(response => response.json())
  .then(translations => {
    const languageSelect = document.getElementById('languageSelect');
    let currentLang = 'en'; // اللغة الافتراضية

    // تغيير النصوص بناءً على اللغة المختارة
    function applyTranslations(lang) {
      document.getElementById('title').textContent = translations[lang].title;
      document.getElementById('domainFilter').placeholder = translations[lang].filter_placeholder;
      document.getElementById('scrapeBtn').innerHTML = `<i class="fas fa-search"></i> ${translations[lang].scrape_button}`;
      document.getElementById('copyBtn').innerHTML = `<i class="fas fa-copy"></i> ${translations[lang].copy_button}`;
      document.getElementById('downloadBtn').innerHTML = `<i class="fas fa-download"></i> ${translations[lang].download_button}`;
      document.getElementById('emailCount').textContent = `${translations[lang].emails_found} 0`;
    }

    // تطبيق اللغة الافتراضية
    applyTranslations(currentLang);

    // تغيير اللغة عند تغيير القائمة المنسدلة
    languageSelect.addEventListener('change', function () {
      currentLang = languageSelect.value;
      applyTranslations(currentLang);
    });

    // الكود الموجود لبدء استخراج الإيميلات
    document.getElementById('scrapeBtn').addEventListener('click', function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "scrapeEmails" }, function (response) {
          if (response && response.emails) {
            const domainFilter = document.getElementById('domainFilter').value;
            const filteredEmails = domainFilter ? response.emails.filter(email => email.includes(domainFilter)) : response.emails;
            displayEmails(filteredEmails);
          } else {
            displayEmails([]);
          }
        });
      });
    });

    document.getElementById('copyBtn').addEventListener('click', function () {
      const emails = Array.from(document.querySelectorAll('#email-list p')).map(p => p.textContent);
      const emailText = emails.join('\n');

      if (emails.length > 0) {
        navigator.clipboard.writeText(emailText).then(() => {
          alert('Emails copied to clipboard!');
        }).catch(err => {
          alert('Failed to copy emails: ', err);
        });
      } else {
        alert('No emails to copy.');
      }
    });

    document.getElementById('downloadBtn').addEventListener('click', function () {
      const emails = Array.from(document.querySelectorAll('#email-list p')).map(p => p.textContent);
      const emailText = emails.join('\n');

      if (emails.length > 0) {
        const blob = new Blob([emailText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'emails.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // تحرير الذاكرة المستخدمة في الـ Blob
      } else {
        alert('No emails to download.');
      }
    });

    function displayEmails(emails) {
      const emailListDiv = document.getElementById('email-list');
      emailListDiv.innerHTML = ''; // مسح المحتويات القديمة

      document.getElementById('emailCount').textContent = `${translations[currentLang].emails_found} ${emails.length}`;

      if (emails.length > 0) {
        emails.forEach(email => {
          const p = document.createElement('p');
          p.textContent = email;
          emailListDiv.appendChild(p);
        });
      } else {
        emailListDiv.textContent = translations[currentLang].no_emails;
      }
    }
  });
