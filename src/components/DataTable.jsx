import React from "react";

export default function DataTable({ data, headers }) {
    return (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            {headers.map((h, i) => (
                                <th key={i} className="px-4 py-2 text-left">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.slice(0, 50).map((row, i) => (
                            <tr key={i} className="border-t hover:bg-gray-50">
                                {headers.map((h, j) => (
                                    <td key={j} className="px-4 py-2">{row[h]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="p-3 text-sm text-gray-500">แสดง 50 แถวแรก</p>
        </div>
    );
}
