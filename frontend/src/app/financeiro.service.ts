import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface adaptada para Transação [cite: 737]
export interface Transacao {
  _id?: string;
  descricao: string;
  valor: number;
  tipo: string;
  categoria: string;
  data?: string;
}

@Injectable({ providedIn: 'root' })
export class FinanceiroService {
  private http = inject(HttpClient);
  // URL da sua API Node [cite: 762]
  private url = 'http://localhost:3000/transacoes'; 

  // Listar [cite: 765]
  listar(): Observable<Transacao[]> {
    return this.http.get<Transacao[]>(this.url);
  }

  // Criar [cite: 778]
  criar(t: Transacao): Observable<Transacao> {
    return this.http.post<Transacao>(this.url, t);
  }

  // Adicione isto:
  atualizar(id: string, t: Transacao): Observable<Transacao> {
    return this.http.put<Transacao>(`${this.url}/${id}`, t);
  }

  // Excluir [cite: 790]
  excluir(id: string) {
    return this.http.delete(`${this.url}/${id}`);
  }
}