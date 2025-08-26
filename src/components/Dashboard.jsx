import React from "react";

export default function Dashboard({ data }) {
    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
                Dashboard แสดงข้อมูลทุน
            </h1>
            <p className="text-gray-600">ไฟล์ที่อัปโหลด: {data.filename}</p>

            {/* TODO: ใส่ตาราง/กราฟ */}
            <div className="mt-6 p-6 bg-white shadow rounded-xl">
                <p>ยังไม่มีตาราง/กราฟ (รอใส่เพิ่ม)</p>
            </div>
        </div>
    );
}
