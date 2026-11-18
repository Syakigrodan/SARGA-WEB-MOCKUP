import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../../core/services/item.service';
import { Item } from '../../core/models';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="catalog-page">
      <header class="catalog-header">
        <div>
          <h1 class="page-title">Katalog Alat</h1>
          <p class="page-subtitle">Daftar alat dan barang inventaris milik organisasi yang dapat dipinjam.</p>
        </div>
      </header>

      <div class="search-bar">
        <input 
          type="text" 
          [(ngModel)]="searchQuery" 
          (input)="onSearch()"
          placeholder="Cari nama alat atau kode..." 
          class="search-input"
        />
      </div>

      <div class="status-summary">
        <span class="count-text">{{ items.length }} alat ditampilkan</span>
      </div>

      <!-- Item Grid -->
      <div class="item-grid" *ngIf="items.length > 0; else emptyState">
        <div class="item-card" *ngFor="let item of items">
          <div class="image-wrapper">
            <img [src]="item.imageUrl || 'assets/img/placeholder-item.svg'" [alt]="item.name" class="item-image" />
            <span class="badge" [ngClass]="{
              'badge-available': item.status === 'AVAILABLE',
              'badge-borrowed': item.status === 'BORROWED',
              'badge-maintenance': item.status === 'MAINTENANCE'
            }">
              {{ item.status === 'AVAILABLE' ? 'Tersedia' : (item.status === 'BORROWED' ? 'Dipinjam' : 'Perawatan') }}
            </span>
          </div>
          <div class="item-body">
            <span class="item-code">{{ item.code }}</span>
            <h3 class="item-name">{{ item.name }}</h3>
            <p class="item-desc">{{ item.description || 'Tidak ada deskripsi' }}</p>
            <div class="item-footer">
              <span class="item-location">📍 {{ item.location || 'Gudang Utama' }}</span>
              <button class="btn btn-sm btn-primary" [disabled]="item.status !== 'AVAILABLE'">Pinjam</button>
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <p>Belum ada alat yang terdaftar atau sesuai pencarian.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .catalog-page {
      padding: 1.5rem 0;
    }
    .catalog-header {
      margin-bottom: 1.5rem;
    }
    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--color-ink);
      margin: 0 0 0.25rem 0;
    }
    .page-subtitle {
      color: var(--color-muted);
      margin: 0;
      font-size: 0.95rem;
    }
    .search-bar {
      margin-bottom: 1rem;
    }
    .search-input {
      width: 100%;
      padding: 0.875rem 1.25rem;
      border: 1px solid var(--color-rule);
      border-radius: var(--radius-input);
      font-size: 0.95rem;
      background-color: #ffffff;
      outline: none;
      transition: border-color 0.15s ease;
    }
    .search-input:focus {
      border-color: var(--color-focus);
      box-shadow: 0 0 0 3px var(--color-focus-ring);
    }
    .status-summary {
      margin-bottom: 1.25rem;
      font-size: 0.85rem;
      color: var(--color-muted);
    }
    .item-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }
    .item-card {
      background: #ffffff;
      border: 1px solid var(--color-rule);
      border-radius: var(--radius-card);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .item-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-subtle);
    }
    .image-wrapper {
      position: relative;
      height: 180px;
      background: var(--color-paper-2);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .item-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .image-wrapper .badge {
      position: absolute;
      top: 0.75rem;
      left: 0.75rem;
    }
    .item-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .item-code {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--color-muted);
      margin-bottom: 0.25rem;
    }
    .item-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-ink);
      margin: 0 0 0.5rem 0;
    }
    .item-desc {
      font-size: 0.85rem;
      color: var(--color-muted);
      line-height: 1.4;
      flex: 1;
      margin: 0 0 1rem 0;
    }
    .item-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--color-rule-2);
      padding-top: 0.75rem;
    }
    .item-location {
      font-size: 0.8rem;
      color: var(--color-muted);
    }
    .btn-sm {
      padding: 0.375rem 0.875rem;
      font-size: 0.8rem;
    }
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--color-muted);
    }
  `]
})
export class CatalogComponent implements OnInit {
  private itemService = inject(ItemService);
  items: Item[] = [];
  searchQuery = '';

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.itemService.getItems({ search: this.searchQuery }).subscribe({
      next: (res) => {
        this.items = res.data;
      },
      error: () => {
        // Fallback demo data if backend is offline
        this.items = [
          {
            id: '1',
            organizationId: 'demo-org',
            code: 'T-001',
            name: 'Set Obeng Presisi Elektrik',
            description: 'Set obeng presisi 24 mata bor untuk perbaikan elektronik ringan.',
            status: 'AVAILABLE',
            imageUrl: 'assets/img/obeng.jpg',
            location: 'Lemari Perkakas A1',
            totalStock: 1,
            availableStock: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            organizationId: 'demo-org',
            code: 'T-002',
            name: 'Tangga Lipat Aluminium 3.8m',
            description: 'Tangga teleskopik multifungsi beban maksimal 150kg.',
            status: 'AVAILABLE',
            imageUrl: 'assets/img/tangga.jpg',
            location: 'Gudang Samping',
            totalStock: 1,
            availableStock: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '3',
            organizationId: 'demo-org',
            code: 'T-003',
            name: 'Tenda Dome Kapasitas 4 Orang',
            description: 'Tenda kemping tahan air double layer.',
            status: 'BORROWED',
            imageUrl: 'assets/img/tenda.jpg',
            location: 'Gudang Perlengkapan',
            totalStock: 1,
            availableStock: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
      }
    });
  }

  onSearch(): void {
    this.loadItems();
  }
}
