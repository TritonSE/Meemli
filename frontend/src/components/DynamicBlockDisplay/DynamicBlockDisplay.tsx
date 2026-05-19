import { useEffect, useRef, useState } from "react";

import styles from "./DynamicBlockDisplay.module.css";

import { getChipColors } from "@/src/components/ChipColor";

/**
 * Renders a horizontal list of colored blocks with labels. If the blocks exceed the width of the parent
 * container, it will render a "+X" block at the end, where X is the number of hidden blocks.
 * @param labels array of labels to display
 * @param colors array of hex colors to display. Must have the same length as labels
 * @returns the rendered block display element
 */
export function DynamicBlockDisplay({ labels, colors }: { labels: string[]; colors: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState<number>(labels.length);

  useEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const updateVisibleCount = () => {
      const containerWidth = container.clientWidth;
      const chips = Array.from(measure.children) as HTMLElement[];
      if (chips.length === 0 || containerWidth <= 0) {
        setVisibleCount(0);
        return;
      }

      const gap = 6;
      const labelWidths = chips.slice(0, labels.length).map((el) => el.offsetWidth);

      const overflowItemWidth = chips[chips.length - 1]?.offsetWidth ?? 40;

      let usedWidth = 0;
      let count = 0;

      for (let i = 0; i < labelWidths.length; i += 1) {
        const nextWidth = labelWidths[i] ?? 0;
        const nextUsed = usedWidth + (count > 0 ? gap : 0) + nextWidth;

        const hasRemaining = i < labelWidths.length - 1;
        const reserveForMore = hasRemaining ? gap + overflowItemWidth : 0;

        if (nextUsed + reserveForMore <= containerWidth) {
          usedWidth = nextUsed;
          count += 1;
        } else {
          break;
        }
      }

      setVisibleCount(count);
    };

    const resizeObserver = new ResizeObserver(updateVisibleCount);
    resizeObserver.observe(container);
    const timer = setTimeout(updateVisibleCount, 0);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [labels]);

  const visible = labels.slice(0, visibleCount);
  const remaining = labels.length - visible.length;

  return (
    <>
      <div ref={containerRef} className={styles.blockItems}>
        {visible.map((label, index) => {
          const baseColor = colors[index] ?? "#21dada";
          const { backgroundColor, textColor } = getChipColors(baseColor);

          return (
            <div
              key={index}
              className={styles.blockItem}
              style={{
                backgroundColor,
                color: textColor,
              }}
            >
              {label}
            </div>
          );
        })}

        {remaining > 0 && (
          <div className={`${styles.blockItem} ${styles.moreItem}`}>+{remaining}</div>
        )}
      </div>

      <div ref={measureRef} className={styles.blockMeasure} aria-hidden>
        {labels.map((label, index) => (
          <div key={`${label}-${index}`} className={styles.blockItem}>
            {label}
          </div>
        ))}
        <div className={`${styles.blockItem} ${styles.moreItem}`}>+{labels.length}</div>
      </div>
    </>
  );
}
