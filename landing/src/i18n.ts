export type Lang = 'pl' | 'en';

export const APK_FILE =
  'https://github.com/multicolor-rgb/krokomierz/releases/latest/download/krokomierz-latest.apk';
export const APK_SIZE = '3,6 MB';
export const APK_VERSION = '1.1.1';
export const APK_DATE = '28.10.2026';
export const SHA256 =
  'https://github.com/multicolor-rgb/krokomierz/releases/latest/download/krokomierz-latest.apk.sha256';
export const PWA_URL = `${import.meta.env.BASE_URL}app/`;
export const APP_URL = 'https://krokomierz.multidev.top';

export const copy = {
  pl: {
    metaTitle: 'Krokomierz — każdy krok się liczy',
    metaDesc:
      'Nowoczesny krokomierz na Androida i w przeglądarce. Cele, statystyki, osiągnięcia i przypomnienia. Bez konta, bez chmury, bez reklam.',
    nav: { features: 'Funkcje', how: 'Jak działa', screens: 'Zrzuty', faq: 'FAQ', download: 'Pobierz' },
    hero: {
      badge: 'Nowość · wersja 1.1.1',
      titleA: 'Każdy krok',
      titleB: 'się liczy.',
      sub: 'Nowoczesny krokomierz na Androida i w przeglądarce. Cele, statystyki, osiągnięcia i przypomnienia — bez konta, bez chmury, bez reklam.',
      cta: 'Pobierz APK',
      ctaSub: 'Wersja w przeglądarce',
      meta: 'Android 6+ · dane tylko na telefonie',
      free: '100% za darmo',
    },
    float: {
      steps: 'kroków dziś',
      badge: 'Nowe osiągnięcie',
      badgeName: 'Tydzień mocy',
      streak: 'dni serii',
      goal: 'celu dziennego',
    },
    trust: [
      { value: '28', label: 'osiągnięć do zdobycia' },
      { value: '100%', label: 'działa offline' },
      { value: '0', label: 'kont i reklam' },
      { value: '5 min', label: 'konfiguracji' },
    ],
    features: {
      title: 'Wszystko, czego potrzebujesz',
      sub: 'Zaprojektowany jak najlepsze aplikacje fitness, ale bez zbędnego balastu.',
      items: [
        {
          icon: '🏃',
          title: 'Licznik w tle',
          desc: 'W wersji APK sensor systemowy liczy kroki nawet przy zgaszonym ekranie i zamkniętej aplikacji.',
        },
        {
          icon: '🎯',
          title: 'Mądre cele',
          desc: 'Zalecany cel wyliczamy z wieku, wzrostu, wagi, aktywności i BMI. Cel rośnie razem z Tobą.',
        },
        {
          icon: '📊',
          title: 'Statystyki',
          desc: 'Dzień, tydzień i miesiąc. Dystans, kalorie, aktywne minuty, rekordy i skuteczność celu.',
        },
        {
          icon: '🏆',
          title: '28 osiągnięć',
          desc: 'Od pierwszego tysiąca po milion kroków. Serie, rekordy i odznaki, które naprawdę motywują.',
        },
        {
          icon: '🔔',
          title: 'Przypomnienia',
          desc: 'Wybierz godzinę i dni tygodnia. W APK powiadomienia działają nawet przy zamkniętej aplikacji.',
        },
        {
          icon: '🔒',
          title: 'Pełna prywatność',
          desc: 'Wszystkie dane zostają na Twoim urządzeniu. Bez konta, bez chmury, bez śledzenia.',
        },
      ],
    },
    how: {
      title: 'Trzy kroki do ruchu',
      sub: 'Konfiguracja zajmuje mniej niż pięć minut.',
      steps: [
        { n: '01', title: 'Pobierz i zainstaluj', desc: 'Pobierz APK, zezwól na instalację z nieznanych źródeł i otwórz aplikację.' },
        { n: '02', title: 'Skonfiguruj profil', desc: 'Podaj wiek, wzrost, wagę i cel. Krokomierz wyliczy zalecaną liczbę kroków.' },
        { n: '03', title: 'Idź i zbieraj', desc: 'Włącz liczenie w tle i ruszaj. Statystyki, serie i odznaki pojawiają się same.' },
      ],
    },
    screens: {
      title: 'Zobacz, jak to wygląda',
      sub: 'Ciemny, sportowy interfejs zaprojektowany na telefon.',
      tabs: { home: 'Pulpit', tracker: 'Tracker', stats: 'Statystyki', badges: 'Osiągnięcia' },
      note: 'Zrzuty z prawdziwej aplikacji.',
    },
    badges: {
      title: 'Osiągnięcia, które motywują',
      sub: 'Każda odznaka to konkretny cel. Zdobywaj je krok po kroku.',
      names: ['Pierwszy tysiąc', 'Dziesiątka', 'Rozpęd', 'Tydzień mocy', 'Perfekcyjny tydzień', 'Milion kroków', 'Sto kilometrów', 'Nocny marek'],
      cta: 'Zobacz wszystkie 28',
    },
    privacy: {
      title: 'Twoje dane zostają na Twoim telefonie',
      text: 'Krokomierz nie wymaga konta i nie wysyła danych na serwer. Historia, profil i osiągnięcia są zapisane lokalnie — możesz je w każdej chwili wyeksportować lub usunąć.',
      points: ['Bez rejestracji i logowania', 'Eksport i import danych (JSON)', 'Działa całkowicie offline'],
    },
    download: {
      title: 'Gotowy na pierwszy krok?',
      sub: 'Pobierz APK bezpośrednio — bez sklepu, bez konta, bez czekania.',
      apk: 'Pobierz APK',
      pwa: 'Otwórz wersję PWA',
      qr: 'Zeskanuj i pobierz',
      version: 'Wersja',
      size: 'Rozmiar',
      updated: 'Aktualizacja',
      requirements: 'Android 6.0+',
      sha: 'Suma kontrolna SHA-256',
      installTitle: 'Jak zainstalować APK',
      install: [
        'Pobierz plik APK na telefon.',
        'W ustawieniach zezwól na instalację z nieznanych źródeł dla przeglądarki.',
        'Otwórz pobrany plik i wybierz „Zainstaluj”.',
      ],
      pwaNote: 'Wolisz przeglądarkę? Otwórz wersję PWA i dodaj ją do ekranu głównego.',
      release: 'Wszystkie wersje na GitHubie',
    },
    faq: {
      title: 'Częste pytania',
      items: [
        {
          q: 'Czy aplikacja liczy kroki w tle?',
          a: 'Tak, w wersji APK. Używa systemowego sensora kroków i usługi działającej w tle, więc liczy również przy zgaszonym ekranie i zamkniętej aplikacji. Wersja przeglądarkowa liczy tylko przy otwartej aplikacji.',
        },
        {
          q: 'Czy moje dane są wysyłane na serwer?',
          a: 'Nie. Profil, historia i osiągnięcia są przechowywane wyłącznie na urządzeniu. Aplikacja nie wymaga konta i działa offline.',
        },
        {
          q: 'Jak działa zalecany cel kroków?',
          a: 'Bazę ustalamy na podstawie wieku, a następnie korygujemy ją o poziom aktywności, BMI i wybrany cel. Gdy regularnie osiągasz cel, aplikacja może zwiększyć go o 5% — maksymalnie o 20%.',
        },
        {
          q: 'Czy jest wersja na iPhone’a?',
          a: 'Tak, jako PWA w Safari. Apple nie udostępnia przeglądarkom dostępu do systemowego licznika kroków, więc w wersji web liczenie działa przy otwartej aplikacji. Wersja APK jest przeznaczona na Androida.',
        },
        {
          q: 'Czy APK jest bezpieczny?',
          a: 'Kod jest otwarty na GitHubie, a plik jest podpisany kluczem release. Przy instalacji poza sklepem system może wyświetlić ostrzeżenie — to normalne dla plików spoza Google Play.',
        },
        {
          q: 'Jak aktualizować aplikację?',
          a: 'Pobierz nowszą wersję APK z tej strony i zainstaluj ją na starszej — dane zostaną zachowane. Aplikacja sama poinformuje o dostępnej aktualizacji.',
        },
      ],
    },
    footer: {
      tagline: 'Nowoczesny krokomierz. Twoje dane, Twoje zasady.',
      product: 'Produkt',
      resources: 'Zasoby',
      legal: 'Informacje',
      download: 'Pobierz APK',
      pwa: 'Wersja PWA',
      github: 'GitHub',
      privacy: 'Prywatność',
      license: 'Licencja MIT',
      contact: 'Kontakt',
      note: 'Zbudowane z myślą o ruchu. © 2026 Krokomierz.',
    },
  },
  en: {
    metaTitle: 'Krokomierz — every step counts',
    metaDesc:
      'A modern step counter for Android and the web. Goals, stats, achievements and reminders. No account, no cloud, no ads.',
    nav: { features: 'Features', how: 'How it works', screens: 'Screens', faq: 'FAQ', download: 'Download' },
    hero: {
      badge: 'New · version 1.1.1',
      titleA: 'Every step',
      titleB: 'counts.',
      sub: 'A modern step counter for Android and the web. Goals, stats, achievements and reminders — no account, no cloud, no ads.',
      cta: 'Download APK',
      ctaSub: 'Open web version',
      meta: 'Android 6+ · data stays on your phone',
      free: '100% free',
    },
    float: {
      steps: 'steps today',
      badge: 'New achievement',
      badgeName: 'Power Week',
      streak: 'day streak',
      goal: 'of daily goal',
    },
    trust: [
      { value: '28', label: 'achievements to earn' },
      { value: '100%', label: 'works offline' },
      { value: '0', label: 'accounts & ads' },
      { value: '5 min', label: 'setup' },
    ],
    features: {
      title: 'Everything you need',
      sub: 'Designed like the best fitness apps, without the extra weight.',
      items: [
        {
          icon: '🏃',
          title: 'Background counting',
          desc: 'In the APK, the system step sensor keeps counting even with the screen off and the app closed.',
        },
        {
          icon: '🎯',
          title: 'Smart goals',
          desc: 'Your recommended goal comes from age, height, weight, activity and BMI. It grows with you.',
        },
        {
          icon: '📊',
          title: 'Statistics',
          desc: 'Day, week and month. Distance, calories, active minutes, records and goal success.',
        },
        {
          icon: '🏆',
          title: '28 achievements',
          desc: 'From the first thousand to a million steps. Streaks, records and badges that actually motivate.',
        },
        {
          icon: '🔔',
          title: 'Reminders',
          desc: 'Pick a time and weekdays. In the APK notifications work even when the app is closed.',
        },
        {
          icon: '🔒',
          title: 'Full privacy',
          desc: 'All data stays on your device. No account, no cloud, no tracking.',
        },
      ],
    },
    how: {
      title: 'Three steps to move',
      sub: 'Setup takes less than five minutes.',
      steps: [
        { n: '01', title: 'Download & install', desc: 'Get the APK, allow installs from unknown sources and open the app.' },
        { n: '02', title: 'Set up your profile', desc: 'Enter age, height, weight and goal. We calculate your recommended steps.' },
        { n: '03', title: 'Walk & collect', desc: 'Turn on background counting and go. Stats, streaks and badges appear on their own.' },
      ],
    },
    screens: {
      title: 'See how it looks',
      sub: 'A dark, sporty interface designed for mobile.',
      tabs: { home: 'Home', tracker: 'Tracker', stats: 'Stats', badges: 'Achievements' },
      note: 'Screenshots from the real app.',
    },
    badges: {
      title: 'Achievements that motivate',
      sub: 'Every badge is a concrete goal. Earn them step by step.',
      names: ['First Thousand', 'Ten K', 'Momentum', 'Power Week', 'Perfect Week', 'One Million', 'Hundred Klicks', 'Night Owl'],
      cta: 'See all 28',
    },
    privacy: {
      title: 'Your data stays on your phone',
      text: 'Krokomierz requires no account and sends nothing to a server. Your history, profile and achievements are stored locally — export or delete them at any time.',
      points: ['No sign-up or login', 'Export and import data (JSON)', 'Works fully offline'],
    },
    download: {
      title: 'Ready for your first step?',
      sub: 'Download the APK directly — no store, no account, no waiting.',
      apk: 'Download APK',
      pwa: 'Open web version',
      qr: 'Scan to download',
      version: 'Version',
      size: 'Size',
      updated: 'Updated',
      requirements: 'Android 6.0+',
      sha: 'SHA-256 checksum',
      installTitle: 'How to install the APK',
      install: [
        'Download the APK on your phone.',
        'Allow installs from unknown sources for your browser.',
        'Open the downloaded file and tap “Install”.',
      ],
      pwaNote: 'Prefer the browser? Open the PWA and add it to your home screen.',
      release: 'All releases on GitHub',
    },
    faq: {
      title: 'Frequently asked questions',
      items: [
        {
          q: 'Does the app count steps in the background?',
          a: 'Yes, in the APK. It uses the system step sensor and a background service, so it counts with the screen off and the app closed. The web version only counts while the app is open.',
        },
        {
          q: 'Is my data sent to a server?',
          a: 'No. Your profile, history and achievements are stored only on your device. The app requires no account and works offline.',
        },
        {
          q: 'How is the recommended step goal calculated?',
          a: 'The base comes from your age and is adjusted for activity level, BMI and goal. If you consistently hit your goal, the app can raise it by 5% — up to 20%.',
        },
        {
          q: 'Is there an iPhone version?',
          a: 'Yes, as a PWA in Safari. Apple does not give browsers access to the system step counter, so the web version counts while the app is open. The APK is for Android.',
        },
        {
          q: 'Is the APK safe?',
          a: 'The source is open on GitHub and the file is signed with a release key. When installing outside a store, the system may show a warning — normal for files outside Google Play.',
        },
        {
          q: 'How do I update the app?',
          a: 'Download the newer APK from this page and install it over the old one — your data is preserved. The app also notifies you about updates.',
        },
      ],
    },
    footer: {
      tagline: 'A modern step counter. Your data, your rules.',
      product: 'Product',
      resources: 'Resources',
      legal: 'Information',
      download: 'Download APK',
      pwa: 'Web version',
      github: 'GitHub',
      privacy: 'Privacy',
      license: 'MIT License',
      contact: 'Contact',
      note: 'Built for movement. © 2026 Krokomierz.',
    },
  },
};

export type Copy = typeof copy.pl;
export const dictionaries: Record<Lang, Copy> = copy;
