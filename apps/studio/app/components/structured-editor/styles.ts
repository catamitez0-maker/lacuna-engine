export const surfaceStyle = {
  display: "grid",
  gap: 14,
};

export const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "start",
};

export const eyebrowStyle = {
  margin: 0,
  color: "#2563eb",
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase" as const,
};

export const sectionTitleStyle = { margin: "4px 0 0", fontSize: 17 };

export const formStyle = {
  borderTop: "1px solid #d9d4ca",
  display: "grid",
  gap: 10,
  paddingTop: 12,
};

export const compactFormStyle = {
  border: "1px solid #d9d4ca",
  borderRadius: 6,
  display: "grid",
  gap: 9,
  padding: 12,
};

export const detailsStyle = {
  display: "grid",
  gap: 12,
  borderTop: "1px solid #d9d4ca",
  paddingTop: 10,
};

export const summaryStyle = {
  cursor: "pointer",
  fontSize: 15,
  fontWeight: 800,
};

export const subsectionGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
  gap: 12,
};

export const fieldGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
  gap: 10,
};

export const labelStyle = {
  color: "#475569",
  display: "grid",
  fontSize: 12,
  fontWeight: 700,
  gap: 5,
};

export const inputStyle = {
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  color: "#111318",
  fontSize: 13,
  padding: "8px 9px",
};

export const textareaStyle = {
  ...inputStyle,
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  lineHeight: 1.45,
  resize: "vertical" as const,
};

export const checkboxStyle = {
  ...labelStyle,
  alignItems: "center",
  display: "flex",
  minHeight: 32,
};

export const buttonStyle = {
  justifySelf: "start",
  border: "1px solid #111318",
  borderRadius: 6,
  background: "#111318",
  color: "#fff",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 700,
  padding: "8px 12px",
};

export const secondaryButtonStyle = {
  ...buttonStyle,
  borderColor: "#cbd5e1",
  background: "#fff",
  color: "#111318",
};

export const destructiveButtonStyle = {
  ...buttonStyle,
  borderColor: "#fecaca",
  background: "#fef2f2",
  color: "#991b1b",
};

export const actionRowStyle = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: 8,
};

export const compactTitleStyle = {
  margin: 0,
  color: "#334155",
  fontSize: 13,
};

export const anchorGroupStyle = {
  border: "1px solid #d9d4ca",
  borderRadius: 6,
  display: "grid",
  gap: 9,
  padding: 12,
};

export const conditionGroupStyle = {
  display: "grid",
  gap: 8,
};

export const mutedStyle = {
  margin: 0,
  color: "#64748b",
  fontSize: 12,
};

export const successPillStyle = {
  border: "1px solid #bbf7d0",
  borderRadius: 6,
  color: "#166534",
  background: "#f0fdf4",
  fontSize: 12,
  fontWeight: 700,
  padding: "6px 8px",
};

export const errorPillStyle = {
  ...successPillStyle,
  borderColor: "#fecaca",
  color: "#991b1b",
  background: "#fef2f2",
};

export const issueListStyle = {
  margin: 0,
  paddingLeft: 18,
  color: "#991b1b",
  fontSize: 13,
};
