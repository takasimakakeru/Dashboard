function TimeTableCard() {
	return (
		<div className="liquid-glass">
			<div className="glass-text">
				<div className="timetable-card">
					<h2>時間割</h2>

					<iframe
						src="https://script.google.com/a/macros/g-ichinomiya.com/s/AKfycbyllFNOlohpXv1HteWlQrUOtsJ5qtd__s7H3NF74aLF9TNj__8msejk7As8Cnq2NzAXrw/exec"
						title="時間割取得"
						className="timetable-gas"
					/>
				</div>
			</div>
		</div>
	);
}

export default TimeTableCard;