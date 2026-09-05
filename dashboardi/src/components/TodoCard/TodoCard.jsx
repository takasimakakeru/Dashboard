import { useEffect, useState } from "react";

export default function TodoCard() {
	const [todos, setTodos] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [newTodo, setNewTodo] = useState("");

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

	const addTodo = async () => {
		const response = await fetch("/api/todo", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				title: newTodo
			})
		});

		const data = await response.json();

		console.log(response.status);
		console.log(data);

		if (!response.ok) {
			alert(data.error);
			return;
		}

		window.location.reload();
	};

	return (
		<div>
			<div className="liquid-glass" style={{}}>
				<div className="glass-text">
					
					
					<div className="card todo-card">
						<h2>Todo</h2>
<div className="inputandbutton">
						<div class="input-wrapper">
  	<span class="icon-left">
    	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
  	</span>
  	<input
		value={newTodo}
		onChange={(e) => setNewTodo(e.target.value)}
    	class="custom-input"
    	type="text"
    	placeholder="予定を入力..."
  	/>
	</div>
	<button onClick={addTodo} class="original-button">追加</button>
	</div>

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

// 修正：CSSのクラス名を修正
