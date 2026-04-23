import { Award, BookOpen, DollarSign, FileSpreadsheet, GraduationCap, School, Search, TrendingUp, Upload, UserCheck, Users } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import * as XLSX from 'xlsx';
import MultiSelectDropdown from './components/MultiSelectDropdown';

const ScholarshipDashboard = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState([]);
  const [selectedScholarshipType, setSelectedScholarshipType] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState([]);
  const [selectedFacultyGroup, setSelectedFacultyGroup] = useState([]);

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
          const rawHeaderRow = jsonData[0];
          const headerRow = rawHeaderRow.map((header, index) =>
            header && typeof header === 'string'
              ? header
              : `คอลัมน์ที่ ${index + 1}`
          );
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

  const scholarshipTypes = useMemo(() => {
    if (data.length === 0) return ['ทั้งหมด'];
    let scholarshipColumn = headers.find(h => typeof h === 'string' && h.includes('ได้รับทุน/สำรองทุน'));
    if (!scholarshipColumn) {
      scholarshipColumn = headers.find(h => typeof h === 'string' && h.includes('ได้รับทุน'));
    }
    if (!scholarshipColumn) return ['ทั้งหมด'];

    const uniqueTypes = [...new Set(data.map(row => row[scholarshipColumn]).filter(Boolean))];
    return ['ทั้งหมด', ...uniqueTypes];
  }, [data, headers]);

  const faculties = useMemo(() => {
    if (data.length === 0) return ['ทั้งหมด'];
    let facultyColumn = headers.find(h => typeof h === 'string' && (h.includes('สาขา') || h.toLowerCase().includes('major')));
    if (!facultyColumn) facultyColumn = headers.find(h => typeof h === 'string' && (h.includes('คณะ') || h.toLowerCase().includes('faculty')));
    if (!facultyColumn) return ['ทั้งหมด'];

    const uniqueFaculties = [...new Set(data.map(row => row[facultyColumn]).filter(Boolean))];
    return ['ทั้งหมด', ...uniqueFaculties].sort();
  }, [data, headers]);

  const facultyGroups = useMemo(() => {
    if (data.length === 0) return ['ทั้งหมด'];
    const facultyColumn = headers.find(h => typeof h === 'string' && (h.includes('คณะ') || h.toLowerCase().includes('faculty')));
    if (!facultyColumn) return ['ทั้งหมด'];

    const uniqueFaculties = [...new Set(data.map(row => row[facultyColumn]).filter(Boolean))];
    return ['ทั้งหมด', ...uniqueFaculties].sort();
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

    if (selectedInstitution.length > 0 && data.length > 0) {
      const institutionColumn = headers.find(h =>
        typeof h === 'string' &&
        (h.toLowerCase().includes('สถาบัน') ||
          h.toLowerCase().includes('มหาวิทยาลัย') ||
          h.toLowerCase().includes('institution'))
      );
      if (institutionColumn) {
        filtered = filtered.filter(row => selectedInstitution.includes(row[institutionColumn]));
      }
    }

    if (selectedScholarshipType.length > 0 && data.length > 0) {
      let scholarshipColumn = headers.find(h => typeof h === 'string' && h.includes('ได้รับทุน/สำรองทุน'));
      if (!scholarshipColumn) {
        scholarshipColumn = headers.find(h => typeof h === 'string' && h.includes('ได้รับทุน'));
      }
      if (scholarshipColumn) {
        filtered = filtered.filter(row => selectedScholarshipType.includes(row[scholarshipColumn]));
      }
    }

    if (selectedFaculty.length > 0 && data.length > 0) {
      let facultyColumn = headers.find(h => typeof h === 'string' && (h.includes('สาขา') || h.toLowerCase().includes('major')));
      if (!facultyColumn) facultyColumn = headers.find(h => typeof h === 'string' && (h.includes('คณะ') || h.toLowerCase().includes('faculty')));
      if (facultyColumn) {
        filtered = filtered.filter(row => selectedFaculty.includes(row[facultyColumn]));
      }
    }

    if (selectedFacultyGroup.length > 0 && data.length > 0) {
      const facultyColumn = headers.find(h => typeof h === 'string' && (h.includes('คณะ') || h.toLowerCase().includes('faculty')));
      if (facultyColumn) {
        filtered = filtered.filter(row => selectedFacultyGroup.includes(row[facultyColumn]));
      }
    }

    return filtered;
  }, [data, searchTerm, selectedInstitution, selectedScholarshipType, selectedFaculty, selectedFacultyGroup, headers]);

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

  // All scholarships data (sorted by count)
  const allScholarshipsData = useMemo(() => {
    if (data.length === 0) return [];

    let scholarshipColumn = headers.find(h => typeof h === 'string' && h.includes('ได้รับทุน/สำรองทุน'));
    if (!scholarshipColumn) {
      scholarshipColumn = headers.find(h => typeof h === 'string' && h.includes('ได้รับทุน'));
    }
    if (!scholarshipColumn) return [];

    const counts = filteredData.reduce((acc, row) => {
      const key = row[scholarshipColumn] || 'ไม่มีข้อมูล';
      if (!acc[key]) acc[key] = { name: key, count: 0 };
      acc[key].count += 1;
      return acc;
    }, {});

    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [filteredData, headers, data]);

  // Distribution by scholarship type (ใช้คอลัมน์ ได้รับทุน/สำรองทุน)
  const scholarshipTypeChartData = useMemo(() => {
    if (!allScholarshipsData || allScholarshipsData.length === 0) return [];

    // แสดงทุกทุน เรียงจากมากไปน้อย
    return [...allScholarshipsData];
  }, [allScholarshipsData]);

  // Distribution by faculty (คณะ)
  const facultyChartData = useMemo(() => {
    if (data.length === 0) return [];

    const facultyColumn = headers.find(
      (h) => typeof h === 'string' && h.includes('คณะ')
    );
    if (!facultyColumn) return [];

    const counts = filteredData.reduce((acc, row) => {
      const key = row[facultyColumn] || 'ไม่ระบุคณะ';
      if (!acc[key]) acc[key] = { name: key, count: 0 };
      acc[key].count += 1;
      return acc;
    }, {});

    return Object.values(counts).slice(0, 15);
  }, [filteredData, headers, data]);

  // Distribution by awareness / channel (การแนะแนว, Website, Social Media, ฯลฯ)
  const channelChartData = useMemo(() => {
    if (data.length === 0) return [];

    const channelKeywords = [
      'การแนะแนว',
      'สื่อสิ่งพิมพ์',
      'ตลาดนัดอุดมศึกษา',
      'โฆษณาโทรทัศน์',
      'บูธประชาสัมพันธ์',
      'Young Creative Program',
      'คุณครูที่โรงเรียน',
      'Website',
      'Social Media',
      'งานประกวด',
      'อื่นๆ',
    ];

    const channelColumns = headers.filter(
      (h) =>
        typeof h === 'string' &&
        channelKeywords.some((keyword) => h.includes(keyword))
    );

    if (!channelColumns.length) return [];

    const counts = {};

    filteredData.forEach((row) => {
      channelColumns.forEach((col) => {
        const value = row[col];
        if (value !== undefined && value !== null && value !== '' && value !== 0 && value !== '0') {
          const key = col;
          if (!counts[key]) counts[key] = { name: key, count: 0 };
          counts[key].count += 1;
        }
      });
    });

    return Object.values(counts).slice(0, 15);
  }, [filteredData, headers, data]);

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
          <div className="animate-fade-in-up">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl mb-16 border border-blue-100">
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-10 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-gradient-to-tr from-purple-400 to-pink-500 rounded-full opacity-10 blur-3xl"></div>
              
              <div className="relative px-8 py-20 lg:px-16 lg:py-28 text-center">
                <div className="flex justify-center mb-8">
                  <div className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-xl transform -rotate-6 transition-transform hover:rotate-0 duration-300">
                    <GraduationCap className="h-16 w-16 text-white transform rotate-6" />
                  </div>
                </div>
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
                  ยกระดับการจัดการทุนการศึกษา <br className="hidden md:block mt-2" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">ด้วย Data Analytics</span>
                </h2>
                
                <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                  เปลี่ยนข้อมูลบน Excel ให้เป็น Dashboard อัจฉริยะในพริบตา วิเคราะห์จำนวนนักศึกษา  
                  และการกระจายตัวของทุนได้แบบ Real-time
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <label
                    htmlFor="file-upload"
                    className="relative group cursor-pointer inline-flex items-center justify-center px-8 py-5 text-lg font-bold text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl overflow-hidden shadow-xl hover:shadow-blue-500/30 hover:scale-105"
                  >
                    <div className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></div>
                    <Upload className="relative h-6 w-6 mr-3 group-hover:-translate-y-1 transition-transform" />
                    <span className="relative">อัพโหลดไฟล์ Excel เพื่อเริ่มต้น</span>
                  </label>
                  
                  {/* <a href="#" className="inline-flex items-center justify-center px-8 py-5 text-lg font-bold text-gray-700 bg-white border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md">
                    <FileSpreadsheet className="h-6 w-6 mr-3 text-gray-400" />
                    ดูตัวอย่างไฟล์
                  </a> */}
                </div>
              </div>
            </div>

            {/* How it Works Section */}
            <div className="mb-24">
              <div className="text-center mb-16">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">ทำงานง่ายๆ ใน 3 ขั้นตอน</h3>
                <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
                <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-1 bg-gradient-to-r from-blue-100 via-indigo-200 to-purple-100 -z-10 transform -translate-y-1/2 rounded-full"></div>
                
                {[
                  { step: "1", title: "เตรียมข้อมูล", desc: "เตรียมข้อมูลนักศึกษาและทุนในรูปแบบไฟล์ .xlsx หรือ .csv", icon: FileSpreadsheet, color: "text-blue-600", bg: "bg-blue-100" },
                  { step: "2", title: "อัพโหลดไฟล์", desc: "กดปุ่มอัพโหลดบนระบบ เลือกไฟล์ที่เตรียมไว้", icon: Upload, color: "text-indigo-600", bg: "bg-indigo-100" },
                  { step: "3", title: "ดูผลลัพธ์", desc: "ระบบจะสร้าง Dashboard และกราฟวิเคราะห์ให้ทันที", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-100" }
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center relative hover:-translate-y-2 transition-transform duration-300">
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-xl text-gray-900 shadow-md border-4 border-white">
                      {item.step}
                    </div>
                    <div className={`mx-auto w-24 h-24 ${item.bg} rounded-full flex items-center justify-center mb-6 mt-4`}>
                      <item.icon className={`h-12 w-12 ${item.color}`} />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h4>
                    <p className="text-gray-600 text-lg">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Features Grid */}
            <div className="mb-12">
              <div className="text-center mb-16">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">ฟีเจอร์ที่ช่วยให้งานคุณง่ายขึ้น</h3>
                <div className="w-24 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FeatureCard
                  icon={School}
                  title="ภาพรวมสถาบัน"
                  description="ดูสรุปจำนวนนักศึกษา งบประมาณ และการอนุมัติทุนของแต่ละสถาบันได้ในหน้าเดียว"
                  color="from-blue-500 to-indigo-600"
                />
                <FeatureCard
                  icon={Users}
                  title="สถิติผู้รับทุน"
                  description="วิเคราะห์ข้อมูลประชากรศาสตร์ เช่น อายุ เพศ คณะที่สังกัด ของผู้ได้รับทุน"
                  color="from-purple-500 to-violet-600"
                />
                <FeatureCard
                  icon={Award}
                  title="เจาะลึกประเภททุน"
                  description="ดูความนิยมและการกระจายตัวของประเภททุนต่างๆ ทั้งให้เปล่าและส่วนลด"
                  color="from-emerald-500 to-teal-600"
                />
                <FeatureCard
                  icon={Search}
                  title="ช่องทางการรับรู้"
                  description="วิเคราะห์ประสิทธิภาพของช่องทางประชาสัมพันธ์ที่ทำให้นักศึกษารู้จักทุน"
                  color="from-amber-500 to-orange-600"
                />
              </div>
            </div>
          </div>
        ) : data.length > 0 && (
          <>
            {/* Modern Controls */}
            <div className="relative z-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">เลือกสถาบัน</label>
                  <MultiSelectDropdown
                    options={institutions}
                    selectedValues={selectedInstitution}
                    onChange={setSelectedInstitution}
                    placeholder="เลือกสถาบัน"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">เลือกคณะ</label>
                  <MultiSelectDropdown
                    options={facultyGroups}
                    selectedValues={selectedFacultyGroup}
                    onChange={setSelectedFacultyGroup}
                    placeholder="เลือกคณะ"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">เลือกสาขา</label>
                  <MultiSelectDropdown
                    options={faculties}
                    selectedValues={selectedFaculty}
                    onChange={setSelectedFaculty}
                    placeholder="เลือกสาขา"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">ประเภททุน/ส่วนลด</label>
                  <MultiSelectDropdown
                    options={scholarshipTypes}
                    selectedValues={selectedScholarshipType}
                    onChange={setSelectedScholarshipType}
                    placeholder="ประเภททุน/ส่วนลด"
                  />
                </div>
              </div>
            </div>

            {/* Scholarship Type Chart - Expanded at top */}
            {data.length > 0 && (
              <div className="grid grid-cols-1 gap-8 mb-8">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg mr-3">
                        <Award className="h-5 w-5 text-white" />
                      </div>
                      จำนวนผู้ได้รับทุนตามประเภททุน
                    </h3>
                  </div>
                  <div className="overflow-y-auto custom-scrollbar pr-2" style={{ height: '400px' }}>
                    <ResponsiveContainer width="100%" height={Math.max(400, scholarshipTypeChartData.length * 35 + 40)}>
                      <BarChart data={scholarshipTypeChartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={true} vertical={false} />
                        <XAxis type="number" stroke="#64748b" hide />
                        <YAxis
                          dataKey="name"
                          type="category"
                          stroke="#64748b"
                          width={220}
                          tick={{ fontSize: 11, fill: '#475569' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: '#f1f5f9' }}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                          }}
                          formatter={(value) => [`${value} คน`, 'จำนวน']}
                        />
                        <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
                          {scholarshipTypeChartData.map((entry, index) => {
                            const isTop = index === 0;
                            return (
                              <Cell
                                key={`cell-${index}`}
                                fill={isTop ? '#10b981' : '#6ee7b7'}
                              />
                            );
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Age & Gender alongside Faculty Chart */}
            {data.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Left Column: Stats Cards */}
                <div className="col-span-1 flex flex-col gap-6">
                  {(() => {
                    const cardsData = [];
                    const ageCol = headers.find(h => typeof h === 'string' && h.includes('อายุ'));
                    const genderCol = headers.find(h => typeof h === 'string' && h.includes('เพศ'));

                    if (ageCol && summaryStats[ageCol]) {
                      cardsData.push({
                        title: ageCol,
                        value: summaryStats[ageCol].average.toFixed(0),
                        subtitle: 'ค่าเฉลี่ย',
                        icon: Users
                      });
                    }

                    if (genderCol) {
                      if (summaryStats[genderCol]) {
                        cardsData.push({
                          title: genderCol,
                          value: summaryStats[genderCol].average.toFixed(1),
                          subtitle: 'ค่าเฉลี่ย',
                          icon: Users
                        });
                      } else {
                        const counts = filteredData.reduce((acc, row) => {
                          const val = row[genderCol];
                          if (val) acc[val] = (acc[val] || 0) + 1;
                          return acc;
                        }, {});
                        let maxVal = '-';
                        let maxCount = 0;
                        Object.entries(counts).forEach(([k, v]) => {
                          if (v > maxCount) {
                            maxCount = v;
                            maxVal = k;
                          }
                        });
                        cardsData.push({
                          title: genderCol,
                          value: maxVal,
                          subtitle: `ส่วนใหญ่ (${maxCount} คน)`,
                          icon: Users
                        });
                      }
                    }

                    return cardsData.map((card, index) => (
                      <div className="h-full" key={card.title}>
                        <ScholarshipStatCard
                          title={card.title}
                          value={card.value}
                          subtitle={card.subtitle}
                          icon={card.icon}
                          gradient={gradients[index % gradients.length]}
                          trend={Math.floor(Math.random() * 15) + 5}
                        />
                      </div>
                    ));
                  })()}
                </div>

                {/* Right Column: Faculty Chart */}
                <div className="col-span-1 lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg mr-3">
                        <School className="h-5 w-5 text-white" />
                      </div>
                      จำนวนผู้ได้รับทุนตามคณะ
                    </h3>
                  </div>
                  <div className="flex-1 min-h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={facultyChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          stroke="#64748b"
                          tick={{ fontSize: 10 }}
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
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* All Scholarships Dashboard */}
            {allScholarshipsData && allScholarshipsData.length > 0 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg mr-3">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    รายชื่อทุนทั้งหมด ({allScholarshipsData.length} ทุน)
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {allScholarshipsData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md hover:border-amber-200 transition-all">
                      <span className="font-medium text-gray-800 break-words flex-1 pr-4">{item.name}</span>
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-bold shadow-sm whitespace-nowrap">
                        {item.count} คน
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* By channel - big chart on its own row (bottom) */}
            <div className="grid grid-cols-1 gap-8 mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg mr-3">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    ช่องทางที่รู้จักมหาวิทยาลัย (ผู้ได้ทุน)
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={channelChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={130}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {channelChartData.map((entry, index) => (
                        <Cell
                          key={`cell-channel-${index}`}
                          fill={colors[index % colors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
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

        {/* Stats for Preview Mode Removed */}
      </div>
    </div>
  );
};

export default ScholarshipDashboard;