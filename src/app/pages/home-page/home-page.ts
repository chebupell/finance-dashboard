import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

interface SummaryCard {
  title: string;
  amount: string;
  trend: 'up' | 'down' | 'flat';
}

interface TransactionItem {
  date: string;
  category: string;
  description: string;
  amount: string;
  status: 'Income' | 'Expense';
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, Sidebar, BaseChartDirective],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  private readonly collapsedCount = 5;

  private readonly balanceData = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1200, 1800, 1600];
  private readonly currentBalance = this.balanceData[this.balanceData.length - 1] ?? 0;
  private readonly previousBalance = this.balanceData[this.balanceData.length - 2] ?? this.currentBalance;
  private readonly balanceTrend: SummaryCard['trend'] =
    this.currentBalance > this.previousBalance
      ? 'up'
      : this.currentBalance < this.previousBalance
      ? 'down'
      : 'flat';

  transactions: TransactionItem[] = [
        {
          date: '21 Mar 2020',
          category: 'Labour',
          description: 'Payroll for operations team',
          amount: '$100',
          status: 'Expense',
        },
        {
          date: '21 Mar 2020',
          category: 'Rent',
          description: 'Loan deslones',
          amount: '$1,900',
          status: 'Income',
        },
        {
          date: '26 Mar 2020',
          category: 'Taxes',
          description: 'Quarterly tax payment',
          amount: '$1,450',
          status: 'Expense',
        },
        {
          date: '22 Mar 2020',
          category: 'Legal',
          description: 'Contract review retainer',
          amount: '$850',
          status: 'Expense',
        },
        {
          date: '23 Mar 2020',
          category: 'Production',
          description: 'Manufacturing batch materials',
          amount: '$1,600',
          status: 'Expense',
        },
        {
          date: '24 Mar 2020',
          category: 'License',
          description: 'Annual software license renewal',
          amount: '$1,200',
          status: 'Expense',
        },
        {
          date: '25 Mar 2020',
          category: 'Facilities',
          description: 'Office maintenance services',
          amount: '$980',
          status: 'Expense',
        },
        {
          date: '26 Mar 2020',
          category: 'Taxes',
          description: 'Quarterly tax payment',
          amount: '$1,450',
          status: 'Expense',
        },
        {
          date: '27 Mar 2020',
          category: 'Insurance',
          description: 'Business insurance premium',
          amount: '$200',
          status: 'Expense',
        },
        {
          date: '27 Mar 2020',
          category: 'Insurance',
          description: 'Business insurance premium',
          amount: '$2000',
          status: 'Expense',
        },
      ];

  private readonly expenseLabels = ['Labour', 'Legal', 'Production', 'License', 'Facilities', 'Taxes', 'Insurance'] as const;

  readonly balanceOverviewData: ChartConfiguration<'line'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        data: this.balanceData,
      },
    ],
  };
  readonly balanceOverviewOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };
  readonly balanceOverviewType: ChartConfiguration<'line'>['type'] = 'line';

  readonly pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };
  readonly pieChartType: ChartConfiguration<'doughnut'>['type'] = 'doughnut';

  isExpanded = false;
  isAddTransactionMenuOpen = false;

  get summaryCards(): SummaryCard[] {
    return [
      { title: 'Total Balance', amount: `$${this.currentBalance.toLocaleString()}`, trend: this.balanceTrend },
      { title: 'Monthly Income', amount: `$${this.currentBalance - this.previousBalance}`, trend: this.balanceTrend },
      { title: 'Monthly Expenses', amount: `$${this.expenseData.reduce((sum, item) => sum + item, 0)}`, trend: 'flat' },
      { title: 'Savings', amount: '$1,200', trend: 'flat' },
    ];
  }

  get pieChartData(): ChartConfiguration<'doughnut'>['data'] {
    return {
      labels: [...this.expenseLabels],
      datasets: [
        {
          data: this.expenseData,
        },
      ],
    };
  }

  get visibleTransactions(): TransactionItem[] {
    if (this.isExpanded) {
      return this.transactions;
    }
    return this.transactions.slice(0, this.collapsedCount);
  }

  private get expenses(): TransactionItem[] {
    return this.transactions.filter((transaction) => transaction.status === 'Expense');
  }

  private get expenseData(): number[] {
    return this.expenseLabels.map((category) =>
      this.expenses
        .filter((transaction) => transaction.category === category)
        .reduce((sum, current) => sum + Number(current.amount.replace(/[$,]/g, '')), 0),
    );
  }

  onViewAll(toggleButton: HTMLButtonElement): void {
    toggleButton.blur();
    this.isExpanded = !this.isExpanded;
  }

  openAddTransactionMenu(): void {
    this.isAddTransactionMenuOpen = true;
  }

  closeAddTransactionMenu(): void {
    this.isAddTransactionMenuOpen = false;
  }

  addTransaction(form: HTMLFormElement): void {
    const formData = new FormData(form);
    const dateValue = String(formData.get('date') ?? '').trim();
    const category = String(formData.get('category') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const amountValue = Number(formData.get('amount') ?? 0);
    const status = String(formData.get('status') ?? '').trim() as TransactionItem['status'];

    if (!dateValue || !category || !description || !amountValue || (status !== 'Income' && status !== 'Expense')) {
      return;
    }

    const date = new Date(dateValue).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const newTransaction: TransactionItem = {
      date,
      category,
      description,
      amount: `$${amountValue.toLocaleString()}`,
      status,
    };

    this.transactions = [newTransaction, ...this.transactions];
    form.reset();
    this.closeAddTransactionMenu();
  }
}
