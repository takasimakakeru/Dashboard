import { useEffect, useState } from "react";

export default function SchoolFilesCard() {
	const [files, setFiles] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchFiles = async () => {
			try {
				const response = await fetch("/api/school-files");

				if (!response.ok) {
					throw new Error("学校書類の取得に失敗しました");
				}

				const data = await response.json();

				setFiles(data);
			} catch (error) {
				console.error(error);
				setError(error.message);
			} finally {
				setLoading(false);
			}
		};

		fetchFiles();
	}, []);

	return (
		<div className="liquid-glass">
			<div className="glass-text">
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
				/>
			</div>

			{loading && (
				<p>読み込み中...</p>
			)}

			{error && (
				<p>{error}</p>
			)}

			{!loading && !error && files.length === 0 && (
				<p>学校書類はありません</p>
			)}

			{!loading && !error && files.length > 0 && (
				<div className="school-files-list">
					{files.map((file) => (
						<div
							key={file.id}
							className="school-file-item"
						>
							<div className="school-file-info">
								<span className="school-file-icon">
									📄
								</span>
							<button
	onClick={async () => {
		try {
			const response = await fetch(
				`/api/school-files/${file.id}`,
				{
					method: "DELETE"
				}
			);

			if (!response.ok) {
				throw new Error("削除に失敗しました");
			}

			setFiles((currentFiles) =>
				currentFiles.filter(
					(currentFile) => currentFile.id !== file.id
				)
			);
		} catch (error) {
			console.error(error);
			alert("削除に失敗しました");
		}
	}}
>
	削除
</button>
								<div>
									<h3>{file.name}</h3>
									<p>
										{file.type} ・ {file.addedDate}
									</p>
								</div>
							</div>

							{file.fileUrl && (
								<img
									src={file.fileUrl}
									alt={file.name}
									className="school-file-preview"
								/>
							)}
						</div>
					))}
				</div>
			)}
		</div>
		</div>
		</div>
	);
}