"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface Point {
  date: string;
  overall: number;
  pitch: number | null;
  breath: number | null;
  intonation: number | null;
}

export default function TrendChart() {
  const [data, setData] = useState<Point[]>([]);

  useEffect(() => {
    fetch("/api/trends")
      .then((res) => res.json())
      .then((payload) => setData(payload.points ?? []))
      .catch(() => setData([]));
  }, []);

  return (
    <div className="card p-6">
      <p className="font-semibold">Overall progress</p>
      <p className="text-sm text-muted-foreground">Rolling view across key vocal metrics.</p>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 8, right: 8 }}>
            <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
            <YAxis domain={[0, 10]} />
            <Tooltip labelFormatter={(d) => new Date(d).toLocaleString()} />
            <Legend />
            <Line type="monotone" dataKey="overall" name="Overall" stroke="#0f172a" strokeWidth={2} />
            <Line type="monotone" dataKey="pitch" name="Pitch" stroke="#2563eb" />
            <Line type="monotone" dataKey="breath" name="Breath" stroke="#10b981" />
            <Line type="monotone" dataKey="intonation" name="Intonation" stroke="#f97316" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
