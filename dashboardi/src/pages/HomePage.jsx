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

		// 金曜日なら表示
		if (now.getDay() === 5) {
			setShowSyuichi(true);
		}

		// 毎月1日なら表示
		if (now.getDate() === 1) {
			setShowTsukiichi(true);
		}
	}, []);

	return (
		<div style={{ padding: "20px" }}>
			{showSyuichi && (
				<PushNotificationSyuichi
					onClose={() => setShowSyuichi(false)}
				/>
			)}

			{showTsukiichi && (
				<PushNotificationTsukiichi
					onClose={() => setShowTsukiichi(false)}
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