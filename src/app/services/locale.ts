import { Injectable, signal } from '@angular/core';

export type AppLocale = 'en' | 'ru';

const TRANSLATIONS = {
  en: {
    'app.title': 'Personal Finance Dashboard',
    'nav.dashboard': 'Dashboard',
    'nav.transactions': 'Transactions',
    'nav.goals': 'Goals',
    'nav.settings': 'Settings',
    'header.login': 'Log In',
    'header.signup': 'Sign Up',
    'header.logout': 'Log Out',
    'header.themeToDark': 'Switch to dark theme',
    'header.themeToLight': 'Switch to light theme',
    'dashboard.search': 'Search transactions',
    'dashboard.addTransaction': 'Add Transaction',
    'dashboard.addGoal': 'Add Goal',
    'dashboard.recentTransactions': 'Recent Transactions',
    'dashboard.transactions': 'Transactions',
    'dashboard.searchResults': 'Search Results',
    'summary.totalBalance': 'Total Balance',
    'summary.monthlyIncome': 'Monthly Income',
    'summary.monthlyExpenses': 'Monthly Expenses',
    'summary.savings': 'Savings',
    'table.date': 'Date',
    'table.category': 'Category',
    'table.description': 'Description',
    'table.amount': 'Amount',
    'table.status': 'Status',
    'table.actions': 'Actions',
    'table.remove': 'Remove',
    'table.removing': 'Removing…',
    'table.empty': 'No transactions yet.',
    'table.emptySearch': 'No transactions match your search.',
    'status.income': 'Income',
    'status.expense': 'Expense',
    'viewAll': 'View All',
    'showLess': 'Show Less',
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your profile and preferences',
    'settings.profile': 'Profile',
    'settings.account': 'Account',
    'settings.preferences': 'Preferences',
    'settings.avatar': 'Avatar',
    'settings.changeAvatar': 'Change photo',
    'settings.removeAvatar': 'Remove photo',
    'settings.name': 'Display name',
    'settings.namePlaceholder': 'Your name',
    'settings.email': 'Email address',
    'settings.emailPlaceholder': 'your@email.com',
    'settings.password': 'Change password',
    'settings.currentPassword': 'Current password',
    'settings.newPassword': 'New password',
    'settings.confirmPassword': 'Confirm new password',
    'settings.theme': 'Theme',
    'settings.themeLight': 'Light',
    'settings.themeDark': 'Dark',
    'settings.language': 'Language',
    'settings.languageEn': 'English',
    'settings.languageRu': 'Russian',
    'settings.save': 'Save changes',
    'settings.saving': 'Saving…',
    'settings.saved': 'Changes saved successfully.',
    'settings.avatarSaved': 'Avatar updated.',
    'settings.error': 'Something went wrong. Please try again.',
    'settings.errorPassword': 'Current password is incorrect.',
    'settings.errorEmail': 'This email is already in use.',
    'settings.nameRequired': 'Name is required.',
    'settings.emailRequired': 'Email is required.',
    'settings.emailInvalid': 'Enter a valid email address.',
    'settings.passwordRequired': 'Password is required.',
    'settings.passwordMin': 'Password must be at least 6 characters.',
    'settings.passwordMismatch': 'Passwords do not match.',
    'settings.avatarHint': 'JPG or PNG, up to 2 MB',
  },
  ru: {
    'app.title': 'Личный финансовый дашборд',
    'nav.dashboard': 'Панель',
    'nav.transactions': 'Транзакции',
    'nav.goals': 'Цели',
    'nav.settings': 'Настройки',
    'header.login': 'Войти',
    'header.signup': 'Регистрация',
    'header.logout': 'Выйти',
    'header.themeToDark': 'Включить тёмную тему',
    'header.themeToLight': 'Включить светлую тему',
    'dashboard.search': 'Поиск транзакций',
    'dashboard.addTransaction': 'Добавить транзакцию',
    'dashboard.addGoal': 'Добавить цель',
    'dashboard.recentTransactions': 'Недавние транзакции',
    'dashboard.transactions': 'Транзакции',
    'dashboard.searchResults': 'Результаты поиска',
    'summary.totalBalance': 'Общий баланс',
    'summary.monthlyIncome': 'Доход за месяц',
    'summary.monthlyExpenses': 'Расходы за месяц',
    'summary.savings': 'Накопления',
    'table.date': 'Дата',
    'table.category': 'Категория',
    'table.description': 'Описание',
    'table.amount': 'Сумма',
    'table.status': 'Статус',
    'table.actions': 'Действия',
    'table.remove': 'Удалить',
    'table.removing': 'Удаление…',
    'table.empty': 'Транзакций пока нет.',
    'table.emptySearch': 'Нет транзакций по вашему запросу.',
    'status.income': 'Доход',
    'status.expense': 'Расход',
    'viewAll': 'Показать все',
    'showLess': 'Свернуть',
    'settings.title': 'Настройки',
    'settings.subtitle': 'Управление профилем и предпочтениями',
    'settings.profile': 'Профиль',
    'settings.account': 'Аккаунт',
    'settings.preferences': 'Предпочтения',
    'settings.avatar': 'Аватар',
    'settings.changeAvatar': 'Сменить фото',
    'settings.removeAvatar': 'Удалить фото',
    'settings.name': 'Отображаемое имя',
    'settings.namePlaceholder': 'Ваше имя',
    'settings.email': 'Email',
    'settings.emailPlaceholder': 'your@email.com',
    'settings.password': 'Смена пароля',
    'settings.currentPassword': 'Текущий пароль',
    'settings.newPassword': 'Новый пароль',
    'settings.confirmPassword': 'Подтвердите пароль',
    'settings.theme': 'Тема',
    'settings.themeLight': 'Светлая',
    'settings.themeDark': 'Тёмная',
    'settings.language': 'Язык',
    'settings.languageEn': 'Английский',
    'settings.languageRu': 'Русский',
    'settings.save': 'Сохранить',
    'settings.saving': 'Сохранение…',
    'settings.saved': 'Изменения успешно сохранены.',
    'settings.avatarSaved': 'Аватар обновлён.',
    'settings.error': 'Что-то пошло не так. Попробуйте снова.',
    'settings.errorPassword': 'Неверный текущий пароль.',
    'settings.errorEmail': 'Этот email уже используется.',
    'settings.nameRequired': 'Имя обязательно.',
    'settings.emailRequired': 'Email обязателен.',
    'settings.emailInvalid': 'Введите корректный email.',
    'settings.passwordRequired': 'Пароль обязателен.',
    'settings.passwordMin': 'Пароль должен быть не менее 6 символов.',
    'settings.passwordMismatch': 'Пароли не совпадают.',
    'settings.avatarHint': 'JPG или PNG, до 2 МБ',
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS.en;

@Injectable({ providedIn: 'root' })
export class Locale {
  private readonly storageKey = 'finance-dashboard-locale';

  readonly current = signal<AppLocale>(this.readStoredLocale());

  constructor() {
    document.documentElement.lang = this.current();
  }

  t(key: TranslationKey): string {
    const locale = this.current();
    return TRANSLATIONS[locale][key];
  }

  setLocale(locale: AppLocale): void {
    this.current.set(locale);
    localStorage.setItem(this.storageKey, locale);
    document.documentElement.lang = locale;
  }

  private readStoredLocale(): AppLocale {
    const stored = localStorage.getItem(this.storageKey);
    return stored === 'ru' ? 'ru' : 'en';
  }
}
