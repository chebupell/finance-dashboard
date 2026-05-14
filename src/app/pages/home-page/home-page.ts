import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { TransactionData, TransactionService } from '../../services/transaction';

interface SummaryCard {
  title: string;
  amount: string;
  trend: 'up' | 'down' | 'flat';
}

const EXPENSE_LABELS = [
  'Labour',
  'Legal',
  'Production',
  'License',
  'Facilities',
  'Taxes',
  'Insurance',
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
  imports: [Sidebar, BaseChartDirective],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit {
  private readonly transactionService = inject(TransactionService);
  private readonly collapsedCount = 5;

  readonly transactions = signal<TransactionData[]>([]);
  readonly isLoading = signal(false);
  readonly isExpanded = signal(false);
  readonly isAddTransactionMenuOpen = signal(false);

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

  readonly visibleTransactions = computed(() =>
    this.isExpanded() ? this.transactions() : this.transactions().slice(0, this.collapsedCount),
  );

  readonly summaryCards = computed<SummaryCard[]>(() => [
    { title: 'Total Balance', amount: `$${this.balance().toLocaleString()}`, trend: 'flat' },
    { title: 'Monthly Income', amount: `$${this.income().toLocaleString()}`, trend: 'up' },
    { title: 'Monthly Expenses', amount: `$${this.expenses().toLocaleString()}`, trend: 'down' },
    { title: 'Savings', amount: `$${(this.income() * 0.2).toLocaleString()}`, trend: 'flat' },
  ]);

  // Line chart — balance by month
  readonly balanceOverviewData = computed<ChartConfiguration<'line'>['data']>(() => {
    const monthlyBalance = Array(12).fill(0);
    this.transactions().forEach((t) => {
      const month = new Date(t.date ?? '').getMonth();
      if (!isNaN(month)) {
        monthlyBalance[month] += t.type === 'income' ? t.amount : -t.amount;
      }
    });
    return {
      labels: [...MONTHS],
      datasets: [{ data: monthlyBalance, tension: 0.4, fill: true }],
    };
  });

  readonly balanceOverviewOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  readonly balanceOverviewType: ChartConfiguration<'line'>['type'] = 'line';

  // Doughnut chart — expenses by category
  readonly pieChartData = computed<ChartConfiguration<'doughnut'>['data']>(() => {
    const expenseTransactions = this.transactions().filter((t) => t.type === 'expense');
    const data = EXPENSE_LABELS.map((label) =>
      expenseTransactions.filter((t) => t.category === label).reduce((sum, t) => sum + t.amount, 0),
    );
    return {
      labels: [...EXPENSE_LABELS],
      datasets: [{ data }],
    };
  });

  readonly pieChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
  };

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
}
