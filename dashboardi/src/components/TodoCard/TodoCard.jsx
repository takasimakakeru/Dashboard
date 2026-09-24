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
					throw new Error(
						data.error || "Todoの取得に失敗しました"
					);
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
		if (!newTodo.trim()) {
			return;
		}

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
			alert(data.error || "Todoの追加に失敗しました");
			return;
		}

		setTodos((prev) => [...prev, data]);
		setNewTodo("");
	};

	const deleteTodo = async (id) => {
		const response = await fetch(`/api/todo/${id}`, {
			method: "DELETE"
		});

		const data = await response.json();

		console.log(response.status);
		console.log(data);

		if (!response.ok) {
			alert(data.error || "Todoの削除に失敗しました");
			return;
		}

		setTodos((prev) =>
			prev.filter((todo) => todo.id !== id)
		);
	};

	const toggleTodo = async (id, checked) => {
		const response = await fetch(`/api/todo/${id}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				checked: !checked
			})
		});

		const data = await response.json();

		console.log(response.status);
		console.log(data);

		if (!response.ok) {
			alert(data.error || "Todoの更新に失敗しました");
			return;
		}

		setTodos((prev) =>
			prev.map((todo) =>
				todo.id === id
					? {
							...todo,
							checked: data.checked
						}
					: todo
			)
		);
	};

	return (
		<div>
			<div className="liquid-glass">
				<div className="glass-text">
					<div className="card todo-card">
						<h2>Todo</h2>

						<div className="input-wrapper">
							<span className="icon-left">
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="#6b7280"
									strokeWidth="1.75"
									strokeLinecap="round"
									strokeLinejoin="round"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
									<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
								</svg>
							</span>

							<input
								value={newTodo}
								onChange={(e) =>
									setNewTodo(e.target.value)
								}
								className="custom-input"
								type="text"
								placeholder="予定を入力..."
							/>
						</div>

						<button
							onClick={addTodo}
							className="original-button"
						>
							追加
						</button>

						{loading && <p>読み込み中...</p>}

						{error && <p>エラー: {error}</p>}

						{!loading &&
							!error &&
							todos.length === 0 && (
								<p>Todoがありません</p>
							)}

						{!loading &&
							!error &&
							todos.map((todo) => (
								<div
									className="todo-item"
									key={todo.id}
								>
									<input
										type="checkbox"
										checked={todo.checked}
										onChange={() =>
											toggleTodo(
												todo.id,
												todo.checked
											)
										}
									/>

									<span>{todo.title}</span>

									<button
										onClick={() =>
											deleteTodo(todo.id)
										}
										className="original-button"
										style={{
											backgroundColor: "red"
										}}
									>
										削除
									</button>
								</div>
							))}
					</div>
				</div>
			</div>

			<svg
				style={{
					display: "none"
				}}
				xmlns="http://www.w3.org/2000/svg"
			>
				<defs>
					<filter
						height="100%"
						id="glass-distortion"
						width="100%"
						x="0%"
						y="0%"
					>
						<feTurbulence
							baseFrequency="0.008 0.008"
							numOctaves="2"
							result="noise"
							seed="92"
							type="fractalNoise"
						/>
						<feGaussianBlur
							in="noise"
							result="blurred"
							stdDeviation="2"
						/>
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