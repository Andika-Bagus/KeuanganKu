import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingDown, TrendingUp, Calendar } from 'lucide-react';
import { useSupabaseFinance } from '@/hooks/useSupabaseFinance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { startOfDay, startOfWeek, startOfMonth, isAfter, format, subDays } from 'date-fns';
import { id } from 'date-fns/locale';

const Statistics = () => {
  const { transactions, loading } = useSupabaseFinance();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        today: { expense: 0, income: 0 },
        week: { expense: 0, income: 0 },
        month: { expense: 0, income: 0 },
      };
    }

    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);

    let todayExpense = 0;
    let todayIncome = 0;
    let weekExpense = 0;
    let weekIncome = 0;
    let monthExpense = 0;
    let monthIncome = 0;

    transactions.forEach((t) => {
      const date = new Date(t.date);
      
      if (t.type === 'expense') {
        if (isAfter(date, todayStart) || date.getTime() === todayStart.getTime()) {
          todayExpense += t.amount;
        }
        if (isAfter(date, weekStart) || date.getTime() === weekStart.getTime()) {
          weekExpense += t.amount;
        }
        if (isAfter(date, monthStart) || date.getTime() === monthStart.getTime()) {
          monthExpense += t.amount;
        }
      } else if (t.type === 'income') {
        if (isAfter(date, todayStart) || date.getTime() === todayStart.getTime()) {
          todayIncome += t.amount;
        }
        if (isAfter(date, weekStart) || date.getTime() === weekStart.getTime()) {
          weekIncome += t.amount;
        }
        if (isAfter(date, monthStart) || date.getTime() === monthStart.getTime()) {
          monthIncome += t.amount;
        }
      }
    });

    return {
      today: { expense: todayExpense, income: todayIncome },
      week: { expense: weekExpense, income: weekIncome },
      month: { expense: monthExpense, income: monthIncome },
    };
  }, [transactions]);

  // Data untuk grafik 7 hari terakhir
  const last7DaysData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }
    
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      let expense = 0;
      let income = 0;

      transactions.forEach((t) => {
        const tDate = new Date(t.date);
        if (tDate >= dayStart && tDate < dayEnd) {
          if (t.type === 'expense') expense += t.amount;
          else if (t.type === 'income') income += t.amount;
        }
      });

      data.push({
        day: format(date, 'EEE', { locale: id }),
        date: format(date, 'dd/MM', { locale: id }),
        pengeluaran: expense,
        pemasukan: income,
      });
    }
    return data;
  }, [transactions]);

  // Data untuk kategori pengeluaran
  const categoryData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }
    
    const now = new Date();
    let startDate;
    
    if (period === 'today') {
      startDate = startOfDay(now);
    } else if (period === 'week') {
      startDate = startOfWeek(now, { weekStartsOn: 1 });
    } else {
      startDate = startOfMonth(now);
    }

    const categoryMap: Record<string, number> = {};

    const categoryLabels: Record<string, string> = {
      'makan': '🍽️ Makan',
      'laundry': '🧺 Laundry',
      'kebutuhan-sehari-hari': '🛒 Kebutuhan',
      'rumah': '🏠 Rumah',
      'arisan': '💰 Arisan',
      'orang-tua': '👨‍👩‍👧 Orang Tua',
      'kebutuhan-mendadak': '⚡ Mendadak',
      'jajan': '🍭 Jajan',
      'self-reward': '🎁 Reward',
      'lainnya': '📝 Lainnya',
    };

    transactions.forEach((t) => {
      const date = new Date(t.date);
      if (t.type === 'expense' && (isAfter(date, startDate) || date.getTime() === startDate.getTime())) {
        const cat = t.category || 'lainnya';
        categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
      }
    });

    const colors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
      'hsl(var(--destructive))',
      'hsl(var(--primary))',
      'hsl(var(--success))',
      'hsl(var(--warning))',
      'hsl(var(--muted-foreground))',
    ];

    return Object.entries(categoryMap)
      .map(([key, value], index) => ({
        name: categoryLabels[key] || key,
        value,
        fill: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, period]);

  const currentStats = period === 'today' ? stats.today : period === 'week' ? stats.week : stats.month;
  const periodLabel = period === 'today' ? 'Hari Ini' : period === 'week' ? 'Minggu Ini' : 'Bulan Ini';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat statistik...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 pb-8">
      <div className="container max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <header className="mb-6 flex items-center gap-4">
          <Link 
            to="/" 
            className="p-2 rounded-xl bg-card border border-border/50 hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Statistik Keuangan</h1>
            <p className="text-muted-foreground text-sm">Analisis pengeluaran & pemasukan</p>
          </div>
        </header>

        {/* Period Tabs */}
        <Tabs value={period} onValueChange={(v) => setPeriod(v as any)} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">Hari Ini</TabsTrigger>
            <TabsTrigger value="week">Minggu Ini</TabsTrigger>
            <TabsTrigger value="month">Bulan Ini</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Summary Card */}
        <Card className="border-border/50 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Ringkasan {periodLabel}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-destructive" />
                <span className="font-medium">Pengeluaran</span>
              </div>
              <span className="font-bold text-lg text-destructive">{formatCurrency(currentStats.expense)}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                <span className="font-medium">Pemasukan</span>
              </div>
              <span className="font-bold text-lg text-success">{formatCurrency(currentStats.income)}</span>
            </div>
            
            <div className="pt-3 border-t border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Selisih</span>
                <span className={`text-xl font-bold ${currentStats.income - currentStats.expense >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(currentStats.income - currentStats.expense)}
                </span>
              </div>
              {currentStats.income - currentStats.expense < 0 && (
                <p className="text-xs text-destructive mt-2">⚠️ Pengeluaran melebihi pemasukan</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 7 Days Chart */}
        {last7DaysData.length > 0 && (
          <Card className="border-border/50 mb-6">
            <CardHeader>
              <CardTitle className="text-base">Grafik 7 Hari Terakhir</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Tren pengeluaran dan pemasukan harian
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {last7DaysData.map((day, index) => {
                  const maxAmount = Math.max(...last7DaysData.map(d => Math.max(d.pengeluaran, d.pemasukan)));
                  const expenseWidth = maxAmount > 0 ? (day.pengeluaran / maxAmount) * 100 : 0;
                  const incomeWidth = maxAmount > 0 ? (day.pemasukan / maxAmount) * 100 : 0;
                  
                  return (
                    <div key={day.date} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{day.day}</span>
                        <span className="text-xs text-muted-foreground">{day.date}</span>
                      </div>
                      
                      {/* Expense Bar */}
                      {day.pengeluaran > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-20 text-xs text-muted-foreground">Keluar</div>
                            <div className="flex-1 bg-muted/50 rounded-full h-8 overflow-hidden relative">
                              <div 
                                className="h-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-end pr-3 text-xs text-white font-semibold transition-all duration-500 ease-out"
                                style={{ width: `${Math.max(expenseWidth, 5)}%` }}
                              >
                                {expenseWidth > 20 && formatCurrency(day.pengeluaran)}
                              </div>
                            </div>
                            {expenseWidth <= 20 && (
                              <span className="text-xs text-muted-foreground w-28 text-right">{formatCurrency(day.pengeluaran)}</span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Income Bar */}
                      {day.pemasukan > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-20 text-xs text-muted-foreground">Masuk</div>
                            <div className="flex-1 bg-muted/50 rounded-full h-8 overflow-hidden relative">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-end pr-3 text-xs text-white font-semibold transition-all duration-500 ease-out"
                                style={{ width: `${Math.max(incomeWidth, 5)}%` }}
                              >
                                {incomeWidth > 20 && formatCurrency(day.pemasukan)}
                              </div>
                            </div>
                            {incomeWidth <= 20 && (
                              <span className="text-xs text-muted-foreground w-28 text-right">{formatCurrency(day.pemasukan)}</span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {day.pengeluaran === 0 && day.pemasukan === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-2">Tidak ada transaksi</p>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-r from-red-500 to-red-600" />
                  <span className="text-sm text-muted-foreground">Pengeluaran</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-r from-green-500 to-green-600" />
                  <span className="text-sm text-muted-foreground">Pemasukan</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Distribution */}
        {categoryData.length > 0 ? (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Pengeluaran per Kategori</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {periodLabel} - Kemana uangmu pergi?
              </p>
            </CardHeader>
            <CardContent>
              {/* Donut Chart */}
              <div className="relative w-56 h-56 mx-auto mb-6">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  {(() => {
                    const total = categoryData.reduce((sum, cat) => sum + cat.value, 0);
                    let currentAngle = 0;
                    
                    return categoryData.map((entry) => {
                      const percentage = (entry.value / total) * 100;
                      const angle = (percentage / 100) * 360;
                      const startAngle = currentAngle;
                      currentAngle += angle;
                      
                      // Calculate path for pie slice
                      const startRad = (startAngle * Math.PI) / 180;
                      const endRad = (currentAngle * Math.PI) / 180;
                      const x1 = 50 + 45 * Math.cos(startRad);
                      const y1 = 50 + 45 * Math.sin(startRad);
                      const x2 = 50 + 45 * Math.cos(endRad);
                      const y2 = 50 + 45 * Math.sin(endRad);
                      const largeArc = angle > 180 ? 1 : 0;
                      
                      return (
                        <path
                          key={entry.name}
                          d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={entry.fill}
                          className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                          style={{
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                          }}
                        />
                      );
                    });
                  })()}
                  {/* Center circle for donut effect */}
                  <circle cx="50" cy="50" r="28" fill="hsl(var(--card))" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Total</p>
                    <p className="text-lg font-bold">{formatCurrency(categoryData.reduce((sum, cat) => sum + cat.value, 0))}</p>
                    <p className="text-xs text-muted-foreground mt-1">{categoryData.length} kategori</p>
                  </div>
                </div>
              </div>
              
              {/* Category List with Progress Bars */}
              <div className="space-y-3">
                {categoryData.map((entry, index) => {
                  const total = categoryData.reduce((sum, cat) => sum + cat.value, 0);
                  const percentage = ((entry.value / total) * 100).toFixed(1);
                  
                  return (
                    <div key={entry.name} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-bold text-muted-foreground">
                            #{index + 1}
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-background shadow-sm" 
                              style={{ backgroundColor: entry.fill }}
                            />
                            <span className="text-sm font-medium truncate">{entry.name}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{formatCurrency(entry.value)}</p>
                          <p className="text-xs text-muted-foreground">{percentage}%</p>
                        </div>
                      </div>
                      {/* Animated Progress Bar */}
                      <div className="ml-11">
                        <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: entry.fill,
                              boxShadow: `0 0 8px ${entry.fill}40`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Insight Card */}
              {categoryData.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/20 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">💡</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground mb-1">Kategori Terbesar</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground">{categoryData[0]?.name}</span> menghabiskan <span className="font-semibold text-foreground">{formatCurrency(categoryData[0]?.value)}</span> atau <span className="font-semibold text-primary">{((categoryData[0]?.value / categoryData.reduce((sum, cat) => sum + cat.value, 0)) * 100).toFixed(1)}%</span> dari total pengeluaran {periodLabel.toLowerCase()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/50">
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-muted-foreground font-medium">Belum ada pengeluaran {periodLabel.toLowerCase()}</p>
              <p className="text-sm text-muted-foreground mt-2">Mulai catat transaksimu untuk melihat statistik</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Statistics;
