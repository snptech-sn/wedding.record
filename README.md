<div align="center">
  <img src="./public/wedding-logo.svg" alt="Wedding Record System Logo" width="130" height="130" />
  <h1>កត់ត្រា - Wedding Record System</h1>
  <p><strong>កម្មវិធីកត់ត្រានិងគ្រប់គ្រងចំណងដៃ ភ្ញៀវកិត្តិយស និងរបាយការណ៍បោះពុម្ព</strong></p>
</div>

---

## 🌟 លក្ខណៈពិសេសចម្បង (Key Features)

- 📝 **កត់ត្រាចំណងដៃលឿនរហ័ស:** កត់ត្រាឈ្មោះភ្ញៀវ ចំនួនទឹកប្រាក់ (KHR / USD) និងស្ថានភាពបង់ប្រាក់ (សាច់ប្រាក់ ឬ ផ្ទេរប្រាក់តាម ABA/KHQR)
- 📊 **ផ្ទាំងរបាយការណ៍ស្ថិតិ:** គណនាផលបូកចំណូលសរុបជាប្រាក់រៀល និងដុល្លារភ្លាមៗ
- 🖨️ **ទំព័របោះពុម្ព (Print & PDF):** បោះពុម្ពបញ្ជីឈ្មោះភ្ញៀវ និងចំនួនប្រាក់ចំណងដៃយ៉ាងស្អាតជាមួយ Logo ផ្លូវការ
- 🖼️ **ការកំណត់ Logo ផ្ទាល់ខ្លួន:** អាច Upload រូបភាព Logo ផ្ទាល់ខ្លួនសម្រាប់កម្មវិធី (កំណត់សិទ្ធិសម្រាប់តែ Admin ជាន់ខ្ពស់)
- 🔒 **ប្រព័ន្ធការពារសិទ្ធិ (Role-Based Access Control):** Admin, Recorder, Viewer និងការកំណត់កូដ PIN សម្ងាត់
- ☁️ **Cloud Database & Offline Sync:** ដំណើរការបានទាំងលើ Cloud និង Offline ជាមួយ Local Storage

---

## 🚀 ការដាក់ដំណើរការលើ GitHub Pages (Deploy to GitHub Pages)

គម្រោងនេះមានផ្ទុក `.github/workflows/deploy.yml` ស្វ័យប្រវត្តិ។ នៅពេល Push ទៅកាន់ `main` branch:
1. GitHub Actions នឹងដំណើរការ `npm run build`
2. ឯកសារក្នុង `dist/` នឹងត្រូវយកទៅដាក់លើ GitHub Pages ដោយស្វ័យប្រវត្តិ
3. Logo និងរូបភាពទាំងអស់នឹងបង្ហាញយ៉ាងត្រឹមត្រូវដោយសារ relative path configuration (`base: './'`)

---

## 💻 ការរត់សាកល្បងនៅលើម៉ាស៊ីន (Local Development)

```bash
# ដំឡើង dependencies
npm install

# រត់កម្មវិធី
npm run dev

# បង្កើត Build សម្រាប់ Production
npm run build
```
