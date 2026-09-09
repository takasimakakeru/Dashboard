function TimeTableCard({ timetableUrl }) {

  return (
    <div className="liquid-glass">
      <div className="glass-text">
    <div className="timetable-card">
      <h2>時間割</h2>

      {timetableUrl ? (
        <iframe
          src={timetableUrl}
          title="時間割表"
          className="timetable-pdf"
        />
      ) : (
        <p>時間割を取得中...</p>
      )}

    </div>
    </div>
    </div>
  );
}

export default TimeTableCard;