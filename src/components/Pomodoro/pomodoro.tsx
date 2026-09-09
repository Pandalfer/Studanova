"use client";

import { useEffect, useMemo, useState } from "react";
import { Play } from "lucide-react";
import PomodoroTimer from "@/components/Pomodoro/pomodorotimer";

const DEFAULT_FOCUS_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;
const MAX_FOCUS_MINUTES = 23 * 60 + 59;
const MAX_BREAK_MINUTES = 59;

type Phase = "focus" | "break";

const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));

export default function Pomodoro() {
	const [focusMinutes, setFocusMinutes] = useState(DEFAULT_FOCUS_MINUTES);
	const [breakMinutes, setBreakMinutes] = useState(DEFAULT_BREAK_MINUTES);
	const [phase, setPhase] = useState<Phase>("focus");
	const [remaining, setRemaining] = useState(DEFAULT_FOCUS_MINUTES * 60);
	const [isRunning, setIsRunning] = useState(false);
	const [hasStarted, setHasStarted] = useState(false);

	const focusSeconds = useMemo(() => focusMinutes * 60, [focusMinutes]);
	const breakSeconds = useMemo(() => breakMinutes * 60, [breakMinutes]);
	const activeDuration = phase === "focus" ? focusSeconds : breakSeconds;

	const startTimer = () => {
		const focus = clamp(Math.round(focusMinutes), 1, MAX_FOCUS_MINUTES);
		const rest = clamp(Math.round(breakMinutes), 1, MAX_BREAK_MINUTES);

		setFocusMinutes(focus);
		setBreakMinutes(rest);
		setPhase("focus");
		setRemaining(focus * 60);
		setHasStarted(true);
		setIsRunning(true);
	};

	const cancelTimer = () => {
		setIsRunning(false);
		setHasStarted(false);
		setPhase("focus");
		setRemaining(focusSeconds);
	};

	useEffect(() => {
		if (!isRunning) return;

		const interval = window.setInterval(() => {
			setRemaining((current) => {
				if (current > 1) return current - 1;

				if (phase === "focus") {
					setPhase("break");
					return breakSeconds;
				}

				setPhase("focus");
				return focusSeconds;
			});
		}, 1000);

		return () => window.clearInterval(interval);
	}, [breakSeconds, focusSeconds, isRunning, phase]);

	if (hasStarted) {
		return (
			<PomodoroTimer
				phase={phase}
				remaining={remaining}
				duration={activeDuration}
				isRunning={isRunning}
				onPause={() => setIsRunning(false)}
				onResume={() => setIsRunning(true)}
				onCancel={cancelTimer}
			/>
		);
	}

	const handleFocusChange = (value: string) => {
		const next = Number(value);
		setFocusMinutes(Number.isFinite(next) ? next : 0);
	};

	const handleBreakChange = (value: string) => {
		const next = Number(value);
		setBreakMinutes(Number.isFinite(next) ? next : 0);
	};

	return (
		<main className="pomodoro-setup">
			<style jsx>{`
        .pomodoro-setup {
          min-height: calc(100vh - 88px);
          min-height: calc(100dvh - 88px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px 64px;
          box-sizing: border-box;
        }

        .setup-card {
          width: min(780px, 100%);
          padding: 32px;
          background: #1a1a1a;
          border: 1px;
          border-radius: 35px;
        }

        .setup-fields {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
          gap: 16px;
          align-items: stretch;
        }

        .duration-field {
          min-width: 0;
          padding: 20px;
          background: #262626;
          border: 1px;
          border-radius: 20px;
        }

        .duration-field label {
          display: block;
          margin-bottom: 11px;
          color: #b3b3b3;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .input-row {
          display: flex;
          align-items: baseline;
          gap: 9px;
        }

        .duration-input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #f2f2f2;
          font: 600 1.5rem/1 Inter, sans-serif;
          font-variant-numeric: tabular-nums;
        }

        .duration-input::-webkit-inner-spin-button,
        .duration-input::-webkit-outer-spin-button {
          opacity: 0.45;
        }

        .duration-input:focus-visible {
          outline: 1px solid #999999;
          outline-offset: 4px;
          border-radius: 4px;
        }

        .unit {
          color: #b3b3b3;
          font-size: 0.82rem;
          white-space: nowrap;
        }

        .start-button {
          min-width: 132px;
          border: 1px ;
          border-radius: 35px;
          background: #262626;
          color: #f2f2f2;
          padding: 0 24px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          font: 700 0.95rem/1 Inter, sans-serif;
          cursor: pointer;
          transition: filter 160ms ease;
        }

        .start-button:hover:not(:disabled) {
          filter: brightness(1.12);
        }

        .start-button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        @media (max-width: 700px) {
          .pomodoro-setup {
            min-height: calc(100vh - 72px);
            min-height: calc(100dvh - 72px);
            padding: 24px 16px 44px;
          }

          .setup-card {
            padding: 18px;
            border-radius: 28px;
          }

          .setup-fields {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .duration-field {
            padding: 18px;
            border-radius: 20px;
          }

          .start-button {
            min-height: 50px;
            border-radius: 18px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .start-button {
            transition: none;
          }
        }
      `}</style>

			<section className="setup-card" aria-label="Pomodoro settings">
				<div className="setup-fields">
					<div className="duration-field">
						<label htmlFor="pomodoro-focus">Focus duration</label>
						<div className="input-row">
							<input
								id="pomodoro-focus"
								className="duration-input"
								type="number"
								min={1}
								max={MAX_FOCUS_MINUTES}
								step={1}
								value={focusMinutes}
								onChange={(event) => handleFocusChange(event.target.value)}
								onBlur={() => setFocusMinutes(clamp(Math.round(focusMinutes), 1, MAX_FOCUS_MINUTES))}
							/>
							<span className="unit">minutes</span>
						</div>
					</div>

					<div className="duration-field">
						<label htmlFor="pomodoro-break">Break duration</label>
						<div className="input-row">
							<input
								id="pomodoro-break"
								className="duration-input"
								type="number"
								min={1}
								max={MAX_BREAK_MINUTES}
								step={1}
								value={breakMinutes}
								onChange={(event) => handleBreakChange(event.target.value)}
								onBlur={() => setBreakMinutes(clamp(Math.round(breakMinutes), 1, MAX_BREAK_MINUTES))}
							/>
							<span className="unit">minutes</span>
						</div>
					</div>

					<button
						type="button"
						className="start-button"
						onClick={startTimer}
						disabled={focusMinutes < 1 || breakMinutes < 1}
					>
						<Play size={17} fill="currentColor" />
						Start
					</button>
				</div>
			</section>
		</main>
	);
}
