import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceiroService, Transacao } from './financeiro.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  private service = inject(FinanceiroService);
  
  transacoes: Transacao[] = [];
  transacoesFiltradas: Transacao[] = [];
  saldo: number = 0;
  
  filtroTexto: string = '';
  
  // Controle de Edição
  idEdicao: string | null = null; // Se tiver ID, é edição. Se null, é criação.

  // Formulário
  descricao = '';
  valor: number | null = null;
  tipo = 'Receita';
  categoria = '';

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.service.listar().subscribe(lista => {
      this.transacoes = lista;
      this.filtrar();
      this.calcularSaldo();
    });
  }

  filtrar() {
    if (!this.filtroTexto) {
      this.transacoesFiltradas = this.transacoes;
    } else {
      const termo = this.filtroTexto.toLowerCase();
      this.transacoesFiltradas = this.transacoes.filter(t => 
        t.categoria.toLowerCase().includes(termo) || 
        t.descricao.toLowerCase().includes(termo)
      );
    }
  }

  // Função unificada: Cria ou Atualiza
  salvar() {
    if (!this.descricao || !this.valor || !this.categoria) return;

    const dados: Transacao = {
      descricao: this.descricao,
      valor: Number(this.valor),
      tipo: this.tipo,
      categoria: this.categoria
    };

    if (this.idEdicao) {
      // MODO EDIÇÃO
      this.service.atualizar(this.idEdicao, dados).subscribe(() => {
        this.carregar();
        this.limparFormulario();
      });
    } else {
      // MODO CRIAÇÃO
      this.service.criar(dados).subscribe(() => {
        this.carregar();
        this.limparFormulario();
      });
    }
  }

  // Preenche o formulário para editar
  editar(t: Transacao) {
    this.idEdicao = t._id!;
    this.descricao = t.descricao;
    this.valor = t.valor;
    this.tipo = t.tipo;
    this.categoria = t.categoria;
    // Rola a página para o topo para ver o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  excluir(id: string) {
    if(confirm('Tem certeza?')) {
      this.service.excluir(id).subscribe(() => this.carregar());
    }
  }

  calcularSaldo() {
    this.saldo = this.transacoes.reduce((acc, t) => {
      return t.tipo === 'Receita' ? acc + t.valor : acc - t.valor;
    }, 0);
  }

  limparFormulario() {
    this.idEdicao = null;
    this.descricao = '';
    this.valor = null;
    this.categoria = '';
    this.tipo = 'Receita';
  }

  // --- Lógica do Gráfico ---
  get dadosGrafico() {
    const despesas = this.transacoes.filter(t => t.tipo === 'Despesa');
    const total = despesas.reduce((sum, t) => sum + t.valor, 0);
    const grupos: { [key: string]: number } = {};

    despesas.forEach(t => {
      grupos[t.categoria] = (grupos[t.categoria] || 0) + t.valor;
    });

    const cores = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    let anguloAtual = 0;

    return Object.keys(grupos).map((cat, i) => {
      const valor = grupos[cat];
      const percent = (valor / total) * 100;
      const angulo = (percent / 100) * 360;
      
      const item = {
        categoria: cat,
        percent: percent,
        cor: cores[i % cores.length],
        css: `${cores[i % cores.length]} ${anguloAtual}deg ${anguloAtual + angulo}deg`
      };
      anguloAtual += angulo;
      return item;
    });
  }

  get estiloGrafico() {
    if (this.dadosGrafico.length === 0) return 'conic-gradient(#eee 0deg 360deg)';
    const partes = this.dadosGrafico.map(d => d.css).join(', ');
    return `conic-gradient(${partes})`;
  }
}