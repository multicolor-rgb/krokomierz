export type Lang = 'pl' | 'en';

export type Block =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'links'; items: { label: string; href: string }[] };

export interface Section {
  title: string;
  blocks: Block[];
}

export interface LegalDoc {
  eyebrow: string;
  title: string;
  updated: string;
  lead: string;
  sections: Section[];
  contact: string;
}

export const CONTACT_EMAIL = 'gramodrana1@gmail.com';

const p = (text: string): Block => ({ type: 'p', text });
const ul = (...items: string[]): Block => ({ type: 'ul', items });
const links = (...items: { label: string; href: string }[]): Block => ({ type: 'links', items });
const table = (head: string[], rows: string[][]): Block => ({ type: 'table', head, rows });

const GITHUB_PRIVACY = 'https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement';
const GOOGLE_PRIVACY = 'https://policies.google.com/privacy';
const UODO = 'https://uodo.gov.pl';
const RODO = 'https://eur-lex.europa.eu/eli/reg/2016/679/oj';
const EPRIVACY = 'https://eur-lex.europa.eu/eli/dir/2002/58/oj';

const privacyPl: LegalDoc = {
  eyebrow: 'Dokumenty prawne',
  title: 'Polityka prywatności',
  updated: 'Ostatnia aktualizacja: 29 października 2026 · wersja 1.0',
  lead: 'Krótko: nie prowadzimy serwera aplikacji, kont ani bazy danych. Dane Twojej aktywności zostają na Twoim urządzeniu. Poniżej wyjaśniamy wyjątki — hosting GitHub i kontakt e-mail.',
  contact: CONTACT_EMAIL,
  sections: [
    {
      title: '1. Administrator danych',
      blocks: [
        p('Administratorem danych jest projekt Krokomierz / multicolor-rgb. Kontakt: gramodrana1@gmail.com. Nie powołano inspektora ochrony danych.'),
        p('Polityka dotyczy strony internetowej, aplikacji PWA oraz aplikacji Android (APK) Krokomierz.'),
      ],
    },
    {
      title: '2. Najważniejsze: nie przechowujemy danych',
      blocks: [
        p('Nie prowadzimy serwera aplikacji, kont użytkowników ani bazy danych. Nie przechowujemy danych użytkowników na naszych serwerach.'),
        p('Profil, kroki, historia, osiągnięcia i ustawienia są zapisywane wyłącznie na Twoim urządzeniu — w IndexedDB, localStorage lub SharedPreferences (APK). Nie wysyłamy ich do nas.'),
      ],
    },
    {
      title: '3. Jakie dane przetwarzamy',
      blocks: [
        ul(
          'dane profilu: wiek, wzrost, waga, płeć, aktywność, cel — przechowywane lokalnie',
          'aktywność: kroki, dystans, kalorie, historia, serie i osiągnięcia — przechowywane lokalnie',
          'ustawienia: język, jednostki, cel, powiadomienia, czułość, długość kroku, tryb cichy — przechowywane lokalnie',
          'uprawnienia systemowe: aktywność fizyczna, powiadomienia, optymalizacja baterii — używane tylko do działania funkcji',
        ),
        p('Aplikacja nie wymaga konta. Dane aktywności nie są wysyłane na serwer administratora.'),
      ],
    },
    {
      title: '4. Hosting GitHub Pages i GitHub Releases',
      blocks: [
        p('Strona i pliki do pobrania są hostowane przez GitHub (GitHub Pages i GitHub Releases). GitHub może przetwarzać techniczne dane, takie jak adres IP, nagłówki HTTP, czas żądania i informacje o pobraniu pliku, w logach bezpieczeństwa i diagnostyce.'),
        p('Nie mamy dostępu do tych logów i nie wykorzystujemy ich do profilowania ani marketingu. GitHub działa jako dostawca hostingu na własnych zasadach.'),
        links({ label: 'GitHub Privacy Statement', href: GITHUB_PRIVACY }),
        p('GitHub może przetwarzać dane poza Europejskim Obszarem Gospodarczym, w tym w USA. Szczegóły mechanizmów prawnych i zabezpieczeń opisuje GitHub Privacy Statement.'),
      ],
    },
    {
      title: '5. Kontakt e-mail',
      blocks: [
        p('Jeśli napiszesz na gramodrana1@gmail.com, przetwarzamy Twój adres e-mail i treść wiadomości w celu odpowiedzi na pytanie lub zgłoszenie.'),
        p('Podstawa prawna: art. 6 ust. 1 lit. f RODO — uzasadniony interes polegający na obsłudze korespondencji.'),
        p('Korespondencja jest przechowywana w Gmail/Google do 12 miesięcy, chyba że dłuższy okres wynika z przepisów lub jest potrzebny do obrony przed roszczeniami.'),
        links({ label: 'Google Privacy Policy', href: GOOGLE_PRIVACY }),
      ],
    },
    {
      title: '6. Powiadomienia i uprawnienia',
      blocks: [
        p('Przypomnienia o krokach są planowane lokalnie przez system operacyjny. Nie używamy serwera push i nie wysyłamy danych o powiadomieniach na zewnątrz.'),
        p('Uprawnienie do aktywności fizycznej służy do odczytu kroków, powiadomienia do przypomnień, a wyłączenie optymalizacji baterii do działania trybu cichego. Możesz je wyłączyć w ustawieniach telefonu.'),
      ],
    },
    {
      title: '7. Podstawy prawne',
      blocks: [
        ul(
          'dane lokalne — przetwarzane na Twoim urządzeniu, poza serwerami administratora',
          'korespondencja e-mail — art. 6 ust. 1 lit. f RODO (uzasadniony interes)',
          'powiadomienia — zgoda wyrażana w systemie operacyjnym (art. 6 ust. 1 lit. a RODO)',
          'logi techniczne hostingu — uzasadniony interes dostawcy w zakresie bezpieczeństwa i działania usługi',
        ),
        links({ label: 'Rozporządzenie RODO (EUR-Lex)', href: RODO }),
      ],
    },
    {
      title: '8. Odbiorcy danych',
      blocks: [
        ul(
          'GitHub — hosting strony, PWA i plików APK/AAB',
          'Google — obsługa skrzynki e-mail Gmail',
          'dostawca systemu operacyjnego i przeglądarki — wyłącznie w zakresie lokalnego przechowywania i uprawnień',
        ),
        p('Nie sprzedajemy danych, nie udostępniamy ich reklamodawcom i nie tworzymy profili marketingowych.'),
      ],
    },
    {
      title: '9. Transfery poza EEA',
      blocks: [
        p('GitHub i Google mogą przetwarzać dane poza EEA, w tym w USA, na podstawie własnych mechanizmów prawnych (np. standardowe klauzule umowne lub Data Privacy Framework, jeśli mają zastosowanie). Aktualne informacje znajdują się w politykach prywatności tych dostawców.'),
      ],
    },
    {
      title: '10. Okres przechowywania',
      blocks: [
        ul(
          'dane aplikacji — do momentu usunięcia ich w aplikacji, wyczyszczenia danych witryny lub odinstalowania aplikacji',
          'korespondencja e-mail — do 12 miesięcy od zakończenia rozmowy',
          'logi techniczne hostingu — zgodnie z zasadami GitHub',
        ),
      ],
    },
    {
      title: '11. Twoje prawa',
      blocks: [
        p('Masz prawo do: dostępu do danych, sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych, sprzeciwu oraz cofnięcia zgody. W sprawach dotyczących danych aplikacji większość z tych praw realizujesz bezpośrednio na urządzeniu (reset danych, odinstalowanie).'),
        p('W sprawie korespondencji e-mail napisz na gramodrana1@gmail.com. Odpowiadamy bez zbędnej zwłoki, najpóźniej w ciągu 30 dni.'),
        p('Masz prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (UODO), ul. Stawki 2, 00-193 Warszawa.'),
        links({ label: 'UODO — strona oficjalna', href: UODO }),
      ],
    },
    {
      title: '12. Bezpieczeństwo',
      blocks: [
        p('Strona działa przez HTTPS. Dane aplikacji są przechowywane lokalnie i chronione przez zabezpieczenia urządzenia oraz przeglądarki. Nie gwarantujemy bezpieczeństwa urządzenia, które zostało zainfekowane lub udostępnione osobom trzecim.'),
      ],
    },
    {
      title: '13. Dzieci',
      blocks: [
        p('Aplikacja nie jest kierowana do dzieci poniżej 13 lat. Nie wymaga konta i nie zbiera danych osobowych na serwerze. Osoby niepełnoletnie powinny korzystać z aplikacji pod opieką rodzica lub opiekuna.'),
      ],
    },
    {
      title: '14. Brak profilowania i automatycznych decyzji',
      blocks: [
        p('Nie podejmujemy automatycznych decyzji wywołujących skutki prawne, nie profilujemy użytkowników i nie wykorzystujemy danych do reklam.'),
      ],
    },
    {
      title: '15. Zmiany polityki',
      blocks: [
        p('Polityka może się zmieniać wraz z rozwojem aplikacji lub zmianą przepisów. Nowa wersja jest publikowana na tej stronie wraz z datą aktualizacji.'),
      ],
    },
    {
      title: '16. Kontakt',
      blocks: [
        p('W sprawach prywatności i ochrony danych napisz na gramodrana1@gmail.com.'),
      ],
    },
  ],
};

const privacyEn: LegalDoc = {
  eyebrow: 'Legal documents',
  title: 'Privacy Policy',
  updated: 'Last updated: 29 October 2026 · version 1.0',
  lead: 'In short: we do not run an app server, user accounts or a database. Your activity data stays on your device. Below we explain the exceptions — GitHub hosting and email contact.',
  contact: CONTACT_EMAIL,
  sections: [
    {
      title: '1. Data controller',
      blocks: [
        p('The controller is the Krokomierz / multicolor-rgb project. Contact: gramodrana1@gmail.com. No Data Protection Officer has been appointed.'),
        p('This policy covers the website, the PWA and the Android APK.'),
      ],
    },
    {
      title: '2. Key point: we do not store your data',
      blocks: [
        p('We do not run an app server, user accounts or a database. We do not store user data on our servers.'),
        p('Your profile, steps, history, achievements and settings are stored only on your device — in IndexedDB, localStorage or SharedPreferences (APK). We do not send them to us.'),
      ],
    },
    {
      title: '3. What data is processed',
      blocks: [
        ul(
          'profile data: age, height, weight, sex, activity, goal — stored locally',
          'activity: steps, distance, calories, history, streaks and achievements — stored locally',
          'settings: language, units, goal, notifications, sensitivity, stride length, silent mode — stored locally',
          'system permissions: physical activity, notifications, battery optimisation — used only to provide features',
        ),
        p('The app requires no account. Activity data is not sent to the controller’s server.'),
      ],
    },
    {
      title: '4. GitHub Pages and GitHub Releases hosting',
      blocks: [
        p('The website and downloads are hosted by GitHub (GitHub Pages and GitHub Releases). GitHub may process technical data such as IP address, HTTP headers, request time and download information in security and diagnostic logs.'),
        p('We have no access to those logs and do not use them for profiling or marketing. GitHub acts as the hosting provider under its own terms.'),
        links({ label: 'GitHub Privacy Statement', href: GITHUB_PRIVACY }),
        p('GitHub may process data outside the European Economic Area, including in the USA. The legal mechanisms and safeguards are described in the GitHub Privacy Statement.'),
      ],
    },
    {
      title: '5. Email contact',
      blocks: [
        p('If you write to gramodrana1@gmail.com, we process your email address and the content of your message to reply to your question or report.'),
        p('Legal basis: Article 6(1)(f) GDPR — legitimate interest in handling correspondence.'),
        p('Correspondence is stored in Gmail/Google for up to 12 months, unless a longer period is required by law or to defend against claims.'),
        links({ label: 'Google Privacy Policy', href: GOOGLE_PRIVACY }),
      ],
    },
    {
      title: '6. Notifications and permissions',
      blocks: [
        p('Step reminders are scheduled locally by the operating system. We do not use a push server and do not send notification data anywhere.'),
        p('The physical activity permission is used to read steps, notifications for reminders, and disabling battery optimisation for silent mode. You can revoke them in your phone settings.'),
      ],
    },
    {
      title: '7. Legal bases',
      blocks: [
        ul(
          'local data — processed on your device, outside the controller’s servers',
          'email correspondence — Article 6(1)(f) GDPR (legitimate interest)',
          'notifications — consent given in the operating system (Article 6(1)(a) GDPR)',
          'hosting technical logs — the hosting provider’s legitimate interest in security and service operation',
        ),
        links({ label: 'GDPR (EUR-Lex)', href: RODO }),
      ],
    },
    {
      title: '8. Recipients',
      blocks: [
        ul(
          'GitHub — website, PWA and APK/AAB hosting',
          'Google — Gmail mailbox operation',
          'your operating system and browser provider — only for local storage and permissions',
        ),
        p('We do not sell data, share it with advertisers or create marketing profiles.'),
      ],
    },
    {
      title: '9. Transfers outside the EEA',
      blocks: [
        p('GitHub and Google may process data outside the EEA, including in the USA, under their own legal mechanisms (e.g. Standard Contractual Clauses or the Data Privacy Framework where applicable). Current details are available in their privacy policies.'),
      ],
    },
    {
      title: '10. Retention',
      blocks: [
        ul(
          'app data — until you delete it in the app, clear site data or uninstall the app',
          'email correspondence — up to 12 months after the conversation ends',
          'hosting technical logs — according to GitHub’s policies',
        ),
      ],
    },
    {
      title: '11. Your rights',
      blocks: [
        p('You have the right to access, rectify, erase, restrict processing, port your data, object and withdraw consent. For app data, you can exercise most of these rights directly on your device (reset data, uninstall).'),
        p('For email correspondence, write to gramodrana1@gmail.com. We respond without undue delay and within 30 days at the latest.'),
        p('You have the right to lodge a complaint with the Polish Data Protection Authority (UODO), ul. Stawki 2, 00-193 Warsaw, Poland.'),
        links({ label: 'UODO — official website', href: UODO }),
      ],
    },
    {
      title: '12. Security',
      blocks: [
        p('The site uses HTTPS. App data is stored locally and protected by your device and browser security. We cannot guarantee the security of a device that is infected or shared with third parties.'),
      ],
    },
    {
      title: '13. Children',
      blocks: [
        p('The app is not directed at children under 13. It requires no account and does not collect personal data on a server. Minors should use the app under parental or guardian supervision.'),
      ],
    },
    {
      title: '14. No profiling or automated decisions',
      blocks: [
        p('We do not make automated decisions with legal effects, do not profile users and do not use data for advertising.'),
      ],
    },
    {
      title: '15. Changes',
      blocks: [
        p('This policy may change as the app develops or the law changes. The new version is published on this page with an update date.'),
      ],
    },
    {
      title: '16. Contact',
      blocks: [
        p('For privacy and data protection matters, write to gramodrana1@gmail.com.'),
      ],
    },
  ],
};

const cookiesPl: LegalDoc = {
  eyebrow: 'Dokumenty prawne',
  title: 'Polityka cookies',
  updated: 'Ostatnia aktualizacja: 29 października 2026 · wersja 1.0',
  lead: 'Ta strona nie używa cookies śledzących, analityki ani reklam. Zapamiętujemy tylko język, ustawienia i zamknięcie komunikatu — lokalnie, w Twojej przeglądarce lub aplikacji.',
  contact: CONTACT_EMAIL,
  sections: [
    {
      title: '1. Czym są cookies i pamięć lokalna',
      blocks: [
        p('Cookies to małe pliki tekstowe zapisywane przez przeglądarkę. Pamięć lokalna (localStorage, IndexedDB) i cache Service Workera działają podobnie, ale służą do przechowywania danych aplikacji, a nie do śledzenia Cię między stronami.'),
      ],
    },
    {
      title: '2. Czy używamy cookies?',
      blocks: [
        p('Nie. Strona Krokomierz nie ustawia własnych cookies, nie używa Google Analytics, pikseli reklamowych ani innych trackerów. Serwer GitHub Pages nie ustawia cookies naszej witryny.'),
      ],
    },
    {
      title: '3. Pamięć lokalna, której używamy',
      blocks: [
        table(
          ['Nazwa / miejsce', 'Cel', 'Okres'],
          [
            ['krokomierz-lang', 'Zapamiętanie wybranego języka PL/EN', 'do wyczyszczenia danych witryny'],
            ['krokomierz-cookie-notice', 'Ukrycie komunikatu informacyjnego o cookies', 'do wyczyszczenia danych witryny'],
            ['IndexedDB „krokomierz”', 'Profil, kroki, historia, osiągnięcia, ustawienia', 'do resetu w aplikacji lub wyczyszczenia danych'],
            ['Cache Storage / Service Worker', 'Pliki PWA potrzebne do działania offline', 'do wyczyszczenia danych witryny'],
            ['SharedPreferences (APK)', 'Ustawienia, licznik, tryb cichy, diagnostyka', 'do wyczyszczenia danych aplikacji / odinstalowania'],
          ],
        ),
      ],
    },
    {
      title: '4. GitHub Pages i logi techniczne',
      blocks: [
        p('GitHub jako dostawca hostingu może rejestrować techniczne dane (adres IP, nagłówki, czas żądania) w logach bezpieczeństwa. Nie są to cookies naszej strony i nie mamy do nich dostępu. Szczegóły opisuje GitHub Privacy Statement.'),
        links({ label: 'GitHub Privacy Statement', href: GITHUB_PRIVACY }),
      ],
    },
    {
      title: '5. Jak usunąć pamięć lokalną',
      blocks: [
        ul(
          'przeglądarka: Ustawienia → Prywatność → Dane witryn → Wyczyść dane dla krokomierz.multidev.top',
          'aplikacja: Ustawienia → Dane → Usuń wszystkie dane',
          'APK: Ustawienia Androida → Aplikacje → Krokomierz → Pamięć → Wyczyść dane',
          'odinstalowanie aplikacji usuwa dane aplikacji z urządzenia',
        ),
      ],
    },
    {
      title: '6. Zgody i ePrivacy',
      blocks: [
        p('Nie używamy nieistotnych cookies ani trackerów, więc nie wyświetlamy banera zgód „Akceptuj wszystkie”. Komunikat na stronie ma charakter informacyjny; jego zamknięcie zapisujemy w localStorage, aby nie pojawiał się przy każdym wejściu.'),
        p('Podstawą jest art. 5 ust. 3 dyrektywy ePrivacy oraz RODO. Dane lokalne są niezbędne do działania wybranej funkcji (język, ustawienia, offline).'),
        links({ label: 'Dyrektywa ePrivacy (EUR-Lex)', href: EPRIVACY }),
      ],
    },
    {
      title: '7. Linki zewnętrzne',
      blocks: [
        p('Strona linkuje do GitHuba i może zawierać linki do innych serwisów. Po przejściu do nich obowiązują ich własne polityki cookies i prywatności.'),
        links(
          { label: 'GitHub Privacy Statement', href: GITHUB_PRIVACY },
          { label: 'Google Privacy Policy', href: GOOGLE_PRIVACY },
        ),
      ],
    },
    {
      title: '8. Kontakt',
      blocks: [
        p('Pytania o cookies i prywatność: gramodrana1@gmail.com.'),
      ],
    },
    {
      title: '9. Zmiany',
      blocks: [
        p('Polityka cookies może się zmieniać wraz z rozwojem strony. Data aktualizacji jest podana na górze dokumentu.'),
      ],
    },
  ],
};

const cookiesEn: LegalDoc = {
  eyebrow: 'Legal documents',
  title: 'Cookie Policy',
  updated: 'Last updated: 29 October 2026 · version 1.0',
  lead: 'This site does not use tracking cookies, analytics or ads. We only remember your language, settings and the dismissal of this notice — locally, in your browser or app.',
  contact: CONTACT_EMAIL,
  sections: [
    {
      title: '1. What are cookies and local storage',
      blocks: [
        p('Cookies are small text files stored by your browser. Local storage (localStorage, IndexedDB) and Service Worker cache work in a similar way, but they store app data rather than tracking you across sites.'),
      ],
    },
    {
      title: '2. Do we use cookies?',
      blocks: [
        p('No. The Krokomierz site does not set its own cookies and does not use Google Analytics, advertising pixels or other trackers. The GitHub Pages server does not set cookies for our site.'),
      ],
    },
    {
      title: '3. Local storage we use',
      blocks: [
        table(
          ['Name / location', 'Purpose', 'Retention'],
          [
            ['krokomierz-lang', 'Remember the selected PL/EN language', 'until site data is cleared'],
            ['krokomierz-cookie-notice', 'Hide the informational cookie notice', 'until site data is cleared'],
            ['IndexedDB “krokomierz”', 'Profile, steps, history, achievements, settings', 'until app reset or site data is cleared'],
            ['Cache Storage / Service Worker', 'PWA files required for offline use', 'until site data is cleared'],
            ['SharedPreferences (APK)', 'Settings, step counter, silent mode, diagnostics', 'until app data is cleared / uninstall'],
          ],
        ),
      ],
    },
    {
      title: '4. GitHub Pages and technical logs',
      blocks: [
        p('GitHub as the hosting provider may log technical data (IP address, headers, request time) for security. These are not our site’s cookies and we have no access to them. See the GitHub Privacy Statement for details.'),
        links({ label: 'GitHub Privacy Statement', href: GITHUB_PRIVACY }),
      ],
    },
    {
      title: '5. How to delete local storage',
      blocks: [
        ul(
          'browser: Settings → Privacy → Site data → Clear data for krokomierz.multidev.top',
          'app: Settings → Data → Delete all data',
          'APK: Android Settings → Apps → Krokomierz → Storage → Clear data',
          'uninstalling the app removes app data from the device',
        ),
      ],
    },
    {
      title: '6. Consent and ePrivacy',
      blocks: [
        p('We do not use non-essential cookies or trackers, so we do not show an “Accept all” consent banner. The notice on the site is informational; its dismissal is stored in localStorage so it does not appear on every visit.'),
        p('The legal basis is Article 5(3) of the ePrivacy Directive and the GDPR. Local data is necessary for the selected feature (language, settings, offline).'),
        links({ label: 'ePrivacy Directive (EUR-Lex)', href: EPRIVACY }),
      ],
    },
    {
      title: '7. External links',
      blocks: [
        p('The site links to GitHub and may contain links to other services. Their own cookie and privacy policies apply after you leave our site.'),
        links(
          { label: 'GitHub Privacy Statement', href: GITHUB_PRIVACY },
          { label: 'Google Privacy Policy', href: GOOGLE_PRIVACY },
        ),
      ],
    },
    {
      title: '8. Contact',
      blocks: [
        p('Questions about cookies and privacy: gramodrana1@gmail.com.'),
      ],
    },
    {
      title: '9. Changes',
      blocks: [
        p('This cookie policy may change as the site develops. The update date is shown at the top of the document.'),
      ],
    },
  ],
};

export const legalDocs: Record<Lang, { privacy: LegalDoc; cookies: LegalDoc }> = {
  pl: { privacy: privacyPl, cookies: cookiesPl },
  en: { privacy: privacyEn, cookies: cookiesEn },
};

export const cookieNoticeCopy = {
  pl: {
    text: 'Ta strona nie używa cookies śledzących. Zapamiętujemy tylko język i ustawienia w localStorage.',
    accept: 'Rozumiem',
    more: 'Polityka cookies',
  },
  en: {
    text: 'This site does not use tracking cookies. We only remember your language and settings in localStorage.',
    accept: 'Got it',
    more: 'Cookie Policy',
  },
};
