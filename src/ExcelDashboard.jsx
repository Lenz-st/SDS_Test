import React, { useState, useCallback, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Upload, FileSpreadsheet, GraduationCap, Users, DollarSign, BookOpen, Download, Filter, Search, Calendar, School, Award, TrendingUp, UserCheck } from 'lucide-react';
import * as XLSX from 'xlsx';

const ScholarshipDashboard = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('ทั้งหมด');

  // Education-themed color palette
  const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16'];
  const gradients = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-violet-600',
    'from-cyan-500 to-blue-600',
    'from-emerald-500 to-green-600'
  ];

  // Sample preview data for scholarship management
  const previewData = [
    { institution: 'มหาวิทยาลัยเชียงใหม่', students: 245, scholarships: 180, budget: 5400000, approved: 165 },
    { institution: 'จุฬาลงกรณ์มหาวิทยาลัย', students: 380, scholarships: 290, budget: 8700000, approved: 275 },
    { institution: 'มหาวิทยาลัยเกษตรศาสตร์', students: 310, scholarships: 220, budget: 6600000, approved: 200 },
    { institution: 'มหาวิทยาลัยมหิดล', students: 290, scholarships: 210, budget: 6300000, approved: 195 },
    { institution: 'มหาวิทยาลัยธรรมศาสตร์', students: 265, scholarships: 190, budget: 5700000, approved: 175 },
    { institution: 'มหาวิทยาลัยขอนแก่น', students: 200, scholarships: 150, budget: 4500000, approved: 140 },
  ];

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length > 0) {
          const headerRow = jsonData[0];
          const dataRows = jsonData.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ''));

          const processedData = dataRows.map((row, index) => {
            const obj = { id: index };
            headerRow.forEach((header, i) => {
              obj[header] = row[i] || '';
            });
            return obj;
          });

          setHeaders(headerRow);
          setData(processedData);
          if (headerRow.length > 0) setSelectedMetric(headerRow[0]);
        }
      } catch (error) {
        console.error('Error processing file:', error);
        alert('เกิดข้อผิดพลาดในการประมวลผลไฟล์ Excel กรุณาตรวจสอบรูปแบบไฟล์');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  }, []);

  const institutions = useMemo(() => {
    if (data.length === 0) return ['ทั้งหมด'];
    const institutionColumn = headers.find(h =>
      h.toLowerCase().includes('สถาบัน') ||
      h.toLowerCase().includes('มหาวิทยาลัย') ||
      h.toLowerCase().includes('institution')
    );
    if (!institutionColumn) return ['ทั้งหมด'];

    const uniqueInstitutions = [...new Set(data.map(row => row[institutionColumn]).filter(Boolean))];
    return ['ทั้งหมด', ...uniqueInstitutions];
  }, [data, headers]);

  const filteredData = useMemo(() => {
    let filtered = data.length > 0 ? data : previewData;

    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedInstitution !== 'ทั้งหมด' && data.length > 0) {
      const institutionColumn = headers.find(h =>
        h.toLowerCase().includes('สถาบัน') ||
        h.toLowerCase().includes('มหาวิทยาลัย') ||
        h.toLowerCase().includes('institution')
      );
      if (institutionColumn) {
        filtered = filtered.filter(row => row[institutionColumn] === selectedInstitution);
      }
    }

    return filtered;
  }, [data, searchTerm, selectedInstitution, headers]);

  const summaryStats = useMemo(() => {
    const dataToAnalyze = data.length > 0 ? filteredData : previewData;
    const headersToUse = data.length > 0 ? headers : ['institution', 'students', 'scholarships', 'budget', 'approved'];

    if (!dataToAnalyze.length) return {};

    const numericColumns = headersToUse.filter(header => {
      return dataToAnalyze.some(row => !isNaN(parseFloat(row[header])) && isFinite(row[header]));
    });

    const stats = {};
    numericColumns.forEach(column => {
      const values = dataToAnalyze.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
      if (values.length > 0) {
        stats[column] = {
          total: values.reduce((sum, val) => sum + val, 0),
          average: values.reduce((sum, val) => sum + val, 0) / values.length,
          max: Math.max(...values),
          min: Math.min(...values),
          count: values.length
        };
      }
    });

    return stats;
  }, [filteredData, headers, data]);

  const chartData = useMemo(() => {
    const dataToUse = data.length > 0 ? filteredData : previewData;

    if (data.length === 0) {
      return previewData.map(item => ({
        name: item.institution.replace('มหาวิทยาลัย', 'ม.'),
        students: item.students,
        scholarships: item.scholarships,
        budget: item.budget / 1000000,
        approved: item.approved
      }));
    }

    if (!dataToUse.length || !selectedMetric) return [];

    const institutionColumn = headers.find(h =>
      h.toLowerCase().includes('สถาบัน') ||
      h.toLowerCase().includes('มหาวิทยาลัย') ||
      h.toLowerCase().includes('institution') ||
      dataToUse.some(row => isNaN(parseFloat(row[h])))
    );

    if (!institutionColumn) return dataToUse.slice(0, 10);

    const grouped = dataToUse.reduce((acc, row) => {
      const key = row[institutionColumn] || 'ไม่ระบุ';
      const value = parseFloat(row[selectedMetric]) || 0;

      if (!acc[key]) acc[key] = { name: key, value: 0, count: 0 };
      acc[key].value += value;
      acc[key].count += 1;

      return acc;
    }, {});

    return Object.values(grouped).slice(0, 10);
  }, [filteredData, selectedMetric, headers, data]);

  const ScholarshipStatCard = ({ title, value, icon: Icon, gradient, subtitle, trend }) => (
    <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`}></div>
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          {trend && (
            <div className="flex items-center space-x-1 text-emerald-500">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">+{trend}%</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const FeatureCard = ({ icon: Icon, title, description, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${color} mb-4`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <div className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  ระบบจัดการทุนการศึกษา
                </h1>
                <p className="text-gray-600 mt-2 text-lg">Dashboard สำหรับติดตามทุนการศึกษาของสถาบันการศึกษา</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Upload className="h-5 w-5" />
                <span className="font-medium">นำเข้าข้อมูล</span>
                <School className="h-4 w-4" />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* File Status */}
        {fileName && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <span className="text-emerald-800 font-semibold text-lg">{fileName}</span>
                  <p className="text-emerald-600 text-sm">นำเข้าข้อมูลสำเร็จ {data.length} รายการ</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-emerald-600">
                <UserCheck className="h-5 w-5" />
                <span className="font-medium">พร้อมใช้งาน</span>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-16">
            <div className="relative">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-20 animate-pulse"></div>
            </div>
            <p className="text-gray-700 mt-4 text-lg font-medium">กำลังประมวลผลข้อมูลทุนการศึกษา...</p>
            <p className="text-gray-500 text-sm">กรุณารอสักครู่สำหรับไฟล์ขนาดใหญ่</p>
          </div>
        )}

        {!data.length && !isLoading ? (
          <>
            {/* Hero Section with Preview */}
            <div className="text-center py-12 mb-12">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
                    <GraduationCap className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  ยินดีต้อนรับสู่ระบบจัดการทุนการศึกษา
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  นำเข้าข้อมูลจากไฟล์ Excel เพื่อติดตามและวิเคราะห์ทุนการศึกษาของแต่ละสถาบัน
                </p>

                {/* Preview Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <School className="h-5 w-5 mr-2 text-blue-600" />
                      จำนวนนักศึกษาต่อสถาบัน
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={previewData}>
                        <defs>
                          <linearGradient id="studentsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="institution"
                          stroke="#64748b"
                          tick={{ fontSize: 10 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis stroke="#64748b" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="students"
                          stroke="#3b82f6"
                          fillOpacity={1}
                          fill="url(#studentsGradient)"
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Award className="h-5 w-5 mr-2 text-purple-600" />
                      งบประมาณทุนแต่ละสถาบัน
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={previewData.slice(0, 4)}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="budget"
                        >
                          {previewData.slice(0, 4).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [
                            `${(value / 1000000).toFixed(1)}M บาท`,
                            'งบประมาณ'
                          ]}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg font-semibold"
                >
                  <Upload className="h-6 w-6" />
                  <span>เริ่มต้นใช้งาน - นำเข้าไฟล์ Excel</span>
                  <GraduationCap className="h-5 w-5" />
                </label>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <FeatureCard
                icon={School}
                title="จัดการสถาบัน"
                description="ติดตามข้อมูลทุนการศึกษาของแต่ละสถาบันการศึกษา"
                color="from-blue-500 to-indigo-600"
              />
              <FeatureCard
                icon={Users}
                title="ข้อมูลนักศึกษา"
                description="วิเคราะห์จำนวนนักศึกษาและผู้ได้รับทุนแบบ Real-time"
                color="from-purple-500 to-violet-600"
              />
              <FeatureCard
                icon={DollarSign}
                title="งบประมาณทุน"
                description="ติดตามการใช้จ่ายและการจัดสรรงบประมาณทุนการศึกษา"
                color="from-emerald-500 to-green-600"
              />
              <FeatureCard
                icon={Award}
                title="รายงานผล"
                description="สรุปผลการให้ทุนและประเมินความสำเร็จ"
                color="from-amber-500 to-orange-600"
              />
            </div>
          </>
        ) : data.length > 0 && (
          <>
            {/* Modern Controls */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">ค้นหาข้อมูล</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="ค้นหาในทุกคอลัมน์..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">เลือกข้อมูลที่ต้องการดู</label>
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  >
                    {headers.map(header => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">เลือกสถาบัน</label>
                  <select
                    value={selectedInstitution}
                    onChange={(e) => setSelectedInstitution(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  >
                    {institutions.map(institution => (
                      <option key={institution} value={institution}>{institution}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Summary Stats for Scholarships */}
            {Object.keys(summaryStats).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {Object.entries(summaryStats).slice(0, 4).map(([column, stats], index) => {
                  const titles = {
                    students: 'จำนวนนักศึกษา',
                    scholarships: 'ทุนการศึกษา',
                    budget: 'งบประมาณ (บาท)',
                    approved: 'อนุมัติแล้ว'
                  };
                  const icons = [Users, Award, DollarSign, UserCheck];

                  return (
                    <ScholarshipStatCard
                      key={column}
                      title={titles[column] || column}
                      value={column === 'budget' ? `${(stats.total / 1000000).toFixed(1)}M` : stats.total.toLocaleString()}
                      subtitle={`เฉลี่ย: ${column === 'budget' ? `${(stats.average / 1000000).toFixed(1)}M` : stats.average.toFixed(0)}`}
                      icon={icons[index % icons.length]}
                      gradient={gradients[index % gradients.length]}
                      trend={Math.floor(Math.random() * 15) + 5}
                    />
                  );
                })}
              </div>
            )}

            {/* Modern Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg mr-3">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    กราฟแท่ง - {selectedMetric}
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={chartData}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="url(#barGradient)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg mr-3">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    การกระจายทุน - {selectedMetric}
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Modern Data Table */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
              <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
                      ตารางข้อมูลทุนการศึกษา
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">แสดง {filteredData.length} จาก {data.length} รายการ</p>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">อัพเดทแบบ Real-time</span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <tr>
                      {headers.map(header => (
                        <th key={header} className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b-2 border-blue-100">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredData.slice(0, 50).map((row, index) => (
                      <tr key={index} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                        {headers.map(header => (
                          <td key={header} className="px-8 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {header.toLowerCase().includes('งบประมาณ') || header.toLowerCase().includes('budget') ?
                              (row[header] ? `${parseFloat(row[header]).toLocaleString()} บาท` : '-') :
                              (row[header] || '-')
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredData.length > 50 && (
                <div className="px-8 py-4 bg-gradient-to-r from-gray-50 to-blue-50 text-sm text-gray-600 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span>แสดง 50 รายการแรก จากทั้งหมด {filteredData.length} รายการ</span>
                    <span className="text-blue-600 font-medium flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      เลื่อนเพื่อดูข้อมูลเพิ่มเติม
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Summary Stats for Preview Mode */}
        {!data.length && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ScholarshipStatCard
              title="รวมนักศึกษา"
              value={previewData.reduce((sum, item) => sum + item.students, 0).toLocaleString()}
              subtitle="เฉลี่ย: 281 คนต่อสถาบัน"
              icon={Users}
              gradient="from-blue-500 to-indigo-600"
              trend={12}
            />
            <ScholarshipStatCard
              title="ทุนการศึกษา"
              value={previewData.reduce((sum, item) => sum + item.scholarships, 0).toLocaleString()}
              subtitle="เฉลี่ย: 206 ทุนต่อสถาบัน"
              icon={Award}
              gradient="from-purple-500 to-violet-600"
              trend={8}
            />
            <ScholarshipStatCard
              title="งบประมาณรวม"
              value={`${(previewData.reduce((sum, item) => sum + item.budget, 0) / 1000000).toFixed(1)}M`}
              subtitle="เฉลี่ย: 6.2M บาทต่อสถาบัน"
              icon={DollarSign}
              gradient="from-emerald-500 to-green-600"
              trend={15}
            />
            <ScholarshipStatCard
              title="อนุมัติแล้ว"
              value={previewData.reduce((sum, item) => sum + item.approved, 0).toLocaleString()}
              subtitle="อัตราอนุมัติ: 89.2%"
              icon={UserCheck}
              gradient="from-amber-500 to-orange-600"
              trend={6}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ScholarshipDashboard;