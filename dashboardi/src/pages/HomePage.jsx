import WeatherCard from "../components/WeatherCard/WeatherCard";
import ClockCard from "../components/ClockCard/ClockCard";
import ScheduleCard from "../components/ScheduleCard/ScheduleCard";
import TodoCard from "../components/TodoCard/TodoCard";
import SchoolFilesCard from "../components/SchoolFilesCard/SchoolFilesCard"
import PushNotificationSyuichi from "../components/PushNotificationSyuichi/PushNotificationSyuichi";
import PushNotificationTsukiichi from "../components/PushNotificationTsukiichi/PushNotificationTsukiichi";

export default function HomePage() {
	return (
		<div style={{ padding: "20px" }}>
			<PushNotificationSyuichi />
			<PushNotificationTsukiichi />
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
