import { useEffect, useState } from "react";

export default function TodoCard() {
	const [todos, setTodos] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetch("/api/todos")
			.then(async (res) => {
				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "Todoの取得に失敗しました");
				}

				return data;
			})
			.then((data) => {
				setTodos(data);
			})
			.catch((err) => {
				setError(err.message);
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	return (
		<div>
			<div className="liquid-glass" style={{width: "35%"}}>
				<div className="glass-text">
					<div className="card todo-card">
						<h2>Todo</h2>

						{/* 修正：条件分岐の文字列囲みを解除 */}
						{loading && <p>読み込み中...</p>}

						{/* 修正：エラー表示の文字列囲みを解除 */}
						{error && <p>エラー: {error}</p>}

						{/* 修正：データが空のときの表示 */}
						{!loading && !error && todos.length === 0 && (
							<p>Todoがありません</p>
						)}

						{/* 修正：ループ処理をJavaScriptの式として展開（key属性を追加） */}
						{!loading && !error && todos.map((todo) => (
							<div className="todo-item" key={todo.id || todo.title}>
								{/* 修正：APIのデータ構造（例: completedフラグ）に合わせてチェック状態を制御 */}
								<input 
									type="checkbox" 
									checked={todo.completed || false} 
									readOnly 
								/>
								<span>{todo.title}</span>
							</div>
						))}
					</div>
				</div>
			</div>
			<svg
				style={{
					display: "none",
				}}
				xmlns="http://www.w3.org/2000/svg">
				<defs>
					<filter height="100%" id="glass-distortion" width="100%" x="0%" y="0%">
						<feTurbulence
							baseFrequency="0.008 0.008"
							numOctaves="2"
							result="noise"
							seed="92"
							type="fractalNoise"
						/>
						<feGaussianBlur in="noise" result="blurred" stdDeviation="2" />
						<feDisplacementMap
							in="SourceGraphic"
							in2="blurred"
							scale="77"
							xChannelSelector="R"
							yChannelSelector="G"
						/>
					</filter>
				</defs>
			</svg>
		</div>
	);
}
