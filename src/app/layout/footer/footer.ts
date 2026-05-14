import { Component, ChangeDetectionStrategy, input } from '@angular/core';

interface FooterLink {
  label: string;
  url: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  readonly companyName = input<string>('Chebupell');
  readonly year = input<number>(new Date().getFullYear());
  readonly repository = input<string>('GitHub');

  readonly companyLinks = input<FooterLink[]>([
    { label: 'About', url: '#' },
    { label: 'Blog', url: '#' },
    { label: 'Contact', url: '#' },
  ]);

  readonly legalLinks = input<FooterLink[]>([
    { label: 'Terms of Service', url: '#' },
    { label: 'Privacy Policy', url: '#' },
    { label: 'Cookie Policy', url: '#' },
  ]);

  readonly socialLinks = input<FooterLink[]>([
    { label: 'Twitter', url: 'https://twitter.com' },
    { label: 'LinkedIn', url: 'https://linkedin.com' },
    { label: 'GitHub', url: 'https://github.com' },
  ]);
}
