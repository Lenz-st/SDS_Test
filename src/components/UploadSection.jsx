export default function UploadSection({ onUploadComplete }) {
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // สมมติแค่เก็บชื่อไฟล์
        onUploadComplete({ filename: file.name });
    };

    return (
        <div className="bg-white shadow-lg rounded-2xl p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
                เลือกไฟล์เพื่ออัปโหลด
            </h2>
            <input type="file" accept=".xlsx,.csv" onChange={handleFileUpload} />
        </div>
    );
}
