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
		<div className="card todo-card">
			<h2>Todo</h2>

			{loading && <p>読み込み中...</p>}

			{error && <p>エラー: {error}</p>}

			{!loading && !error && todos.length === 0 && (
				<p>Todoがありません</p>
			)}

			{todos.map((todo) => (
				<div key={todo.id} className="todo-item">
					<input
						type="checkbox"
						checked={todo.checked}
						readOnly
					/>
					<span>{todo.title}</span>
				</div>
			))}
		</div>
	);
}