import { useState } from "react";

import styles from "./ColorInput.module.css";

type ColorInputProps = {
  colors: string[];
};

export function ColorInput({ colors }: ColorInputProps) {
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };

  return(
    <div className={styles.colorInputContainer}>
      {colors.map(
        (color) => (
            <input
            key={color}
             type="radio" 
             className={styles.radioInput}
             name="colorInput" 
             value={color} 
             checked={selectedColor === color} 
             onChange={() => handleColorChange(color)}
             style={{ backgroundColor: color }}
            />
          )
        )
      }
    </div>
  );
}