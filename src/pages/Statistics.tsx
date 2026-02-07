import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingDown, TrendingUp, Calendar } from 'lucide-react';
import { useFinance } from '@/hooks/useFinance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { startOfDay, startOfWeek, startOfMonth, isAfter, format, subDays } from 'date-fns';
import { id } from 'date-fns/locale';

const Statistics = () => {
  const { transactions } = useFinance();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = useMemo(() => {
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
        pengeluaran: expense,
        pemasukan: income,
      });
    }
    return data;
  }, [transactions]);

  // Data untuk pie chart kategori akun
  const accountData = useMemo(() => {
    let bankExpense = 0;
    let cashExpense = 0;

    const monthStart = startOfMonth(new Date());

    transactions.forEach((t) => {
      const date = new Date(t.date);
      if (t.type === 'expense' && (isAfter(date, monthStart) || date.getTime() === monthStart.getTime())) {
        if (t.account === 'bank') bankExpense += t.amount;
        else cashExpense += t.amount;
      }
    });

    return [
      { name: 'Rekening', value: bankExpense, fill: 'hsl(var(--primary))' },
      { name: 'Cash', value: cashExpense, fill: 'hsl(var(--success))' },
    ].filter(d => d.value > 0);
  }, [transactions]);

  // Data untuk pie chart kategori pengeluaran
  const categoryData = useMemo(() => {
    const monthStart = startOfMonth(new Date());
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
      if (t.type === 'expense' && (isAfter(date, monthStart) || date.getTime() === monthStart.getTime())) {
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
  }, [transactions]);

  const chartConfig = {
    pengeluaran: {
      label: 'Pengeluaran',
      color: 'hsl(var(--destructive))',
    },
    pemasukan: {
      label: 'Pemasukan',
      color: 'hsl(var(--success))',
    },
  };

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

        {/* Info Box */}
        <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
          <p className="text-sm text-foreground">
            💡 <span className="font-medium">Tips:</span> Pantau pengeluaranmu secara berkala untuk mengatur keuangan lebih baik
          </p>
        </div>

        {/* Summary Cards */}
        <div className="space-y-4 mb-6">
          {/* Today */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Hari Ini
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                  Keluar
                </span>
                <span className="font-semibold text-destructive">{formatCurrency(stats.today.expense)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-success" />
                  Masuk
                </span>
                <span className="font-semibold text-success">{formatCurrency(stats.today.income)}</span>
              </div>
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Selisih</span>
                  <span className={`text-sm font-bold ${stats.today.income - stats.today.expense >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(stats.today.income - stats.today.expense)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* This Week */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Minggu Ini
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                  Keluar
                </span>
                <span className="font-semibold text-destructive">{formatCurrency(stats.week.expense)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-success" />
                  Masuk
                </span>
                <span className="font-semibold text-success">{formatCurrency(stats.week.income)}</span>
              </div>
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Selisih</span>
                  <span className={`text-sm font-bold ${stats.week.income - stats.week.expense >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(stats.week.income - stats.week.expense)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* This Month */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Bulan Ini
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                  Keluar
                </span>
                <span className="font-semibold text-destructive">{formatCurrency(stats.month.expense)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-success" />
                  Masuk
                </span>
                <span className="font-semibold text-success">{formatCurrency(stats.month.income)}</span>
              </div>
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Selisih</span>
                  <span className={`text-sm font-bold ${stats.month.income - stats.month.expense >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(stats.month.income - stats.month.expense)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bar Chart - Last 7 Days */}
        <Card className="border-border/50 mb-6">
          <CardHeader>
            <CardTitle className="text-base">Grafik 7 Hari Terakhir</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Perbandingan pengeluaran (merah) vs pemasukan (hijau) per hari
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart data={last7DaysData}>
                <XAxis 
                  dataKey="day" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `${(value / 1000)}k`}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="pengeluaran" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pemasukan" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-destructive" />
                <span className="text-muted-foreground">Pengeluaran</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-success" />
                <span className="text-muted-foreground">Pemasukan</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Account Distribution */}
        {accountData.length > 0 && (
          <Card className="border-border/50 mb-6">
            <CardHeader>
              <CardTitle className="text-base">Pengeluaran per Akun (Bulan Ini)</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Dari mana uangmu keluar? Bank atau Cash?
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={accountData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {accountData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {accountData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.fill }}
                    />
                    <div className="text-sm">
                      <p className="text-muted-foreground">{entry.name}</p>
                      <p className="font-medium">{formatCurrency(entry.value)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pie Chart - Category Distribution */}
        {categoryData.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Pengeluaran per Kategori (Bulan Ini)</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Uangmu habis untuk apa saja? Lihat kategori terbesar
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {categoryData.map((entry) => (
                  <div key={entry.name} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5" 
                      style={{ backgroundColor: entry.fill }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">{entry.name}</p>
                      <p className="text-sm font-semibold">{formatCurrency(entry.value)}</p>
                      <p className="text-xs text-muted-foreground">
                        {((entry.value / categoryData.reduce((sum, cat) => sum + cat.value, 0)) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-xs text-muted-foreground">
                  💡 <span className="font-medium">Insight:</span> Kategori teratas: <span className="font-semibold text-foreground">{categoryData[0]?.name}</span> dengan total {formatCurrency(categoryData[0]?.value)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Statistics;
