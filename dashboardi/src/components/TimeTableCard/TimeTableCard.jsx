function TimeTableCard() {
	return (
		<div className="liquid-glass">
			<div className="glass-text">
				<div className="timetable-card">
					<h2>時間割</h2>

					<iframe
						src="https://drive.google.com/file/d/1VXc-BA1y5Y3oxN9NKAjON9ICRHxgVM2a/preview"
						title="時間割表"
						className="timetable-pdf"
					/>
				</div>
			</div>
		</div>
	);
}

export default TimeTableCard;