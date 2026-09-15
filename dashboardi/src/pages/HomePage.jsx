import WeatherCard from "../components/WeatherCard/WeatherCard";
import ClockCard from "../components/ClockCard/ClockCard";
import ScheduleCard from "../components/ScheduleCard/ScheduleCard";
import TodoCard from "../components/TodoCard/TodoCard";
import SchoolFilesCard from "../components/SchoolFilesCard/SchoolFilesCard";
import PushNotificationSyuichi from "../components/PushNotificationSyuichi/PushNotificationSyuichi";
import PushNotificationTsukiichi from "../components/PushNotificationTsukiichi/PushNotificationTsukiichi";
import { useState, useEffect } from "react";

export default function HomePage() {
	const [showSyuichi, setShowSyuichi] = useState(false);
	const [showTsukiichi, setShowTsukiichi] = useState(false);

	useEffect(() => {
		const now = new Date();

		// 今週の番号を作る
		const startOfYear = new Date(now.getFullYear(), 0, 1);
		const weekNumber = Math.ceil(
			(((now - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7
		);

		const weekKey = `${now.getFullYear()}-${weekNumber}`;
		const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;

		const syuichiDismissed =
			localStorage.getItem("syuichi-dismissed") === weekKey;

		const tsukiichiDismissed =
			localStorage.getItem("tsukiichi-dismissed") === monthKey;

		// 金曜日なら週一通知
		if (now.getDay() === 5 && !syuichiDismissed) {
			setShowSyuichi(true);
		}

		// 1日なら月一通知
		if (now.getDate() === 1 && !tsukiichiDismissed) {
			setShowTsukiichi(true);
		}
	}, []);

	const closeSyuichi = () => {
		const now = new Date();

		const startOfYear = new Date(now.getFullYear(), 0, 1);
		const weekNumber = Math.ceil(
			(((now - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7
		);

		const weekKey = `${now.getFullYear()}-${weekNumber}`;

		localStorage.setItem("syuichi-dismissed", weekKey);
		setShowSyuichi(false);
	};

	const closeTsukiichi = () => {
		const now = new Date();

		const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;

		localStorage.setItem("tsukiichi-dismissed", monthKey);
		setShowTsukiichi(false);
	};

	return (
		<div style={{ padding: "20px" }}>
			{showSyuichi && (
				<PushNotificationSyuichi
					onClose={closeSyuichi}
				/>
			)}

			{showTsukiichi && (
				<PushNotificationTsukiichi
					onClose={closeTsukiichi}
				/>
			)}

			<ClockCard />
			<WeatherCard />

			<div className="sandt">
				<ScheduleCard />
				<TodoCard />
			</div>

			<SchoolFilesCard />
		</div>
	);
}