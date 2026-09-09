import { useState } from "react";

export default function SchoolFilesCard() {
	const [file, setFile] = useState(null);

	const handleFileChange = (event) => {
		const selectedFile = event.target.files[0];

		if (!selectedFile) return;

		setFile(selectedFile);
	};

	return (
		<div className="school-files-card">
			<div className="school-files-header">
				<h2>学校書類</h2>
				<p>学校でもらった書類をまとめて管理</p>
			</div>

			<div className="school-files-upload">
				<label
					htmlFor="school-file-upload"
					className="school-files-upload-button"
				>
					＋ ファイルを追加
				</label>

				<input
					id="school-file-upload"
					type="file"
					hidden
					onChange={handleFileChange}
				/>
			</div>

			{file && (
				<div className="school-file-item">
					<span>📄</span>
					<span>{file.name}</span>
				</div>
			)}
		</div>
	);
}