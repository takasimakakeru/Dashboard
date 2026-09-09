import { useEffect, useState } from "react";

const FILE_TYPES = [
	"時間割",
	"プリント",
	"行事",
	"提出物",
	"その他"
];

export default function SchoolFilesCard() {
	const [files, setFiles] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");


	const [selectedFile, setSelectedFile] = useState(null);
	const [name, setName] = useState("");
	const [type, setType] = useState("その他");
	const [addedDate, setAddedDate] = useState(
		new Date().toISOString().slice(0, 10)
	);

	const [uploading, setUploading] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [editName, setEditName] = useState("");
	const [editType, setEditType] = useState("その他");
	const [editAddedDate, setEditAddedDate] = useState("");
	const [updating, setUpdating] = useState(false);

	const fetchFiles = async () => {
		try {
			setLoading(true);

			const response = await fetch(
				"/api/school-files"
			);

			if (!response.ok) {
				throw new Error(
					"学校書類の取得に失敗しました"
				);
			}

			const data = await response.json();

			setFiles(data);
			setError("");
		} catch (error) {
			console.error(error);
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchFiles();
	}, []);

	const handleFileChange = (event) => {
		const file = event.target.files?.[0];

		if (!file) {
			return;
		}

		setSelectedFile(file);

		// ファイル名を初期値にする
		setName(
			file.name.replace(/\.[^/.]+$/, "")
		);
	};

	const handleUpload = async () => {
		if (!selectedFile) {
			alert("ファイルを選択してください");
			return;
		}

		if (!name.trim()) {
			alert("名前を入力してください");
			return;
		}

		if (!addedDate) {
			alert("追加日を指定してください");
			return;
		}

		try {
			setUploading(true);

			const formData = new FormData();

			formData.append(
				"file",
				selectedFile
			);

			formData.append(
				"name",
				name.trim()
			);

			formData.append(
				"type",
				type
			);

			formData.append(
				"addedDate",
				addedDate
			);

			const response = await fetch(
				"/api/school-files",
				{
					method: "POST",
					body: formData
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					data.error ||
					"アップロードに失敗しました"
				);
			}

			// フォームをリセット
			setSelectedFile(null);
			setName("");
			setType("その他");
			setAddedDate(
				new Date()
					.toISOString()
					.slice(0, 10)
			);

			// input[type=file] をリセット
			const input = document.getElementById(
				"school-file-upload"
			);

			if (input) {
				input.value = "";
			}

			// 一覧を再取得
			await fetchFiles();

			alert("ファイルを追加しました");
		} catch (error) {
			console.error(error);
			alert(error.message);
		} finally {
			setUploading(false);
		}
	};

	const handleUpdate = async (file) => {
		if (!editName.trim()) {
			alert("名前を入力してください");
			return;
		}

		if (!editAddedDate) {
			alert("追加日を指定してください");
			return;
		}

		try {
			setUpdating(true);

			const response = await fetch(
				`/api/school-files/${file.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({
						name: editName.trim(),
						type: editType,
						addedDate: editAddedDate
					})
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					data.error ||
					"更新に失敗しました"
				);
			}

			await fetchFiles();

			setEditingId(null);

		} catch (error) {
			console.error(error);
			alert(error.message);
		} finally {
			setUpdating(false);
		}
	};

	return (
		<div className="liquid-glass">
			<div className="glass-text">
				<div className="school-files-card">

					<div className="school-files-header">
						<h2>学校書類</h2>
						<p>
							学校でもらった書類をまとめて管理
						</p>
					</div>

					<div className="school-files-upload">

						<label
							htmlFor="school-file-upload"
							className="school-files-upload-button"
						>
							＋ ファイルを選択
						</label>

						<input
							id="school-file-upload"
							type="file"
							hidden
							onChange={handleFileChange}
						/>

						{selectedFile && (
							<div className="school-files-form">

								<p className="school-files-selected">
									📄 {selectedFile.name}
								</p>

								<label>
									<span>名前</span>

									<input
										type="text"
										value={name}
										onChange={(event) =>
											setName(
												event.target.value
											)
										}
										placeholder="書類の名前"
									/>
								</label>

								<label>
									<span>種類</span>

									<select
										value={type}
										onChange={(event) =>
											setType(
												event.target.value
											)
										}
									>
										{FILE_TYPES.map(
											(fileType) => (
												<option
													key={fileType}
													value={fileType}
												>
													{fileType}
												</option>
											)
										)}
									</select>
								</label>

								<label>
									<span>追加日</span>

									<input
										type="date"
										value={addedDate}
										onChange={(event) =>
											setAddedDate(
												event.target.value
											)
										}
									/>
								</label>

								<button
									type="button"
									className="school-files-submit"
									onClick={handleUpload}
									disabled={uploading}
								>
									{uploading
										? "アップロード中..."
										: "追加する"}
								</button>

							</div>
						)}
					</div>

					{loading && (
						<p>読み込み中...</p>
					)}

					{error && (
						<p>{error}</p>
					)}

					{!loading &&
						!error &&
						files.length === 0 && (
							<p>
								学校書類はありません
							</p>
						)}

					{!loading &&
						!error &&
						files.length > 0 && (
							<div className="school-files-list">

								{files.map((file) => (
									<div
										key={file.id}
										className="school-file-item"
									>

										<div className="school-file-info">

											{editingId === file.id && (
												<div className="school-file-edit-form">

													<label>
														<span>名前</span>

														<input
															type="text"
															value={editName}
															onChange={(event) =>
																setEditName(event.target.value)
															}
														/>
													</label>

													<label>
														<span>種類</span>

														<select
															value={editType}
															onChange={(event) =>
																setEditType(event.target.value)
															}
														>
															{FILE_TYPES.map((fileType) => (
																<option
																	key={fileType}
																	value={fileType}
																>
																	{fileType}
																</option>
															))}
														</select>
													</label>

													<label>
														<span>追加日</span>

														<input
															type="date"
															value={editAddedDate}
															onChange={(event) =>
																setEditAddedDate(event.target.value)
															}
														/>
													</label>

													<div>
														<button
															className="original-button"
															type="button"
															onClick={() =>
																handleUpdate(file)
															}
															disabled={updating}
														>
															{updating
																? "更新中..."
																: "保存"}
														</button>

														<button
															className="original-button"
															type="button"
															onClick={() =>
																setEditingId(null)
															}
															disabled={updating}
														>
															キャンセル
														</button>
													</div>

												</div>
											)}

											<span className="school-file-icon">
												📄
											</span>

											<div>
												<h3>
													{file.name}
												</h3>

												<p>
													{file.type}
													{" ・ "}
													{file.addedDate}
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

										<button
											className="original-button"
											type="button"
											onClick={() => {
												setEditingId(file.id);
												setEditName(file.name);
												setEditType(file.type);
												setEditAddedDate(file.addedDate);
											}}
										>
											編集
										</button>

										<button
											className="original-button"
											style={{ backgroundColor: "red" }}
											onClick={async () => {
												try {
													const response =
														await fetch(
															`/api/school-files/${file.id}`,
															{
																method: "DELETE"
															}
														);

													if (!response.ok) {
														throw new Error(
															"削除に失敗しました"
														);
													}

													setFiles(
														(currentFiles) =>
															currentFiles.filter(
																(currentFile) =>
																	currentFile.id !==
																	file.id
															)
													);
												} catch (error) {
													console.error(
														error
													);

													alert(
														"削除に失敗しました"
													);
												}
											}}
										>
											削除
										</button>

									</div>
								))}

							</div>
						)}
				</div>
			</div>
		</div>
	);
}
