# Ranking Supabase

1. Utworz projekt Supabase i uruchom migracje z `supabase/migrations/`.
2. W Auth wlacz Anonymous Sign-Ins.
3. W Auth > Bot and Abuse Protection wlacz Cloudflare Turnstile albo hCaptcha.
4. Uzupelnij `runtime-config.js` publicznym URL-em projektu i kluczem publishable/anon.
5. Przekazuj aktualny token CAPTCHA jako `window.KURS8_SUPABASE.captchaToken` przed pierwszym logowaniem anonimowym.

Klucz publishable/anon jest publiczny. Nie umieszczaj w froncie klucza `service_role`.
Tabele wynikow nie przyjmuja bezposrednich zapisow; klient korzysta wylacznie z RPC.
