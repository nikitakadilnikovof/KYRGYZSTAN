# KYRGYZSTAN

Статичный сайт путешествия по Кыргызстану на русском и турецком языках: Иссык-Куль, каньон «Сказка», водопады Барскоон и Ала-Арча.

[Русская версия](https://kyrgyzstan-nature-journey.iteachet-9750.chatgpt.site/ru/) · [Türkçe](https://kyrgyzstan-nature-journey.iteachet-9750.chatgpt.site/tr/)

GitHub Pages: [выбор языка](https://nikitakadilnikovof.github.io/KYRGYZSTAN/) · [русский](https://nikitakadilnikovof.github.io/KYRGYZSTAN/ru/) · [Türkçe](https://nikitakadilnikovof.github.io/KYRGYZSTAN/tr/).

## Публикация на GitHub Pages

Workflow `.github/workflows/pages.yml` при обновлении `main` собирает сайт и публикует содержимое `dist/`. В Settings → Pages источником должны быть **GitHub Actions**.

Сборка учитывает адрес хостинга и префикс репозитория через `SITE_ORIGIN` и `SITE_BASE_PATH`. GitHub Actions получает их из `actions/configure-pages`. Эти настройки применяются к страницам, изображениям, галереям, переключению языка и метаданным. Без переменных окружения сохраняется обычная сборка для корня домена.

Для локальной проверки адреса с префиксом в PowerShell:

```powershell
$env:SITE_ORIGIN = 'https://nikitakadilnikovof.github.io'
$env:SITE_BASE_PATH = '/KYRGYZSTAN'
$env:SITE_OUTPUT_DIR = 'output/pages-preview'
npm.cmd run build
npm.cmd run check
npm.cmd run preview
```

Откройте <http://127.0.0.1:4173/KYRGYZSTAN/ru/>. Для обычной локальной сборки откройте новый терминал без этих переменных.

## Локальный запуск

Требуется Node.js. В папке проекта выполните:

```sh
npm install
npm run build
npm run preview
```

Откройте <http://127.0.0.1:4173/ru/> или <http://127.0.0.1:4173/tr/>. После изменений исходников выполните `npm run build` и обновите страницу.

## Файлы проекта

- `src/content.mjs` — тексты на двух языках, контакты, маршрут и настройки сайта.
- `public/assets/` — оформление, JavaScript и оптимизированные реальные фотографии.
- `dist/` — готовая статичная сборка для хостинга.
- `output/advertising/` — рекламные изображения PNG/JPG, тексты публикаций и промпты генерации.
- `public/assets/photo-credits.json` — авторы фотографий, первоисточники и лицензии.
- `README.txt` — подробная инструкция и сведения о реализации.

## Проверка

```sh
npm run check
```

Браузерная проверка: `node scripts/browser-check.mjs` (Windows, установленный Microsoft Edge). Результаты находятся в `output/qa/`.

## Содержание и фотографии

Программа на 7 дней — пример для обсуждения с гидом. Конкретные горячие источники и остановка Ala-Kush уточняются. Формат помощи гида — дистанционная организация поездки.

Авторы и условия использования фотографий указаны в реестре и на страницах `/ru/credits/` и `/tr/credits/`. Рекламные композиции созданы с помощью ИИ на основе реальной фотографии Ала-Арчи: Vilya Shoni, CC BY-SA 4.0; производные рекламные материалы сохраняют эту лицензию.
