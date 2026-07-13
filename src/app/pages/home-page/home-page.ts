import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Sidebar, SidebarNav } from '../../layout/sidebar/sidebar';
import { SettingsView } from './settings-view/settings-view';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { TransactionData, TransactionService } from '../../services/transaction';
import { Locale } from '../../services/locale';
import { Theme } from '../../services/theme';

interface SummaryCard {
  title: string;
  amount: string;
  trend: 'up' | 'down' | 'flat';
}

export interface FinancialGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
}

const GOALS_STORAGE_KEY = 'finance-dashboard-goals';
const GOAL_TRANSACTION_CATEGORY = 'Goals';

const GOAL_CATEGORIES = ['Savings', 'Travel', 'Transport', 'Education', 'Home', 'Other'] as const;

type GoalFundsMode = 'deposit' | 'withdraw';

const PIE_CHART_COLORS = [
  '#2f6bd1',
  '#4a8ae8',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#6366f1',
] as const;
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

@Component({
  selector: 'app-home-page',
  imports: [Sidebar, SettingsView, BaseChartDirective],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit {
  private readonly transactionService = inject(TransactionService);
  readonly locale = inject(Locale);
  private readonly theme = inject(Theme);
  private readonly collapsedCount = 5;

  readonly transactions = signal<TransactionData[]>([]);
  readonly searchQuery = signal('');
  readonly activeNav = signal<SidebarNav>('dashboard');
  readonly isLoading = signal(false);
  readonly isExpanded = signal(false);
  readonly isAddTransactionMenuOpen = signal(false);
  readonly isAddGoalMenuOpen = signal(false);
  readonly isGoalFundsMenuOpen = signal(false);
  readonly selectedGoalForFunds = signal<FinancialGoal | null>(null);
  readonly goalFundsMode = signal<GoalFundsMode>('deposit');
  readonly isGoalFundsSubmitting = signal(false);
  readonly isAddGoalSubmitting = signal(false);
  readonly deletingTransactionId = signal<number | null>(null);
  readonly deletingGoalId = signal<number | null>(null);
  readonly goals = signal<FinancialGoal[]>(this.loadGoals());
  readonly goalCategories = GOAL_CATEGORIES;

  readonly isGoalsView = computed(() => this.activeNav() === 'goals');
  readonly isSettingsView = computed(() => this.activeNav() === 'settings');

  readonly filteredTransactions = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return this.transactions();

    return this.transactions().filter((t) => this.transactionMatchesQuery(t, query));
  });

  readonly isSearching = computed(() => this.searchQuery().trim().length > 0);
  readonly isFullTransactionsView = computed(
    () => this.activeNav() === 'transactions' || this.isSearching(),
  );

  readonly income = computed(() =>
    this.transactions()
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
  );

  readonly expenses = computed(() =>
    this.transactions()
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
  );

  readonly balance = computed(() => this.income() - this.expenses());

  readonly visibleTransactions = computed(() => {
    const list = this.filteredTransactions();
    if (this.isFullTransactionsView() || this.isExpanded()) return list;
    return list.slice(0, this.collapsedCount);
  });

  readonly hasMoreTransactions = computed(
    () => !this.isFullTransactionsView() && this.filteredTransactions().length > this.collapsedCount,
  );

  readonly summaryCards = computed<SummaryCard[]>(() => {
    this.locale.current();
    return [
    { title: this.locale.t('summary.totalBalance'), amount: `$${this.balance().toLocaleString()}`, trend: 'flat' },
    { title: this.locale.t('summary.monthlyIncome'), amount: `$${this.income().toLocaleString()}`, trend: 'up' },
    { title: this.locale.t('summary.monthlyExpenses'), amount: `$${this.expenses().toLocaleString()}`, trend: 'down' },
    { title: this.locale.t('summary.savings'), amount: `$${(this.income() * 0.2).toLocaleString()}`, trend: 'flat' },
  ];
  });

  readonly goalSummaryCards = computed<SummaryCard[]>(() => {
    const list = this.goals();
    const totalTarget = list.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = list.reduce((sum, g) => sum + g.currentAmount, 0);
    const avgProgress =
      list.length === 0
        ? 0
        : Math.round(
            list.reduce((sum, g) => sum + this.goalProgress(g), 0) / list.length,
          );

    return [
      { title: 'Active Goals', amount: String(list.length), trend: 'flat' },
      { title: 'Total Target', amount: `$${totalTarget.toLocaleString()}`, trend: 'flat' },
      { title: 'Amount Saved', amount: `$${totalSaved.toLocaleString()}`, trend: 'up' },
      { title: 'Avg. Progress', amount: `${avgProgress}%`, trend: avgProgress >= 50 ? 'up' : 'down' },
    ];
  });

  readonly balanceOverviewData = computed<ChartConfiguration<'line'>['data']>(() => {
    this.theme.mode();
    const chartLine = this.readCssVar('--chart-line');
    const chartLineFill = this.readCssVar('--chart-line-fill');

    const now = new Date();
    const monthSlots = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        label: MONTHS[date.getMonth()],
        year: date.getFullYear(),
        month: date.getMonth(),
        balance: 0,
      };
    });

    this.transactions().forEach((t) => {
      const date = new Date(t.date ?? '');
      if (isNaN(date.getTime())) return;

      const slot = monthSlots.find(
        (s) => s.year === date.getFullYear() && s.month === date.getMonth(),
      );
      if (slot) {
        slot.balance += t.type === 'income' ? t.amount : -t.amount;
      }
    });

    return {
      labels: monthSlots.map((s) => s.label),
      datasets: [
        {
          data: monthSlots.map((s) => s.balance),
          tension: 0.4,
          fill: true,
          borderColor: chartLine,
          backgroundColor: chartLineFill,
          pointBackgroundColor: chartLine,
          pointBorderColor: chartLine,
        },
      ],
    };
  });

  readonly balanceOverviewOptions = computed<ChartConfiguration<'line'>['options']>(() => {
    this.theme.mode();
    const gridColor = this.readCssVar('--chart-grid');
    const textColor = this.readCssVar('--chart-text');

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor },
        },
        y: {
          ticks: { color: textColor },
          grid: { color: gridColor },
        },
      },
    };
  });

  readonly balanceOverviewType: ChartConfiguration<'line'>['type'] = 'line';

  readonly pieChartData = computed<ChartConfiguration<'doughnut'>['data']>(() => {
    const totals = new Map<string, number>();

    for (const transaction of this.transactions()) {
      const category = transaction.category?.trim() || 'Other';
      totals.set(category, (totals.get(category) ?? 0) + Number(transaction.amount));
    }

    const entries = Array.from(totals.entries())
      .filter(([, amount]) => amount > 0)
      .sort((a, b) => b[1] - a[1]);

    const labels = entries.map(([category]) => category);
    const data = entries.map(([, amount]) => amount);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: labels.map(
            (_, index) => PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
          ),
        },
      ],
    };
  });

  readonly pieChartKey = computed(() =>
    this.transactions()
      .map((transaction) => `${transaction.id}:${transaction.category}:${transaction.amount}:${transaction.type}`)
      .join('|'),
  );

  readonly pieChartOptions = computed<ChartConfiguration<'doughnut'>['options']>(() => {
    this.theme.mode();
    const textColor = this.readCssVar('--chart-text');

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor },
        },
      },
    };
  });

  readonly pieChartType: ChartConfiguration<'doughnut'>['type'] = 'doughnut';

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.isLoading.set(true);
    this.transactionService.getAll().subscribe({
      next: (data) => {
        this.transactions.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  deleteTransaction(id: number): void {
    if (this.deletingTransactionId() !== null) return;

    const transaction = this.transactions().find((t) => t.id === id);
    if (!transaction?.id) return;

    this.deletingTransactionId.set(id);
    this.transactionService.delete(id).subscribe({
      next: () => {
        this.transactions.update((prev) => prev.filter((t) => t.id !== id));
        if (transaction) {
          this.reverseGoalTransaction(transaction);
        }
        this.deletingTransactionId.set(null);
      },
      error: (err) => {
        console.error(err);
        this.deletingTransactionId.set(null);
      },
    });
  }

  addTransaction(form: HTMLFormElement): void {
    const formData = new FormData(form);
    const amount = Number(formData.get('amount'));
    const description = String(formData.get('description') ?? '');
    const category = String(formData.get('category') ?? '');
    const type = String(formData.get('status') ?? '') === 'Income' ? 'income' : 'expense';

    if (!amount || !type) return;

    this.transactionService
      .create({ amount, description, category, type: type as 'income' | 'expense' })
      .subscribe({
        next: (newTransaction) => {
          this.transactions.update((prev) => [newTransaction, ...prev]);
          form.reset();
          this.closeAddTransactionMenu();
        },
        error: (err) => console.error(err),
      });
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatAmount(amount: number): string {
    return `$${amount.toLocaleString()}`;
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    if (value.trim()) {
      this.activeNav.set('transactions');
    }
  }

  onNavChange(nav: SidebarNav): void {
    this.activeNav.set(nav);
    if (nav === 'dashboard' || nav === 'goals' || nav === 'settings') {
      this.searchQuery.set('');
    }
    if (nav !== 'goals') {
      this.isAddGoalMenuOpen.set(false);
      this.closeGoalFundsMenu();
    }
    if (nav !== 'dashboard') {
      this.isExpanded.set(false);
    }
  }

  t(key: Parameters<Locale['t']>[0]): string {
    return this.locale.t(key);
  }

  goalProgress(goal: FinancialGoal): number {
    if (goal.targetAmount <= 0) return 0;
    return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  }

  goalRemaining(goal: FinancialGoal): number {
    return Math.max(0, goal.targetAmount - goal.currentAmount);
  }

  isGoalComplete(goal: FinancialGoal): boolean {
    return goal.currentAmount >= goal.targetAmount;
  }

  addGoal(form: HTMLFormElement): void {
    if (this.isAddGoalSubmitting()) return;

    const formData = new FormData(form);
    const name = String(formData.get('name') ?? '').trim();
    const targetAmount = Number(formData.get('targetAmount'));
    const currentAmount = Math.min(Number(formData.get('currentAmount') ?? 0), targetAmount);
    const deadline = String(formData.get('deadline') ?? '');
    const category = String(formData.get('category') ?? 'Other');

    if (!name || !targetAmount || !deadline) return;

    const persistNewGoal = (): void => {
      const newGoal: FinancialGoal = {
        id: Date.now(),
        name,
        targetAmount,
        currentAmount,
        deadline,
        category,
      };

      this.goals.update((prev) => {
        const next = [newGoal, ...prev];
        this.persistGoals(next);
        return next;
      });
      form.reset();
      this.closeAddGoalMenu();
    };

    if (currentAmount <= 0) {
      persistNewGoal();
      return;
    }

    this.isAddGoalSubmitting.set(true);
    this.transactionService
      .create({
        amount: currentAmount,
        description: `Deposit to goal: ${name}`,
        category: GOAL_TRANSACTION_CATEGORY,
        type: 'expense',
      })
      .subscribe({
        next: (newTransaction) => {
          this.transactions.update((prev) => [newTransaction, ...prev]);
          persistNewGoal();
        },
        error: (err) => {
          console.error(err);
          this.isAddGoalSubmitting.set(false);
        },
      });
  }

  deleteGoal(id: number): void {
    if (this.deletingGoalId() !== null) return;

    const goal = this.goals().find((g) => g.id === id);
    if (!goal) return;

    if (goal.currentAmount <= 0) {
      this.removeGoal(id);
      return;
    }

    this.deletingGoalId.set(id);
    this.transactionService
      .create({
        amount: goal.currentAmount,
        description: `Withdrawal from goal: ${goal.name}`,
        category: GOAL_TRANSACTION_CATEGORY,
        type: 'income',
      })
      .subscribe({
        next: (newTransaction) => {
          this.transactions.update((prev) => [newTransaction, ...prev]);
          this.removeGoal(id);
          this.deletingGoalId.set(null);
        },
        error: (err) => {
          console.error(err);
          this.deletingGoalId.set(null);
        },
      });
  }

  private removeGoal(id: number): void {
    this.goals.update((prev) => {
      const next = prev.filter((g) => g.id !== id);
      this.persistGoals(next);
      return next;
    });
  }

  openAddGoalMenu(): void {
    this.isAddGoalMenuOpen.set(true);
  }

  closeAddGoalMenu(): void {
    this.isAddGoalMenuOpen.set(false);
    this.isAddGoalSubmitting.set(false);
  }

  openGoalFundsMenu(goal: FinancialGoal, mode: GoalFundsMode): void {
    this.selectedGoalForFunds.set(goal);
    this.goalFundsMode.set(mode);
    this.isGoalFundsMenuOpen.set(true);
  }

  closeGoalFundsMenu(): void {
    this.isGoalFundsMenuOpen.set(false);
    this.selectedGoalForFunds.set(null);
    this.isGoalFundsSubmitting.set(false);
  }

  goalFundsModalTitle(): string {
    const goal = this.selectedGoalForFunds();
    if (!goal) return 'Adjust Funds';
    return this.goalFundsMode() === 'deposit'
      ? `Add Funds to ${goal.name}`
      : `Withdraw from ${goal.name}`;
  }

  maxGoalFundsAmount(): number {
    const goal = this.selectedGoalForFunds();
    if (!goal) return 0;
    return this.goalFundsMode() === 'deposit'
      ? Math.max(0, goal.targetAmount - goal.currentAmount)
      : goal.currentAmount;
  }

  adjustGoalFunds(form: HTMLFormElement): void {
    const goal = this.selectedGoalForFunds();
    const mode = this.goalFundsMode();
    if (!goal || this.isGoalFundsSubmitting()) return;

    const amount = Number(new FormData(form).get('amount'));
    if (!amount || amount <= 0) return;

    const maxAmount = this.maxGoalFundsAmount();
    if (amount > maxAmount) return;

    const type: 'income' | 'expense' = mode === 'deposit' ? 'expense' : 'income';
    const description =
      mode === 'deposit'
        ? `Deposit to goal: ${goal.name}`
        : `Withdrawal from goal: ${goal.name}`;

    this.isGoalFundsSubmitting.set(true);
    this.transactionService
      .create({
        amount,
        description,
        category: GOAL_TRANSACTION_CATEGORY,
        type,
      })
      .subscribe({
        next: (newTransaction) => {
          const newCurrent =
            mode === 'deposit' ? goal.currentAmount + amount : goal.currentAmount - amount;

          this.transactions.update((prev) => [newTransaction, ...prev]);
          this.updateGoalAmount(goal.id, newCurrent);
          form.reset();
          this.closeGoalFundsMenu();
        },
        error: (err) => {
          console.error(err);
          this.isGoalFundsSubmitting.set(false);
        },
      });
  }

  private reverseGoalTransaction(transaction: TransactionData): void {
    if (transaction.category !== GOAL_TRANSACTION_CATEGORY) return;

    const depositMatch = transaction.description?.match(/^Deposit to goal: (.+)$/);
    const withdrawMatch = transaction.description?.match(/^Withdrawal from goal: (.+)$/);
    const goalName = depositMatch?.[1] ?? withdrawMatch?.[1];
    if (!goalName) return;

    const goal = this.goals().find((g) => g.name === goalName);
    if (!goal) return;

    const newCurrent = depositMatch
      ? goal.currentAmount - transaction.amount
      : goal.currentAmount + transaction.amount;

    this.updateGoalAmount(goal.id, newCurrent);
  }

  private updateGoalAmount(goalId: number, currentAmount: number): void {
    this.goals.update((prev) => {
      const next = prev.map((g) =>
        g.id === goalId ? { ...g, currentAmount: Math.max(0, currentAmount) } : g,
      );
      this.persistGoals(next);
      return next;
    });
  }

  private loadGoals(): FinancialGoal[] {
    try {
      const stored = localStorage.getItem(GOALS_STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored) as FinancialGoal[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private persistGoals(goals: FinancialGoal[]): void {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  }

  private transactionMatchesQuery(transaction: TransactionData, query: string): boolean {
    const description = (transaction.description ?? '').toLowerCase();
    const category = (transaction.category ?? '').toLowerCase();

    if (description.includes(query) || category.includes(query)) return true;

    if (!transaction.date) return false;

    const date = new Date(transaction.date);
    if (isNaN(date.getTime())) return false;

    if (
      this.getTransactionDateSearchVariants(date, transaction.date).some((variant) =>
        variant.includes(query),
      )
    ) {
      return true;
    }

    const parsedQuery = this.parseDateQuery(query);
    return parsedQuery ? this.dateMatchesParsedQuery(date, parsedQuery) : false;
  }

  private getTransactionDateSearchVariants(date: Date, dateStr: string): string[] {
    const day = String(date.getDate()).padStart(2, '0');
    const monthNum = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    const monthShort = MONTHS[date.getMonth()].toLowerCase();
    const monthLong = date.toLocaleDateString('en-GB', { month: 'long' }).toLowerCase();

    return [
      this.formatDate(dateStr).toLowerCase(),
      dateStr.toLowerCase(),
      `${day}.${monthNum}.${year}`,
      `${day}/${monthNum}/${year}`,
      `${day}-${monthNum}-${year}`,
      `${day}.${monthNum}`,
      `${day}/${monthNum}`,
      `${monthNum}.${year}`,
      `${monthNum}/${year}`,
      day,
      monthShort,
      monthLong,
      monthNum,
      year,
    ];
  }

  private parseDateQuery(
    query: string,
  ): { day?: number; month?: number; year?: number } | null {
    const fullMatch = query.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
    if (fullMatch) {
      return {
        day: Number(fullMatch[1]),
        month: Number(fullMatch[2]),
        year: this.normalizeSearchYear(Number(fullMatch[3])),
      };
    }

    const dayMonthMatch = query.match(/^(\d{1,2})[./-](\d{1,2})$/);
    if (dayMonthMatch) {
      return {
        day: Number(dayMonthMatch[1]),
        month: Number(dayMonthMatch[2]),
      };
    }

    const monthYearMatch = query.match(/^(\d{1,2})[./-](\d{2,4})$/);
    if (monthYearMatch) {
      return {
        month: Number(monthYearMatch[1]),
        year: this.normalizeSearchYear(Number(monthYearMatch[2])),
      };
    }

    return null;
  }

  private normalizeSearchYear(year: number): number {
    return year < 100 ? 2000 + year : year;
  }

  private dateMatchesParsedQuery(
    date: Date,
    parsed: { day?: number; month?: number; year?: number },
  ): boolean {
    if (parsed.day !== undefined && date.getDate() !== parsed.day) return false;
    if (parsed.month !== undefined && date.getMonth() + 1 !== parsed.month) return false;
    if (parsed.year !== undefined && date.getFullYear() !== parsed.year) return false;
    return true;
  }

  onViewAll(toggleButton: HTMLButtonElement): void {
    toggleButton.blur();
    this.isExpanded.update((v) => !v);
  }

  openAddTransactionMenu(): void {
    this.isAddTransactionMenuOpen.set(true);
  }

  closeAddTransactionMenu(): void {
    this.isAddTransactionMenuOpen.set(false);
  }

  private readCssVar(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
}
