import styles from "./ColorInput.module.css";

type ColorInputProps = {
  colors: string[];
  value: string;
  onChange: (color: string) => void;
  error?: string;
  required?: boolean;
};

export function ColorInput({ colors, value, onChange, error, required }: ColorInputProps) {
  return (
    <div className={styles.inputWrapper}>
      <label htmlFor="colorInput"> Color </label>
      <span className={styles.required}>*</span>
      <div className={styles.colorInputContainer} id="colorInput">
        {colors.map((color) => (
          <input
            key={color}
            type="radio"
            className={styles.radioInput}
            name="colorInput"
            value={color}
            // controlled by the parent form now
            checked={value === color}
            onChange={() => onChange(color)}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
            required={required}
          />
        ))}
      </div>

      {/* dedicated error output tag */}
      {error && (
        <span role="alert" className={styles.errorMessage}>
          {error}
        </span>
      )}
    </div>
  );
}
