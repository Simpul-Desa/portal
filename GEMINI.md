# UI Design Guidelines

When creating or modifying UI components, you MUST adhere strictly to the "Modern Clean Interface" principles:

1. **Minimalist Aesthetic:** Avoid visual clutter. Use negative space (generous padding/margins) to separate elements rather than borders or background blocks whenever possible.
2. **Neat Typography:** Follow the project's strict typography hierarchy (`text-micro` for default base elements, `text-title-sm` for standard headers). Do not hardcode custom pixel sizes.
3. **Borderless by Default:** Interactive elements like tool buttons or secondary actions should lack borders in their default state. Borders or outline rings should only appear on hover or focus (e.g., `border-transparent hover:border-line-strong` or using the project's `FOCUS_RING`).
4. **Subtle Interactions:** Hover states and transitions should be clean and smooth, typically relying on background color shifts (`hover:bg-surface`) or border reveals.
