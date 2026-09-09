"use client";

import { Pause, Play, X } from "lucide-react";

const GREEN = "#a8e34b";
const PAUSED = "#8c8c8c";

type Phase = "focus" | "break";

type PomodoroTimerProps = {
	phase: Phase;
	remaining: number;
	duration: number;
	isRunning: boolean;
	onPause: () => void;
	onCancel: () => void;
	onResume: () => void;
};

const formatTime = (seconds: number) => {
	const safe = Math.max(0, Math.ceil(seconds));
	const minutes = Math.floor(safe / 60);
	const secs = safe % 60;
	return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export default function PomodoroTimer({
	                                      phase,
	                                      remaining,
	                                      duration,
	                                      isRunning,
	                                      onPause,
	                                      onCancel,
	                                      onResume,
                                      }: PomodoroTimerProps) {
	const radius = 154;
	const circumference = 2 * Math.PI * radius;
	const progress = duration > 0 ? Math.min(1, Math.max(0, remaining / duration)) : 0;
	const dashOffset = circumference * (1 - progress);
	const phaseName = phase === "focus" ? "Focus" : "Break";

	return (
		<section className="pomodoro-timer" aria-live="polite" aria-label="Pomodoro timer">
			<style jsx>{`
				.pomodoro-timer {
					min-height: calc(100vh - 88px);
					min-height: calc(100dvh - 88px);
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 40px 24px 64px;
					box-sizing: border-box;
				}

				.timer-content {
					display: flex;
					width: min(520px, 100%);
					flex-direction: column;
					align-items: center;
					justify-content: center;
					text-align: center;
				}

				.phase-label {
					display: inline-flex;
					align-items: center;
					gap: 9px;
					color: ${isRunning ? "#b3b3b3" : PAUSED};
					font-size: 0.8rem;
					font-weight: 700;
					letter-spacing: 0.12em;
					text-transform: uppercase;
				}

				.phase-dot {
					width: 7px;
					height: 7px;
					border-radius: 50%;
					background: ${isRunning ? GREEN : PAUSED};
				}

				.ring-wrap {
					position: relative;
					width: min(390px, 78vw, 50vh);
					aspect-ratio: 1;
					margin: 22px 0 28px;
				}

				.ring-svg {
					width: 100%;
					height: 100%;
					transform: rotate(-90deg);
					overflow: visible;
				}

				.ring-track,
				.ring-progress {
					fill: none;
					stroke-width: 10;
				}

				.ring-track {
					stroke: #262626;
				}

				.ring-progress {
					stroke: ${GREEN};
					stroke-linecap: round;
				}

				.timer-center {
					position: absolute;
					inset: 0;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
				}

				.timer-time {
					margin: 0;
					color: #f2f2f2;
					font-size: clamp(4.25rem, 11vw, 6.4rem);
					line-height: 0.95;
					font-weight: 600;
					letter-spacing: -0.075em;
					font-variant-numeric: tabular-nums;
				}

				.timer-phase {
					margin: 16px 0 0;
					color: #b3b3b3;
					font-size: 0.9rem;
				}

				.timer-actions {
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 12px;
				}

				.timer-action {
					min-width: 128px;
					height: 46px;
					border: 0;
					border-radius: 12px;
					background: #262626;
					color: #b3b3b3;
					display: inline-flex;
					align-items: center;
					justify-content: center;
					gap: 8px;
					padding: 0 18px;
					font: 600 0.88rem/1 Inter, sans-serif;
					cursor: pointer;
					transition: filter 160ms ease, color 160ms ease;
				}

				.timer-action:hover {
					filter: brightness(1.12);
					color: #f2f2f2;
				}

				.timer-action.primary {
					color: #f2f2f2;
				}

				@media (max-width: 700px) {
					.pomodoro-timer {
						min-height: calc(100vh - 72px);
						min-height: calc(100dvh - 72px);
						padding: 28px 16px 44px;
					}

					.ring-wrap {
						width: min(330px, 82vw, 52vh);
					}

					.timer-actions {
						width: min(330px, 100%);
					}

					.timer-action {
						flex: 1;
						min-width: 0;
					}
				}

				@media (prefers-reduced-motion: reduce) {
					.timer-action {
						transition: none;
					}
				}
			`}</style>

			<div className="timer-content">
				<div className="phase-label">
					<span className="phase-dot" />
					{isRunning ? phaseName : "Paused"}
				</div>

				<div className="ring-wrap">
					<svg className="ring-svg" viewBox="0 0 340 340" aria-hidden="true">
						<circle className="ring-track" cx="170" cy="170" r={radius} />
						<circle
							className="ring-progress"
							cx="170"
							cy="170"
							r={radius}
							strokeDasharray={circumference}
							strokeDashoffset={dashOffset}
						/>
					</svg>

					<div className="timer-center">
						<p className="timer-time">{formatTime(remaining)}</p>
					</div>
				</div>

				<div className="timer-actions">
					{isRunning ? (
						<button type="button" className="timer-action primary" onClick={onPause}>
							<Pause size={17} />
							Pause
						</button>
					) : (
						<button type="button" className="timer-action primary" onClick={onResume}>
							<Play size={17} fill="currentColor" />
							Resume
						</button>
					)}

					<button type="button" className="timer-action" onClick={onCancel}>
						<X size={17} />
						Cancel
					</button>
				</div>
			</div>
		</section>
	);
}
