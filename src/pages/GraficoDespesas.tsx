import React, { useEffect, useState } from 'react';
import { Bar, PolarArea } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, ArcElement, BarControllerChartOptions, CoreChartOptions, DatasetChartOptions, ElementChartOptions, PluginChartOptions, ScaleChartOptions } from 'chart.js';
import { Colors } from 'chart.js';
import http from '../http'; // Importando a instância do axios
import { _DeepPartialObject } from 'chart.js/dist/types/utils';
import { useRef } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors,
  RadialLinearScale,
  ArcElement
);

const GraficoDespesas = () => {
  const [despesas, setDespesas] = useState<any[]>([]);
  const [tipoGrafico, setTipoGrafico] = useState<'Bar' | 'PolarArea'>('Bar'); // Estado para alternar gráficos
  const chartRef = useRef<any>(null);

  const palette = [
    'rgba(187, 104, 238, 0.5)', 
    'rgba(75, 192, 192, 0.5)', 
    'rgba(255, 99, 132, 0.5)', 
    'rgba(255, 206, 86, 0.5)', 
    'rgba(54, 162, 235, 0.5)', 
    'rgba(153, 102, 255, 0.5)', 
    'rgba(210, 64, 255, 0.5)',
  ];

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

  // Agrupando despesas por categoria e somando os valores
  const totalPorCategoria = despesas.reduce((acc, despesa) => {
    const categoria = despesa.categoria;
    if (!acc[categoria]) {
      acc[categoria] = 0;
    }
    acc[categoria] += despesa.valor;
    return acc;
  }, {});

  // Dados do gráfico
  const data = {
    labels: Object.keys(totalPorCategoria), // Categorias
    datasets: [
      {
        label: ' ',
        data: Object.values(totalPorCategoria), // Valores totais por categoria
        backgroundColor: palette, // Aplicando cores dinâmicas
        borderColor: palette.map((color) => color.replace('0.5', '1')), // Cor da borda com opacidade total
        borderWidth: 1,
        hoverBackgroundColor: palette.map((color) => color.replace('0.5', '1.0')), // Cor ao passar o mouse
        hoverBorderColor: palette, // muda de acordo com a cor da barra
      },
    ],
  };

  // Opções do gráfico
  const options: _DeepPartialObject<CoreChartOptions<'bar'> & ElementChartOptions<'bar'> & PluginChartOptions<'bar'> & DatasetChartOptions<'bar'> & ScaleChartOptions<'bar'> & BarControllerChartOptions> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuad' as const,
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const total = tooltipItem.dataset.data.reduce((acc: any, value: any) => acc + value, 0);
            const percentage = ((tooltipItem.raw / total) * 100).toFixed(2);
            return `R$ ${tooltipItem.raw} (${percentage}%)`; // Tooltip mostrando valores e porcentagem
          },
        },
        backgroundColor: '#4B0082',
        titleFont: {
          family: 'Italiana, serif',
          size: 15,
          weight: 700 as const,
        },
        bodyFont: {
            family: 'erif',
          size: 15,
        },
      },
      legend: {
        display: true, // Ativa a legenda
        position: 'top', // Posição da legenda (top, bottom, left, right)
        onClick: (_e: any, legendItem: any, legend: { chart: any; }) => {
          const index = legendItem.index;
          const chart = legend.chart;
          const meta = chart.getDatasetMeta(0);
          meta.data[index].hidden = !meta.data[index].hidden;
          chart.update();
        },
        labels: {
          generateLabels: (chart: any) => {
            return chart.data.labels.map((label: any, index: number) => {
              const hidden = chart.getDatasetMeta(0).data[index].hidden;
              return {
                text: label,
                fillStyle: palette[index % palette.length],
                strokeStyle: palette[index % palette.length].replace('0.5', '1'),
                lineWidth: 1,
                hidden,
                index,
              };
            });
          },
          font: {
            size: 15, // Tamanho da fonte
            family: 'Italiana, serif', // Família da fonte
            weight: 'bold', // Peso da fonte
          },
          color: '#4B0082', // Cor do texto
          usePointStyle: false, // Retângulo ou ponto na legenda
        },
      },
    },
   
    scales: {
      x: {
        grid: {
          display: tipoGrafico === 'Bar', // Mostra grades apenas no Bar Chart
        },
        ticks: {
          color: '#4B0082',
          font: {
            size: 20,
            family: 'Italiana, serif',
            weight: 'bold' as const,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(123, 104, 238, 0.2)',
        },
        ticks: {
          color: '#4B0082',
          font: {
            size: 20,
            family: 'Italiana, serif',
            weight: 700,
          },
        },
      },
    },
  };

  const graficDownload = () => {
    if (chartRef.current) {
      const chartInstance = chartRef.current.chartInstance || chartRef.current;
      const canvas = chartInstance.canvas;
  
      // Cria um canvas temporário
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
  
      // Define o tamanho do canvas temporário com base no canvas original
      tempCanvas.width = canvas.width + 100;
      tempCanvas.height = canvas.height + 100;
  
      if (tempCtx) {
        // Preenche o fundo com branco
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
        // Desenha o gráfico original sobre o fundo branco
        tempCtx.drawImage(canvas, 50, 50);
    
        // Gera a URL da imagem do canvas temporário
        const url = tempCanvas.toDataURL('image/png');
    
        // Cria um link para download
        const link = document.createElement('a');
        link.href = url;
        link.download = 'grafico-despesas.png';
        link.click();
      }
    }
  };

  return (
    <div style={{ height: '500px', width: '80%', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', padding: '40px 0', color: '#4B0082', fontFamily: 'Italiana, serif' }}>Gráfico de Despesas</h1>

      {/* Botões para alternar entre os gráficos */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button
          style={{
            margin: '5px',
            padding: '10px 20px',
            backgroundColor: tipoGrafico === 'Bar' ? '#4B0082' : '#ddd',
            color: tipoGrafico === 'Bar' ? '#fff' : '#4B0082',
            border: '1px solid #4B0082',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
          onClick={() => setTipoGrafico('Bar')}
        >
          Gráfico de Barras
        </button>
        <button
          style={{
            margin: '5px',
            padding: '10px 20px',
            backgroundColor: tipoGrafico === 'PolarArea' ? '#4B0082' : '#ddd',
            color: tipoGrafico === 'PolarArea' ? '#fff' : '#4B0082',
            border: '1px solid #4B0082',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
          onClick={() => setTipoGrafico('PolarArea')}
        >
          Gráfico Polar
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#8e44ad',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
          }}
          onClick={graficDownload}
        >
          Baixar Gráfico
        </button>
      </div>

      {/* Renderização condicional do gráfico */}
      {tipoGrafico === 'Bar' ? (
        <Bar ref={chartRef} data={data} options={options} />
      ) : (
        <PolarArea ref={chartRef} data={data} options={{ ...options, scales: {} as any } as any} /> // Remove as escalas no Polar Area
      )}
    </div>
  );
};

export default GraficoDespesas;
