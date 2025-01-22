import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import http from '../http'; // Importando a instância do axios

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GraficoDespesas = () => {
  const [despesas, setDespesas] = useState<any[]>([]);

  // Carregando dados das despesas
  useEffect(() => {
    const fetchDespesas = async () => {
      try {
        const response = await http.get('https://back-end-financeiro.onrender.com/despesas/W7AABqLwfVXz0YfmFgTbiC66Vmn2'); // Rota do backend
        setDespesas(response.data);
      } catch (error) {
        console.error('Erro ao buscar as despesas:', error);
      }
    };

    fetchDespesas();
  }, []);

  // Dados do gráfico
  const data = {
    labels: despesas.map(despesa => despesa.categoria),
    datasets: [
      {
        label: 'Despesas',
        data: despesas.map(despesa => despesa.valor),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Opções do gráfico
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Gráfico de Despesas',
      },
    },
  };

  return (
    <div>
      <h2>Gráfico de Despesas</h2>
      <Bar data={data} options={options} />
    </div>
  );
};

export default GraficoDespesas;
