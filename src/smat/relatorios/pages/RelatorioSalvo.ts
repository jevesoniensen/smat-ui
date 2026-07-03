import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RelatorioService } from '../services/RelatorioService';
import { RelatorioSalvo } from '../../../types/models';

@Component({
  selector: 'app-relatorio-salvo',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './RelatorioSalvo.html',
  styles: [`
    .details-card {
      margin-bottom: 24px;
    }
    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 16px;
    }
    .w-100 {
      width: 100%;
    }
    .clickable-row {
      cursor: pointer;
    }
    .clickable-row:hover {
      background: rgba(0, 0, 0, 0.04);
    }
    .selected-row {
      background: rgba(0, 0, 0, 0.08) !important;
    }
  `]
})
export class RelatorioSalvoComponent implements OnInit {
  private router = inject(Router);
  private relatorioService = inject(RelatorioService);

  reports = signal<RelatorioSalvo[]>([]);
  selectedReport = signal<RelatorioSalvo | null>(null);
  loading = signal(false);
  message = signal('');

  displayedColumns: string[] = ['nomeRelatorio', 'dataSalvamento'];

  ngOnInit() {
    this.fetchReports();
  }

  async fetchReports() {
    this.loading.set(true);
    try {
      const data = await this.relatorioService.getSavedReports();
      this.reports.set(data || []);
    } catch (error) {
      this.message.set('Erro ao carregar relatórios salvos.');
    } finally {
      this.loading.set(false);
    }
  }

  handleSelect(report: RelatorioSalvo) {
    this.selectedReport.set(report);
  }

  handleGenerate() {
    const sel = this.selectedReport();
    if (sel) {
      this.router.navigate(['/relatorios/relatorio'], { state: { relatorio: sel } });
    }
  }

  async handleDelete() {
    const sel = this.selectedReport();
    if (!sel) return;
    if (!window.confirm('Confirma a exclusão deste relatório?')) return;

    this.loading.set(true);
    try {
      await this.relatorioService.deleteSavedReport(sel.id);
      this.message.set('Relatório excluído com sucesso!');
      this.selectedReport.set(null);
      this.fetchReports();
    } catch (error) {
      this.message.set('Erro ao excluir relatório.');
    } finally {
      this.loading.set(false);
    }
  }
}
