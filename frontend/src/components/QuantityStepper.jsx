
import { MinusIcon, PlusIcon } from './Icons';

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = 'md',
  label = '',
  onMaxReached,
}) {
  const suffix = label ? ` of ${label}` : '';

  function handleIncrease() {
    if (value >= max) {
      onMaxReached?.(max);
      return;
    }

    onChange(value + 1);
  }

  return (
    <div
      className={`stepper${size === 'sm' ? ' stepper--sm' : ''}`}
      role="group"
      aria-label={`Quantity${suffix}`}
    >
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        aria-label={`Decrease quantity${suffix}`}
      >
        <MinusIcon size={16} />
      </button>

      <output className="stepper__value" aria-live="polite">
        {value}
      </output>

      <button
        type="button"
        className="stepper__btn"
        onClick={handleIncrease}
        disabled={disabled}
        aria-label={`Increase quantity${suffix}`}
      >
        <PlusIcon size={16} />
      </button>
    </div>
  );
}
