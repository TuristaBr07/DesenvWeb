import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'; // Importante para o Angular acessar

const app = express();
app.use(express.json()); // Habilita leitura de JSON 
app.use(cors()); // Habilita acesso externo (Angular)

// --- CONEXÃO COM O BANCO ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB')) 
  .catch(err => console.error('Erro na conexão:', err.message)); 

// --- MODELO (SCHEMA) ---
const transacaoSchema = new mongoose.Schema({
  descricao: { type: String, required: true },
  valor: { type: Number, required: true },
  tipo: { type: String, required: true }, // 'Receita' ou 'Despesa'
  categoria: { type: String, required: true },
  data: { type: Date, default: Date.now }
});

const Transacao = mongoose.model('Transacao', transacaoSchema); 

// --- ROTAS ---

// Rota 1: Listar todas as transações (GET)
app.get('/transacoes', async (req, res) => {
  try {
    const lista = await Transacao.find(); // Busca tudo no banco 
    res.json(lista);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota 2: Criar nova transação (POST)
app.post('/transacoes', async (req, res) => {
  try {
    const nova = await Transacao.create(req.body); // Salva no banco 
    res.status(201).json(nova);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Rota 3: Excluir transação (DELETE)
app.delete('/transacoes/:id', async (req, res) => {
  try {
    await Transacao.findByIdAndDelete(req.params.id); // Remove pelo ID 
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota 4: Atualizar transação (PUT) 
app.put('/transacoes/:id', async (req, res) => {
  try {
    const atualizado = await Transacao.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Retorna o dado atualizado
    );
    res.json(atualizado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Iniciar servidor
app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT}`); // [cite: 1040]
});