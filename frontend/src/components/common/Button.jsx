import "./Button.css";

export default function Button({
  as: Component = "button",
  text,
  children,
  type = "button",
  disabled = false,
  className = "",
  ...props
}) {
  const isNativeButton = Component === "button";

  return (
    <Component
      className={`button ${className}`.trim()}
      {...(isNativeButton ? { type, disabled } : {})}
      {...props}
    >
      {children ?? text}
    </Component>
  );
}
