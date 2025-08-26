import React, { useState } from "react";
import UploadSection from "./components/UploadSection";
import Dashboard from "./components/Dashboard"; // <- สร้างเพิ่ม
import { GraduationCap } from "lucide-react";

export default function App() {
  const [uploadedData, setUploadedData] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 flex flex-col">
      {!uploadedData ? (
        <>
          {/* Landing Page */}
          <header className="text-center py-16">
            <div className="flex justify-center mb-6">
              <GraduationCap className="w-16 h-16 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">
              Scholarship Decision Dashboard
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
              ระบบสำหรับอัปโหลดไฟล์ทุนการศึกษาและแสดงผลในรูปแบบกราฟและตาราง
            </p>
          </header>

          {/* Upload Section */}
          <main className="flex-1 flex flex-col justify-center items-center py-16">
            <UploadSection onUploadComplete={setUploadedData} />
          </main>
        </>
      ) : (
        // Dashboard เมื่ออัปโหลดเสร็จ
        <Dashboard data={uploadedData} />
      )}
    </div>
  );
}
