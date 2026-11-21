import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../toast/toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  readonly currentUser$ = this.authService.currentUser$;
  menuOpen = false;

  get roleLabel(): string {
    const membership = this.authService.activeMembership();
    if (!membership) return 'Belum tergabung';
    if (membership.status === 'MENUNGGU_VERIFIKASI') return 'Menunggu verifikasi';
    if (membership.status === 'DITOLAK') return 'Keanggotaan ditolak';
    return membership.role === 'ADMIN' ? 'Pengurus' : 'Anggota';
  }

  onOrganizationChange(event: Event): void {
    const select = event.currentTarget;
    if (select instanceof HTMLSelectElement && select.value) {
      this.authService.setActiveOrg(select.value);
    }
    this.menuOpen = false;
  }

  onLogout(): void {
    this.authService.logout();
    this.menuOpen = false;
    this.toastService.show('Anda telah keluar dari akun.', 'info');
  }
}
