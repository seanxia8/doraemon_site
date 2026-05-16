import type { CSSProperties } from 'react';
import { models, questions } from '@/lib/site-data';

type MatrixProps = {
  compact?: boolean;
  className?: string;
};

type CellStyle = CSSProperties & Record<string, string | number>;

function score(row: number, column: number) {
  const wave = Math.sin(row * 1.83 + column * 0.77) * 0.18;
  const ridge = Math.cos((row - column) * 0.51) * 0.13;
  const band = row % 3 === 1 ? 0.12 : row % 3 === 2 ? -0.05 : 0.02;
  return Math.max(0.18, Math.min(0.97, 0.62 + wave + ridge + band));
}

function colorFor(value: number, row: number, column: number) {
  if (value >= 0.84) {
    return row % 2 === 0
      ? 'color-mix(in srgb, var(--palo-alto) 92%, white)'
      : 'color-mix(in srgb, var(--lagunita) 90%, white)';
  }
  if (value >= 0.68) {
    return column % 2 === 0
      ? 'color-mix(in srgb, var(--sky) 90%, white)'
      : 'color-mix(in srgb, var(--lagunita-light) 92%, white)';
  }
  if (value >= 0.5) {
    return 'color-mix(in srgb, var(--sky-light) 78%, white)';
  }
  return 'color-mix(in srgb, var(--black-20) 80%, white)';
}

export function EvaluationMatrix({ compact = false, className = '' }: MatrixProps) {
  const visibleModels = compact ? models.slice(0, 6) : models;
  const visibleQuestions = compact ? questions.slice(0, 8) : questions;

  return (
    <div
      aria-label={`${visibleModels.length} models by ${visibleQuestions.length} evaluation items`}
      className={`evaluation-matrix eg-phase-scanning ${compact ? 'is-compact' : ''} ${className}`.trim()}
      role="img"
    >
      <div
        className="matrix-heading"
        style={
          {
            '--cols': visibleQuestions.length,
          } as CellStyle
        }
      >
        <span />
        <span />
        <span className="matrix-axis-x">Evaluation Items</span>
      </div>
      <div
        className="matrix-question-row"
        style={
          {
            '--cols': visibleQuestions.length,
          } as CellStyle
        }
      >
        <span />
        <span />
        {visibleQuestions.map((question, index) => (
          <span
            className="matrix-label"
            key={question}
            style={{ '--label-delay': `${index * 20}ms` } as CellStyle}
          >
            {question}
          </span>
        ))}
      </div>
      <div
        className="matrix-body"
        style={
          {
            '--cols': visibleQuestions.length,
            '--rows': visibleModels.length,
          } as CellStyle
        }
      >
        <div className="matrix-axis-y">
          <span>Models</span>
        </div>
        {visibleModels.map((model, row) => (
          <div className="matrix-row" key={model}>
            <span
              className="matrix-model matrix-label"
              style={{ '--label-delay': `${row * 30}ms` } as CellStyle}
            >
              {model}
            </span>
            {visibleQuestions.map((question, column) => {
              const value = score(row, column);
              return (
                <span
                  className="eval-cell"
                  key={`${model}-${question}`}
                  style={
                    {
                      '--cell-color': colorFor(value, row, column),
                      '--cell-opacity': (0.24 + value * 0.65).toFixed(2),
                      '--struct-delay': `${row * 30 + column * 18}ms`,
                      '--color-delay': `${column * 24}ms`,
                      '--spark-delay': `${((row * 7 + column * 11) % 31) / 10}s`,
                      '--spark-duration': `${2.2 + ((row + column) % 7) * 0.33}s`,
                      '--spark-brightness': (1.08 + value * 0.18).toFixed(2),
                      '--hue-drift': `${1 + ((row + column) % 4) * 0.45}deg`,
                    } as CellStyle
                  }
                  title={`${model} x ${question}: ${value.toFixed(2)}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="matrix-legend" aria-hidden="true">
        <span className="legend-strong" />
        <span>Strong</span>
        <span className="legend-moderate" />
        <span>Moderate</span>
        <span className="legend-low" />
        <span>Low</span>
        <span className="legend-weak" />
        <span>Weak</span>
      </div>
    </div>
  );
}
